module.exports = function reportException(file, error) {
  const lines = error.message.split(/\r?\n/);
  if (lines.length > 2) {
    return lines
      .splice(1)
      .join('\n');
  }
  return error.message;
};
