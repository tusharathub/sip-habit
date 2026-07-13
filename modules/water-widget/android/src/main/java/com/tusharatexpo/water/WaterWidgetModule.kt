package com.tusharatexpo.water

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WaterWidgetModule : Module() {

  companion object {
    @Volatile
    var instance: WaterWidgetModule? = null
  }

  fun emitLogEvent(amount: Int) {
    try {
      sendEvent("onWidgetLog", mapOf("amount" to amount))
    } catch (e: Exception) {
      // Ignore if React native context is not fully ready to receive events
    }
  }

  override fun definition() = ModuleDefinition {
    Name("WaterWidgetModule")

    Events("onWidgetLog")

    OnCreate {
      instance = this@WaterWidgetModule
    }

    OnDestroy {
      if (instance == this@WaterWidgetModule) {
        instance = null
      }
    }

    Function("updateWidgetData") { today: Int, goal: Int ->
      val context = appContext.reactContext
      if (context != null) {
        val prefs = context.getSharedPreferences("WaterWidgetPrefs", Context.MODE_PRIVATE)
        prefs.edit().apply {
          putInt("todayIntake", today)
          putInt("dailyGoal", goal)
          apply()
        }

        // Notify the widget provider to redraw the UI immediately
        val intent = Intent(context, WaterWidgetProvider::class.java).apply {
          action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        }
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val ids = appWidgetManager.getAppWidgetIds(ComponentName(context, WaterWidgetProvider::class.java))
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        context.sendBroadcast(intent)
      }
    }

    Function("getPendingLogs") { ->
      val context = appContext.reactContext
      if (context == null) {
        listOf<Int>()
      } else {
        val prefs = context.getSharedPreferences("WaterWidgetPrefs", Context.MODE_PRIVATE)
        val logsStr = prefs.getString("pendingLogs", "") ?: ""
        if (logsStr.isEmpty()) {
          listOf<Int>()
        } else {
          try {
            logsStr.split(",").filter { it.isNotEmpty() }.map { it.toInt() }
          } catch (e: Exception) {
            listOf<Int>()
          }
        }
      }
    }

    Function("clearPendingLogs") { ->
      val context = appContext.reactContext
      if (context != null) {
        val prefs = context.getSharedPreferences("WaterWidgetPrefs", Context.MODE_PRIVATE)
        prefs.edit().putString("pendingLogs", "").apply()
      }
    }
  }
}
