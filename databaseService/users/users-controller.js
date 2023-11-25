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
    const users = await usersDao.findAllUsers();
    res.json(users);
}

/*
    Search by PlayerID
*/
const findUserById = async (req, res) => {
    const id = req.params.id;
    const user = await usersDao.findUserById(id);
    res.json(user);
}

/*

For this method, pass in username=townId in :usernameTown of request.

Example: /api/usernametown/hello=townGang will return user with matching username hello and townid townGang
*/
const findUserByUsernameAndTown = async (req, res) => {
    const usernameAndTown = req.params.usertown;
    const usernameAndTownPair = usernameAndTown.split("=");
    const username = usernameAndTownPair[0];
    const townId = usernameAndTownPair[1];

    const user = await usersModel.findOne({username: username, whatTown: townId});

    res.json(user)
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
    const user = await usersDao.createUser(req.body);
    res.json(user)
}

const updateELO = async (req, res) => {
    const id = req.params.id;
    const newELO = req.body.elo;

    const user = await usersDao.findUserById(id);
    user.elo.push(newELO);

    const updatedUser = await user.save();
    res.json(updatedUser);
}

const findUsersByTown = async (req, res) => {
    const townId = req.params.id;
    const users = await usersModel.find({whatTown : townId})
    res.json(users)
}

/*
TODO:

method that returns _id by username and whatTown
    this _id is what is going to be assigned to 

method that returns user by id

method that creates user

*/