//! N1 compatibility core. Only fixed non-transaction proofs are exposed to native
//! adapters. No general signer, key export, network or transaction-signing API.
use alloy_consensus::{SignableTransaction, TxEip1559};
use alloy_primitives::{Address, TxKind, U256, keccak256};
use bip32::{DerivationPath, XPrv};
use bip39::{Language, Mnemonic};
use k256::ecdsa::VerifyingKey;
use std::time::{Duration, Instant};
use zeroize::Zeroizing;

uniffi::setup_scaffolding!();

#[derive(Debug, thiserror::Error, uniffi::Error)]
pub enum ProbeError {
    #[error("Invalid native probe input")]
    InvalidInput,
    #[error("Native cryptographic check failed")]
    CryptoFailed,
    #[error("Native probe expired")]
    Expired,
}

#[derive(uniffi::Record)]
pub struct ProbeProof {
    pub account_index: u32,
    pub address: String,
    pub message: String,
    pub signature_hex: String,
}

fn address(key: &VerifyingKey) -> String {
    let point = key.to_sec1_point(false);
    Address::from_slice(&keccak256(&point.as_bytes()[1..])[12..]).to_checksum(None)
}

fn message_hash(message: &str) -> [u8; 32] {
    keccak256(format!(
        "\x19Ethereum Signed Message:\n{}{}",
        message.len(),
        message
    ))
    .into()
}

/// Private native-to-native FFI only. Swift/Kotlin own approval, generation and
/// lifecycle; the Expo bridge must never accept these arguments from JavaScript.
/// Consumes its PRF copy. Foreign/runtime copies require separate cleanup.
#[uniffi::export]
pub fn run_native_probe(prf: Vec<u8>, operation_id: String) -> Result<Vec<ProbeProof>, ProbeError> {
    let prf = Zeroizing::new(prf);
    if prf.len() != 32
        || operation_id.len() != 64
        || !operation_id.bytes().all(|b| b.is_ascii_hexdigit())
    {
        return Err(ProbeError::InvalidInput);
    }
    let started = Instant::now();
    let mnemonic =
        Mnemonic::from_entropy_in(Language::English, &prf).map_err(|_| ProbeError::CryptoFailed)?;
    let seed = Zeroizing::new(mnemonic.to_seed(""));
    drop(mnemonic);
    drop(prf);
    let mut proofs = Vec::with_capacity(16);
    for index in 0..16 {
        if started.elapsed() >= Duration::from_secs(120) {
            return Err(ProbeError::Expired);
        }
        let path: DerivationPath = format!("m/44'/60'/0'/0/{index}")
            .parse()
            .map_err(|_| ProbeError::CryptoFailed)?;
        let child =
            XPrv::derive_from_path(seed.as_ref(), &path).map_err(|_| ProbeError::CryptoFailed)?;
        let key = child.private_key();
        let message = format!(
            "Gizu gizu.io native compatibility test v2. Operation {operation_id}; account {index}; step {index}. Test-key control only. Not authentication, transactions, transfers or spending."
        );
        let digest = message_hash(&message);
        let (signature, recovery) = key.sign_prehash_recoverable(&digest);
        let recovered = VerifyingKey::recover_from_prehash(&digest, &signature, recovery)
            .map_err(|_| ProbeError::CryptoFailed)?;
        if &recovered != key.verifying_key() {
            return Err(ProbeError::CryptoFailed);
        }
        let mut bytes = signature.to_bytes().to_vec();
        bytes.push(recovery.to_byte() + 27);
        proofs.push(ProbeProof {
            account_index: index,
            address: address(&recovered),
            message,
            signature_hex: alloy_primitives::hex::encode_prefixed(bytes),
        });
    }
    Ok(proofs)
}

/// Native-only address derivation for local wallet access. No signature or retained session.
#[uniffi::export]
pub fn derive_wallet_address(prf: Vec<u8>) -> Result<String, ProbeError> {
    let prf = Zeroizing::new(prf);
    if prf.len() != 32 {
        return Err(ProbeError::InvalidInput);
    }
    let mnemonic =
        Mnemonic::from_entropy_in(Language::English, &prf).map_err(|_| ProbeError::CryptoFailed)?;
    let seed = Zeroizing::new(mnemonic.to_seed(""));
    drop(mnemonic);
    drop(prf);
    let path: DerivationPath = "m/44'/60'/0'/0/0"
        .parse()
        .map_err(|_| ProbeError::CryptoFailed)?;
    let child =
        XPrv::derive_from_path(seed.as_ref(), &path).map_err(|_| ProbeError::CryptoFailed)?;
    Ok(address(child.private_key().verifying_key()))
}

/// Public synthetic vector only; never uses a provider or creates an account to fund.
#[uniffi::export]
pub fn run_synthetic_check() -> Result<Vec<ProbeProof>, ProbeError> {
    let proofs = run_native_probe(vec![0; 32], "0".repeat(64))?;
    if proofs[0].address != "0xF278cF59F82eDcf871d630F28EcC8056f25C1cdb" {
        return Err(ProbeError::CryptoFailed);
    }
    Ok(proofs)
}

// Codec-only N1 fixture. No transaction signing function is exported. Live
// transfer construction/review and signing remain gated on N2 authorization.
#[uniffi::export]
pub fn monad_transfer_fixture_hash() -> String {
    TxEip1559 {
        chain_id: 10143,
        nonce: 0,
        gas_limit: 21000,
        max_fee_per_gas: 200_000_000_000,
        max_priority_fee_per_gas: 0,
        to: TxKind::Call(Address::repeat_byte(0x11)),
        value: U256::from(1u64),
        access_list: Default::default(),
        input: Default::default(),
    }
    .signature_hash()
    .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use k256::ecdsa::{RecoveryId, Signature};
    #[test]
    fn sixteen_accounts_recover_and_reject_changed_messages() {
        let proofs = run_synthetic_check().unwrap();
        assert_eq!(proofs.len(), 16);
        let mut addresses = std::collections::HashSet::new();
        for proof in proofs {
            assert!(addresses.insert(proof.address.clone()));
            let bytes = alloy_primitives::hex::decode(&proof.signature_hex).unwrap();
            let sig = Signature::from_slice(&bytes[..64]).unwrap();
            let rid = RecoveryId::from_byte(bytes[64] - 27).unwrap();
            let recovered =
                VerifyingKey::recover_from_prehash(&message_hash(&proof.message), &sig, rid)
                    .unwrap();
            assert_eq!(address(&recovered), proof.address);
            let altered =
                VerifyingKey::recover_from_prehash(&message_hash("altered"), &sig, rid).unwrap();
            assert_ne!(address(&altered), proof.address);
        }
    }
    #[test]
    fn wallet_access_returns_only_the_frozen_account_zero_address() {
        assert_eq!(
            derive_wallet_address(vec![0; 32]).unwrap(),
            run_synthetic_check().unwrap()[0].address
        );
        assert_ne!(
            derive_wallet_address(vec![1; 32]).unwrap(),
            derive_wallet_address(vec![0; 32]).unwrap()
        );
        for len in [0, 31, 33] {
            assert!(derive_wallet_address(vec![0; len]).is_err());
        }
    }

    #[test]
    fn independent_js_vectors_match() {
        let lines: Vec<_> = include_str!("../tests/reference-vectors.txt")
            .lines()
            .collect();
        for (proof, expected) in run_synthetic_check().unwrap().iter().zip(&lines[..16]) {
            assert_eq!(&proof.address, expected);
        }
        assert_eq!(monad_transfer_fixture_hash(), lines[16]);
    }
    #[test]
    fn malformed_inputs_are_sanitized() {
        for len in [0, 12, 31, 33, 64] {
            assert!(matches!(
                run_native_probe(vec![7; len], "a".repeat(64)),
                Err(ProbeError::InvalidInput)
            ));
        }
        assert!(matches!(
            run_native_probe(vec![7; 32], "bad".into()),
            Err(ProbeError::InvalidInput)
        ));
    }
    #[test]
    fn different_root_changes_account() {
        assert_ne!(
            run_native_probe(vec![7; 32], "a".repeat(64)).unwrap()[0].address,
            run_synthetic_check().unwrap()[0].address
        );
    }
}

mod transfers;
pub use transfers::*;
