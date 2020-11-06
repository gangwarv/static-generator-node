module.exports = function ({ id }) {
  return Promise.resolve({
    title: id.toUpperCase(),
    content: `This is content of Blog ${id}`,
  });
};
