import mongoose from "mongoose";
const gamesSchema = new mongoose.Schema({
  gameId: {type: String, required: true, unique: true},
  redPlayer: {type: String, required: true},
  yellowPlayer: {type: String, required: true},
  winner: {type: String, required: true},
  redMoves: [{ type: Number}],
  yellowMoves: [{type: Number}]
}, { collection: "users" });
export default gamesSchema;
