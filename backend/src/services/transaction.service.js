import axios from "axios";

import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model.js";

import { BadRequestException, NotFoundException } from "../utils/app-error.js";

import { calculateNextOccurrence } from "../utils/helper.js";

import { convertToPaise, convertToRupeeUnit } from "../utils/format-currency.js";
import { genAI, genAIModel } from "../config/google-ai.config.js";
import { receiptPrompt } from "../utils/prompt.js";

export const createTransactionService = async (body, userId) => {
  let nextRecurringDate;
  const currentDate = new Date();

  if (body.isRecurring && body.recurringInterval) {
    const calulatedDate = calculateNextOccurrence(
      body.date,
      body.recurringInterval
    );

    nextRecurringDate =
      calulatedDate < currentDate
        ? calculateNextOccurrence(currentDate, body.recurringInterval)
        : calulatedDate;
  }

  const transaction = await TransactionModel.create({
    ...body,
    userId,
    category: body.category,
    amount: convertToPaise(body.amount),
    isRecurring: body.isRecurring || false,
    recurringInterval: body.recurringInterval || null,
    nextRecurringDate,
    lastProcessed: null,
  });

  return transaction;
};

export const getAllTransactionService = async (
  userId,
  filters,
  pagination
) => {
  const { keyword, type, recurringStatus } = filters;

  const filterConditions = { userId };

  if (keyword) {
    filterConditions.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
    ];
  }

  if (type) {
    filterConditions.type = type;
  }

  if (recurringStatus) {
    filterConditions.isRecurring =
      recurringStatus === "RECURRING" ? true : false;
  }

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [transactions, totalCount] = await Promise.all([
    TransactionModel.find(filterConditions)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }),
    TransactionModel.countDocuments(filterConditions),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    transactions: transactions.map((t) => ({
      ...t.toObject(),
      amount: convertToRupeeUnit(t.amount),
    })),
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTransactionByIdService = async (
  userId,
  transactionId
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if (!transaction) throw new NotFoundException("Transaction not found");
  return {
    ...transaction.toObject(),
    amount: convertToRupeeUnit(transaction.amount),
  };
};

export const duplicateTransactionService = async (
  userId,
  transactionId
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if (!transaction) throw new NotFoundException("Transaction not found");

  const duplicated = await TransactionModel.create({
    ...transaction.toObject(),
    _id: undefined,
    title: `Duplicate - ${transaction.title}`,
    description: transaction.description
      ? `${transaction.description} (Duplicate)`
      : "Duplicated transaction",
    isRecurring: false,
    recurringInterval: undefined,
    nextRecurringDate: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  });

  return duplicated;
};

export const updateTransactionService = async (
  userId,
  transactionId,
  body
) => {
  const existingTransaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if (!existingTransaction)
    throw new NotFoundException("Transaction not found");

  const now = new Date();
  const isRecurring =
    body.isRecurring ?? existingTransaction.isRecurring;

  const date =
    body.date !== undefined
      ? new Date(body.date)
      : existingTransaction.date;

  const recurringInterval =
    body.recurringInterval || existingTransaction.recurringInterval;

  let nextRecurringDate;

  if (isRecurring && recurringInterval) {
    const calulatedDate = calculateNextOccurrence(date, recurringInterval);

    nextRecurringDate =
      calulatedDate < now
        ? calculateNextOccurrence(now, recurringInterval)
        : calulatedDate;
  }

  existingTransaction.set({
    ...(body.title && { title: body.title }),
    ...(body.description && { description: body.description }),
    ...(body.category && { category: body.category }),
    ...(body.type && { type: body.type }),
    ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
    ...(body.amount !== undefined && { amount: convertToPaise(body.amount) }),
    date,
    isRecurring,
    recurringInterval,
    nextRecurringDate,
  });

  await existingTransaction.save();
};

export const deleteTransactionService = async (
  userId,
  transactionId
) => {
  const deleted = await TransactionModel.findByIdAndDelete({
    _id: transactionId,
    userId,
  });

  if (!deleted) throw new NotFoundException("Transaction not found");
};

export const bulkDeleteTransactionService = async (
  userId,
  transactionIds
) => {
  const result = await TransactionModel.deleteMany({
    _id: { $in: transactionIds },
    userId,
  });

  if (result.deletedCount === 0)
    throw new NotFoundException("No transactions found");

  return {
    sucess: true,
    deletedCount: result.deletedCount,
  };
};

export const bulkTransactionService = async (
  userId,
  transactions
) => {
  const bulkOps = transactions.map((tx) => ({
    insertOne: {
      document: {
        ...tx,
        userId,
        isRecurring: false,
        nextRecurringDate: null,
        recurringInterval: null,
        lastProcessed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  }));

  const result = await TransactionModel.bulkWrite(bulkOps, {
    ordered: true,
  });

  return {
    insertedCount: result.insertedCount,
    success: true,
  };
};

export const scanReceiptService = async (file) => {
  if (!file) throw new BadRequestException("No file uploaded");

  try {
    if (!file.path)
      throw new BadRequestException("Failed to upload file");

    const responseData = await axios.get(file.path, {
      responseType: "arraybuffer",
    });

    const base64String = Buffer.from(responseData.data).toString("base64");

    if (!base64String)
      throw new BadRequestException("Could not process file");

    const model = genAI.getGenerativeModel({ model: genAIModel });

    const result = await model.generateContent([
      receiptPrompt,
      {
        inlineData: {
          data: base64String,
          mimeType: file.mimetype,
        },
      },
    ]);

    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    if (!cleanedText) {
      return { error: "Could not read receipt content" };
    }

    const data = JSON.parse(cleanedText);

    if (!data.amount || !data.date) {
      return { error: "Receipt missing required information" };
    }

    return {
      title: data.title || "Receipt",
      amount: data.amount,
      date: data.date,
      description: data.description,
      category: data.category,
      paymentMethod: data.paymentMethod,
      type: data.type,
      receiptUrl: file.path,
    };
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    return { error: "Receipt scanning service unavailable" };
  }
};
