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
    if (this.files != null) {
      this.files.forEach(function (mapping) {
        mapping.src.forEach(function (file) {
          grunt.log.debug('Validating "' + file + '"...');

          try {
            jsonlint.parse(grunt.file.read(file));
            grunt.log.writeln('File "' + file + '" is valid JSON.');
          }
          catch (e) {
            grunt.log.error('File "' + file + '" failed JSON validation.');
            grunt.fail.warn(e);
          }
        });
      });
    }
  });
};
