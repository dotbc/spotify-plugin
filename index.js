const cdem = require('cardstack-extension-manager');
const SpotifyPlugin = require('./plugin');

let interval;

module.exports.activate = function (cb) {
  cb(null, new SpotifyPlugin());
};

module.exports.deactivate = function () {
  clearInterval(interval);
  console.log('extension deactivated');
}