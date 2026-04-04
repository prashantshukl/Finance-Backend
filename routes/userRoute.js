import { Router } from "express";
import {
	createUser,
	updateUser,
	deleteUser,
	getUsers,
	getUserById,
} from "../controllers/userController.js";
import { adminAuth } from "../middlewares/auth.js";

const userRouter = new Router();

userRouter.post("/", adminAuth, createUser);
userRouter.get("/", adminAuth, getUsers);
userRouter.get("/:id", adminAuth, getUserById);
userRouter.put("/:id", adminAuth, updateUser);
userRouter.delete("/:id", adminAuth, deleteUser);

export default userRouter;