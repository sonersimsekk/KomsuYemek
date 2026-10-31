const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase paketlerinin bir kısmı .cjs olarak gelir. Metro bunları
// sourceExts içinde cjs yoksa çözemez ve uygulama açılışta çöker.
if (!config.resolver.sourceExts.includes('cjs')) {
  config.resolver.sourceExts.push('cjs');
}
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
