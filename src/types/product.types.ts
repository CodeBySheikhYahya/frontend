export type Discount = {
  amount: number;
  percentage: number;
};

export type Product = {
  id: string | number; // Support both UUID (string) and numeric IDs
  title: string;
  srcUrl: string;
  gallery?: string[];
  price: number;
  discount: Discount;
  rating: number;
};
