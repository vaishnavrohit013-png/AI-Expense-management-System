import {
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
  startOfDay,
} from "date-fns";

import { DateRangeEnum } from "../enums/date-range.enum.js";

export const getDateRange = (preset, customFrom, customTo) => {
  if (customFrom && customTo) {
    return { from: new Date(customFrom), to: new Date(customTo), value: DateRangeEnum.CUSTOM };
  }

  const now = new Date();
  const today = endOfDay(now);

  switch (preset) {
    case DateRangeEnum.THIS_MONTH:
      return {
        from: startOfMonth(now),
        to: today,
        value: DateRangeEnum.THIS_MONTH,
      };

    case DateRangeEnum.LAST_MONTH:
      return {
        from: startOfMonth(subMonths(now, 1)),
        to: endOfMonth(subMonths(now, 1)),
        value: DateRangeEnum.LAST_MONTH,
      };

    case DateRangeEnum.LAST_30_DAYS:
      return {
        from: startOfDay(subDays(now, 30)),
        to: today,
        value: DateRangeEnum.LAST_30_DAYS,
      };

    case DateRangeEnum.LAST_3_MONTHS:
      return {
        from: startOfMonth(subMonths(now, 3)),
        to: today,
        value: DateRangeEnum.LAST_3_MONTHS,
      };

    case DateRangeEnum.THIS_YEAR:
      return {
        from: startOfYear(now),
        to: today,
        value: DateRangeEnum.THIS_YEAR,
      };

    case DateRangeEnum.LAST_YEAR:
      return {
        from: startOfYear(subYears(now, 1)),
        to: endOfYear(subYears(now, 1)),
        value: DateRangeEnum.LAST_YEAR,
      };

    case DateRangeEnum.ALL_TIME:
      return {
        from: null,
        to: null,
        value: DateRangeEnum.ALL_TIME,
      };

    default:
      return {
        from: startOfDay(subDays(now, 30)),
        to: today,
        value: DateRangeEnum.LAST_30_DAYS,
      };
  }
};
