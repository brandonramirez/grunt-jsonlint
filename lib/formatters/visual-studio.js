module.exports = function formatForVisualStudio(file, line) {
  return file + '(' + line + '): error: failed JSON validation';
};
