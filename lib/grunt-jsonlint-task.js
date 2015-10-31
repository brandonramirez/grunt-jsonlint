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
          grunt.log.error('File "' + file + '" failed JSON validation.');
          grunt.fail.warn(e);
        }
      });
      var successful = files.length - failed;
      grunt.log.ok(successful + ' file' + (successful === 1 ? '' : 's') + ' lint free.');
    }
  };
};
