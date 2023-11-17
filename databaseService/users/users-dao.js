import usersModel from "./users-model";

export const findAllUsers = () =>
    usersModel.find();

export const findUserById = (id) =>
    usersModel.findById(id)

export const createUser = (user) =>
    usersModel.create(user)

