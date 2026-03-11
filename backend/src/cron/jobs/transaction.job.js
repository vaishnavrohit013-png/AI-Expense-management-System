import mongoose from "mongoose";
import TransactionModel from "../../models/transaction.model.js";
import { calculateNextOccurrence } from "../../utils/helper.js";

export const processRecurringTransactions = async () => {
  const now = new Date();
  let processedCount = 0;
  let failedCount = 0;

  try {
    const transactionCursor = TransactionModel.find({
      isRecurring: true,
      nextRecurringDate: { $lte: now },
    }).cursor();

    console.log("Starting recurring process");

    for await (const tx of transactionCursor) {
      const nextDate = calculateNextOccurrence(
        tx.nextRecurringDate,
        tx.recurringInterval
      );

      const session = await mongoose.startSession();

      try {
        await session.withTransaction(
          async () => {
            await TransactionModel.create(
              [
                {
                  ...tx.toObject(),
                  _id: new mongoose.Types.ObjectId(),
                  title: `Recurring - ${tx.title}`,
                  date: tx.nextRecurringDate,
                  isRecurring: false,
                  nextRecurringDate: null,
                  recurringInterval: null,
                  lastProcessed: null,
                  createdAt: undefined,
                  updatedAt: undefined,
                },
              ],
              { session }
            );

            await TransactionModel.updateOne(
              { _id: tx._id },
              {
                $set: {
                  nextRecurringDate: nextDate,
                  lastProcessed: now,
                },
              },
              { session }
            );
          },
          { maxCommitTimeMS: 20000 }
        );

        processedCount++;
      } catch (error) {
        failedCount++;
        console.error(`Failed recurring tx: ${tx._id}`, error);
      } finally {
        await session.endSession();
      }
    }

    console.log(`✅ Processed: ${processedCount} transactions`);
    console.log(`❌ Failed: ${failedCount} transactions`);

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error) {
    console.error("Error processing recurring transactions", error);
    return {
      success: false,
      error: error?.message,
    };
  }
};
