use gizu_signer_core::{TransferOperation, TransferQuote};
fn main() {
    let op = TransferOperation::new(r#"{"kind":"nativeTransfers","chainId":10143,"transfers":[{"accountIndex":0,"to":"0x1111111111111111111111111111111111111111","valueWei":"1"}]}"#.into(), vec![0;32]).unwrap();
    op.prepare(vec![TransferQuote {
        chain_id: "0x279f".into(),
        nonce: "0x0".into(),
        gas: "0x5208".into(),
        max_fee: "0x174876e800".into(),
        priority_fee: "0x0".into(),
        balance: "0xde0b6b3a7640000".into(),
        recipient_code: "0x".into(),
        sender_code: "0x".into(),
    }])
    .unwrap();
    op.approve().unwrap();
    let tx = op
        .sign_next("0x0".into(), "0x279f".into(), "0x".into(), "0x".into())
        .unwrap();
    println!(
        "{}\n{}\n{}",
        tx.from, tx.transaction_hash, tx.raw_transaction
    );
}
