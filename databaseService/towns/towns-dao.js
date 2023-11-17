import townsModel from "./towns-model";

export const findAllTowns = () =>
    townsModel.find();

export const findTownByTownId = (id) =>
    townsModel.findOne({townId: id});

export const createTownEntry = (town) => 
    townsModel.create(town)