import mongoose from "mongoose";
const usersSchema = new mongoose.Schema({
  username: { type: String, required: true},
  password: { type: String, required : true},
  elo :{type: Number, required: true},  
  whatTown: {type: String, required: true}
}, { collection: "users" });
export default usersSchema;
