import { Router } from "express";
import { 
    getAllReceiptsController, 
    getReceiptByIdController, 
    deleteReceiptController 
} from "../controllers/receipt.controller.js";

const receiptRoutes = Router();


receiptRoutes.get("/", getAllReceiptsController);
receiptRoutes.get("/:id", getReceiptByIdController);
receiptRoutes.delete("/:id", deleteReceiptController);

export default receiptRoutes;
