import mongoose from "mongoose";
const usersSchema = new mongoose.Schema({
  userId: {type: String, required: true, unique: true},
  username: { type: String, required: true, unique: true },
  whatTown: {type: String, required: true}
}, { collection: "users" });
export default usersSchema;
