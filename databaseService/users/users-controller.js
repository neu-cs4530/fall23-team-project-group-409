import * as usersDao from "./users-dao.js"
import usersModel from "./users-model.js";

const UsersController = (app) => {
    app.get('/api/users', findAllUsers);
    app.get('/api/users/:id', findUserById);
    app.get('/api/users/usernametown', findUserByUsernameAndTown);
    app.get('/api/users/bytown/:id', findUsersByTown);
    app.post('/api/users', createUser);
    app.put('/api/users/elo/:id', updateELO);
}

export default UsersController

const findAllUsers = async (req, res) => {
    const users = await usersDao.findAllUsers();
    res.json(users);
}

const findUserById = async (req, res) => {
    const id = req.params.id;
    const user = await usersDao.findUserById(id);
    res.json(user);
}

/*

{
    username : string
    townId : string
}

*/
const findUserByUsernameAndTown = async (req, res) => {
    const username = req.body.id;
    const townId = req.body.townId;

    const user = await usersModel.findOne({username: username, whatTown: townId});
    res.json(user)
}

const createUser = async (req, res) => {
    const user = await usersDao.createUser(req.body);
    res.json(user)
}

const updateELO = async (req, res) => {
    const id = req.params.id;
    const newELO = req.body.elo;
    const user = await usersDao.findUserById(id);
    user.elo = newELO;

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