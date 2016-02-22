var Trello = require('node-trello');

var getLists = function(callback) {
  trello = new Trello(process.env.NESTOR_TRELLO_KEY, process.env.NESTOR_TRELLO_TOKEN);
  trello.get("/1/boards/" + process.env.NESTOR_TRELLO_BOARD, function(err, data) {
    board = data;
    trello.get("/1/boards/" + process.env.NESTOR_TRELLO_BOARD + "/lists", function(err, data) {
      var i, len, lists;
      lists = {}
      for (i = 0, len = data.length; i < len; i++) {
        list = data[i];
        lists[list.name.toLowerCase()] = list;
      }
      callback(board, lists);
    });
  });
};

var createCard = function(msg, list_name, cardName, done) {
  msg.reply("Sure thing boss. I'll create that card for you.").then(function() {
    getLists(function(board, lists) {
      trello = new Trello(process.env.NESTOR_TRELLO_KEY, process.env.NESTOR_TRELLO_TOKEN);
      id = lists[list_name.toLowerCase()].id;

      trello.post("/1/cards", {
        name: cardName,
        idList: id
      }, function(err, data) {
        if (err) {
          msg.reply("There was an error creating the card", done);
        } else {
          msg.reply("OK, I created that card for you. You can see it here: " + data.url, done);
        }
      });
    });
  });
};

var showCards = function(msg, list_name, done) {
  var id;

  msg.reply("Looking up the cards for " + list_name + ", one sec.").then(function() {
    getLists(function(board, lists) {
      id = lists[list_name.toLowerCase()].id;
      if (!id) {
        msg.send("I couldn't find a list named: " + list_name + ".", done);
      }
      if (id) {
        trello.get("/1/lists/" + id, {
          cards: "open"
        }, function(err, data) {
          var card, i, len, ref;
          if (err) {
            msg.reply("There was an error showing the list.", done);
          } else {
            if (data.cards.length !== 0) {
              msg.reply("Here are all the cards in " + data.name + ":").then(function() {
                ref = data.cards;
                cards = [];
                for (i = 0, len = ref.length; i < len; i++) {
                  card = ref[i];
                  cards.push("* [" + card.shortLink + "] " + card.name + " - " + card.shortUrl);
                }
                msg.send(cards, done);
              });
            } else {
              msg.reply("No cards are currently in the " + data.name + " list.", done);
            }
          }
        });
      }
    });
  });
};

var moveCard = function(msg, card_id, list_name, done) {
  var id;
  getLists(function(board, lists) {
    id = lists[list_name.toLowerCase()].id;
    if (!id) {
      msg.reply("I couldn't find a list named: " + list_name + ".", done);
    }
    if (id) {
      trello.put("/1/cards/" + card_id + "/idList", {
        value: id
      }, function(err, data) {
        if (err) {
          msg.reply("Sorry boss, I couldn't move that card after all.", done);
        } else {
          msg.reply("Yep, ok, I moved that card to " + list_name + ".", done);
        }
      });
    }
  });
};

module.exports = function(robot) {
  robot.respond(/trello new ["'](.+)["']\s(.*)/i, function(msg, done) {
    var card_name, list_name;
    list_name = msg.match[1];
    card_name = msg.match[2];

    if (card_name.length === 0) {
      msg.reply("You must give the card a name", done);
    }
    if (list_name.length === 0) {
      msg.reply("You must give a list name", done);
    }

    createCard(msg, list_name, card_name, done);
  });

  robot.respond(/trello list ["'](.+)["']/i, function(msg, done) {
    showCards(msg, msg.match[1], done);
  });

  robot.respond(/trello move (\w+) ["'](.+)["']/i, function(msg, done) {
    moveCard(msg, msg.match[1], msg.match[2], done);
  });

  robot.respond(/trello list lists/i, function(msg, done) {
    msg.reply("Here are all the lists on your board.").then(function() {
      getLists(function(board, lists) {
        keys = [];
        Object.keys(lists).forEach(function(key) {
          keys.push("* " + key);
        });

        msg.send(keys, done);
      });
    });
  });

  robot.respond(/trello help/i, function(msg, done) {
    msg.reply("Here are all the commands for me.").then(function() {
      return msg.send([
        " *  trello new \"<ListName>\" <TaskName>",
        " *  trello list \"<ListName>\"",
        " *  trello move <card.shortlink> \"<ListName>\"",
        " *  trello list lists"
      ]);
    }).then(function() {
      done();
    });
  });
};
