import { Pastry } from './pastry.interface';

export interface Command {
  _id?: string;
  pastries: Pastry[];
  table: string;
  name: string;
  reference?: string;
  createdAt?: string;
  updatedAt?: string;
  isDone?: boolean;
  isPayed?: boolean;
}
