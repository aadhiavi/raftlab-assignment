import { Request, Response } from 'express';
import { z } from 'zod';
import Order from '../models/Order';
import Menu from '../models/Menu';
import { io } from '../index';
import crypto from 'crypto';

const orderSchema = z.object({
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().positive()
    })
  ).min(1, 'Cart cannot be empty'),
  customerDetails: z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(1, 'Address is required'),
    phone: z.string().min(1, 'Phone is required')
  })
});

export const placeOrder = async (req: Request, res: Response) => {
  try {
    const validatedData = orderSchema.parse(req.body);
    const { items, customerDetails } = validatedData;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ error: `Menu item not found: ${item.menuItemId}` });
      }
      totalAmount += menuItem.price * item.quantity;
      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity
      });
    }

    const orderId = 'ORD-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const newOrder = new Order({
      orderId,
      items: orderItems,
      customerDetails,
      totalAmount,
      status: 'Order Received'
    });

    await newOrder.save();

    // Start simulating status updates only if not in test mode to prevent open handle leaks
    if (process.env.NODE_ENV !== 'test') {
      simulateOrderStatusUpdates(newOrder.orderId);
    }

    res.status(201).json(newOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ orderId: id }).populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().populate('items.menuItem').sort({ _id: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['Order Received', 'Preparing', 'Out for Delivery', 'Delivered'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await Order.findOneAndUpdate(
          { orderId: id }, 
          { status }, 
          { returnDocument: 'after' }
        );
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Emit socket event!
        io.to(id).emit('orderStatusUpdated', order);

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findOneAndDelete({ orderId: id });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Simulate real-time updates for assessment purposes
const simulateOrderStatusUpdates = async (orderId: string) => {
  const updateStatus = async (status: string) => {
    const order = await Order.findOneAndUpdate(
      { orderId }, 
      { status }, 
      { returnDocument: 'after' }
    );
    if (order) {
      io.to(orderId).emit('orderStatusUpdated', order);
    }
  };

  setTimeout(() => {
    updateStatus('Preparing');
    setTimeout(() => {
      updateStatus('Out for Delivery');
      setTimeout(() => {
        updateStatus('Delivered');
      }, 15000);
    }, 15000);
  }, 10000);
};
