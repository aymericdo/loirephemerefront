import { Pastry } from './pastry.interface';

export interface Command {
  _id?: string;
  pastries: Pastry[];
  name: string;
  totalPrice: number;
  reference?: string;
  createdAt?: string;
  updatedAt?: string;
  isDone?: boolean;
  isPayed?: boolean;
}
