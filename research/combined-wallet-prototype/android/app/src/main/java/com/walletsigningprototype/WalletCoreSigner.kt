package com.walletsigningprototype

import com.google.protobuf.ByteString
import java.math.BigInteger
import wallet.core.java.AnySigner
import wallet.core.jni.CoinType
import wallet.core.jni.HDWallet
import wallet.core.jni.Hash
import wallet.core.jni.proto.Common
import wallet.core.jni.proto.Ethereum

class WalletCoreSigner : WalletSigner {
  init { System.loadLibrary("TrustWalletCore") }

  override fun addresses(entropy: ByteArray): List<String> {
    require(entropy.size == 32)
    val wallet = HDWallet(entropy, "")
    return (1..6).map { index ->
      CoinType.ETHEREUM.deriveAddress(wallet.getKey(CoinType.ETHEREUM, path(index)))
    }
  }

  override fun signTransfer(
    entropy: ByteArray,
    accountIndex: Int,
    nonce: Long,
    destination: String,
    valueWei: BigInteger,
    gasPriceWei: BigInteger,
  ): SignedTransfer {
    require(entropy.size == 32 && accountIndex in 1..6 && nonce >= 0)
    require(valueWei == BigInteger.ZERO || valueWei == BigInteger.ONE)
    require(gasPriceWei > BigInteger.ZERO && gasPriceWei <= BigInteger("10000000000"))
    val wallet = HDWallet(entropy, "")
    val key = wallet.getKey(CoinType.ETHEREUM, path(accountIndex))
    val ownAddress = CoinType.ETHEREUM.deriveAddress(key)
    require(destination.equals(ownAddress, ignoreCase = true))
    val keyBytes = key.data()
    try {
      val input = Ethereum.SigningInput.newBuilder()
        .setChainId(unsigned(BigInteger.valueOf(31337)))
        .setNonce(unsigned(BigInteger.valueOf(nonce)))
        .setTxMode(Ethereum.TransactionMode.Legacy)
        .setGasPrice(unsigned(gasPriceWei))
        .setGasLimit(unsigned(BigInteger.valueOf(21_000)))
        .setToAddress(ownAddress)
        .setPrivateKey(ByteString.copyFrom(keyBytes))
        .setTransaction(Ethereum.Transaction.newBuilder()
          .setTransfer(Ethereum.Transaction.Transfer.newBuilder().setAmount(unsigned(valueWei))))
        .build()
      val output = AnySigner.sign(input, CoinType.ETHEREUM, Ethereum.SigningOutput.parser())
      check(output.error == Common.SigningError.OK && !output.encoded.isEmpty) {
        "Wallet Core signing failed: ${output.errorMessage}"
      }
      val raw = output.encoded.toByteArray()
      return SignedTransfer("0x${raw.hex()}", "0x${Hash.keccak256(raw).hex()}")
    } finally {
      keyBytes.fill(0)
    }
  }

  private fun path(index: Int) = "m/44'/60'/0'/0/$index"

  private fun unsigned(value: BigInteger): ByteString {
    require(value >= BigInteger.ZERO)
    val bytes = value.toByteArray().dropWhile { it == 0.toByte() }.toByteArray()
    return ByteString.copyFrom(bytes)
  }
}

fun ByteArray.hex(): String = joinToString("") { "%02x".format(it.toInt() and 0xff) }
