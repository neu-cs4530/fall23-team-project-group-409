import mongoose from "mongoose";
const usersSchema = new mongoose.Schema({
  username: { type: String, required: true},
  elo :{type: Number, required: true},  
  whatTown: {type: String, required: true},
  playerId: {type: String, required: true, unique: true},
}, { collection: "users" });
export default usersSchema;
