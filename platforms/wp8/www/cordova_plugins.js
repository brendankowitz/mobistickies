cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins\\org.apache.cordova.core.console\\www\\console-via-logger.js",
        "id": "org.apache.cordova.core.console.console",
        "clobbers": [
            "console"
        ]
    },
    {
        "file": "plugins\\org.apache.cordova.core.console\\www\\logger.js",
        "id": "org.apache.cordova.core.console.logger",
        "clobbers": [
            "cordova.logger"
        ]
    }
]
});