import { Pastry } from './pastry.interface';

export interface Command {
  pastries: Pastry[];
  table: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  isDone?: boolean;
}
