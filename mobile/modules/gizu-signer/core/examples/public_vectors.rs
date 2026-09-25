fn main() {
    for proof in gizu_signer_core::run_synthetic_check().expect("synthetic fixture") {
        println!(
            "{}\t{}\t{}",
            proof.address, proof.message, proof.signature_hex
        );
    }
}
