import Receipt from "../models/receipt.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http.config.js";

/**
 * Get all receipts for the logged-in user with filters
 */
export const getAllReceiptsController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { month, status } = req.query;

    const query = { user: userId };
    
    // Filter by month (YYYY-MM)
    if (month) {
        const start = new Date(`${month}-01`);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        query.date = { $gte: start, $lt: end };
    }

    // Filter by status
    if (status) {
        query.status = status;
    }

    const receipts = await Receipt.find(query)
        .sort({ createdAt: -1 })
        .populate('transaction', 'title amount type');

    return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Receipts fetched successfully",
        count: receipts.length,
        data: receipts
    });
});

/**
 * Delete a specific receipt
 */
export const deleteReceiptController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const receipt = await Receipt.findOneAndDelete({ _id: id, user: userId });

    if (!receipt) {
        return res.status(HTTPSTATUS.NOT_FOUND).json({
            success: false,
            message: "Receipt not found or you don't have permission to delete it"
        });
    }

    return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Receipt deleted successfully from vault"
    });
});

/**
 * Get single receipt detail
 */
export const getReceiptByIdController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const receipt = await Receipt.findOne({ _id: id, user: userId })
        .populate('transaction');

    if (!receipt) {
        return res.status(HTTPSTATUS.NOT_FOUND).json({
            success: false,
            message: "Receipt not found"
        });
    }

    return res.status(HTTPSTATUS.OK).json({
        success: true,
        data: receipt
    });
});
