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
    try {
        const games = await gamesDao.findAllGames();
        res.json(games);
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const findGamesByTownId = async (req, res) => {
    try {
        const townId = req.params.id;
        const games = await gamesModel.find({ townId: townId });
        res.json(games)
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const findGameByGameId = async (req, res) => {
    try {
        const id = req.params.id;
        const game = await gamesDao.findGameById({ gameId: id });
        res.json(game);
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

const findGamesByPlayerId = async (req, res) => {
    try {
        const id = req.params.id;
        const games = await gamesDao.findAllGamesByPlayer(id)
        res.json(games);
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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
    try {
        const newGame = await gamesDao.createGame(req.body);
        res.json(newGame);
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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
    try {
        const updateFields = req.body;
        const game = await gamesDao.findGameById({ gameId: req.params.id });

        if (updateFields.playerId === game.redPlayer) {
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
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

export default GamesController