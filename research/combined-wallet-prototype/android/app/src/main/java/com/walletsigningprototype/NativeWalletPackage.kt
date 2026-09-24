package com.walletsigningprototype

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class NativeWalletPackage : BaseReactPackage() {
  override fun getModule(name: String, context: ReactApplicationContext): NativeModule? =
    if (name == NativeWalletSpec.NAME) NativeWalletModule(context) else null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
    mapOf(NativeWalletSpec.NAME to ReactModuleInfo(
      NativeWalletSpec.NAME,
      NativeWalletModule::class.java.name,
      false,
      false,
      false,
      true,
    ))
  }
}
