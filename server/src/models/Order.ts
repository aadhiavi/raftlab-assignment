import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IOrder extends Document {
  orderId: string;
  items: IOrderItem[];
  customerDetails: {
    name: string;
    address: string;
    phone: string;
  };
  status: 'Order Received' | 'Preparing' | 'Out for Delivery' | 'Delivered';
  totalAmount: number;
  createdAt: Date;
}

const OrderItemSchema = new Schema({
  menuItem: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const OrderSchema: Schema = new Schema({
  orderId: { type: String, required: true, unique: true },
  items: { type: [OrderItemSchema], required: true },
  customerDetails: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true }
  },
  status: { 
    type: String, 
    enum: ['Order Received', 'Preparing', 'Out for Delivery', 'Delivered'],
    default: 'Order Received' 
  },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOrder>('Order', OrderSchema);
