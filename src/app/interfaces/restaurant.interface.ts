export interface Restaurant extends CoreRestaurant {
  _id: string;
  code: string;
}

export interface CoreRestaurant {
  name: string;
}
