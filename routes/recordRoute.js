import { Router } from "express";
import {
  createRecord,
  deleteRecord,
  getAllRecords,
  getRecord,
  getRecordsWithFilters,
  updateRecord,
} from "../controllers/recordController.js";

import { adminAuth, analystAuth } from "../middlewares/auth.js";

const recordRouter = Router();

recordRouter.post("/", adminAuth, createRecord);
recordRouter.put("/:id", adminAuth, updateRecord);
recordRouter.delete("/:id", adminAuth, deleteRecord);
recordRouter.get("/filters", analystAuth, getRecordsWithFilters);
recordRouter.get("/", analystAuth, getAllRecords);
recordRouter.get("/:id", analystAuth, getRecord);

export default recordRouter;