import townsModel from "./towns-model.js";

export const findAllTowns = () =>
    townsModel.find();

export const findTownByTownId = (id) =>
    townsModel.findOne({townId: id});

export const createTownEntry = (town) => 
    townsModel.create(town)