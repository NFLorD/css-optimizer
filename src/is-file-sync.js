module.exports = function (path) {
    try {
        const handle = require("fs").lstatSync(path);
        return handle ? handle.isFile() : false;
    } catch (err) {}

    return false;
}