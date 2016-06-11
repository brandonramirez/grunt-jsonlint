/**
 * The meat of this Grunt plugin's task implementation is broken out into
 * a library file so that it can be called directly with dependencies injected.

 * This facilitates testing.
 */
exports = module.exports = function makeTask(grunt, jsonlint, strip) {
  var FORMATTERS = {
    prose: require('../lib/formatters/prose'),
    msbuild: require('../lib/formatters/visual-studio')
  };

  var REPORTERS = {
    exception: require('../lib/reporters/exception'),
    jshint: require('../lib/reporters/jshint-style')
  };

  return function () {
    var options = this.options({
      cjson: false,
      format: false,
      indent: 2,
      formatter: 'prose',
      reporter: 'exception'
    });

    var format = FORMATTERS[options.formatter];
    var report = REPORTERS[options.reporter];

    if (this.filesSrc != null) {
      var failed = 0;
      var errorDetails = null;

      // Monkey patch the parseError function to something we can control.
      var originalParseError = jsonlint.parser.yy.parseError;
      jsonlint.parser.yy.parseError = function (str, hash) {
        errorDetails = hash;
        //console.log(JSON.stringify(errorDetails, null, 2));
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
            grunt.log.error(format(file, errorDetails.line));
            grunt.log.writeln(report(file, e, errorDetails, grunt));
          }
        });
      }
      finally {
        jsonlint.parser.yy.parseError = originalParseError;
      }

      if (failed > 0) {
        grunt.fail.warn(failed + ' ' + grunt.util.pluralize(failed, 'file/files') + ' failed validation');
      }
      else {
        var successful = this.filesSrc.length - failed;
        grunt.log.ok(successful + ' file' + (successful === 1 ? '' : 's') + ' lint free.');
      }
    }
  };
};
