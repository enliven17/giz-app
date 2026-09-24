import Foundation
import UIKit
import AuthenticationServices
import CryptoKit

@available(iOS 18.0, *)
final class NativeTransferController: UIViewController, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding, UITextViewDelegate {
  private let proposal: String
  private var completion: ((String?) -> Void)?
  private var operation: TransferOperation?
  private var provider: ASAuthorizationController?
  private var providerPending = false
  private var task: Task<Void, Never>?
  private var expiry: DispatchWorkItem?
  private var onActive: (() -> Void)?
  private var observers: [NSObjectProtocol] = []
  private let rpc = MonadRPC()
  private var journal: NativeTransferJournal?
  private var operationId = ""
  private var intents: [TransferIntent] = []
  private let stack = UIStackView()
  // Mirrors src/theme/colors.json; transaction review stays entirely native.
  private let ink = UIColor(red: 5/255, green: 7/255, blue: 6/255, alpha: 1)
  private let surface = UIColor(red: 11/255, green: 16/255, blue: 13/255, alpha: 1)
  private let accent = UIColor(red: 49/255, green: 196/255, blue: 126/255, alpha: 1)
  private let foregroundColor = UIColor(red: 223/255, green: 232/255, blue: 227/255, alpha: 1)
  private let muted = UIColor(red: 167/255, green: 178/255, blue: 171/255, alpha: 1)
  private let border = UIColor(red: 29/255, green: 40/255, blue: 33/255, alpha: 1)
  private let review = UITextView()
  private let approve = UIButton(type: .system)
  private var approved = false
  init(proposal: String, completion: @escaping (String?) -> Void) {
    self.proposal = proposal; self.completion = completion
    super.init(nibName: nil, bundle: nil)
    modalPresentationStyle = .fullScreen; isModalInPresentation = true
  }
  required init?(coder: NSCoder) { fatalError("Unavailable") }
  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = ink; overrideUserInterfaceStyle = .dark
    stack.axis = .vertical; stack.spacing = 16; stack.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(stack)
    NSLayoutConstraint.activate([stack.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 20),
      stack.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -20),
      stack.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
      stack.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -16)])
    label("MONAD TESTNET · NATIVE APPROVAL", style: .caption1)
    label("Review transfer", style: .largeTitle)
    label("Unlock an existing test passkey to derive sender addresses and fetch current fees. Nothing is signed until you approve the final native review.")
    button("Unlock test passkey", #selector(unlock))
    button("Cancel", #selector(cancel))
    stack.addArrangedSubview(UIView()) // Flexible space keeps preparation content at the top.
    observers.append(NotificationCenter.default.addObserver(forName: UIApplication.didEnterBackgroundNotification, object: nil, queue: .main) { [weak self] _ in
      guard let self else { return }; if !self.providerPending { self.cancel() }
    })
    observers.append(NotificationCenter.default.addObserver(forName: UIApplication.didBecomeActiveNotification, object: nil, queue: .main) { [weak self] _ in
      let callback = self?.onActive; self?.onActive = nil; callback?()
    })
  }
  private func label(_ value: String, style: UIFont.TextStyle = .body) {
    let label = UILabel(); label.text = value; label.numberOfLines = 0
    label.font = .preferredFont(forTextStyle: style)
    label.textColor = style == .caption1 ? accent : style == .body ? muted : foregroundColor
    label.adjustsFontForContentSizeCategory = true
    label.setContentHuggingPriority(.required, for: .vertical)
    stack.addArrangedSubview(label)
  }
  private func button(_ title: String, _ selector: Selector) {
    let button = UIButton(type: .system); button.setTitle(title, for: .normal)
    styleButton(button, primary: title != "Cancel" && title != "Reject" && title != "Close")
    button.addTarget(self, action: selector, for: .touchUpInside); stack.addArrangedSubview(button)
  }
  private func styleButton(_ button: UIButton, primary: Bool) {
    var config = UIButton.Configuration.filled()
    config.baseBackgroundColor = primary ? accent : surface
    config.baseForegroundColor = primary ? ink : foregroundColor
    config.background.cornerRadius = 20
    config.background.strokeColor = border; config.background.strokeWidth = 1
    config.contentInsets = NSDirectionalEdgeInsets(top: 16, leading: 20, bottom: 16, trailing: 20)
    button.configuration = config
    button.titleLabel?.numberOfLines = 0
    button.titleLabel?.font = .preferredFont(forTextStyle: .headline)
    button.titleLabel?.adjustsFontForContentSizeCategory = true
    button.heightAnchor.constraint(greaterThanOrEqualToConstant: 56).isActive = true
    button.setContentHuggingPriority(.required, for: .vertical)
  }
  private func clear() { stack.arrangedSubviews.forEach { stack.removeArrangedSubview($0); $0.removeFromSuperview() } }
  private func deadline() {
    expiry?.cancel(); let item = DispatchWorkItem { [weak self] in self?.cancel() }; expiry = item
    DispatchQueue.main.asyncAfter(deadline: .now() + 120, execute: item)
  }
  private func random() throws -> Data {
    var data = Data(count: 32)
    guard data.withUnsafeMutableBytes({ SecRandomCopyBytes(kSecRandomDefault, 32, $0.baseAddress!) }) == errSecSuccess else { throw TransferFailure.stopped }
    return data
  }
  @objc private func unlock() {
    guard completion != nil, !providerPending, operation == nil else { return }
    do {
      try validateTransferProposal(proposal: proposal)
      journal = try NativeTransferJournal()
      guard try !journal!.unresolved() else { throw TransferFailure.stopped }
      operationId = try random().map { String(format: "%02x", $0) }.joined()
      let request = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: "gizu.io").createCredentialAssertionRequest(challenge: try random())
      request.userVerificationPreference = .required
      let hex = "896d46ac4ac191885c46137439db7bb52fb05cff3ecd34af7cdae0a1e0c00db9"
      let salt = Data(stride(from: 0, to: hex.count, by: 2).map { offset -> UInt8 in
        let start = hex.index(hex.startIndex, offsetBy: offset); return UInt8(hex[start..<hex.index(start, offsetBy: 2)], radix: 16)!
      })
      request.prf = .inputValues(.saltInput1(salt))
      providerPending = true; deadline()
      provider = ASAuthorizationController(authorizationRequests: [request])
      provider?.delegate = self; provider?.presentationContextProvider = self; provider?.performRequests()
    } catch { cancel() }
  }
  func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor { view.window ?? UIWindow() }
  func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
    providerPending = false
    guard completion != nil, let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialAssertion, let key = credential.prf?.first else { cancel(); return }
    var bytes = key.withUnsafeBytes { Data($0) }; defer { bytes.resetBytes(in: 0..<bytes.count) }
    do {
      operation = try TransferOperation(proposal: proposal, prf: bytes); deadline()
      let start: () -> Void = { [weak self] in self?.prepare() }
      if UIApplication.shared.applicationState == .active { start() }
      else if UIApplication.shared.applicationState == .inactive { onActive = start }
      else { cancel() }
    } catch { cancel() }
  }
  func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) { cancel() }
  private func prepare() {
    clear(); label("Preparing exact transfers…")
    task = Task { @MainActor in
      do {
        guard let operation else { throw TransferFailure.stopped }
        intents = try operation.intents()
        let chain = try await rpc.text("eth_chainId")
        let maxFee = try await rpc.text("eth_gasPrice")
        let priority = try await rpc.text("eth_maxPriorityFeePerGas")
        var nonces: [String: String] = [:]; var balances: [String: String] = [:]; var quotes: [TransferQuote] = []
        for intent in intents {
          let nonce: String
          if let cached = nonces[intent.from] { nonce = cached } else { nonce = try await rpc.text("eth_getTransactionCount", [intent.from, "pending"]); nonces[intent.from] = nonce }
          let balance: String
          if let cached = balances[intent.from] { balance = cached } else { balance = try await rpc.text("eth_getBalance", [intent.from, "pending"]); balances[intent.from] = balance }
          let gas = try await rpc.text("eth_estimateGas", [["from": intent.from, "to": intent.to, "value": intent.valueHex, "data": "0x"]])
          let recipient = try await rpc.text("eth_getCode", [intent.to, "pending"])
          let sender = try await rpc.text("eth_getCode", [intent.from, "pending"])
          quotes.append(TransferQuote(chainId: chain, nonce: nonce, gas: gas, maxFee: maxFee, priorityFee: priority, balance: balance, recipientCode: recipient, senderCode: sender))
        }
        try Task.checkCancellation()
        guard completion != nil, UIApplication.shared.applicationState == .active else { throw TransferFailure.stopped }
        showReview(try operation.prepare(quotes: quotes))
      } catch { cancel() }
    }
  }
  private func showReview(_ value: String) {
    clear(); label("MONAD TESTNET · NATIVE APPROVAL", style: .caption1)
    label("Confirm transfers", style: .title1)
    label("Review all details below to enable approval.")
    review.text = value; review.isEditable = false; review.font = .preferredFont(forTextStyle: .body)
    review.backgroundColor = surface; review.textColor = foregroundColor
    review.layer.cornerRadius = 20; review.layer.borderWidth = 1; review.layer.borderColor = border.cgColor
    review.textContainerInset = UIEdgeInsets(top: 20, left: 16, bottom: 20, right: 16)
    review.adjustsFontForContentSizeCategory = true; review.delegate = self; stack.addArrangedSubview(review)
    approve.setTitle("Approve exact testnet transfers", for: .normal)
    styleButton(approve, primary: true)
    approve.addTarget(self, action: #selector(confirm), for: .touchUpInside); approve.isEnabled = false
    stack.addArrangedSubview(approve); button("Reject", #selector(cancel))
    view.layoutIfNeeded(); scrollViewDidScroll(review)
  }
  func scrollViewDidScroll(_ scrollView: UIScrollView) {
    approve.isEnabled = !approved && scrollView.contentOffset.y + scrollView.bounds.height >= scrollView.contentSize.height - 4
  }
  @objc private func confirm() {
    guard !approved, completion != nil, UIApplication.shared.applicationState == .active else { return }
    approved = true; approve.isEnabled = false
    task = Task { @MainActor in
      do {
        guard let operation, let journal else { throw TransferFailure.stopped }
        try operation.approve()
        for (step, intent) in intents.enumerated() {
          let chain = try await rpc.text("eth_chainId")
          let nonce = try await rpc.text("eth_getTransactionCount", [intent.from, "pending"])
          let code = try await rpc.text("eth_getCode", [intent.to, "pending"])
          let senderCode = try await rpc.text("eth_getCode", [intent.from, "pending"])
          try Task.checkCancellation()
          guard completion != nil, UIApplication.shared.applicationState == .active else { throw TransferFailure.stopped }
          let tx = try operation.signNext(pendingNonce: nonce, chainId: chain, recipientCode: code, senderCode: senderCode)
          try journal.beforeBroadcast(operation: operationId, step: step, tx: tx, intent: intent)
          try Task.checkCancellation()
          let returned = try await rpc.text("eth_sendRawTransaction", [tx.rawTransaction])
          guard returned.lowercased() == tx.transactionHash.lowercased() else { throw TransferFailure.stopped }
          var status = try await journal.reconcile(rpc)
          for _ in 0..<3 {
            if try !journal.unresolved() { break }
            try await Task.sleep(nanoseconds: 1_000_000_000); status = try await journal.reconcile(rpc)
          }
          guard let entries = try JSONSerialization.jsonObject(with: Data(status.utf8)) as? [[String: Any]] else { throw TransferFailure.stopped }
          if entries.last?["status"] as? String != "finalized" { break }
        }
        finish(try journal.publicStatus())
      } catch { cancel() }
    }
  }
  @objc func cancel() { let pending = provider; finish(nil); pending?.cancel() }
  private func finish(_ result: String?) {
    guard let callback = completion else { return }
    completion = nil; expiry?.cancel(); expiry = nil; task?.cancel(); task = nil; onActive = nil
    operation?.invalidate(); operation = nil; provider = nil
    observers.forEach { NotificationCenter.default.removeObserver($0) }; observers = []
    dismiss(animated: true) { callback(result) }
  }
}
