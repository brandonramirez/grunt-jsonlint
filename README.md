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
