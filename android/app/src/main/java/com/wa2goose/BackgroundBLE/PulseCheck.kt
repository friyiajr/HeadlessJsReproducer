package com.wa2goose.BackgroundBLE

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.NoRetryPolicy

class PulseCheck : HeadlessJsTaskService() {

    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        return intent.extras?.let {
            HeadlessJsTaskConfig(
                "PulseCheck",
                Arguments.fromBundle(it),
                5000,
                false,
                NoRetryPolicy.INSTANCE
            )
        }
    }
}




