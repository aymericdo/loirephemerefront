import { Pastry } from './pastry.interface';

export interface Command {
  _id?: string;
  pastries: Pastry[];
  table: string;
  name: string;
  ref?: string;
  createdAt?: string;
  updatedAt?: string;
  isDone?: boolean;
}
