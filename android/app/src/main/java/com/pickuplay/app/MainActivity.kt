package com.pickuplay.app

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle
import android.content.Intent
import android.util.Log

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "pickuplay"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
      override fun onCreate(savedInstanceState: Bundle?) {
      super.onCreate(savedInstanceState)
      val uri = intent?.data
      Log.d("DeepLink", "URI: $uri")  // e.g. pickuplay://game/
  }

  // Also handle when app is already running:
  override fun onNewIntent(intent: Intent) {
      super.onNewIntent(intent)
      val uri = intent.data
      Log.d("DeepLink", "New intent URI: $uri")
  }
}
