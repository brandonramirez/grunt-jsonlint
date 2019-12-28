const grunt = require('grunt');
const jsonlint = require('@prantlf/jsonlint');
const validator = require('@prantlf/jsonlint/lib/validator');
const sorter = require('@prantlf/jsonlint/lib/sorter');
const printer = require('@prantlf/jsonlint/lib/printer');
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
    expectFailure(grunt, 'test/invalid.json', 10, 9);
  });

  it('passes a valid CJSON file', () => {
    runWithFiles(grunt, jsonlint, [ 'test/cjson.json' ], { cjson: true });
    expectSuccess(grunt);
  });

  it('passes a JSON file complying with the schema', () => {
    runWithFiles(grunt, jsonlint, [ 'test/3.json' ], {
      schema: { src: 'test/3.schema.json' }
    });
    expectSuccess(grunt);
  });

  it('fails a JSON file not complying with the schema', () => {
    runWithFiles(grunt, jsonlint, [ 'test/valid.json' ], {
      schema: { src: 'test/3.schema.json' }
    });
    expectFailure(grunt, 'test/valid.json', 1, 1);
  });

  it('passes a JSON file with duplicate object keys', () => {
    runWithFiles(grunt, jsonlint, [ 'test/duplicate-keys.json' ]);
    expectSuccess(grunt);
  });

  it('fails a JSON file not complying with the schema', () => {
    runWithFiles(grunt, jsonlint, [ 'test/duplicate-keys.json' ], {
      allowDuplicateObjectKeys: false
    });
    expectFailure(grunt, 'test/duplicate-keys.json', 3, 7);
  });

  // reporting behaviors

  it('reports a failure for each files which failed to validate', () => {
    const jsonlintSpy = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlintSpy, [ 'test/invalid.json' ]);
    expectFailure(grunt, 'test/invalid.json', 3, 8);
  });

  it('reports the file name and line number for each file that failed validation', () => {
    const jsonlintSpy = createFailingJsonlintSpy();

    runWithFiles(grunt, jsonlintSpy, [ 'test/invalid.json' ]);
    expectFailure(grunt, 'test/invalid.json', 3, 8);
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

    const message = grunt.log.writeln.args[0][0];

    expect(message).to.contain('Expected');
    expect(message).to.contain('and instead saw');
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
    expect(grunt.log.error).was.calledWith('test/invalid.json(3,8): error: failed JSON validation');
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
  return {
    parse() {
      const error = new SyntaxError('Parse error on line 1, column 3:\n{ 3...\n--^\nExpected "}" and instead saw "3"');
      error.reason = 'Expected "}" and instead saw "3"';
      error.excerpt = '{ 3...';
      error.pointer = '--^';
      error.location = {
        start: {
          line: 3,
          column: 8,
          offset: 11
        }
      };
      throw error;
    }
  };
}

function createTaskContext(data) {
  const target = 'unit test';
  const normalizedFiles = grunt.task.normalizeMultiTaskFiles(data, target);

  const filesSrc = normalizedFiles.map((f) => f.src).reduce((prev, curr) => prev.concat(curr), []);

  const optionsFunc = (function optionsFunc(options) {
    return (defaultOptions) => _.extend(defaultOptions, options);
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
  const gruntFiles = files.map((file) => ({
    src: file
  }));

  taskFactory(gruntForTest, jsonlintForTest, validator, sorter, printer)
    .bind(createTaskContext({
      files: gruntFiles,
      options
    }))();
}

function expectSuccess(gruntSpy) {
  expect(gruntSpy.fail.warn).was.notCalled();
  expect(gruntSpy.log.ok).was.calledOnce();
  expect(gruntSpy.log.ok).was.calledWith('1 file lint free.');
}

function expectFailure(gruntSpy, file, atLine, atColumn) {
  expect(gruntSpy.log.error).was.calledOnce();
  let message = `File "${file}" failed JSON validation`;
  if (atLine != null) {
    message += ` at line ${atLine}, column ${atColumn}`;
  }
  message += '.';
  expect(gruntSpy.log.error).was.calledWith(message);
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
