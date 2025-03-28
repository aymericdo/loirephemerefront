export const ACCESS_LIST = ['menu', 'commands', 'stats', 'users'] as const;
export type Access = typeof ACCESS_LIST[number];

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  access: Access[] | { [restaurantId: string]: Access[] };
  displayDemoResto: boolean;
  waiterMode: boolean | { [restaurantId: string]: boolean };
}

export interface CoreUser {
  email: string;
  password: string;
}
