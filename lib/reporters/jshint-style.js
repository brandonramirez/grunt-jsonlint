function padLeft(number, length) {
  let value = number.toString();
  const missingLength = length - value.length;
  if (missingLength > 0) {
    value = ' '.repeat(missingLength) + value;
  }
  return value;
}

module.exports = function reportLikeJshint(file, error) {
  let line;
  let exzerpt;
  let pointer;
  let reason;
  if (error.location) {
    ({ line } = error.location.start);
    ({ exzerpt, pointer, reason } = error);
  }
  else {
    return error.message;
  }
  const extraLength = pointer.length - 10;
  if (extraLength > 0) {
    pointer = `   ${pointer.substr(extraLength)}`;
    exzerpt = `...${exzerpt.substr(extraLength)}`;
  }
  if (exzerpt.length > 20) {
    exzerpt = `${exzerpt.substr(0, 20)}...`;
  }
  pointer = pointer.replace(/-/g, ' ');
  const prefix = `${padLeft(line, 6)} | `;
  const indent = ' '.repeat(prefix.length);
  return `${prefix}${exzerpt}\n${indent}${pointer} ${reason}`;
};
