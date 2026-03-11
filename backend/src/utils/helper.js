import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  startOfMonth,
} from "date-fns";

import { RecurringIntervalEnum } from "../models/transaction.model.js";

export const calulateNextReportDate = (lastSentDate) => {
  const lastSent = lastSentDate || new Date();
  return startOfMonth(addMonths(lastSent, 1));
};

export const calculateNextOccurrence = (date, interval) => {
  switch (interval) {
    case RecurringIntervalEnum.DAILY:
      return addDays(date, 1);
    case RecurringIntervalEnum.WEEKLY:
      return addWeeks(date, 1);
    case RecurringIntervalEnum.MONTHLY:
      return addMonths(date, 1);
    case RecurringIntervalEnum.YEARLY:
      return addYears(date, 1);
    default:
      return date;
  }
};

export const capitalizeFirstLetter = (value) =>
  value.charAt(0).toUpperCase() + value.slice(1);
