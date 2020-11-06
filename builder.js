const pug = require("pug");
const { copySync } = require("fs-extra");
const routes = [
  {
    path: "/",
    view: "/index",
  },
  {
    path: "/about",
    view: "/about",
  },
  {
    path: "/contact",
    view: "/contact",
  },
  {
    path: "/blogs/:id",
    view: "/blogs/blog",
  },
];

const { resolve, dirname } = require("path");
const { readdir, rmdir, writeFile, mkdir } = require("fs").promises;
const outputDir = resolve("dist");
const publicDir = resolve("public");

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

function matchedView(url) {
  // if static route
  let route = routes.find((r) => r.path == url);
  if (route) {
    return { ...route };
  }
  route = routes.find(
    (r) => r.path.split("/:")[0] == url.substr(0, url.lastIndexOf("/"))
  );
  // check if dynamic route
  if (route) {
    let params = {};
    params[route.path.split("/:")[1]] = url.substr(url.lastIndexOf("/") + 1);
    return { ...route, params };
  }
}
async function genOutputFile(url, IsWrite = true) {
  var _matchedView = matchedView(url);
  if (!_matchedView) return Promise.resolve(false); //Promise.reject(new Error('View not found for url:'+ url));
  try {
    const { view, params } = _matchedView;
    let model;

    try {
      var resolverPath = `./resolvers${view}`;
      let modelResolver = require(resolverPath);
      model = await modelResolver(params);
    } catch {}

    const compiledFunction = pug.compileFile(`./views${view}.pug`);
    const compiledView = compiledFunction(model);

    let filePath = `${outputDir}${url == "/" ? "/index" : url}.html`;
    
    await mkdir(dirname(filePath), { recursive: true });

    await writeFile(filePath, compiledView);

    return Promise.resolve({ model, view });
  } catch (err) {
    console.log(err.message);
    return Promise.resolve(false);
  }
}
async function buildRoutes(url) {
  // process single route matched with url
  if (url) console.log(url, await genOutputFile(url));
  // process all static routes
  else {
    await rmdir(outputDir, { recursive: true });
    routes
      .filter((r) => !r.path.includes(":"))
      .forEach(async ({ path }) =>
        console.log(path, await genOutputFile(path))
      );

    // Copy asstes
    copySync(publicDir, outputDir);
  }
}

// buildRoutes();
console.log("---------------");
// buildRoutes("/");
// buildRoutes("/about");
// buildRoutes("/contact");
buildRoutes("/blogs/welcome");
// buildRoutes("/notfound");

module.exports = {
  genOutputFile,
};
