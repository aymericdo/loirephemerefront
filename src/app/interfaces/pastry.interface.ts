export interface Pastry {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  ingredients: string[];
  hidden?: boolean;
}
