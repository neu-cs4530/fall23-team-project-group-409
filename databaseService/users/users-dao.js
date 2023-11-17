import usersModel from "./users-model";

export const findAllUsers = () =>
    usersModel.find();