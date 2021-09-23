var anyBarClient = require('./anybar-client');
var notifier = require('node-notifier');
var path = require('path');

var fail = anyBarClient.bind(null, 'webpack-fail'),
    warning = anyBarClient.bind(null, 'webpack-warning'),
    compile = anyBarClient.bind(null, 'webpack-compile'),
    success = anyBarClient.bind(null, 'webpack-success'),
    exit = anyBarClient.bind(null, 'white');

var AnyBarWebpackPlugin = function (port, host, opts) {

    var self = this;

    var enableNotifications;

    opts = opts || {};

    if (typeof port === 'object') {
        opts = port;
        port = undefined;
    }

    enableNotifications = opts.enableNotifications;

    var failBinded = fail.bind(this, port, host);
    this.fail = function(projectName, errorName) {

        failBinded();

        if (enableNotifications === true) {
            notifier.notify({
                title: 'Webpack Build Status',
                subtitle: 'Project: ' + projectName,
                message: errorName,
                icon: path.join(__dirname, 'icons/webpack-fail@2x.png')
            });
        }
    };

    const warningBinded = warning.bind(this, port, host);
    this.warning = function(projectName, warningName) {

        warningBinded();

        if (enableNotifications === true) {
            notifier.notify({
                title: 'Webpack Build Status',
                subtitle: 'Project: ' + projectName,
                message: warningName,
                icon: path.join(__dirname, 'icons/webpack-warning@2x.png')
            });
        }
    };

    this.compile = compile.bind(this, port, host);
    this.success = success.bind(this, port, host);
    this.exit = exit.bind(this, port, host);
};

AnyBarWebpackPlugin.prototype.apply = function (compiler) {

    var _this = this;

    compiler.plugin('compile', function() {

        _this.compile();
    });

    compiler.plugin('done', function (stats) {
        if (stats.hasErrors()){
            _this.fail(
                stats.compilation.options.name,
                stats.compilation.errors[0].name);
            return ;
        }
        if (stats.hasWarnings()){
            _this.warning(
                stats.compilation.options.name,
                stats.compilation.warnings[0].name);
            return ;
        }

        _this.success();
    });

    process.on('SIGINT', _this.exit.bind(null));
};

module.exports = AnyBarWebpackPlugin;
