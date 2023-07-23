import { Pastry } from './pastry.interface';
import { Restaurant } from './restaurant.interface';

export const PAYMENT_TYPES = ['creditCart', 'cash', 'bankCheque'] as const;
export type PaymentType = typeof PAYMENT_TYPES[number];

export interface PaymentPossibility {
  key: PaymentType;
  value: number;
}

export interface Command extends CoreCommand {
  id: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  isDone?: boolean;
  isPayed?: boolean;
  restaurant: Restaurant;
  pastries: Pastry[];
  totalPrice: number;
  payment?: PaymentPossibility[];
}

export interface CoreCommand {
  name: string;
  takeAway: boolean;
  pastries?: Pastry[];
  pickUpTime?: Date | null;
}
