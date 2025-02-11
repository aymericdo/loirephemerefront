export interface Restaurant extends CoreRestaurant {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  openingTime?: { [weekDay: number]: { startTime: string, endTime: string } };
  openingPickupTime?: { [weekDay: number]: { startTime: string } };
  displayStock?: boolean;
  alwaysOpen?: boolean;
  timezone?: string;
  paymentInformation?: {
    type: 'Stripe';
    paymentActivated: boolean;
    paymentRequired: boolean;
    publicKey: string;
    secretKey: string;
  }
}

export interface CoreRestaurant {
  name: string;
}
