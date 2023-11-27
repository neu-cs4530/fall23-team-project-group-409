# Welcome to David's super duper awesome incredibly concise and well-written database backend (11/21 @ 5PM)

Here, I will explain rationale behind the API calls and how you (Drew, Andrew, and Brian) should utilize them.

Here's some quick API info:
- When I say parameter, I'm referring to a field within the API request link (i.e. stuff thats preceded with a ":")
- When I say body, I'm referring to an object that you're passing along with your API request not within the link (i.e. in a separate field in your axios call)
- GET REQUESTS CANNOT BE PASSED A BODY, if you send a body it won't throw an error but the backend will not read it

Here's some mongo shenanigans:
- By default, each document (entry) in a collection (users, towns, games) in Mongo contains an id by default. Some of our collections have both id thats generated by Mongo, and id that we assign.

## Users

This is the weirdest because of confusion behind how we're dealing with user authentication with ELO/leaderboards per town but whatever:

IT SHOULD BE NOTED: Since covey.town generates a new id every time you login as a user, we're using the combination of username and town to identify unique players. HOWEVER, because using tuple pairs are dumb, I'm providing an API call to find a user by user and town, which will return the entire user including their ID. THIS ID IS WHAT WILL BE USED TO IDENTIFY UNIQUE USERS IN OTHER CALLS.

At the time of writing, there are 5 available API calls

    app.get('/api/users', findAllUsers);
    app.get('/api/users/:id', findUserById);
    app.get('/api/usernametown/:usertown', findUserByUsernameAndTown);
    app.get('/api/bytown/:id', findUsersByTown);
    app.post('/api/users', createUser);
    app.put('/api/userselo/:id', updateELO);
    
- findAllUsers : returns list of all users across all towns
- findUserById : returns user with matching ID, requires only parameter
- findUserByUsernameAndTown: find user with matching username and town, requires param to be formatted like so: username:townid
- findUsersByTown: find users with matching townId, requires only parameter (useful for leaderboard)
- createUser : create a new user, requires body with fields as defined within users-schema (only fields marked as required are needed to make a new user) (useful for everything, remember to check if a user already exists with a call to findAllUsers or findUsersByTown)
- updateELO : update ELO! need a parameter and body with: { elo : number } (userful for leaderboard and elo)

## Towns

Simplest one. Avaiable calls:

    app.get('/api/towns', findAllTowns)
    app.get('/api/townsId/:townId', findTownByTownId);
    app.post('/api/towns', createTown);

- findAllTowns : returns all towns
- findTownByTownId : returns town with matching townId from parameter (NOT ID, townID)
- createTown: create a town, usiing body

## Games

Have some game rationale.

There are a lot of fields that aren't super explanatory:
```
  gameId: {type: String, required: true, unique: true},
  redPlayer: {type: String, required: true},
  yellowPlayer: {type: String, required: true},
  winner: {type: String},
  redMoves: [{ type: Number}],
  yellowMoves: [{type: Number}]
```

- gameID : SEPARATE FROM ID, assign whatever with this. I'm not sure if we'll need this but I tossed it in for funsies.
- redPlayer : USE USER ID, not USERNAME OR TOWN
- yellowPlayer : see above
- winner : THIS SHOULD ONLY BE DEFINED WHEN THE GAME IS OVER, if it's a draw label it "draw" or some other unique identifier.
- redMoves : a list of numbers, where each number denotes the column played
- yellowMoves : see above

You'll have to do some coding to order the redMoves and yellowMoves, I didn't want to mess with tuples

Here are the API calls:

    app.get('/api/games', findGames)
    app.get('/api/games/:id', findGameByGameId);
    app.get('/api/gamesplayer/:id', findGamesByPlayerId);
    app.get('/api/gamesbytown/:id', findGamesByTownId);
    app.post('/api/games', createGame);
    app.put('/api/games/:id', updateGame);

- findGames : self-explanatory
- findGameByGameId : THIS WILL SEARCH FOR A GAME BY GAMEID, NOT ID. only need param
- findGamesByPlayerId : lists all games ever played by a player, only need parameter (UTILIZES PLAYER ID, NOT USERNAME OR WHATEVER)
- findGamesByTownId : list all games ever played within a town
- createGame : create a game, see schema for required fields. requires only body
- updateGame : update a game, see controller for fields. requires body and param

THERE ARE TWO WAYS YOU CAN DEAL WITH SAVING GAMES:
1. Create the entire game entry at the end of the game. This might be weird to trace back your steps.
2. Create a game at the start of a game, and then update game each move with updateGame. 

## Other

Here are some example axios calls:
```
export const findUserComments = async (id) => {
    const response = await axios.get(`${AUTHOR_COMMENTS}/${id}`);
    return response.data;
}

export const findVideoComments = async (id) => {
    const response = await axios.get(`${VIDEO_COMMENTS}/${id}`);
    return response.data;
}

export const deleteComment = async (commentId) => {
    const response = await axios.delete(`${COMMENTS_URL}/${commentId}`);
    return response.data;
}

export const loginUser = async (username, password) => {
  const response = await axios.post(LOGIN_API, { username, password });
  const user = response.data;
  return user;
}
```

Look at how loginUser has both a field for link and body. Calls can have both (except for GET).