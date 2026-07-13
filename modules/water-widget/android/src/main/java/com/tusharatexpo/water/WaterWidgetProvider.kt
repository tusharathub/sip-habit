package com.tusharatexpo.water

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class WaterWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "com.tusharatexpo.water.ACTION_LOG_WATER") {
            val amount = intent.getIntExtra("amount", 0)
            if (amount > 0) {
                val prefs = context.getSharedPreferences("WaterWidgetPrefs", Context.MODE_PRIVATE)
                val todayIntake = prefs.getInt("todayIntake", 0)
                val dailyGoal = prefs.getInt("dailyGoal", 2500)
                val nextIntake = todayIntake + amount

                // Update SharedPreferences immediately so the widget display updates instantly on screen
                prefs.edit().putInt("todayIntake", nextIntake).apply()

                // Queue the logged drink in SharedPreferences
                val pendingLogs = prefs.getString("pendingLogs", "") ?: ""
                val nextLogs = if (pendingLogs.isEmpty()) "$amount" else "$pendingLogs,$amount"
                prefs.edit().putString("pendingLogs", nextLogs).apply()

                // Emit event to JavaScript in real-time if the app is active
                WaterWidgetModule.instance?.emitLogEvent(amount)

                // Force update UI of all widget instances
                val appWidgetManager = AppWidgetManager.getInstance(context)
                val componentName = ComponentName(context, WaterWidgetProvider::class.java)
                val ids = appWidgetManager.getAppWidgetIds(componentName)
                onUpdate(context, appWidgetManager, ids)
            }
        } else {
            super.onReceive(context, intent)
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, WaterWidgetProvider::class.java)
            val ids = appWidgetManager.getAppWidgetIds(componentName)
            onUpdate(context, appWidgetManager, ids)
        }
    }

    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        val prefs = context.getSharedPreferences("WaterWidgetPrefs", Context.MODE_PRIVATE)
        val todayIntake = prefs.getInt("todayIntake", 0)
        val dailyGoal = prefs.getInt("dailyGoal", 2500)
        
        val percentage = if (dailyGoal > 0) {
            (todayIntake.toFloat() / dailyGoal.toFloat() * 100).toInt()
        } else {
            0
        }

        // Load layout
        val views = RemoteViews(context.packageName, R.layout.water_widget_layout)
        
        // Update texts
        views.setTextViewText(R.id.widget_progress_text, "Currently: $percentage% ($todayIntake / ${dailyGoal}ml)")

        // Configure click PendingIntents for background logging
        views.setOnClickPendingIntent(R.id.btn_add_250, createLogWaterPendingIntent(context, 250))
        views.setOnClickPendingIntent(R.id.btn_add_500, createLogWaterPendingIntent(context, 500))
        views.setOnClickPendingIntent(R.id.btn_add_750, createLogWaterPendingIntent(context, 750))

        // Update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun createLogWaterPendingIntent(context: Context, amount: Int): PendingIntent {
        val intent = Intent(context, WaterWidgetProvider::class.java).apply {
            action = "com.tusharatexpo.water.ACTION_LOG_WATER"
            putExtra("amount", amount)
        }
        
        val flags = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        
        return PendingIntent.getBroadcast(context, amount, intent, flags)
    }
}
