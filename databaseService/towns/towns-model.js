import mongoose from "mongoose";
import townsSchema from "./towns-schema";
const townsModel = mongoose.model("towns", townsSchema);
export default townsModel;