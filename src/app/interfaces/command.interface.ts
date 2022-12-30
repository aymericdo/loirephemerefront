import { Pastry } from './pastry.interface';
import { Restaurant } from './restaurant.interface';

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
}

export interface CoreCommand {
  name: string;
  takeAway: boolean;
  pastries?: Pastry[];
  pickUpTime?: Date | null;
}
