import { Router } from "express";
import { getSummary, getTrends } from "../controllers/dashboardController.js";
import { userAuth } from "../middlewares/auth.js";

const dashboardRouter = Router();

dashboardRouter.get("/summary", userAuth, getSummary);
dashboardRouter.get("/trends", userAuth, getTrends);

export default dashboardRouter;
