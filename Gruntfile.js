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
                    options: {
                        jshint: grunt.file.readJSON(".jshintrc")
                    },
                    files: {
                        "reports/plato": [ "js/**/*.js" ]
                    }
                }
            },

            // https://github.com/sindresorhus/grunt-shell
            shell: {
                platoreports: {
                    command: "open http://photopicker.dev/reports/plato/"
                }
            },

            // https://github.com/gruntjs/grunt-contrib-watch
            watch: {
                options: {
                    livereload: true,
                    spawn: false
                },
                js: {
                    files: jsFiles,
                    tasks: "js"
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

    grunt.registerTask(
        "test",
        [ "jshint", "jscs", "plato", "shell:platoreports" ]
    );

    var changedFiles = Object.create(null),
        onChange = grunt.util._.debounce(function() {
            grunt.config( "jshint.src", Object.keys(changedFiles) );
            grunt.config( "jscs.src", Object.keys(changedFiles) );
            changedFiles = Object.create(null);
        }, 200);

    grunt.event.on("watch", function(action, filepath) {
        changedFiles[filepath] = action;
        onChange();
    });
};
