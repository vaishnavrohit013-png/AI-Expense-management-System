import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http.config.js";

import {
  bulkDeleteTransactionSchema,
  bulkTransactionSchema,
  createTransactionSchema,
  transactionIdSchema,
  updateTransactionSchema,
} from "../validators/transaction.validator.js";

import {
  bulkDeleteTransactionService,
  bulkTransactionService,
  createTransactionService,
  deleteTransactionService,
  duplicateTransactionService,
  getAllTransactionService,
  getTransactionByIdService,
  scanReceiptService,
  updateTransactionService,
} from "../services/transaction.service.js";

import { checkAndSendBudgetAlerts } from "../services/budget-alert.service.js";

export const createTransactionController = asyncHandler(async (req, res) => {
  const body = createTransactionSchema.parse(req.body);
  const userId = req.user?._id;

  const { transaction, budgetAlert } = await createTransactionService(body, userId);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Transaction created successfully",
    transaction,
    budgetAlert,
  });
});

export const getAllTransactionController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const filters = {
    keyword: req.query.keyword,
    type: req.query.type,
    category: req.query.category,
    recurringStatus: req.query.recurringStatus,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    minAmount: req.query.minAmount,
    maxAmount: req.query.maxAmount,
    sort: req.query.sort,
  };

  const pagination = {
    pageSize: parseInt(req.query.pageSize) || 20,
    pageNumber: parseInt(req.query.pageNumber) || 1,
  };

  const result = await getAllTransactionService(
    userId,
    filters,
    pagination
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Transaction fetched successfully",
    ...result,
  });
});

export const getTransactionByIdController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const transactionId = transactionIdSchema.parse(req.params.id);

  const transaction = await getTransactionByIdService(
    userId,
    transactionId
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Transaction fetched successfully",
    transaction,
  });
});

export const duplicateTransactionController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const transactionId = transactionIdSchema.parse(req.params.id);

  const transaction = await duplicateTransactionService(
    userId,
    transactionId
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Transaction duplicated successfully",
    data: transaction,
  });
});

export const updateTransactionController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const transactionId = transactionIdSchema.parse(req.params.id);
  const body = updateTransactionSchema.parse(req.body);

  const { transaction, budgetAlert } = await updateTransactionService(userId, transactionId, body);

  return res.status(HTTPSTATUS.OK).json({
    message: "Transaction updated successfully",
    transaction,
    budgetAlert,
  });
});

export const deleteTransactionController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const transactionId = transactionIdSchema.parse(req.params.id);

  await deleteTransactionService(userId, transactionId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Transaction deleted successfully",
  });
});

export const bulkDeleteTransactionController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { transactionIds } =
    bulkDeleteTransactionSchema.parse(req.body);

  const result = await bulkDeleteTransactionService(
    userId,
    transactionIds
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Transaction deleted successfully",
    ...result,
  });
});

export const bulkTransactionController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { transactions } =
    bulkTransactionSchema.parse(req.body);

  const result = await bulkTransactionService(
    userId,
    transactions
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Bulk transaction inserted successfully",
    ...result,
  });
});

export const scanReceiptController = asyncHandler(async (req, res) => {
  const file = req.file;

  const result = await scanReceiptService(file);

  return res.status(HTTPSTATUS.OK).json({
    message: "Receipt scanned successfully",
    data: result,
  });
});
