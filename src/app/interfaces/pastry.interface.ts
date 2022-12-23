import { Restaurant } from "./restaurant.interface";

export interface Historical {
  date: Date;
  price?: [number, number];
  type?: [string | null, string];
}

export type PastryType = 'pastry' | 'drink' | 'tip' | 'other';

export interface Pastry extends CorePastry {
  _id: string;
  restaurant?: Restaurant;
  displaySequence: number;
  createdAt: string;
  updatedAt: string;
  historical: Historical[];
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
  type: PastryType;
  hidden: boolean;
}
