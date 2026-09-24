package com.walletsigningprototype

import java.math.BigInteger

data class SignedTransfer(val rawHex: String, val txHash: String)

interface WalletSigner {
  fun addresses(entropy: ByteArray): List<String>
  fun signTransfer(
    entropy: ByteArray,
    accountIndex: Int,
    nonce: Long,
    destination: String,
    valueWei: BigInteger,
    gasPriceWei: BigInteger,
  ): SignedTransfer
}
