grunt-jsonlint [![Node.js CI](https://github.com/brandonramirez/grunt-jsonlint/actions/workflows/node.js.yml/badge.svg)](https://github.com/brandonramirez/grunt-jsonlint/actions/workflows/node.js.yml)
==============

Validate [JSON]/[JSON5] files from [Grunt].

Requires Grunt 1.6+ and node 18+.

# Install

    npm install grunt-jsonlint --save-dev

# Configure

Add the following (multi-)task to your Gruntfile:

    jsonlint: {
      sample: {
        src: [ 'some/valid.json' ],
        options: {
          formatter: 'prose'
        }
      }
    }

Add the following to load the task into your Gruntfile:

    grunt.loadNpmTasks('grunt-jsonlint');

An error will be thrown if the JSON file contains syntax errors.  To prefer an error format compatible with Visual Studio, change the formatter to 'msbuild'.

Here's a simple [tutorial](http://grunt-tasks.com/grunt-jsonlint/ "grunt") on how to use grunt-jsonlint

# Customizing

There are a couple of options, which can support non-standard JSON syntax, usually used in configuration files for convenience:

    jsonlint: {
      all: {
        src: [ 'some/settings.json' ],
        options: {
          ignoreComments: true,
          ignoreTrailingCommas: true,
          allowSingleQuotedStrings: true,
          allowDuplicateObjectKeys: false,
          mode: 'json5'
        }
      }
    }

* `ignoreComments`, when true JavaScript-style single-line and multiple-line comments will be recognised and ignored during parsing
* `ignoreTrailingCommas`, when true trailing commas in objects and arrays will be ignored during parsing
* `allowSingleQuotedStrings`, when true single quotes will be accepted as alternative delimiters for strings
* `allowDuplicateObjectKeys`, when false, duplicate object keys will be reported as an error
* `mode`, when set to "json", "cjson" or "json5", enables multiple flags according to the referred input type

| Mode    | Enabled Options   |
| ------- | ----------------- |
| "json"  | (none)            |
| "cjson" | `ignoreComments`  |
| "json5" | `ignoreComments`, `ignoreTrailingCommas`, `allowSingleQuotedStrings` and other JSON5 specifics |

# Formatting

Add the following (multi-)task to your `Gruntfile`:

    jsonlint: {
      all: {
        src: [ 'some/valid.json' ],
        options: {
          format: true,
          prettyPrint: false,
          indent: 2,
          sortKeys: false,
          pruneComments: false,
          stripObjectKeys: false,
          enforceDoubleQuotes: false,
          enforceSingleQuotes: false,
          trimTrailingCommas: false
        }
      }
    }

* `format`, when `true` `JSON.stringify` will be used to format the JavaScript (if it is valid)
* `prettyPrint`, when `true` `JSON.stringify` will be used to format the JavaScript (if it is valid)
* `indent`, the value passed to `JSON.stringify`, it can be the number of spaces, or string like "\t"
* `sortKeys`, when `true` keys of objects in the output JSON will be sorted alphabetically (`format` has to be set to `true`)
* `pruneComments`, when `true` comments will be omitted from the prettified output (CJSON feature, `prettyPrint` has to be set to `true`)
* `stripObjectKeys`, when `true` quotes surrounding object keys will be stripped if the key is a JavaScript identifier name (JSON5 feature, `prettyPrint` has to be set to `true`)
* `enforceDoubleQuotes`, when `true` string literals will be consistently surrounded by double quotes (JSON5 feature, `prettyPrint` has to be set to `true`)
* `enforceSingleQuotes`, when `true` string literals will be consistently surrounded by single quotes (JSON5 feature, `prettyPrint` has to be set to `true`)
* `trimTrailingCommas`, when `true` trailing commas after all array items and object entries will be omitted (JSON5 feature, `prettyPrint` has to be set to `true`)

# Schema Validation

You can validate JSON files using [JSON Schema] drafts 06 or 07:

    jsonlint: {
      all: {
        src: [ 'some/manifest.json' ],
        options: {
          schema: {
            src: 'some/manifest-schema.json',
            environment: 'json-schema-draft-07'
          }
        }
      }
    }

* `schema`, when `src` set to a file path, the file will be used as a source of the JSON Schema to validate the JSON files in addition to the syntax checks
* `environment`, can specify the version of the JSON Schema draft to use for validation: "json-schema-draft-04", "json-schema-draft-06" or "json-schema-draft-07" (if not set, the schema draft version will be inferred automatically)

# Reporting

There are a few options available for reporting errors:

## Error message format

The standard error message format (`prose`) is optimized for human reading and looks like:

    >> File "test/invalid.json" failed JSON validation at line 10, column 9.

This is customizable to conform to the Visual Studio style by specifying the `formatter` option as `msbuild`, like:

    jsonlint: {

      visualStudioExample: {
        src: [ 'test/invalid.json' ],
        options: {
          formatter: 'msbuild'
        }
      }

    }

The output will look like:

    >> test/invalid.json(10,9): error: failed JSON validation

## Error reporting

By default, the raw error from the underlying `jsonlint` library comes through to the grunt output.  It looks like:

    ...        "2"        "3",      ],      ...
    ----------------------^
    Unexpected string

To customize this, change the `reporter` option to `jshint` (the format is inspired by how `jshint` formats their output, hence the name):

    jsonlint: {

      jshintStyle: {
        src: [ 'test/invalid.json' ],
        options: {
          reporter: 'jshint'
        }
      }

    }

The output will look like:

    10 | ..."        "3",    ...
                     ^ Unexpected string

The default reporter is called `exception` since it simply relays the raw exception message.

# Running tests

Unit tests are provided for automated regression testing.  The easiest way
to run them is with

    $ npm install
    $ npm test

Alternatively, if you have `grunt-cli` installed, you could use grunt directly with

    $ npm install
    $ grunt test

Which does the same thing.

# Release History

* 2013-02-20   v1.0.0	First official release
* 2013-09-19   v1.0.1	Do not log every validated file
* 2013-10-31   v1.0.2	Add output of count of successfully linted JSON file for issue
* 2013-11-16   v1.0.3	Fix output of count of successfully linted JSON files.
* 2013-11-18   v1.0.4	Updated for latest dependencies.
* 2015-10-11   v1.0.5	Updated for latest dependencies.
* 2015-10-29   v1.0.6	CJSON support thanks to @fredghosn, unit tests
* 2015-12-23   v1.0.7	Include file name and JSON source line number in error messages
* 2016-05-27   v1.0.8	Option to format JSON file thanks to @robblue2x
* 2016-06-11   v1.1.0	Enhanced error reporting for better human reading and Visual Studio integration.
* 2019-06-14   v2.0.0	Schema validation, sorting keys, single quotes thanks to @prantlf, dependency upgrades, drop support for node 4.x.
* 2020-01-01   v2.1.0 Implement `ignoreTrailingCommas`, `allowDuplicateObjectKeys`, `enforceDoubleQuotes`, `enforceSingleQuotes`, and `trimTrailingCommas` options, dependency upgrades, improved error reporting.
* 2020-01-01   v2.1.1 Include license file in published npm package.
* 2020-03-15   v2.1.2 Update external dependency for security.
* 2020-07-22   v2.1.3 Update external dependency for security.
* 2024-05-02   v2.1.4 Update dependencies.
* 2024-05-02   v2.1.5 Lock grunt dependency to 1.5.3 to preserve support for older node versions.
* 2024-05-02   v3.0.0 Update all dependencies, including major version updates. Dropped support for node.js < 18. We now require node 18+ and Grunt 1.6+.

[JSON]: https://tools.ietf.org/html/rfc8259
[JSON5]: https://spec.json5.org
[JSON Schema]: https://json-schema.org
[Grunt]: https://gruntjs.com/
