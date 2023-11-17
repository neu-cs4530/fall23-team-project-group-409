import mongoose from "mongoose";
import usersSchema from "./users-schema";
const usersModel = mongoose.model("users", usersSchema);
export default usersModel;