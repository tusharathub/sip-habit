const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidSplits(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let content = config.modResults.contents;
      
      // Inject splits block inside android { ... }
      if (!content.includes('splits {')) {
        const androidIndex = content.indexOf('android {');
        if (androidIndex !== -1) {
          const insertIndex = androidIndex + 'android {'.length;
          const splitsConfig = `
    splits {
        abi {
            reset()
            enable true
            universalApk false
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        }
    }
`;
          content = content.slice(0, insertIndex) + splitsConfig + content.slice(insertIndex);
        }
      }
      
      config.modResults.contents = content;
    }
    return config;
  });
};
