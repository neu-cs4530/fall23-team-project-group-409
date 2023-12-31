import usersModel from "./users-model.js";

export const findAllUsers = () =>
    usersModel.find();

export const findUserById = (id) =>
    usersModel.find({playerId: id});

export const createUser = (user) =>
    usersModel.create(user)

