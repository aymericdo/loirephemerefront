import { Pastry } from './pastry.interface';

export interface Command {
  _id?: string;
  pastries: Pastry[];
  table: string;
  num: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  isDone?: boolean;
}
