var fs = require('fs');
var getDirName = require('path').dirname;

module.exports = function (path, contents, options) {
    fs.mkdirSync(getDirName(path), { recursive: true });
    fs.writeFileSync(path, contents, options);
}