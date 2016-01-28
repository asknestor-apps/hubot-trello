nestor-trello
============

manage your trello board from nestor

## Configuration

Setup the following as environment variables before you run nestor.

```
NESTOR_TRELLO_KEY    - Trello application key
NESTOR_TRELLO_TOKEN  - Trello API token
NESTOR_TRELLO_BOARD  - The ID of the Trello board you will be working with
```

- To get your key, go to: `https://trello.com/1/appKey/generate`
- To get your token, go to: `https://trello.com/1/authorize?key=<<your key>>&name=Nestor+Trello&expiration=never&response_type=token&scope=read,write`
- Figure out what board you want to use, grab it's id from the url `https://trello.com/boards/<<board id>>/<<board name>>`


## Sample Interaction

```
user1> nestor trello new "to do" my simple task
Nestor> Sure thing boss. I'll create that card for you.
Nestor> OK, I created that card for you. You can see it here: http://trello.com/c/<shortLink>
user1> nestor trello move <shortLink> "doing"
Nestor> Yep, ok, I moved that card to doing.
user1> nestor trello list "to do"
Nestor> user1: Looking up the cards for to do, one sec...
Nestor> user1: Here are all the cards in To Do
Nestor> * [<shortLink>] <card_name> - <card_url>
Nestor> * [<shortLink>] <card_name> - <card_url>
Nestor> * [<shortLink>] <card_name> - <card_url>
user1> nestor trello list lists
Nestor> user1: Here are all the lists on your board.
Nestor> * to do
Nestor> * doing
Nestor> * done
```

And you can use a little help command.

```
user1> trello help
```

