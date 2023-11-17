import * as gamesDao from "./games-dao.js"

const GamesController = (app) => {
    app.get('/api/games', findGames)
    app.get('/api/games/:id', findGameById);
    app.get('/api/games/player/:id', findGamesByPlayerId);
    app.post('/api/games', createGame);
    // app.delete('/api/games/:id', deleteGame);
    app.put('/api/games/:id', updateGame);
}

const findGames = async (req, res) => {
    const games = await gamesDao.findAllGames();
    res.json(games);
}

const findGameById = async (req, res) => {
    const id = req.params.id;
    const game = await gamesDao.findGameById({gameId: id});
    res.json(game);
}

const findGamesByPlayerId = async (req, res) => {
    const id = req.params.id;
    const games = await gamesDao.findAllGamesByPlayer(id)
    res.json(games);
}

const createGame = async (req, res) => {
    const newGame = await gamesDao.createGame(req.body);
    res.json(newGame);
}


/*

Body formatting should be like so:

{
    playerId: string,
    move: number,
    winner: string (playerId)
}

*/
const updateGame = async (req, res) => {
    const updateFields = req.body;
    const game = await gamesDao.findGameById({gameId: req.params.id});

    if(updateFields.playerId === game.redPlayer) {
        game.redMoves.push(updateFields.move);
    } else if (updateFields.playerId === game.yellowPlayer) {
        game.yellowMoves.push(updateFields.move);
    } else {
        console.log("Error handling for later")
    }

    if (winner) {
        game.winner = updateFields.winner;
    }

    const updatedGame = await game.save();
    res.json(updatedGame);
}


export default GamesController