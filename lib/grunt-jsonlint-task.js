/**
 * The meat of this Grunt plugin's task implementation is broken out into
 * a library file so that it can be called directly with dependencies injected.

 * This facilitates testing.
 */

const prose = require('./formatters/prose');
const msbuild = require('./formatters/visual-studio');

const exception = require('./reporters/exception');
const jshint = require('./reporters/jshint-style');

const FORMATTERS = {
  prose,
  msbuild
};

const REPORTERS = {
  exception,
  jshint
};

module.exports = function makeTask(grunt, jsonlint, validator, sorter, printer) {
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
      prettyPrint: false,
      indent: 2,
      sortKeys: false,
      pruneComments: false,
      stripObjectKeys: false,
      enforceDoubleQuotes: false,
      enforceSingleQuotes: false,
      trimTrailingCommas: false,
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

    function parseInput(data) {
      // Parse JSON data from string by the schema validator to get
      // error messages including the location in the source string.
      if (schema.src) {
        const parsedSchema = grunt.file.read(schema.src);
        const validate = validator.compile(parsedSchema, parserOptions);
        return validate(data, parserOptions);
      }
      return jsonlint.parse(data, parserOptions);
    }

    function formatOutput(data, parsedData, file) {
      let formatted;
      if (options.format) {
        const preparedData = options.sortKeys
          ? sorter.sortObject(parsedData) : parsedData;
        formatted = `${JSON.stringify(preparedData, null, options.indent)}\n`;
      }
      else if (options.prettyPrint) {
        parserOptions.rawTokens = true;
        const tokens = jsonlint.tokenize(data, parserOptions);
        // TODO: Support sorting tor the tokenized input too.
        formatted = `${printer.print(tokens, {
          indent: options.indent,
          pruneComments: options.pruneComments,
          stripObjectKeys: options.stripObjectKeys,
          enforceDoubleQuotes: options.enforceDoubleQuotes,
          enforceSingleQuotes: options.enforceSingleQuotes,
          trimTrailingCommas: options.trimTrailingCommas
        })}\n`;
      }
      if (formatted) {
        grunt.file.write(file, formatted);
        grunt.verbose.ok(`File "${file}" formatted.`);
      }
    }

    if (this.filesSrc) {
      let failed = 0;
      this.filesSrc.forEach((file) => {
        grunt.log.debug(`Validating "${file}"...`);
        try {
          const data = grunt.file.read(file);
          const parsedData = parseInput(data);
          grunt.verbose.ok(`File "${file}" is valid JSON.`);
          formatOutput(data, parsedData, file);
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
