module.exports = function formatForVisualStudio(file, line) {
  var message = 'File "' + file + '" failed JSON validation';
  if (line != null) {
    message += ' at line ' + line;
  }
  return message + '.';
};
