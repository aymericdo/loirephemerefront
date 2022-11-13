import { Restaurant } from "./restaurant.interface";

export interface Pastry extends CorePastry {
  _id: string;
  restaurant: Restaurant;
}

export interface CorePastry {
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  stock: number;
  ingredients: string[];
  type: string;
  hidden?: boolean;
}
