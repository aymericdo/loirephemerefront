import { presetPalettes } from '@ant-design/colors';
import { Pastry } from './pastry.interface';
import { Restaurant } from './restaurant.interface';

export const PAYMENT_TYPES = ['creditCart', 'cash', 'bankCheque'] as const;
export type PaymentType = typeof PAYMENT_TYPES[number];

export const PAYMENT_METHOD_LABEL = {
  cash: {
    label: 'Espèce',
    color: presetPalettes['green'].primary as string,
  },
  creditCart: {
    label: 'Carte bancaire',
    color: presetPalettes['blue'].primary as string,
  },
  bankCheque: {
    label: 'Chèque',
    color: presetPalettes['magenta'].primary as string,
  }
}

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
  isCancelled?: boolean;
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
