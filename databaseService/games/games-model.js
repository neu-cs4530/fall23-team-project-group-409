import mongoose from "mongoose";
import gamesSchema from "./games-schema.js";
const gamesModel = mongoose.model("games", gamesSchema);
export default gamesModel;