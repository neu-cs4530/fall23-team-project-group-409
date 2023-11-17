import * as townsDao from "./games-dao.js"

const TownsController = (app) => {
    app.get('/api/towns', findAllTowns)
    app.get('/api/towns/:townId', findTownByTownId);
    app.post('/api/towns', createTown);
    // app.delete('/api/videos/:id', deleteVid);
    // app.put('/api/videos/:id', updateVid);
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