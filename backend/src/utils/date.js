import {
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";

import { DateRangeEnum } from "../enums/date-range.enum.js";

export const getDateRange = (preset, customFrom, customTo) => {
  if (customFrom && customTo) {
    return { from: customFrom, to: customTo, value: DateRangeEnum.CUSTOM };
  }

  const now = new Date();
  const today = endOfDay(now);

  switch (preset) {
    case DateRangeEnum.LAST_MONTH:
      return {
        from: startOfMonth(subMonths(now, 1)),
        to: endOfMonth(subMonths(now, 1)),
        value: DateRangeEnum.LAST_MONTH,
      };

    default:
      return {
        from: subDays(today, 29),
        to: today,
        value: DateRangeEnum.LAST_30_DAYS,
      };
  }
};
