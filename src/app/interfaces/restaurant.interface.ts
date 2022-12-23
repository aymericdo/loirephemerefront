export interface Restaurant extends CoreRestaurant {
  _id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoreRestaurant {
  name: string;
}
