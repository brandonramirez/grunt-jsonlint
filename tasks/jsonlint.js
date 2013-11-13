/*
 * grunt-jsonlint
 * https://github.com/brandonsramirez/grunt-jsonlint
 *
 * Copyright (c) 2013 Brandon Ramirez
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  "use strict";

  var jsonlint = require('jsonlint');

  grunt.registerMultiTask("jsonlint", "Validate JSON files.", function () {
    if (this.filesSrc != null) {
      var failed = 0;
      this.filesSrc.forEach(function (file) {
        grunt.log.debug('Validating "' + file + '"...');

        try {
          jsonlint.parse(grunt.file.read(file));
          grunt.verbose.ok('File "' + file + '" is valid JSON.');
        }
        catch (e) {
          failed++;
          grunt.log.error('File "' + file + '" failed JSON validation.');
          grunt.fail.warn(e);
        }
      });
      var successful = this.filesSrc.length - failed;
      grunt.log.ok(successful + ' file' + (successful === 1 ? '' : 's') + ' lint free.');
    }
  });
};
