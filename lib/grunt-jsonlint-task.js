/**
 * The meat of this Grunt plugin's task implementation is broken out into
 * a library file so that it can be called directly with dependencies injected.

 * This facilitates testing.
 */
exports = module.exports = function makeTask(grunt, jsonlint, strip) {
  return function () {
    var options = this.options({
      cjson: false,
      format: false,
      indent: 2
    });

    if (this.filesSrc != null) {
      var failed = 0;
      var lastErrorLine = 0;

      // Monkey patch the parseError function to something we can control.
      var originalParseError = jsonlint.parser.yy.parseError;
      jsonlint.parser.yy.parseError = function (str, hash) {
        lastErrorLine = hash.line;
      };

      try {
        this.filesSrc.forEach(function (file) {
          grunt.log.debug('Validating "' + file + '"...');

          try {
            var data = grunt.file.read(file);

            if (options.cjson) {
              data = strip(data);
            }

            jsonlint.parse(data);
            grunt.verbose.ok('File "' + file + '" is valid JSON.');
            if ( options.format ) {
              var obj = JSON.parse( data );
              var fmtd = JSON.stringify( obj, null, options.indent ) + "\n";
              grunt.file.write( file, fmtd );
              grunt.verbose.ok( 'File "' + file + '" formatted.' );
            }
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

      var successful = this.filesSrc.length - failed;
      grunt.log.ok(successful + ' file' + (successful === 1 ? '' : 's') + ' lint free.');
    }
  };
};
