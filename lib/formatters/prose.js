module.exports = function formatForVisualStudio(file, error) {
  const message = `File "${file}" failed JSON validation`;
  const line = error.location ? error.location.start.line : undefined;
  if (line !== undefined) {
    const { column } = error.location.start;
    return `${message} at line ${line}, column ${column}.`;
  }
  return `${message}.`;
};
