import { Restaurant } from "./restaurant.interface";

export interface Pastry extends CorePastry {
  _id: string;
  restaurant?: Restaurant;
  displaySequence: number;
  createdAt: string;
  updatedAt: string;
}

export interface CorePastry {
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  stock: number;
  displaySequence?: number;
  commonStock?: string;
  ingredients: string[];
  type: 'pastry' | 'drink' | 'tip' | 'other';
  hidden: boolean;
}
