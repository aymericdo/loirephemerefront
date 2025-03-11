import { Command } from "src/app/interfaces/command.interface";
import { pastriesMock } from "src/app/mocks/pastry.mock";
import { restaurantsMock } from "./restaurants.mock";

export const commandsMock: Command[] = [
  {
    id: '06ca4ae0-62a3-11ed-9b6a-0242ac120002',
    pastries: [pastriesMock[0]],
    name: 'name1',
    takeAway: false,
    totalPrice: 3,
    reference: 'XXX',
    restaurant: restaurantsMock[0],
    mergedCommandIds: [],
    createdAt: '2021-07-22T09:49:07.324+00:00',
    updatedAt: '2021-07-22T09:49:07.324+00:00',
  },
  {
    id: '4d81410b-b158-4951-820c-a898e5a49911',
    pastries: [pastriesMock[0]],
    name: 'name2',
    takeAway: false,
    totalPrice: 3,
    reference: 'XXX',
    restaurant: restaurantsMock[0],
    mergedCommandIds: [],
    createdAt: '2021-07-22T09:49:07.324+00:00',
    updatedAt: '2021-07-22T09:49:07.324+00:00',
  },
  {
    id: 'e2a46283-def5-4209-8a76-67bc12a4ddca',
    pastries: [pastriesMock[0]],
    name: 'name3',
    takeAway: true,
    totalPrice: 3,
    reference: 'XXX',
    restaurant: restaurantsMock[0],
    mergedCommandIds: [],
    createdAt: '2021-07-22T09:49:07.324+00:00',
    updatedAt: '2021-07-22T09:49:07.324+00:00',
  },
];
