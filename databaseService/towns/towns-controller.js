import * as townsDao from "./towns-dao.js"

const TownsController = (app) => {
    app.get('/api/towns', findAllTowns)
    app.get('/api/towns/:townId', findTownByTownId);
    app.post('/api/towns', createTown);
}

const findAllTowns = async (req, res) => {
    const towns = await townsDao.findAllTowns();
    res.json(towns);
} 

const findTownByTownId = async (req, res) => {
    const townId = req.params.townId;
    const town = await townsDao.findTownsByTownId(townId);
    res.json(town);
}

const createTown = async (req, res) => {
    const newTown = await townsDao.createTown(req.body);
    res.json(newTown)
}

export default TownsController