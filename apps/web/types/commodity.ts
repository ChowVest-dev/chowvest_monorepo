export interface Commodity {
  sku: string;
  category: string;
  brand: string | null;
  price: number;
  unit: string;
  size: number;
  image: string | null;
  description: string;
  name: string;
}
