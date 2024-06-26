module.exports = (grunt) => {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      gruntfile: {
        src: [ 'Gruntfile.js' ]
      },
      tasks: {
        src: [ 'tasks/*.js', 'lib/*.js' ]
      },
      tests: {
        src: [ 'test/*.js' ]
      }
    },

    jsonlint: {
      sample: {
        src: [ 'test/valid.json' ]
      },
      packageJson: {
        src: [ 'package.json' ]
      },
      schema: {
        src: [ 'test/3.json' ],
        options: {
          schema: {
            src: 'test/3.schema.json'
          }
        }
      },
      singleQuotes: {
        src: [ 'test/single-quotes.json' ],
        options: {
          allowSingleQuotedStrings: true
        }
      },
      comments: {
        src: [ 'test/cjson.json' ],
        options: {
          ignoreComments: true
        }
      },
      trailingCommas: {
        src: [ 'test/trailing-commas.json' ],
        options: {
          ignoreTrailingCommas: true
        }
      },
      json5: {
        src: [ 'test/json5.json' ],
        options: {
          mode: 'json5'
        }
      },
      duplicateKeys: {
        src: [ 'test/duplicate-keys.json' ]
      },
      overflowTest: {
        src: [ 'test/issue13/**/*.json' ]
      },
      invalid: {
        src: [ 'test/invalid.json' ]
      },
      invalidVisualStudio: {
        src: [ 'test/invalid.json' ],
        options: {
          formatter: 'msbuild'
        }
      },
      invalidJshintStyle: {
        src: [ 'test/invalid.json' ],
        options: {
          reporter: 'jshint'
        }
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

  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');

  require('./tasks/jsonlint')(grunt);

  grunt.registerTask('test', [
    'eslint',
    'jsonlint:sample', 'jsonlint:packageJson', 'jsonlint:comments', 'jsonlint:singleQuotes',
    'jsonlint:trailingCommas', 'jsonlint:json5', 'jsonlint:duplicateKeys',
    'mochaTest'
  ]);

  // Default task(s).
  grunt.registerTask('default', [ 'test' ]);
};
