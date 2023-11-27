import * as gamesDao from "./games-dao.js"
import gamesModel from "./games-model.js";

const GamesController = (app) => {
    app.get('/api/games', findGames)
    app.get('/api/games/:id', findGameByGameId);
    app.get('/api/gamesplayer/:id', findGamesByPlayerId);
    app.get('/api/gamesbytown/:id', findGamesByTownId);
    app.post('/api/games', createGame);
    app.put('/api/games/:id', updateGame);
}

const findGames = async (req, res) => {
    const games = await gamesDao.findAllGames();
    res.json(games);
}

const findGamesByTownId = async (req, res) => {
    const townId = req.params.id;
    const games = await gamesModel.find({townId: townId});
}

const findGameByGameId = async (req, res) => {
    const id = req.params.id;
    const game = await gamesDao.findGameById({gameId: id});
    res.json(game);
}

const findGamesByPlayerId = async (req, res) => {
    const id = req.params.id;
    const games = await gamesDao.findAllGamesByPlayer(id)
    res.json(games);
}

/*
Body formatting should be like so:
{ All Player ID's (redPlayer, yellowPlayer, winner)
    gameId: string,
    townId: string,
    redPlayer: string,
    yellowPlayer: string,
    winner: string,
    redMoves: list[numbers]
    yellowMoves: list[numbers]
}
*/
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