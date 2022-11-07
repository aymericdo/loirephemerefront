export interface Pastry {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  stock: number;
  ingredients: string[];
  type: string;
  hidden?: boolean;
}
