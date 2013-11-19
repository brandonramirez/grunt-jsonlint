grunt-jsonlint
==============

Validate JSON files from grunt.

Requires grunt 0.4

# Install

    npm install grunt-jsonlint --save-dev

# Configure

Add the following (multi-)task to your Gruntfile:

    jsonlint: {
      sample: {
        src: [ 'some/valid.json' ]
      }
    }

Add the following to load the task into your Gruntfile:

    grunt.loadNpmTasks('grunt-jsonlint');

An error will be thrown if the JSON file contains syntax errors.

# Roadmap

The underlying jsonlint library has many features not yet exposed.
Each of these would be valuable in grunt.

* Schema validation
* Sort file by key

# Release History

* 2013-02-20   v1.0.0   First official release
* 2013-09-19   v1.0.1   Do not log every validated file
* 2013-10-31   v1.0.2   Add output of count of successfully linted JSON file for issue
* 2013-11-16   v1.0.3   Fix output of count of successfully linted JSON files.
* 2013-11-18   v1.0.4   Updated for latest dependencies.
