import ExpoModulesCore
import AuthenticationServices
import UIKit
import CryptoKit

public final class GizuSignerModule: Module {
  private var probe: AnyObject?
  private var transfer: AnyObject?
  private var reconciling = false
  private func openAccess(_ promise: Promise, walletOnly: Bool) {
      DispatchQueue.main.async {
        #if DEBUG
        guard #available(iOS 18.0, *), self.probe == nil, self.transfer == nil, !self.reconciling, let presenter = self.appContext?.utilities?.currentViewController(), let window = presenter.view.window else {
          promise.reject("UNAVAILABLE", "Native probe unavailable"); return
        }
        let probe = NativeProbe(presenter: presenter, window: window, walletOnly: walletOnly) { results in
          self.probe = nil
          switch results {
          case .success(.wallet(let address)): promise.resolve(["address": address, "accountIndex": 0, "chainId": 10143] as [String: Any])
          case .success(.proofs(let proofs)): promise.resolve(proofs.map { ["accountIndex": $0.accountIndex, "address": $0.address, "message": $0.message, "signature": $0.signatureHex] as [String: Any] })
          case .failure: promise.reject("PROBE_FAILED", "Native probe cancelled, unsupported or failed. Open existing after partial creation.")
          }
        }
        self.probe = probe
        probe.present()
        #else
        promise.reject("UNAVAILABLE", "Development probe only")
        #endif
      }
  }
  public func definition() -> ModuleDefinition {
    Name("GizuSigner")
    Function("getCapabilities") {
      #if DEBUG
      if #available(iOS 18.0, *) { return ["nativeTransfers": true, "fixedProbe": true] }
      #endif
      return ["nativeTransfers": false, "fixedProbe": false]
    }
    AsyncFunction("executeOperation") { (proposal: String, promise: Promise) in
      DispatchQueue.main.async {
        #if DEBUG
        guard #available(iOS 18.0, *), self.probe == nil, self.transfer == nil, !self.reconciling,
              let presenter = self.appContext?.utilities?.currentViewController(), presenter.view.window != nil else {
          promise.reject("UNAVAILABLE", "Native testnet operation unavailable"); return
        }
        do {
          try validateTransferProposal(proposal: proposal)
          let controller = NativeTransferController(proposal: proposal) { result in
            self.transfer = nil
            if let result { promise.resolve(result) }
            else { promise.reject("OPERATION_STOPPED", "Operation stopped. Refresh native status before retrying; submitted transfers cannot be undone.") }
          }
          self.transfer = controller; presenter.present(controller, animated: true)
        } catch { promise.reject("INVALID_OPERATION", "Native operation rejected") }
        #else
        promise.reject("UNAVAILABLE", "Development testnet operation only")
        #endif
      }
    }
    AsyncFunction("getOperationStatus") { (promise: Promise) in
      Task { @MainActor in
        guard self.probe == nil, self.transfer == nil, !self.reconciling else {
          promise.reject("BUSY", "Native operation in progress"); return
        }
        self.reconciling = true
        defer { self.reconciling = false }
        do { promise.resolve(try await NativeTransferJournal().reconcile(MonadRPC())) }
        catch { promise.reject("RPC_UNAVAILABLE", "Cannot reconcile native status. Do not repeat uncertain transfers.") }
      }
    }
    Function("cancelOperation") { DispatchQueue.main.async {
      if #available(iOS 18.0, *) { (self.transfer as? NativeTransferController)?.cancel() }
    } }
    Function("lock") { DispatchQueue.main.async {
      if #available(iOS 18.0, *) {
        (self.transfer as? NativeTransferController)?.cancel(); (self.probe as? NativeProbe)?.cancel()
      }
    } }
    AsyncFunction("openNativeProbe") { (promise: Promise) in self.openAccess(promise, walletOnly: false) }
    AsyncFunction("openWallet") { (promise: Promise) in self.openAccess(promise, walletOnly: true) }
    Function("cancelProbe") { DispatchQueue.main.async { if #available(iOS 18.0, *) { (self.probe as? NativeProbe)?.cancel() } } }
    OnDestroy { DispatchQueue.main.async { if #available(iOS 18.0, *) { (self.transfer as? NativeTransferController)?.cancel(); (self.probe as? NativeProbe)?.cancel() } } }
  }
}

private enum NativeAccessResult { case wallet(String); case proofs([ProbeProof]) }

@available(iOS 18.0, *)
private final class NativeProbe: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
  private let presenter: UIViewController
  private let window: UIWindow
  private let walletOnly: Bool
  private var completion: ((Result<NativeAccessResult, Error>) -> Void)?
  private var controller: ASAuthorizationController?
  private var timeout: DispatchWorkItem?
  private var createdId: Data?
  private var alert: UIAlertController?
  private enum Failure: Error { case failed }
  init(presenter: UIViewController, window: UIWindow, walletOnly: Bool, completion: @escaping (Result<NativeAccessResult, Error>) -> Void) { self.presenter = presenter; self.window = window; self.walletOnly = walletOnly; self.completion = completion }
  private func random() throws -> Data {
    var data = Data(count: 32)
    let status = data.withUnsafeMutableBytes { SecRandomCopyBytes(kSecRandomDefault, 32, $0.baseAddress!) }
    guard status == errSecSuccess else { throw Failure.failed }; return data
  }
  func present() {
    let alert = UIAlertController(title: walletOnly ? "Open Gizu testnet wallet" : "Native compatibility test", message: walletOnly ? "Create or open a passkey to view Account 0 on Monad testnet. No transaction or message will be signed. This opens a local wallet view, not a backend login. Creation may require two prompts." : "Approve 16 fixed test signatures across accounts 0–15 using an unfunded test passkey. No transactions, login or spending. Keys stay in native memory. Creation may show two prompts.", preferredStyle: .alert)
    alert.addAction(UIAlertAction(title: "Open existing", style: .default) { _ in self.request(create: false) })
    alert.addAction(UIAlertAction(title: walletOnly ? "Create passkey" : "Create test passkey", style: .default) { _ in self.request(create: true) })
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in self.cancel() })
    self.alert = alert
    presenter.present(alert, animated: true)
    let work = DispatchWorkItem { self.cancel() }; timeout = work
    DispatchQueue.main.asyncAfter(deadline: .now() + 120, execute: work)
  }
  private func request(create: Bool) {
    guard completion != nil else { return }
    do {
      let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: "gizu.io")
      let request: ASAuthorizationRequest
      if create {
        let registration = provider.createCredentialRegistrationRequest(challenge: try random(), name: walletOnly ? "gizu-testnet-wallet" : "gizu-native-test", userID: try random())
        registration.userVerificationPreference = .required
        registration.prf = .checkForSupport
        request = registration
      } else {
        let assertion = provider.createCredentialAssertionRequest(challenge: try random())
        assertion.userVerificationPreference = .required
        if let id = createdId { assertion.allowedCredentials = [ASAuthorizationPlatformPublicKeyCredentialDescriptor(credentialID: id)] }
        let hex = "896d46ac4ac191885c46137439db7bb52fb05cff3ecd34af7cdae0a1e0c00db9"
        let salt = Data(stride(from: 0, to: hex.count, by: 2).map { offset -> UInt8 in
          let start = hex.index(hex.startIndex, offsetBy: offset)
          return UInt8(hex[start..<hex.index(start, offsetBy: 2)], radix: 16)!
        })
        assertion.prf = .inputValues(.saltInput1(salt))
        request = assertion
      }
      controller = ASAuthorizationController(authorizationRequests: [request])
      controller?.delegate = self; controller?.presentationContextProvider = self
      controller?.performRequests()
    } catch { cancel() }
  }
  func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor { window }
  func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
    guard completion != nil else { return }
    if let registration = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialRegistration { createdId = registration.credentialID; request(create: false); return }
    guard let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialAssertion, let key = credential.prf?.first else { cancel(); return }
    // Never return credential/PRF to Expo. Swift/FFI copies remain a documented limitation.
    var bytes = key.withUnsafeBytes { Data($0) }
    defer { bytes.resetBytes(in: 0..<bytes.count) }
    do {
      guard UIApplication.shared.applicationState != .background else { throw Failure.failed }
      if walletOnly {
        finish(.success(.wallet(try deriveWalletAddress(prf: bytes))))
        return
      }
      let id = try random().map { String(format: "%02x", $0) }.joined()
      let result = try runNativeProbe(prf: bytes, operationId: id)
      finish(.success(.proofs(result)))
    } catch { cancel() }
  }
  func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) { cancel() }
  func cancel() { let pending = controller; finish(.failure(Failure.failed)); pending?.cancel(); alert?.dismiss(animated: false); alert = nil }
  private func finish(_ result: Result<NativeAccessResult, Error>) {
    timeout?.cancel(); timeout = nil
    let callback = completion; completion = nil; controller = nil; callback?(result)
  }
}
