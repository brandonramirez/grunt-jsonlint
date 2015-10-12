var grunt = require('grunt');
var jsonlint = require('jsonlint');

var expect = require('expect.js');
var sinon = require('sinon');

expect = require('sinon-expect').enhance(expect, sinon, 'was');

var jsonlintTask = require('../tasks/jsonlint.js');
var taskFactory = require('../lib/grunt-jsonlint-task');

describe('grunt-jsonlint task', function () {

  // basic pass/fail behaviors

  it('passes a valid JSON file', function () {
    var grunt = createGruntSpy();

    runWithFiles(grunt, jsonlint, [ 'test/valid.json' ]);
    expectSuccess(grunt);
  });

  it('fails an invalid JSON file', function () {
    var grunt = createGruntSpy();

    runWithFiles(grunt, jsonlint, [ 'test/invalid.json' ]);
    expectFailure(grunt);
  });

  // reporting behaviors

  it('reports a failure for each files which failed to validate', function () {
    var grunt = createGruntSpy();
    var jsonlint = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlint, [ 'test/invalid.json' ]);
    expectFailure(grunt);
  });

  it('fails the build when a JSON file fails to validate', function () {
    var grunt = createGruntSpy();
    var jsonlint = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlint, [ 'test/invalid.json' ]);

    expect(grunt.fail.warn).was.calledOnce();
  });

  it('reports the number of files which validated successfully', function () {
    var grunt = createGruntSpy();
    var jsonlint = createPassingJsonlintSpy();

    runWithFiles(grunt, jsonlint, [ 'test/valid.json' ]);

    expectSuccess(grunt);
  });

});

function createGruntSpy() {
  return {
    log: {
      ok: sinon.spy(),
      debug: sinon.spy(),
      error: sinon.spy()
    },
    fail: {
      warn: sinon.spy(),
      fatal: sinon.spy()
    },
    verbose: {
      ok: sinon.spy()
    },
    file: {
      read: grunt.file.read
    }
  };
}

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

  return {
    target: target,
    files: normalizedFiles,
    filesSrc: filesSrc,
    data: data,
    errorCount: 0,
    flags: {},
    nameArgs: '',
    args: [],
    name: 'jsonlint'
  };
}

function runWithFiles(grunt, jsonlint, files) {
  var gruntFiles = files.map(function (file) {
    return {
      src: file
    };
  });

  taskFactory(grunt, jsonlint).bind(createTaskContext({
    files: gruntFiles
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
