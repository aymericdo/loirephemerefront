export interface Restaurant extends CoreRestaurant {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  openingTime?: { [weekDay: number]: { startTime: string, endTime: string } };
  openingPickupTime?: { [weekDay: number]: { startTime: string, endTime: string } };
}

export interface CoreRestaurant {
  name: string;
}
