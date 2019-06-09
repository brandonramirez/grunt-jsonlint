const grunt = require('grunt');
const jsonlint = require('@prantlf/jsonlint');
const sorter = require('@prantlf/jsonlint/lib/sorter');
const _ = require('lodash');

let expect = require('expect.js');
const sinon = require('sinon');
expect = require('sinon-expect').enhance(expect, sinon, 'was');

const taskFactory = require('../lib/grunt-jsonlint-task');

describe('grunt-jsonlint task', () => {
  before('stub out and spy on grunt logger', () => {
    sinon.stub(grunt.log, 'ok');
    sinon.stub(grunt.log, 'error');
    sinon.stub(grunt.log, 'writeln');
    sinon.stub(grunt.fail, 'warn');
  });

  after('restore grung logger methods', () => {
    grunt.log.ok.restore();
    grunt.log.error.restore();
    grunt.log.writeln.restore();
    grunt.fail.warn.restore();
  });

  afterEach('reset the spy counts', () => {
    grunt.log.ok.reset();
    grunt.log.error.reset();
    grunt.log.writeln.reset();
    grunt.fail.warn.reset();
  });

  // basic pass/fail behaviors

  it('passes a valid JSON file', () => {
    runWithFiles(grunt, jsonlint, [ 'test/valid.json' ]);
    expectSuccess(grunt);
  });

  it('fails an invalid JSON file', () => {
    runWithFiles(grunt, jsonlint, [ 'test/invalid.json' ]);
    expectFailure(grunt, 9);
  });

  it('passes a valid CJSON file', () => {
    runWithFiles(grunt, jsonlint, [ 'test/cjson.json' ], { cjson: true });
    expectSuccess(grunt);
  });

  // reporting behaviors

  it('reports a failure for each files which failed to validate', () => {
    const jsonlintSpy = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlintSpy, [ 'test/invalid.json' ]);
    expectFailure(grunt, 3);
  });

  it('reports the file name and line number for each file that failed validation', () => {
    const jsonlintSpy = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlintSpy, [ 'test/invalid.json' ]);
    expectFailure(grunt, 3);
  });

  it('fails the build when a JSON file fails to validate', () => {
    const jsonlintSpy = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlintSpy, [ 'test/invalid.json' ]);

    expect(grunt.fail.warn).was.calledOnce();
  });

  it('reports the number of files which validated successfully', () => {
    const jsonlintSpy = createPassingJsonlintSpy();

    runWithFiles(grunt, jsonlintSpy, [ 'test/valid.json' ]);

    expectSuccess(grunt);
  });

  it('reports the raw jsonlint exception during failure', () => {
    const jsonlintSpy = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlintSpy, [ 'test/invalid.json' ], {
      reporter: 'exception'
    });

    const e = grunt.log.writeln.args[0][0];

    expect(e).to.be.an(Error);
    expect(e.message).to.contain('Invalid JSON');
  });

  it('includes jshint-style details of failure', () => {
    const jsonlintSpy = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlintSpy, [ 'test/invalid.json' ], {
      reporter: 'jshint'
    });

    const message = grunt.log.writeln.args[0][0];

    expect(message).to.contain('"3"');
    expect(message).to.contain('3 | ');
    expect(message).to.contain(grunt.util.linefeed);
    expect(message).to.contain('^ Expected');
    expect(message).to.contain('and instead saw ');
  });

  it('formats validation errors for Visual Studio when the appropriate option is given', () => {
    const jsonlintSpy = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlintSpy, [ 'test/invalid.json' ], {
      formatter: 'msbuild'
    });
    expect(grunt.log.error).was.calledWith('test/invalid.json(3): error: failed JSON validation');
  });

  // formatting of the JSON files.

  it('reformats the input JSON file when configured to do so, using the default indentation level of 2', () => {
    testReformattingFile();
  });

  it('reformats the input JSON file using the specified indentation level', () => {
    testReformattingFile(1);
    testReformattingFile(2);
    testReformattingFile(3);
  });

  it('reformats the input JSON file with object keys sorted', testSortingObjectKeys);

  it('does not sort keys unless asked to do so', testNotSortingObjectKeys);
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
  /* eslint no-unused-vars: [ "off" ] */

  const x = {
    parse(data) {
      const hash = {
        text: '"3"',
        token: 'STRING',
        line: 3,
        loc: {
          first_line: 3,
          last_line: 3,
          first_column: 8,
          last_column: 11
        },
        expected: [
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
  const target = 'unit test';
  const normalizedFiles = grunt.task.normalizeMultiTaskFiles(data, target);

  const filesSrc = normalizedFiles.map(f => f.src).reduce((prev, curr) => prev.concat(curr), []);

  const optionsFunc = (function optionsFunc(options) {
    return defaultOptions => _.extend(defaultOptions, options);
  }(data.options));

  return {
    target,
    files: normalizedFiles,
    filesSrc,
    data,
    errorCount: 0,
    flags: {},
    nameArgs: '',
    args: [],
    name: 'jsonlint',
    options: optionsFunc
  };
}

function runWithFiles(gruntForTest, jsonlintForTest, files, options) {
  const gruntFiles = files.map(file => ({
    src: file
  }));

  taskFactory(gruntForTest, jsonlintForTest, sorter).bind(createTaskContext({
    files: gruntFiles,
    options
  }))();
}

function expectSuccess(gruntSpy) {
  expect(gruntSpy.fail.warn).was.notCalled();
  expect(gruntSpy.log.ok).was.calledOnce();
  expect(gruntSpy.log.ok).was.calledWith('1 file lint free.');
}

function expectFailure(gruntSpy, atLine) {
  expect(gruntSpy.log.error).was.calledOnce();
  expect(gruntSpy.log.error).was.calledWith(`File "test/invalid.json" failed JSON validation at line ${atLine}.`);
}

function testReformattingFile(indent) {
  const options = {
    format: true
  };

  if (indent !== undefined) {
    options.indent = indent;
  }

  let expectedIndent = '';
  if (indent === undefined) {
    expectedIndent = '  ';
  }
  else {
    for (let i = 0; i < indent; i++) {
      expectedIndent += ' ';
    }
  }

  // Build an unformatted file for testing.
  grunt.file.write(`${__dirname}/reformat-this.json`, '{"somethingsomething":"something","something":"dark side"}');

  runWithFiles(grunt, jsonlint, [ 'test/reformat-this.json' ], options);

  const formatted = grunt.file.read(`${__dirname}/reformat-this.json`);
  const lines = formatted.split(/\r?\n/);
  expect(lines).to.have.length(5);
  expect(lines[0]).to.be('{');
  expect(lines[1]).to.be(`${expectedIndent}"somethingsomething": "something",`);
  expect(lines[2]).to.be(`${expectedIndent}"something": "dark side"`);
  expect(lines[3]).to.be('}');
  expect(lines[4]).to.be.empty();

  grunt.file.delete(`${__dirname}/reformat-this.json`);
}

function testSortingObjectKeys() {
  const options = {
    format: true,
    sortKeys: true
  };

  const sourceJson = JSON.stringify({
    somethingsomething: 'something',
    something: 'dark side'
  }, null, 2);

  // Build an unformatted file for testing.
  grunt.file.write(`${__dirname}/reformat-this.json`, sourceJson);

  runWithFiles(grunt, jsonlint, [ 'test/reformat-this.json' ], options);

  const formatted = grunt.file.read(`${__dirname}/reformat-this.json`);
  const lines = formatted.split(/\r?\n/);
  expect(lines).to.have.length(5);
  expect(lines[0]).to.be('{');
  expect(lines[1]).to.be('  "something": "dark side",');
  expect(lines[2]).to.be('  "somethingsomething": "something"');
  expect(lines[3]).to.be('}');
  expect(lines[4]).to.be.empty();

  grunt.file.delete(`${__dirname}/reformat-this.json`);
}

function testNotSortingObjectKeys() {
  const options = {
    format: true,
    sortKeys: false
  };

  const sourceJson = JSON.stringify({
    somethingsomething: 'something',
    something: 'dark side'
  }, null, 2);

  // Build an unformatted file for testing.
  grunt.file.write(`${__dirname}/dont-reformat-this.json`, sourceJson);

  runWithFiles(grunt, jsonlint, [ 'test/dont-reformat-this.json' ], options);

  const formatted = grunt.file.read(`${__dirname}/dont-reformat-this.json`);
  expect(formatted).to.be(`${sourceJson}\n`);

  grunt.file.delete(`${__dirname}/dont-reformat-this.json`);
}
