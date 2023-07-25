import { Restaurant } from "./restaurant.interface";

export interface Historical {
  date: string;
  price?: [number, number];
  type?: [string | null, string];
}

export type PastryType = 'pastry' | 'drink' | 'tip' | 'other';

export const PASTRY_TYPE_LABEL = {
  pastry: {
    label: 'Nourritures',
  },
  drink: {
    label: 'Boissons',
  },
  tip: {
    label: 'Pourboires',
  },
  other: {
    label: 'Autres',
  }
}

export interface Pastry extends CorePastry {
  id: string;
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
