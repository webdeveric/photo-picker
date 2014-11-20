/* jshint ignore:start */
requirejs.config({
    // enforceDefine: true,
    paths: {
        // jquery: [
        //     "//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min",
        //     "../bower_components/jquery/dist/jquery.min"
        // ],
        jquery: "../bower_components/jquery/dist/jquery.min",
        facebook: "//connect.facebook.net/en_US/all",
        hogan: "../bower_components/hogan/web/builds/3.0.2/hogan-3.0.2.amd"
    },
    shim: {
        facebook: {
            exports: "FB"
        }
    }
});

requirejs([ "jquery", "main" ]);
