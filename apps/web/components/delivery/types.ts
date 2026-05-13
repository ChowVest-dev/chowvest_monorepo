export interface SerializedDelivery {
  id: string;
  status: string;
  address: string;
  createdAt: string;
  deliveredAt: string | null;
  basketId: string | null;
  commodityName: string;
  image: string;
  amount: number;
  riderName?: string | null;
  riderPhone?: string | null;
  deliveryPin?: string | null;
}
export interface SerializedReadyBasket {
  id: string;
  name: string;
  image: string;
  goalAmount: number;
}
