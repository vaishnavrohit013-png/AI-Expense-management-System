import axios from "axios";

import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model.js";

import { BadRequestException, NotFoundException } from "../utils/app-error.js";

import { calculateNextOccurrence } from "../utils/helper.js";

import { convertToPaise, convertToRupeeUnit } from "../utils/format-currency.js";
import { genAI, genAIModels } from "../config/google-ai.config.js";
import { receiptPrompt } from "../utils/prompt.js";
import Tesseract from 'tesseract.js';
import { checkAndSendBudgetAlerts } from "./budget-alert.service.js";

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

  // Check budget after expense
  const budgetAlert = await checkAndSendBudgetAlerts(userId, transaction).catch(err => {
    console.error("[TransactionService] Budget alert error:", err);
    return null;
  });

  return { transaction, budgetAlert };
};

export const getAllTransactionService = async (
  userId,
  filters,
  pagination
) => {
  const { keyword, type, category, recurringStatus, startDate, endDate, minAmount, maxAmount, sort } = filters;

  const filterConditions = { userId };

  if (keyword) {
    filterConditions.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { merchant: { $regex: keyword, $options: "i" } },
    ];
  }

  if (type) {
    filterConditions.type = type;
  }

  if (category) {
    filterConditions.category = category;
  }

  if (recurringStatus) {
    filterConditions.isRecurring =
      recurringStatus === "RECURRING" ? true : false;
  }

  if (startDate || endDate) {
    filterConditions.date = {};
    if (startDate) filterConditions.date.$gte = new Date(startDate);
    if (endDate) filterConditions.date.$lte = new Date(endDate);
  }

  if (minAmount || maxAmount) {
    filterConditions.amount = {};
    if (minAmount) filterConditions.amount.$gte = convertToPaise(parseFloat(minAmount));
    if (maxAmount) filterConditions.amount.$lte = convertToPaise(parseFloat(maxAmount));
  }

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  let sortCondition = { date: -1 }; // default

  if (sort === "oldest") {
    sortCondition = { date: 1 };
  } else if (sort === "highest") {
    sortCondition = { amount: -1 };
  } else if (sort === "lowest") {
    sortCondition = { amount: 1 };
  } else if (sort === "latest") {
    sortCondition = { date: -1 };
  }

  const [transactions, totalCount] = await Promise.all([
    TransactionModel.find(filterConditions)
      .skip(skip)
      .limit(pageSize)
      .sort(sortCondition),
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
    ...(body.merchant && { merchant: body.merchant }),
    ...(body.type && { type: body.type }),
    ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
    ...(body.amount !== undefined && { amount: convertToPaise(body.amount) }),
    date,
    isRecurring,
    recurringInterval,
    nextRecurringDate,
  });

  await existingTransaction.save();

  // Trigger budget alert check after update
  const budgetAlert = await checkAndSendBudgetAlerts(userId, existingTransaction).catch(err => {
    console.error("[TransactionService] Budget alert trigger error (update):", err);
    return null;
  });

  return { transaction: existingTransaction, budgetAlert };
};

export const deleteTransactionService = async (
  userId,
  transactionId
) => {
  const deleted = await TransactionModel.findOneAndDelete({
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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const scanReceiptService = async (file) => {
  if (!file) throw new BadRequestException("No file uploaded");

  console.log(`[DEBUG] Received File: ${file.originalname} (${file.size} bytes)`);

  try {
    let base64String;
    if (file.buffer) {
      base64String = file.buffer.toString("base64");
    } else if (file.path) {
      // Check if path is a URL (Cloudinary) or local path
      if (file.path.startsWith('http')) {
        const resp = await axios.get(file.path, { responseType: "arraybuffer" });
        base64String = Buffer.from(resp.data).toString("base64");
      } else {
        const fs = await import('fs');
        base64String = fs.readFileSync(file.path).toString("base64");
      }
    } else if (file.url) {
      const resp = await axios.get(file.url, { responseType: "arraybuffer" });
      base64String = Buffer.from(resp.data).toString("base64");
    } else {
      throw new BadRequestException("Invalid file source");
    }

    let lastError = null;
    let rawResult = null;

    for (let i = 0; i < genAIModels.length; i++) {
        const modelName = genAIModels[i];
        try {
            console.log(`[AI Scan] Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: { response_mime_type: "application/json" }
            });

            const result = await model.generateContent([
                receiptPrompt,
                { inlineData: { data: base64String, mimeType: file.mimetype } }
            ]);

            rawResult = result.response.text();
            console.log(`[DEBUG] Raw Gemini Response [${modelName}]:`, rawResult);
            if (rawResult) break;
        } catch (err) {
            lastError = err;
            const errMsg = err.message || "";
            // If quota is completely exhausted, do not hammer the remaining failover models
            if (errMsg.includes('429') || errMsg.includes('Quota')) {
                console.warn(`[AI Scan] Quota exceeded on ${modelName}, aborting failover loop.`);
                break;
            }
            continue;
        }
    }

    if (!rawResult) {
        console.warn("[DEBUG] AI Quota Exceeded. Engaging Offline Tesseract OCR Fallback...");
        try {
            const imageSource = file.buffer || file.path || file.url; 
            const { data: { text } } = await Tesseract.recognize(imageSource, 'eng');
            console.log("[DEBUG] Tesseract Extracted Text:", text.substring(0, 150), '...');
            rawResult = text; 
        } catch (tcrErr) {
            console.error("[DEBUG] Tesseract OCR fallback failed:", tcrErr.message);
            return {
              title: "New Receipt",
              shopName: "",
              amount: 0,
              date: new Date().toISOString().split('T')[0],
              category: "Other",
              tax: 0,
              paymentMethod: "Other",
              isAIFailed: true,
              partial: false,
              success: false,
              message: "AI Quota Exceeded and local OCR failed. Please fill details manually."
            };
        }
    }

    // Clean JSON (remove blocks and extra text)
    let cleaned = rawResult.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];

    let data;
    let isPartial = false;
    try {
        data = JSON.parse(cleaned);
        console.log("[DEBUG] Cleaned Parsed JSON:", data);
    } catch (e) {
        console.warn("[DEBUG] JSON Parse failed, returning fallback data.");
        data = {};
        isPartial = true;
    }

    // --- FALLBACK LOGIC ---

    const searchCorpus = ((data.fullText || "") + " " + (rawResult || "")).trim() || "";

    // 1. Amount detection
    let finalAmount = parseFloat(String(data.amount || 0).replace(/[^\d.-]/g, '')) || 0;
    if (finalAmount <= 0 && searchCorpus) {
        isPartial = true;
        // Simple regex scan for "total" keyword if amount is missing
        const amountRegex = /(?:total|grand total|final total|payable|amount paid|net amount|due)[\s]*[:\-₹$]*[\s]*([\d,.]+(?:\.\d{2})?)/gi;
        let match;
        let amounts = [];
        while ((match = amountRegex.exec(searchCorpus)) !== null) {
            const num = parseFloat(match[1].replace(/[^\d.]/g, ''));
            if (!isNaN(num)) amounts.push(num);
        }
        
        if (amounts.length > 0) {
             finalAmount = amounts[amounts.length - 1]; // Often the last total is the grand total
        } else {
             // Absolute fallback: extract all decimal numbers that look like currency and take the largest
             const currencyRegex = /(?:[\₹\$]?\s*)(\d{1,5}(?:\.\d{2}))/g;
             let cMatch;
             let allNums = [];
             while ((cMatch = currencyRegex.exec(searchCorpus)) !== null) {
                 const num = parseFloat(cMatch[1]);
                 if (!isNaN(num)) allNums.push(num);
             }
             if (allNums.length > 0) {
                 finalAmount = Math.max(...allNums);
             }
        }
    }

    // 2. Date fallback
    let finalDate = data.date;
    if (!finalDate || isNaN(new Date(finalDate).getTime())) {
        isPartial = true;
        finalDate = new Date().toISOString().split('T')[0];
    }

    // 3. Category Fallback using keywords
    let finalCategory = data.category || "Other";
    const catWords = finalCategory.toLowerCase() + " " + (data.title || "").toLowerCase() + " " + (data.shopName || "").toLowerCase() + " " + (data.description || "").toLowerCase() + " " + searchCorpus.substring(0, 500).toLowerCase();
    
    // Explicit mapping as requested
    if (finalCategory === "Other" || !finalCategory) {
        isPartial = true;
        if (/zomato|swiggy|restaurant|cafe|hotel|pizza|food|bk|mcdonald|burger/i.test(catWords)) finalCategory = "Food";
        else if (/uber|ola|metro|taxi|bus|train|fuel|shell|bpcl|petrol/i.test(catWords)) finalCategory = "Travel";
        else if (/dmart|reliance|trends|mall|market|shopping|amazon|flipkart/i.test(catWords)) finalCategory = "Shopping";
        else if (/electri|recharge|gas|broadband|wifi|water|bill|utility/i.test(catWords)) finalCategory = "Bills";
        else if (/movie|netflix|game|ticket|pvr|inox|show/i.test(catWords)) finalCategory = "Entertainment";
        else if (/pharmacy|hospital|clinic|medicine|doctor|apollo/i.test(catWords)) finalCategory = "Health";
        else if (/school|college|books|course|fees|academy/i.test(catWords)) finalCategory = "Education";
    }

    // 4. Shop Name / merchant
    let finalShopName = data.shopName || data.merchant || data.title || "";
    if (!finalShopName && searchCorpus) {
        isPartial = true;
        const usefulLines = searchCorpus.split('\n').map(l => l.trim()).filter(l => l.length > 3 && !l.match(/\d/) && !l.includes("{") && !l.toLowerCase().includes("total"));
        finalShopName = usefulLines.length > 0 ? usefulLines[0].substring(0, 30) : "Unknown Shop";
    }

    const finalResponse = {
        title: data.title || finalShopName || "Scanned Expense",
        amount: finalAmount,
        date: finalDate,
        shopName: finalShopName,
        category: finalCategory,
        tax: Number(data.tax) || 0,
        paymentMethod: data.paymentMethod || "Other",
        description: data.description || `Purchase at ${finalShopName}`,
        receiptUrl: file.url || file.path || "",
        merchant: finalShopName, // for backward compatibility if any
        success: true,
        partial: isPartial,
        message: isPartial ? "Some details may be incorrect. Please review." : "Receipt scanned successfully."
    };

    console.log("[DEBUG] Final Transformed Response:", finalResponse);
    return finalResponse;

  } catch (err) {
    console.error("[Scan Error]", err.message);
    // Never crash completely, fallback to empty manual mode
    return {
        title: "New Receipt",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        shopName: "",
        category: "Other",
        tax: 0,
        paymentMethod: "Other",
        success: true,
        partial: true,
        isAIFailed: true,
        message: "Unable to read this receipt clearly. Please review.",
        receiptUrl: file?.url || file?.path || ""
    };
  }
};
