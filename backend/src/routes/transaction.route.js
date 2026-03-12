import { Router } from "express";
import {
  bulkDeleteTransactionController,
  bulkTransactionController,
  createTransactionController,
  deleteTransactionController,
  duplicateTransactionController,
  getAllTransactionController,
  getTransactionByIdController,
  scanReceiptController,
  updateTransactionController,
} from "../controllers/transaction.controller.js";
import { upload } from "../config/cloudinary.config.js";

const transactionRoutes = Router();

transactionRoutes.post("/", createTransactionController);

transactionRoutes.post(
  "/scan-receipt",
  upload.single("receipt"),
  scanReceiptController
);

transactionRoutes.post("/bulk", bulkTransactionController);

transactionRoutes.post("/:id/duplicate", duplicateTransactionController);
transactionRoutes.put("/:id", updateTransactionController);

transactionRoutes.get("/", getAllTransactionController);
transactionRoutes.get("/:id", getTransactionByIdController);
transactionRoutes.delete("/:id", deleteTransactionController);
transactionRoutes.delete("/bulk", bulkDeleteTransactionController);

export default transactionRoutes;
