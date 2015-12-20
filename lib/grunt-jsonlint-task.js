/**
 * The meat of this Grunt plugin's task implementation is broken out into
 * a library file so that it can be called directly with dependencies injected.

 * This facilitates testing.
 */
exports = module.exports = function makeTask(grunt, jsonlint, strip) {
  return function () {
    var options = this.options({
      cjson: false
    });

    if (this.files != null) {
      var failed = 0;

      // Work-around for issue 1371: https://github.com/gruntjs/grunt/issues/1371
      // Avoiding this.filesSrc so that we don't overflow the stack due to 1371.
      var files = this.files.map(function (file) {
        return file.src;
      }).reduce(function (prev, curr) {
        return prev.concat(curr);
      }, []);

      var lastErrorLine = 0;

      // Monkey patch the parseError function to something we can control.
      var originalParseError = jsonlint.parser.yy.parseError;
      jsonlint.parser.yy.parseError = function (str, hash) {
        lastErrorLine = hash.line;
      };

      try {
        files.forEach(function (file) {
          grunt.log.debug('Validating "' + file + '"...');

          try {
            var data = grunt.file.read(file);

            if (options.cjson) {
              data = strip(data);
            }

            jsonlint.parse(data);
            grunt.verbose.ok('File "' + file + '" is valid JSON.');
          }
          catch (e) {
            failed++;
            grunt.log.error('File "' + file + '" failed JSON validation at line ' + lastErrorLine + '.');
            grunt.fail.warn(e);
          }
        });
      }
      finally {
        jsonlint.parser.yy.parseError = originalParseError;
      }

      var successful = files.length - failed;
      grunt.log.ok(successful + ' file' + (successful === 1 ? '' : 's') + ' lint free.');
    }
  };
};
