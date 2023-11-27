import mongoose from "mongoose";
const townsSchema = new mongoose.Schema({
  townId: {type: String, required: true, unique: true},
  townEdittingPassword: { type: String, required: true },
}, { collection: "towns" });
export default townsSchema;