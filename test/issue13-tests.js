const fs = require('fs');
const grunt = require('grunt');

const Promise = require('promise');
const mkdirpPromise = require('mkdirp-promise');
const async = require('async');

const expect = require('expect.js');

const NUM_TEST_DIRECTORIES = 55;
const NUM_TEST_FILES_PER_DIRECTORY = 5000;
const PARALLEL_FILE_CREATION = 100;

describe('system tests', () => {
  before('create 275,000 files spread across various directories', function test(done) {
    this.timeout(60000);

    fs.exists(`${__dirname}/issue13/generated`, (exists) => {
      if (exists) {
        done();
      }
      else {
        const promises = [];
        for (let i = 0; i < NUM_TEST_DIRECTORIES; i++) {
          promises.push(mkdirpPromise(`${__dirname}/issue13/${i}`));
        }
        Promise.all(promises).then(createFiles(() => {
          fs.writeFile(`${__dirname}/issue13/generated`, 'generated', () => {
            done();
          });
        }));
      }
    });
  });

  it('can lint 275,000 files without overflowing the call stack', function test(done) {
    // Issue https://github.com/brandonramirez/grunt-jsonlint/issues/13
    // Work-around until Grunt fixes https://github.com/gruntjs/grunt/issues/1371

    this.timeout(300000);

    function doTest() {
      grunt.util.spawn({
        grunt: true,
        args: [ 'jsonlint:overflowTest' ]
      }, (err, result, code) => {
        // console.log(result.stdout);
        expect(code).to.be(0);
        expect(err).to.be(null);
        done();
      });
    }

    doTest();
  });
});

function createFiles(done) {
  return () => {
    const overall = [];

    for (let i = 0; i < NUM_TEST_DIRECTORIES; i++) {
      for (let j = 0; j < NUM_TEST_FILES_PER_DIRECTORY; j++) {
        overall.push(`${__dirname}/issue13/${i}/${j}.json`);
      }
    }

    // const startTime = new Date().getTime();

    async.eachLimit(overall, PARALLEL_FILE_CREATION, (file, fileDone) => {
      fs.writeFile(file, '{}', fileDone);
    }, () => {
      // console.log('all files built in ' + (new Date().getTime() - startTime) + 'ms.');
      done();
    });
  };
}
