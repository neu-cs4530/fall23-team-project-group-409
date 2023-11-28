import * as usersDao from "./users-dao.js"
import usersModel from "./users-model.js";

const UsersController = (app) => {
    app.get('/api/users', findAllUsers);
    app.get('/api/users/:id', findUserById);
    app.get('/api/usernametown/:usertown', findUserByUsernameAndTown);
    app.get('/api/bytown/:id', findUsersByTown);
    app.post('/api/users', createUser);
    app.put('/api/userselo/:id', updateELO);
}

export default UsersController

const findAllUsers = async (req, res) => {
    try {
        const users = await usersDao.findAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

/*
    Search by PlayerID
*/
const findUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await usersDao.findUserById(id);
        res.json(user);
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

/*

For this method, pass in username=townId in :usernameTown of request.

Example: /api/usernametown/hello=townGang will return user with matching username hello and townid townGang
*/
const findUserByUsernameAndTown = async (req, res) => {
    try {
        const usernameAndTown = req.params.usertown;
        const usernameAndTownPair = usernameAndTown.split("=");
        const username = usernameAndTownPair[0];
        const townId = usernameAndTownPair[1];

        const user = await usersModel.findOne({ username: username, whatTown: townId });

        res.json(user)
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

/*
Body Format for createUser

{
    username: string,
    elo: number,
    whatTown: string (townID),
    playerID: string (playerID)
}

*/
const createUser = async (req, res) => {
    try {
        const user = await usersDao.createUser(req.body);
        res.json(user)
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateELO = async (req, res) => {
    try {
        const id = req.params.id;
        const newELO = req.body.elo;
        const user = await usersModel.updateOne({ playerId: id }, { $set: { elo: newELO } });

        res.json(user);
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const findUsersByTown = async (req, res) => {
    try {
        const townId = req.params.id;
        const users = await usersModel.find({ whatTown: townId })
        res.json(users)
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}
