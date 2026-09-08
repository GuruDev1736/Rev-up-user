const DAY_HOURS = 24;
const WEEK_HOURS = 7 * DAY_HOURS;
const MONTH_HOURS = 30 * DAY_HOURS;

const pluralize = (value, singular, plural = `${singular}s`) =>
  `${value} ${value === 1 ? singular : plural}`;

export const getBilledDuration = (startDateTime, endDateTime, rentalPeriodType) => {
  if (!startDateTime || !endDateTime) return "N/A";

  const start = new Date(startDateTime.replace(" ", "T"));
  const end = new Date(endDateTime.replace(" ", "T"));
  const totalHours = Math.floor((end - start) / (1000 * 60 * 60));
  if (totalHours < 0) return "N/A";

  const parts = [];
  const addHours = (hours) => {
    if (hours > 0) parts.push(pluralize(hours, "Hour"));
  };

  switch ((rentalPeriodType || "DAY").toUpperCase()) {
    case "WEEK": {
      const fullWeeks = Math.floor(totalHours / WEEK_HOURS);
      let remainingHours = totalHours % WEEK_HOURS;
      let extraDays = Math.floor(remainingHours / DAY_HOURS);
      remainingHours %= DAY_HOURS;
      if (extraDays >= 5) return pluralize(fullWeeks + 1, "Week");
      if (fullWeeks > 0) parts.push(pluralize(fullWeeks, "Week"));
      if (remainingHours > 0 && remainingHours < 3) addHours(Math.ceil(remainingHours));
      else if (remainingHours >= 3) extraDays += 1;
      if (extraDays > 0) parts.push(pluralize(extraDays, "Day"));
      return parts.join(" + ") || "0 Hours";
    }
    case "MONTH": {
      const fullMonths = Math.floor(totalHours / MONTH_HOURS);
      let remainingHours = totalHours % MONTH_HOURS;
      let extraWeeks = Math.floor(remainingHours / WEEK_HOURS);
      remainingHours %= WEEK_HOURS;
      if (extraWeeks >= 4) return pluralize(fullMonths + 1, "Month");
      if (fullMonths > 0) parts.push(pluralize(fullMonths, "Month"));
      let extraDays = Math.floor(remainingHours / DAY_HOURS);
      remainingHours %= DAY_HOURS;
      if (extraDays >= 5) {
        extraWeeks += 1;
        extraDays = 0;
        remainingHours = 0;
      }
      if (extraWeeks > 0) parts.push(pluralize(extraWeeks, "Week"));
      if (remainingHours > 0 && remainingHours < 3) addHours(Math.ceil(remainingHours));
      else if (remainingHours >= 3) extraDays += 1;
      if (extraDays > 0) parts.push(pluralize(extraDays, "Day"));
      return parts.join(" + ") || "0 Hours";
    }
    default: {
      if (totalHours < 3) return "0 Hours";
      const fullDays = Math.floor(totalHours / DAY_HOURS);
      const remainingHours = totalHours % DAY_HOURS;
      if (remainingHours === 0) return pluralize(fullDays, "Day");
      if (remainingHours < 3) {
        if (fullDays > 0) parts.push(pluralize(fullDays, "Day"));
        addHours(Math.ceil(remainingHours));
        return parts.join(" + ");
      }
      return pluralize(fullDays + 1, "Day");
    }
  }
};