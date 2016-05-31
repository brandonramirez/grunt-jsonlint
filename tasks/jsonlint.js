/*
 * grunt-jsonlint
 * https://github.com/brandonsramirez/grunt-jsonlint
 *
 * Copyright (c) 2013 Brandon Ramirez
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  "use strict";

  var strip = require('strip-json-comments');
  var jsonlint = require('jsonlint');
  var gruntJsonLintTask = require('../lib/grunt-jsonlint-task');

  grunt.registerMultiTask("jsonlint", "Validate JSON files.", gruntJsonLintTask(grunt, jsonlint, strip));
};


