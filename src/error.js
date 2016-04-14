module.exports = function(error, msg, done) {
  if (error.statusCode == 400) {
    console.log("statusCode", 400);
    errorMessage = error.statusMessage + ": " + error.responseBody + ": " + "Typically this means that the NESTOR_TRELLO_BOARD variable you set is not the right one. If you're sure you have set this correctly, reach out at help@asknestor.me";
  } else {
    errorMessage = error.statusMessage + ": " + error.responseBody;
  }

  msg.send(msg.newRichResponse({
    title: "Oops, Trello returned with an error",
    color: 'danger',
    fields: [
      {
        "title": "Response Code",
        "value": error.statusCode,
        "short": true
      },
      {
        "title": "Error",
        "value": errorMessage,
        "short": true
      }
    ]
  }), done);
};

