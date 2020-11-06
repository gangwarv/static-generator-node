var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("blogs/index", { title: "Express", body: "Blog" });
});

router.get("/:id", async function (req, res, next) {
  const { params } = req;
  const blogResolver = require("../../resolvers/blogs/blog");
  const model = await blogResolver(params);
  res.render("blogs/blog", model);
});

module.exports = router;
