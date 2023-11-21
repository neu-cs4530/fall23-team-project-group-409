import * as usersDao from "./users-dao.js"

const UsersController = (app) => {
    app.get('/api/users', findAllUsers);
    app.get('/api/users/:id', findUserById);
    app.get('/api/users/usernametown', findUserByUsernameAndTown);
    app.post('/api/users', createUser);
    // app.delete('/api/videos/:id', deleteVid);
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
    res.json(game);
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

/*
TODO:

method that returns _id by username and whatTown
    this _id is what is going to be assigned to 

method that returns user by id

method that creates user

*/