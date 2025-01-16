import { getCwday, getYesterday, hourMinuteToDate } from "src/app/helpers/date";
import { Restaurant as RestaurantInterface } from "src/app/interfaces/restaurant.interface";

interface OpeningHours {
  start: Date | null;
  end: Date | null;
  isOnTwoDay?: boolean;
}

export class Restaurant implements RestaurantInterface {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  openingTime?: { [weekDay: number]: { startTime: string, endTime: string } };
  openingPickupTime?: { [weekDay: number]: { startTime: string } };
  displayStock?: boolean;
  alwaysOpen?: boolean;
  paymentInformation?: {
    type: 'Stripe';
    paymentActivated: boolean;
    paymentRequired: boolean;
    publicKey: string;
    secretKey: string;
  };

  todayOpeningTimes: OpeningHours;
  yesterdayOpeningTimes: OpeningHours;

  constructor(restaurant: RestaurantInterface) {
    this.id = restaurant.id;
    this.code = restaurant.code;
    this.name = restaurant.name;
    this.createdAt = restaurant.createdAt;
    this.updatedAt = restaurant.updatedAt;
    this.openingTime = restaurant.openingTime;
    this.openingPickupTime = restaurant.openingPickupTime;
    this.displayStock = restaurant.displayStock;
    this.alwaysOpen = restaurant.alwaysOpen;
    this.paymentInformation = restaurant.paymentInformation;

    this.todayOpeningTimes = this.getTodayOpeningTimes();
    this.yesterdayOpeningTimes = this.getYesterdayOpeningTimes();
  }

  isOpen(date = new Date()): boolean {
    if (this.alwaysOpen) {
      return true;
    }

    const now = new Date(date.getTime());

    const { start: startTime, end: endTime } = this.todayOpeningTimes;
    const { start: yesterdayStartTime, end: yesterdayEndTime } = this.yesterdayOpeningTimes;

    return !!(startTime && endTime && startTime < now && now < endTime) ||
      !!(yesterdayStartTime && yesterdayEndTime && yesterdayStartTime < now && now < yesterdayEndTime);
  };

  isPickupOpen(): boolean {
    if (this.alwaysOpen) return true;
    if (this.isOpen()) return true;

    const now = new Date();
    const cwday = getCwday();

    if (this.getOpeningPickupTime(cwday)) {
      const openingPickupHoursMinutes = this.getOpeningPickupTime(cwday)!.split(':');
      const startTime = hourMinuteToDate(openingPickupHoursMinutes[0], openingPickupHoursMinutes[1]);

      return !!(startTime && now >= startTime);
    }

    return false;
  };

  getTodayClosingTime(): Date {
    const {
      start: startTime,
      end: endTime,
    } = this.getTodayOpeningTimes();

    const {
      start: yesterdayStartTime,
      end: yesterdayEndTime,
      isOnTwoDay: yesterdayOnTwoDays,
    } = this.getYesterdayOpeningTimes();

    const isTodayClose = !startTime && !endTime;
    const isYesterdayClose = !yesterdayStartTime && !yesterdayEndTime;

    return (isYesterdayClose || !yesterdayOnTwoDays) ? endTime! :
      isTodayClose ? yesterdayEndTime! :
      endTime! > yesterdayEndTime! ? endTime! : yesterdayEndTime!;
  }

  getTodayOpeningTimes(): OpeningHours {
    const cwday = getCwday();

    if (this.getOpeningTime(cwday)) {
      const openingHoursMinutes = this.getOpeningTime(cwday)!.split(':');
      const closingHoursMinutes = this.getClosingTime(cwday)!.split(':');

      const start = hourMinuteToDate(openingHoursMinutes[0], openingHoursMinutes[1]);
      const end = hourMinuteToDate(closingHoursMinutes[0], closingHoursMinutes[1]);
      let isOnTwoDay = false;

      if (start >= end) {
        end.setDate(end.getDate() + 1);
        isOnTwoDay = true;
      }

      return { start, end, isOnTwoDay };
    }

    return { start: null, end: null };
  };

  private getYesterdayOpeningTimes(): OpeningHours {
    const yesterday = getYesterday();

    if (this.getOpeningTime(yesterday)) {
      const openingHoursMinutes = this.getOpeningTime(yesterday)!.split(':');
      const closingHoursMinutes = this.getClosingTime(yesterday)!.split(':');

      const start = hourMinuteToDate(openingHoursMinutes[0], openingHoursMinutes[1]);
      const end = hourMinuteToDate(closingHoursMinutes[0], closingHoursMinutes[1]);

      let isOnTwoDay = false;

      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);

      if (start >= end) {
        end.setDate(end.getDate() + 1);
        isOnTwoDay = true;
      }

      return { start, end, isOnTwoDay };
    }

    return { start: null, end: null };
  };

  private getOpeningTime(cwday: number): string | undefined {
    return this.openingTime &&
      this.openingTime[cwday] &&
      this.openingTime[cwday].startTime;
  }

  private getClosingTime(cwday: number): string | undefined {
    return this.openingTime &&
      this.openingTime[cwday] &&
      this.openingTime[cwday].endTime;
  }

  private getOpeningPickupTime(cwday: number): string | undefined {
    return this.openingPickupTime &&
      this.openingPickupTime[cwday] &&
      this.openingPickupTime[cwday].startTime;
  }

}
