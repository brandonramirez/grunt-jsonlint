var grunt = require('grunt');
var jsonlint = require('@prantlf/jsonlint');
var strip = require('strip-json-comments');
var validator = require('@prantlf/jsonlint/lib/validator');
var _ = require('lodash');

var expect = require('expect.js');
var sinon = require('sinon');
expect = require('sinon-expect').enhance(expect, sinon, 'was');

var taskFactory = require('../lib/grunt-jsonlint-task');

describe('grunt-jsonlint task', function () {

  before('stub out and spy on grunt logger', function () {
    sinon.stub(grunt.log, 'ok');
    sinon.stub(grunt.log, 'error');
    sinon.stub(grunt.log, 'writeln');
    sinon.stub(grunt.fail, 'warn');
  });

  after('restore grung logger methods', function () {
    grunt.log.ok.restore();
    grunt.log.error.restore();
    grunt.log.writeln.restore();
    grunt.fail.warn.restore();
  });

  afterEach('reset the spy counts', function () {
    grunt.log.ok.reset();
    grunt.log.error.reset();
    grunt.log.writeln.reset();
    grunt.fail.warn.reset();
  });

  // basic pass/fail behaviors

  it('passes a valid JSON file', function () {
    runWithFiles(grunt, jsonlint, [ 'test/valid.json' ]);
    expectSuccess(grunt);
  });

  it('fails an invalid JSON file', function () {
    runWithFiles(grunt, jsonlint, [ 'test/invalid.json' ]);
    expectFailure(grunt, 'test/invalid.json', 9);
  });

  it('passes a valid CJSON file', function () {
    runWithFiles(grunt, jsonlint, [ 'test/cjson.json' ], { cjson: true });
    expectSuccess(grunt);
  });

  it('passes a JSON file complying with the schema', function () {
    runWithFiles(grunt, jsonlint, [ 'test/3.json' ], {
      schema: { src: 'test/3.schema.json' }
    });
    expectSuccess(grunt);
  });

  it('fails a JSON file not complying with the schema', function () {
    runWithFiles(grunt, jsonlint, [ 'test/valid.json' ], {
      schema: { src: 'test/3.schema.json' }
    });
    expectFailure(grunt, 'test/valid.json');
  });

  // reporting behaviors

  it('reports a failure for each files which failed to validate', function () {
    var jsonlint = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlint, [ 'test/invalid.json' ]);
    expectFailure(grunt, 'test/invalid.json', 3);
  });

  it('reports the file name and line number for each file that failed validation', function () {
    var jsonlint = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlint, [ 'test/invalid.json' ]);
    expectFailure(grunt, 'test/invalid.json', 3);
  });

  it('fails the build when a JSON file fails to validate', function () {
    var jsonlint = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlint, [ 'test/invalid.json' ]);

    expect(grunt.fail.warn).was.calledOnce();
  });

  it('reports the number of files which validated successfully', function () {
    var jsonlint = createPassingJsonlintSpy();

    runWithFiles(grunt, jsonlint, [ 'test/valid.json' ]);

    expectSuccess(grunt);
  });

  it('reports the raw jsonlint exception during failure', function () {
    var jsonlint = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlint, [ 'test/invalid.json' ], {
      reporter: 'exception'
    });

    var e = grunt.log.writeln.args[0][0];

    expect(e).to.be.an(Error);
    expect(e.message).to.contain('Invalid JSON');
  });

  it('includes jshint-style details of failure', function () {
    var jsonlint = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlint, [ 'test/invalid.json' ], {
      reporter: 'jshint'
    });

    var message = grunt.log.writeln.args[0][0];

    expect(message).to.contain('"3"');
    expect(message).to.contain('3 | ');
    expect(message).to.contain(grunt.util.linefeed);
    expect(message).to.contain('^ Expected');
    expect(message).to.contain('and instead saw ');
  });

  it('formats validation errors for Visual Studio when the appropriate option is given', function () {
    var jsonlint = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlint, [ 'test/invalid.json' ], {
      formatter: 'msbuild'
    });
    expect(grunt.log.error).was.calledWith('test/invalid.json(3): error: failed JSON validation');
  });

  // formatting of the JSON files.

  it('reformats the input JSON file when configured to do so, using the default indentation level of 2', function () {
    testReformattingFile();
  });

  it('reformats the input JSON file using the specified indentation level', function () {
    testReformattingFile(1);
    testReformattingFile(2);
    testReformattingFile(3);
  });

});

function createPassingJsonlintSpy() {
  return {
    parse: sinon.spy(),
    parser: {
      yy: { }
    }
  };
}

function createFailingJsonlintSpy() {
  var x = {
    parse: function (data) {
      var hash = {
        "text": "\"3\"",
        "token": "STRING",
        "line": 3,
        "loc": {
          "first_line": 3,
          "last_line": 3,
          "first_column": 8,
          "last_column": 11
        },
        "expected": [
          "']'"
        ]
      };
      this.yy.parseError('Invalid JSON', hash);
      throw new Error('Invalid JSON');
    },
    parser: {
      yy: {
        parseError: function stub(msg, hash) { }
      }
    }
  };
  x.parse = x.parse.bind(x.parser);
  return x;
}

function createTaskContext(data) {
  var target = 'unit test';
  var normalizedFiles = grunt.task.normalizeMultiTaskFiles(data, target);

  var filesSrc = normalizedFiles.map(function (f) {
    return f.src;
  }).reduce(function (prev, curr) {
    return prev.concat(curr);
  }, []);

  var optionsFunc = function optionsFunc(options) {
    return function(defaultOptions) {
      return _.extend(defaultOptions, options);
    };
  }(data.options);

  return {
    target: target,
    files: normalizedFiles,
    filesSrc: filesSrc,
    data: data,
    errorCount: 0,
    flags: {},
    nameArgs: '',
    args: [],
    name: 'jsonlint',
    options: optionsFunc
  };
}

function runWithFiles(grunt, jsonlint, files, options) {
  var gruntFiles = files.map(function (file) {
    return {
      src: file
    };
  });

  taskFactory(grunt, jsonlint, strip, validator).bind(createTaskContext({
    files: gruntFiles,
    options: options
  }))();
}

function expectSuccess(gruntSpy) {
  expect(gruntSpy.fail.warn).was.notCalled();
  expect(gruntSpy.log.ok).was.calledOnce();
  expect(gruntSpy.log.ok).was.calledWith('1 file lint free.');
}

function expectFailure(grunt, file, atLine) {
  expect(grunt.log.error).was.calledOnce();
  var message = 'File "' + file + '" failed JSON validation';
  if (atLine != null) {
    message += ' at line ' + atLine;
  }
  message += '.';
  expect(grunt.log.error).was.calledWith(message);
}

function testReformattingFile(indent) {
  var options = {
    format: true
  };

  if (indent !== undefined) {
    options.indent = indent;
  }

  var expectedIndent = '';
  if (indent === undefined) {
    expectedIndent = '  ';
  }
  else {
    for (var i = 0; i < indent; i++) {
      expectedIndent += ' ';
    }
  }

  // Build an unformatted file for testing.
  grunt.file.write(__dirname + '/reformat-this.json', '{"somethingsomething":"something","something":"dark side"}');

  runWithFiles(grunt, createPassingJsonlintSpy(), [ 'test/reformat-this.json' ], options);

  var formatted = grunt.file.read(__dirname + '/reformat-this.json');
  var lines = formatted.split(/\r?\n/);
  expect(lines).to.have.length(5);
  expect(lines[0]).to.be('{');
  expect(lines[1]).to.be(expectedIndent + '"somethingsomething": "something",');
  expect(lines[2]).to.be(expectedIndent + '"something": "dark side"');
  expect(lines[3]).to.be('}');
  expect(lines[4]).to.be.empty();

  grunt.file.delete(__dirname + '/reformat-this.json');
}
