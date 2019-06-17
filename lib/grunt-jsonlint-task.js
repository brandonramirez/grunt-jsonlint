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
      ignoreTrailingCommas: false,
      allowSingleQuotedStrings: false,
      allowDuplicateObjectKeys: true,
      cjson: false,
      mode: 'json',
      format: false,
      indent: 2,
      sortKeys: false,
      formatter: 'prose',
      reporter: 'exception'
    });
    const { schema } = options;
    // Share the same options for parsing both data and schema for simplicity.
    const parserOptions = {
      mode: options.mode,
      ignoreComments: options.ignoreComments || options.cjson
                      || options.mode === 'cjson' || options.mode === 'json5',
      ignoreTrailingCommas: options.ignoreTrailingCommas || options.mode === 'json5',
      allowSingleQuotedStrings: options.allowSingleQuotedStrings || options.mode === 'json5',
      allowDuplicateObjectKeys: options.allowDuplicateObjectKeys,
      environment: schema.environment
    };

    const format = FORMATTERS[options.formatter];
    const report = REPORTERS[options.reporter];

    if (this.filesSrc) {
      let failed = 0;
      this.filesSrc.forEach((file) => {
        grunt.log.debug(`Validating "${file}"...`);
        try {
          const data = grunt.file.read(file);
          let parsedData;
          // Parse JSON data from string by the schema validator to get
          // error messages including the location in the source string.
          if (schema.src) {
            const parsedSchema = grunt.file.read(schema.src);
            const validate = validator.compile(parsedSchema, parserOptions);
            parsedData = validate(data, parserOptions);
          }
          else {
            parsedData = jsonlint.parse(data, parserOptions);
          }
          grunt.verbose.ok(`File "${file}" is valid JSON.`);
          if (options.format) {
            if (options.sortKeys) {
              parsedData = sorter.sortObject(parsedData);
            }
            const formatted = `${JSON.stringify(parsedData, null, options.indent)}\n`;
            grunt.file.write(file, formatted);
            grunt.verbose.ok(`File "${file}" formatted.`);
          }
        }
        catch (error) {
          failed++;
          grunt.log.error(format(file, error));
          grunt.log.writeln(report(file, error, grunt));
        }
      });

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
