export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderStatusType = 'Order Received' | 'Preparing' | 'Out for Delivery' | 'Delivered';

export interface Order {
  id: string;
  items: { menuItemId: string, quantity: number }[];
  customerDetails: {
    name: string;
    address: string;
    phone: string;
  };
  status: OrderStatusType;
  totalAmount: number;
  createdAt: string;
}
