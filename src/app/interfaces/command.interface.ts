import { presetPalettes } from '@ant-design/colors';
import { Pastry } from './pastry.interface';
import { Restaurant } from './restaurant.interface';

export const PAYMENT_TYPES = ['creditCart', 'cash', 'bankCheque', 'internet'] as const;
export type PaymentType = typeof PAYMENT_TYPES[number];

export const PAYMENT_METHOD_LABEL = {
  cash: {
    label: $localize`Espèce`,
    color: presetPalettes['green'].primary as string,
  },
  creditCart: {
    label: $localize`Carte bancaire`,
    color: presetPalettes['blue'].primary as string,
  },
  bankCheque: {
    label: $localize`Chèque`,
    color: presetPalettes['magenta'].primary as string,
  },
  internet: {
    label: $localize`Internet`,
    color: presetPalettes['orange'].primary as string,
  },
};

export interface Discount {
  gifts: string[];
  percentage: number;
  newPrice: number;
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
  paymentRequired?: boolean;
  paymentActivated?: boolean;
  isCancelled?: boolean;
  restaurant: Restaurant;
  pastries: Pastry[];
  totalPrice: number;
  payment?: PaymentPossibility[];
  discount?: Discount;
}

export interface CoreCommand {
  name: string;
  takeAway: boolean;
  pastries?: Pastry[];
  pickUpTime?: Date | null;
}
