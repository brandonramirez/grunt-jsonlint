grunt-jsonlint [![Build Status](https://travis-ci.org/brandonramirez/grunt-jsonlint.svg)](https://travis-ci.org/brandonramirez/grunt-jsonlint)
==============

Validate JSON files from grunt.

Requires grunt 1.0+ and node 4.0+.

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

# Formatting

Add the following (multi-)task to your Gruntfile:

    jsonlint: {
      all: {
        src: [ 'some/valid.json' ],
        options: {
          format: true,
          indent: 2,
        }
      }
    }

* format, when true JSON.stringify will be used to format the JavaScript (if it is valid)
* indent, the value passed to JSON.stringify, it can be the number of spaces, or string like "\t"

# Reporting

There are a few options available for reporting errors:

## Error message format

The standard error message format (`prose`) is optimized for human reading and looks like:

    >> File "test/invalid.json" failed JSON validation at line 9.

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

    >> test/invalid.json(9): error: failed JSON validation

## Error reporting

By default, the raw error from the underlying `jsonlint` library comes through to the grunt output.  It looks like:

    Error: Parse error on line 9:
    ...        "2"        "3",      ],      
    ----------------------^
    Expecting 'EOF', '}', ':', ',', ']', got 'STRING'

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

     9 |     "3"
             ^ Expected 'EOF', '}', ':', ',', ']' and instead saw '3'

The default reporter is called `exception` since it simply relays the raw exception.

# Roadmap

The underlying jsonlint library has many features not yet exposed.
Each of these would be valuable in grunt.

* Schema validation
* Sort file by key

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
