module.exports = function formatForVisualStudio(file, error) {
  const message = ': error: failed JSON validation';
  const line = error.location ? error.location.start.line : undefined;
  if (line !== undefined) {
    const { column } = error.location.start;
    return `${file}(${line},${column})${message}`;
  }
  return `${file}${message}`;
};
