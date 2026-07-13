const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidWidget(config) {
  return withAndroidManifest(config, async (config) => {
    let androidManifest = config.modResults;
    let mainApplication = androidManifest.manifest.application[0];
    
    // Ensure receiver array exists
    if (!mainApplication.receiver) {
      mainApplication.receiver = [];
    }
    
    // Check if the widget provider receiver is already added
    const hasReceiver = mainApplication.receiver.some(
      (r) => r.$['android:name'] === 'com.tusharatexpo.water.WaterWidgetProvider'
    );
    
    if (!hasReceiver) {
      mainApplication.receiver.push({
        $: {
          'android:name': 'com.tusharatexpo.water.WaterWidgetProvider',
          'android:label': 'Sip Habit Progress',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.appwidget.action.APPWIDGET_UPDATE',
                },
              },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/water_widget_info',
            },
          },
        ],
      });
    }
    
    return config;
  });
};
