import { Pastry } from './pastry.interface';

export interface Command extends CoreCommand {
  _id?: string;
  pastries: Pastry[];
  totalPrice: number;
  reference?: string;
  createdAt?: string;
  updatedAt?: string;
  isDone?: boolean;
  isPayed?: boolean;
}

export interface CoreCommand {
  name: string;
  takeAway: boolean;
  pickUpTime?: Date | null;
}
