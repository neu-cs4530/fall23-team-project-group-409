import * as townsDao from "./towns-dao.js"

const TownsController = (app) => {
    app.get('/api/towns', findAllTowns)
    app.get('/api/townsId/:townId', findTownByTownId);
    app.post('/api/towns', createTown);
}

const findAllTowns = async (req, res) => {
    try {
        const towns = await townsDao.findAllTowns();
        res.json(towns);
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
} 

const findTownByTownId = async (req, res) => {
    try {
        const townId = req.params.townId;
        const town = await townsDao.findTownsByTownId(townId);
        res.json(town);
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const createTown = async (req, res) => {
    try {
        const newTown = await townsDao.createTown(req.body);
        res.json(newTown)
    } catch (error) {
        console.error('Error fetching towns:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default TownsController