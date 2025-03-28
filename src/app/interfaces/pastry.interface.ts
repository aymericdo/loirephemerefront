import { Restaurant } from "./restaurant.interface";

export interface Historical {
  date: string;
  price?: [number, number];
  type?: [string | null, string];
}

export type PastryType = 'pastry' | 'drink' | 'tip' | 'other';
export type PastryTypeCompleted = PastryType | 'separator';

export const PASTRY_TYPE_LABEL = {
  pastry: {
    label: $localize`Plats`,
    sequence: 0,
  },
  drink: {
    label: $localize`Boissons`,
    sequence: 1,
  },
  tip: {
    label: $localize`Pourboires`,
    sequence: 2,
  },
  other: {
    label: $localize`Autres`,
    sequence: 3,
  },
};

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
  type: PastryTypeCompleted;
  hidden: boolean;
  isSeparator?: boolean;
}
