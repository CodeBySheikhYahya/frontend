export type Discount = {
  amount: number;
  percentage: number;
};

export type ProductVariant = {
  id: string;
  stock_quantity: number;
  is_active: boolean;
  color?: {
    id: string;
    name: string;
    hex_code: string;
  };
  size?: {
    id: string;
    name: string;
  };
};

export type Product = {
  id: string | number; // Support both UUID (string) and numeric IDs
  title: string;
  srcUrl: string;
  gallery?: string[];
  price: number;
  discount: Discount;
  rating: number;
  variants?: ProductVariant[];
  description?: string | null;
  short_description?: string | null;
};
