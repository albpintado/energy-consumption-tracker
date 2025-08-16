export class DateHelper {
  static getMonthRange = (dateString: string): { startDate: Date; endDate: Date } => {
    const date = new Date(dateString);

    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    return { startDate, endDate };
  };

  static getDaysBetween = (startDate: Date, endDate: Date): number => {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return Math.floor((endTime - startTime) / millisecondsPerDay);
  };

  static getMonthName = (month: number): string => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[month];
  };
}
