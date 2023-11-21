import gamesModel from "./games-model.js";

export const findAllGames = () =>
    gamesModel.find();

export const createGame = (game) => 
    gamesModel.create(game);

export const findGameById = (id) =>
    gamesModel.findOne(id)

export const updateGame = (id, game) =>
    gamesModel.updateOne({ gameId: id}, {$set: game});

export const findAllGamesByPlayer = (id) =>
    gamesModel.find({
        $or: [
            { redPlayer: id },
            { yellowPlayer: id}
        ]
    });

