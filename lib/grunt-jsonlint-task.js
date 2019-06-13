/**
 * The meat of this Grunt plugin's task implementation is broken out into
 * a library file so that it can be called directly with dependencies injected.

 * This facilitates testing.
 */

const prose = require('../lib/formatters/prose');
const msbuild = require('../lib/formatters/visual-studio');

const exception = require('../lib/reporters/exception');
const jshint = require('../lib/reporters/jshint-style');

const FORMATTERS = {
  prose,
  msbuild
};

const REPORTERS = {
  exception,
  jshint
};

module.exports = function makeTask(grunt, jsonlint, validator, sorter) {
  return function runTask() {
    const options = this.options({
      schema: {},
      ignoreComments: false,
      allowSingleQuotedStrings: false,
      cjson: false,
      format: false,
      indent: 2,
      sortKeys: false,
      formatter: 'prose',
      reporter: 'exception'
    });
    const { schema } = options;

    const format = FORMATTERS[options.formatter];
    const report = REPORTERS[options.reporter];

    if (this.filesSrc != null) {
      let failed = 0;
      let errorDetails = null;

      /* eslint no-param-reassign:
        ["error", { "props": true, "ignorePropertyModificationsFor": ["jsonlint"] }]
      */

      // Monkey patch the parseError function to something we can control.
      const originalParseError = jsonlint.parser.yy.parseError;
      jsonlint.parser.yy.parseError = (str, hash) => {
        errorDetails = hash;
        // console.log(JSON.stringify(errorDetails, null, 2));
      };

      try {
        this.filesSrc.forEach((file) => {
          grunt.log.debug(`Validating "${file}"...`);

          try {
            const data = grunt.file.read(file);

            let parsedData = jsonlint.parse(data, {
              ignoreComments: options.ignoreComments || options.cjson,
              allowSingleQuotedStrings: options.allowSingleQuotedStrings
            });
            if (schema.src) {
              const parsedSchema = grunt.file.read(schema.src);
              const validate = validator.compile(parsedSchema, schema.environment);
              validate(parsedData);
            }
            grunt.verbose.ok(`File "${file}" is valid JSON.`);
            if (options.format) {
              if (options.sortKeys) {
                parsedData = sorter.sortObject(parsedData);
              }
              const fmtd = `${JSON.stringify(parsedData, null, options.indent)}\n`;
              grunt.file.write(file, fmtd);
              grunt.verbose.ok(`File "${file}" formatted.`);
            }
          }
          catch (e) {
            failed++;
            grunt.log.error(format(file, errorDetails ? errorDetails.line : undefined));
            grunt.log.writeln(report(file, e, errorDetails, grunt));
          }
        });
      }
      finally {
        jsonlint.parser.yy.parseError = originalParseError;
      }

      if (failed > 0) {
        grunt.fail.warn(`${failed} ${grunt.util.pluralize(failed, 'file/files')} failed validation`);
      }
      else {
        const successful = this.filesSrc.length - failed;
        grunt.log.ok(`${successful} file${successful === 1 ? '' : 's'} lint free.`);
      }
    }
  };
};
