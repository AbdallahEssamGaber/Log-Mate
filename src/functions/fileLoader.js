const { glob } = require("glob");
const path = require("node:path");

module.exports = async (dirName) => {
  try {
    let files = await glob(
      path
        .join(`${process.cwd()}`, `../discord/${dirName}`, "**/*.js")
        .replace(/\\/g, "/")
    );
    //Preventing glob error with extname and also not including the current file
    const jsFiles = files.filter(
      (file) => path.extname(file) == ".js" && !file.includes("fileLoader")
    );
    return jsFiles;
  } catch (error) {
    throw error;
  }
};
