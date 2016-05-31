module.exports = function formatForVisualStudio(file, line) {
  return 'File "' + file + '" failed JSON validation at line ' + line + '.';
};
