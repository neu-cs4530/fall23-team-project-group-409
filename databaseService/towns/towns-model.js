import mongoose from "mongoose";
import townsSchema from "./towns-schema.js";
const townsModel = mongoose.model("towns", townsSchema);
export default townsModel;