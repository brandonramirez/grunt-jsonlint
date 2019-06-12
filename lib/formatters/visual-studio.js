module.exports = function formatForVisualStudio(file, line) {
  var message = file;
  if (line != null) {
    message += '(' + line + ')';
  }
  return message + ': error: failed JSON validation';
};
