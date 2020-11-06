const { genOutputFile } = require("../builder");

module.exports = async function (req, res, next) {
    let m = await genOutputFile(req.originalUrl);
    if (m) {
      const { view, model } = m;
      req.__data = {
          view:view.substr(1),
          model
      }
    }
    next();
};
