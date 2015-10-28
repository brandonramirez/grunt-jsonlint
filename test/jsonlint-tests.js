var grunt = require('grunt');
var jsonlint = require('jsonlint');
var strip = require('strip-comments');
var _ = require('lodash');

var expect = require('expect.js');
var sinon = require('sinon');

expect = require('sinon-expect').enhance(expect, sinon, 'was');

var taskFactory = require('../lib/grunt-jsonlint-task');

describe('grunt-jsonlint task', function () {

  before('stub out and spy on grunt logger', function () {
    sinon.stub(grunt.log, 'ok');
    sinon.stub(grunt.log, 'error');
    sinon.stub(grunt.fail, 'warn');
  });

  after('restore grung logger methods', function () {
    grunt.log.ok.restore();
    grunt.log.error.restore();
    grunt.fail.warn.restore();
  });

  afterEach('reset the spy counts', function () {
    grunt.log.ok.reset();
    grunt.log.error.reset();
    grunt.fail.warn.reset();
  });

  // basic pass/fail behaviors

  it('passes a valid JSON file', function () {
    runWithFiles(grunt, jsonlint, [ 'test/valid.json' ]);
    expectSuccess(grunt);
  });

  it('fails an invalid JSON file', function () {
    runWithFiles(grunt, jsonlint, [ 'test/invalid.json' ]);
    expectFailure(grunt);
  });

  it('passes a valid CJSON file', function () {
    runWithFiles(grunt, jsonlint, [ 'test/cjson.json' ], { strip: true });
    expectSuccess(grunt);
  });

  // reporting behaviors

  it('reports a failure for each files which failed to validate', function () {
    var jsonlint = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlint, [ 'test/invalid.json' ]);
    expectFailure(grunt);
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

});

function createPassingJsonlintSpy() {
  return {
    parse: sinon.spy()
  };
}

function createFailingJsonlintSpy() {
  return {
    parse: function (data) {
      throw new Error('Invalid JSON');
    }
  };
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

  taskFactory(grunt, jsonlint, strip).bind(createTaskContext({
    files: gruntFiles,
    options: options
  }))();
}

function expectSuccess(gruntSpy) {
  expect(gruntSpy.fail.warn).was.notCalled();
  expect(gruntSpy.log.ok).was.calledOnce();
  expect(gruntSpy.log.ok).was.calledWith('1 file lint free.');
}

function expectFailure(grunt) {
  expect(grunt.log.error).was.calledOnce();
  expect(grunt.log.error).was.calledWith('File "test/invalid.json" failed JSON validation.');
}
