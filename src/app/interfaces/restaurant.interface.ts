export interface Restaurant extends CoreRestaurant {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  openingTime?: { [weekDay: number]: { openingTime: string, closingTime: string } };
}

export interface CoreRestaurant {
  name: string;
}
