/**
 * The meat of this Grunt plugin's task implementation is broken out into
 * a library file so that it can be called directly with dependencies injected.

 * This facilitates testing.
 */
exports = module.exports = function makeTask(grunt, jsonlint, strip) {
  return function () {
    var options = this.options({
      strip: false
    });
console.log(options);
    if (this.filesSrc != null) {
      var failed = 0;
      this.filesSrc.forEach(function (file) {
        grunt.log.debug('Validating "' + file + '"...');

        try {
          var data = grunt.file.read(file);

          if (options.strip) {
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
      var successful = this.filesSrc.length - failed;
      grunt.log.ok(successful + ' file' + (successful === 1 ? '' : 's') + ' lint free.');
    }
  };
};
