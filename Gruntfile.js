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
        src: [ 'tasks/*.js' ],
        options: {
          eqnull: true,
          curly: true,
          newcap: true,
          unused: true,
          indent: 2,
          noempty: true,

          node: true
        }
      }
    },

    jsonlint: {
      sample: {
        src: [ 'test/valid.json' ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  require('./tasks/jsonlint')(grunt);

  // Default task(s).
  grunt.registerTask('default', [ 'jshint', 'jsonlint' ]);

};
