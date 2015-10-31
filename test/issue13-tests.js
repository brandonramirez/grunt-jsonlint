var fs = require('fs');
var grunt = require('grunt');

var Promise = require('promise');
var mkdirpPromise = require('mkdirp-promise');
var async = require('async');

var expect = require('expect.js');

var NUM_TEST_DIRECTORIES = 55;
var NUM_TEST_FILES_PER_DIRECTORY = 5000;
var PARALLEL_FILE_CREATION = 100;

describe('system tests', function () {

  before('create 275,000 files spread across various directories', function (done) {
    this.timeout(60000);

    fs.exists(__dirname + '/issue13/generated', function (exists) {
      if (exists) {
        done();
      }
      else {
        var promises = [];
        for (var i = 0; i < NUM_TEST_DIRECTORIES; i++) {
          promises.push(mkdirpPromise(__dirname + '/issue13/' + i));
        }
        Promise.all(promises).then(createFiles(function () {
          fs.writeFile(__dirname + '/issue13/generated', 'generated', function () {
            done();
          });
        }));
      }
    });
  });

  it('can lint 275,000 files without overflowing the call stack', function (done) {
    // Issue https://github.com/brandonramirez/grunt-jsonlint/issues/13
    // Work-around until Grunt fixes https://github.com/gruntjs/grunt/issues/1371

    this.timeout(300000);

    function doTest() {
      grunt.util.spawn({
        grunt: true,
        args: [ 'jsonlint:overflowTest' ]
      }, function (err, result, code) {
        //console.log(result.stdout);
        expect(code).to.be(0);
        expect(err).to.be(null);
        done();
      });
    }

    doTest();
  });

});

function createFiles(done) {
  return function () {
    var directories = [];
    var files = [];
    var overall = [];

    for (var i = 0; i < NUM_TEST_DIRECTORIES; i++) {
      for (var j = 0; j < NUM_TEST_FILES_PER_DIRECTORY; j++) {
        overall.push(__dirname + '/issue13/' + i + '/' + j + '.json');
      }
    }

    var startTime = new Date().getTime();

    async.eachLimit(overall, PARALLEL_FILE_CREATION, function (file, fileDone) {
      fs.writeFile(file, '{}', fileDone);
    }, function directoriesComplete() {
      //console.log('all files built in ' + (new Date().getTime() - startTime) + 'ms.');
      done();
    });
  };
}