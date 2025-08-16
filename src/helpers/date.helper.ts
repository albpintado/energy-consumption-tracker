export class DateHelper {
  static getMonthRange = (
    dateString: string
  ): { startDate: Date; endDate: Date } => {
    const date = new Date(dateString);

    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    return { startDate, endDate };
  };
}
