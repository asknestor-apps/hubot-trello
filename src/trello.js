var Trello = require('node-trello');

var getLists = function(callback) {
  trello = new Trello(process.env.HUBOT_TRELLO_KEY, process.env.HUBOT_TRELLO_TOKEN);
  trello.get("/1/boards/" + process.env.HUBOT_TRELLO_BOARD, function(err, data) {
    board = data;
    trello.get("/1/boards/" + process.env.HUBOT_TRELLO_BOARD + "/lists", function(err, data) {
      var i, len, list, results;
      results = [];
      for (i = 0, len = data.length; i < len; i++) {
        list = data[i];
        results.push(lists[list.name.toLowerCase()] = list);
      }
      callback(board, results);
    });
  });
};

var createCard = function(msg, list_name, cardName) {
  var id;
  msg.reply("Sure thing boss. I'll create that card for you.");

  getLists(function(board, lists) {
    trello = new Trello(process.env.HUBOT_TRELLO_KEY, process.env.HUBOT_TRELLO_TOKEN);
    id = lists[list_name.toLowerCase()].id;
    trello.post("/1/cards", {
      name: cardName,
      idList: id
    }, function(err, data) {
      if (err) {
        msg.reply("There was an error creating the card");
      }
      if (!err) {
        return msg.reply("OK, I created that card for you. You can see it here: " + data.url);
      }
    });
  });
};

var showCards = function(msg, list_name) {
  var id;
  msg.reply("Looking up the cards for " + list_name + ", one sec.");

  getLists(function(board, lists) {
    id = lists[list_name.toLowerCase()].id;
    if (!id) {
      msg.send("I couldn't find a list named: " + list_name + ".");
    }
    if (id) {
      trello.get("/1/lists/" + id, {
        cards: "open"
      }, function(err, data) {
        var card, i, len, ref;
        if (err) {
          msg.reply("There was an error showing the list.");
        }
        if (!(err && data.cards.length === 0)) {
          msg.reply("Here are all the cards in " + data.name + ":");
        }
        if (!(err && data.cards.length === 0)) {
          ref = data.cards;
          for (i = 0, len = ref.length; i < len; i++) {
            card = ref[i];
            msg.send("* [" + card.shortLink + "] " + card.name + " - " + card.shortUrl);
          }
        }
        if (data.cards.length === 0 && !err) {
          return msg.reply("No cards are currently in the " + data.name + " list.");
        }
      });
    }
  });
};

var moveCard = function(msg, card_id, list_name) {
  var id;
  getLists(function(board, lists) {
    id = lists[list_name.toLowerCase()].id;
    if (!id) {
      msg.reply("I couldn't find a list named: " + list_name + ".");
    }
    if (id) {
      return trello.put("/1/cards/" + card_id + "/idList", {
        value: id
      }, function(err, data) {
        if (err) {
          msg.reply("Sorry boss, I couldn't move that card after all.");
        }
        if (!err) {
          return msg.reply("Yep, ok, I moved that card to " + list_name + ".");
        }
      });
    }
  });
};

module.exports = function(robot) {
  robot.respond(/trello new ["'](.+)["']\s(.*)/i, function(msg) {
    var card_name, list_name;
    if (!ensureConfig()) {
      return;
    }
    card_name = msg.match[2];
    list_name = msg.match[1];
    if (card_name.length === 0) {
      msg.reply("You must give the card a name");
      return;
    }
    if (list_name.length === 0) {
      msg.reply("You must give a list name");
      return;
    }

    createCard(msg, list_name, card_name);
  });

  robot.respond(/trello list ["'](.+)["']/i, function(msg) {
    showCards(msg, msg.match[1]);
  });

  robot.respond(/trello move (\w+) ["'](.+)["']/i, function(msg) {
    moveCard(msg, msg.match[1], msg.match[2]);
  });

  robot.respond(/trello list lists/i, function(msg) {
    msg.reply("Here are all the lists on your board.");
    getLists(function(board, lists) {
      Object.keys(lists).forEach(function(key) {
        msg.send(" * " + key);
      });
    });
  });

  robot.respond(/trello help/i, function(msg) {
    msg.reply("Here are all the commands for me.");
    msg.send(" *  trello new \"<ListName>\" <TaskName>");
    msg.send(" *  trello list \"<ListName>\"");
    msg.send(" *  shows * [<card.shortLink>] <card.name> - <card.shortUrl>");
    msg.send(" *  trello move <card.shortlink> \"<ListName>\"");
    msg.send(" *  trello list lists");
  });
};
