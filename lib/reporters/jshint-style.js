module.exports = function reportLikeJshint(file, e, errorDetails, grunt) {
  var line = grunt.file.read(file).split(/\r?\n/)[errorDetails.loc.first_line];  // intentionally do not read it as json.
  return '     ' + errorDetails.line + ' |     ' + errorDetails.text + "\n" +
         '             ^ Expected ' + grunt.log.wordlist(errorDetails.expected) + ' and instead saw \'' + line.charAt(errorDetails.loc.first_column + 1) + '\'';
};
