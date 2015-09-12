module.exports = function(grunt) {
  'use strict';

  var jsFiles = [ 'src/**/*.js' ];
  var exampleFile = [ 'example/main.js' ];

  var config = {

    eslint: {
      options: {
        configFile: './.eslintrc'
      },
      js: jsFiles,
      example: exampleFile
    },

    jscs: {
      options: {
        config: './.jscsrc'
      },
      js: jsFiles,
      example: exampleFile
    },

    babel: {
      options: {
        sourceMap: true,
        env: {
          production: {
            compact: true
          }
        }
      },
      js: {
        files: [ {
          expand: true,
          cwd: './src/',
          src: ['*.js'],
          dest: './lib/'
        } ]
      }
    },

    browserify: {
      example: {
        options: {
          transform: [ 'babelify' ]
        },
        files: {
          'example/main.min.js': 'example/main.js'
        }
      }
    },

    watch: {
      js: {
        files: jsFiles,
        tasks: [ 'js' ]
      },
    }
  };

  grunt.config.init( config );

  require('time-grunt')(grunt);

  require('load-grunt-tasks')(grunt);

  grunt.task.registerTask(
    'js',
    'Validate JS then transpile ES6 to ES5',
    [ 'eslint:js', 'jscs:js', 'babel' ]
  );

  grunt.task.registerTask(
    'example',
    'Build the example js',
    [ 'eslint:example', 'jscs:example', 'browserify' ]
  );

  grunt.task.registerTask(
    'default',
    [ 'watch' ]
  );
};
