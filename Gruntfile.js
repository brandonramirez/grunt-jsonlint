module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      gruntfile: {
        src: [ 'Gruntfile.js' ]
      },
      packageJson: {
        src: [ 'package.json' ]
      },
      tasks: {
        src: [ 'tasks/*.js', 'lib/*.js' ],
        options: {
          eqnull: true,
          curly: true,
          newcap: true,
          unused: true,
          indent: 2,
          noempty: true,

          node: true
        }
      },
      tests: {
        src: [ 'test/*.js' ],
        options: {
          eqnull: true,
          indent: 2,
          node: true
        }
      }
    },

    jsonlint: {
      sample: {
        src: [ 'test/valid.json' ]
      },
      packageJson: {
        src: [ 'package.json' ]
      },
      overflowTest: {
        src: [ 'test/issue13/**/*.json' ]
      },
      invalid: {
        src: [ 'test/invalid.json' ]
      }
    },

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      unitTests: {
        src: [ 'test/unit-tests.js' ]
      },
      issue13Tests: {
        src: [ 'test/issue13-tests.js' ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  require('./tasks/jsonlint')(grunt);

  grunt.registerTask('test', [ 'jshint', 'jsonlint:sample', 'jsonlint:packageJson', 'mochaTest' ]);

  // Default task(s).
  grunt.registerTask('default', [ 'test' ]);

};
