var Path = require('path');

module.exports = function(robot) {
  robot.loadFile(Path.resolve(__dirname, "src"), "trello.js");
};
