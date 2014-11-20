requirejs.config({
    paths: {
        jquery: "//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min",
        facebook: "//connect.facebook.net/en_US/all",
        hogan: "../bower_components/hogan/web/builds/3.0.2/hogan-3.0.2.amd"
    },
    shim: {
        facebook: {
            exports: "FB"
        }
    }
});

// Load the main app module to start the app
requirejs([ "helpers", "main" ]);
