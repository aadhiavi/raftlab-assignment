import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';


import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';

export const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: '*', // Allow all
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Socket.IO Real Time Communication
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Clients can join a room specific to their order ID to receive updates
  socket.on('joinOrder', (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined order room: ${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start MongoDB and Server
const startServer = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/food-delivery';

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB at', mongoUri);

    // Seed menu if empty
    const Menu = mongoose.model('Menu');
    const count = await Menu.countDocuments();
    if (count === 0) {
      await Menu.insertMany([
        { name: 'Classic Burger', description: 'Juicy beef patty.', price: 9.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
        { name: 'Pepperoni Pizza', description: 'Fresh baked pizza.', price: 14.99, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80' },
        { name: 'Sushi Platter', description: 'Assorted fresh sushi rolls.', price: 24.99, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80' }
      ]);
      console.log('Seeded database with menu items.');
    }

    if (require.main === module) {
      server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}
