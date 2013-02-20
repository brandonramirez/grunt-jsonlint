grunt-jsonlint
==============

Validate JSON files from grunt.

# Install

npm install grunt-jsonlint

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

The underlying jsonlint library has many feasures not yet exposed.
Each of these would be valuable in grunt.

* Schema validation
* Sort file by key
