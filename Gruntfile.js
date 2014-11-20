module.exports = function( grunt ) {
    "use strict";

    var jsFiles = [ "Gruntfile.js", "./js/**/*.js", "!./js/**/*.min.js" ],
        config = {
            // https://github.com/gruntjs/grunt-contrib-jshint
            jshint: {
                src: jsFiles,
                options: {
                    jshintrc: "./.jshintrc"
                }
            },

            // https://github.com/jscs-dev/grunt-jscs
            jscs: {
                src: jsFiles,
                options: {
                    config: "./.jscs.json"
                }
            },

            // https://github.com/jsoverson/grunt-plato
            plato: {
                app: {
                    options : {
                        jshint: grunt.file.readJSON(".jshintrc")
                    },
                    files: {
                        "reports/plato": [ "js/**/*.js",  ]
                    }
                }
            },

            watch: {
                js: {
                    files: jsFiles,
                    tasks: [ "js" ]
                },

                livereload: {
                    options: {
                        // livereload: {
                        //     port: 12345,
                        //     key: grunt.file.read("livereload/localhost.key"),
                        //     cert: grunt.file.read("livereload/localhost.cert")
                        // }
                    },
                    files: jsFiles
                }
            }

        };

    grunt.config.init( config );

    // https://github.com/sindresorhus/load-grunt-tasks
    require("load-grunt-tasks")(grunt);

    grunt.registerTask(
        "default",
        [ "watch" ]
    );

    grunt.registerTask(
        "js",
        [ "jshint", "jscs" ]
    );

};
