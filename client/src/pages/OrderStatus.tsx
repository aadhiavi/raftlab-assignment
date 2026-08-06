import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { io } from 'socket.io-client';

const fetchOrder = async (id: string) => {
  const { data } = await axios.get(`http://localhost:5000/api/orders/${id}`);
  return data;
};

const STATUS_STEPS = ['Order Received', 'Preparing', 'Out for Delivery', 'Delivered'];

const OrderStatus = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [liveStatus, setLiveStatus] = useState<string | null>(null);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id as string),
    enabled: !!id
  });

  useEffect(() => {
    if (!id) return;
    
    // Connect to Socket.IO for real-time updates
    const socket = io('http://localhost:5000');
    
    socket.emit('joinOrder', id);
    
    socket.on('orderStatusUpdated', (updatedOrder) => {
      setLiveStatus(updatedOrder.status);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>;
  
  if (error || !order) return (
    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-red-500 mb-2">Order Not Found</h2>
      <p className="text-gray-500 mb-6">We couldn't find the order you are looking for.</p>
      <button onClick={() => navigate('/')} className="bg-brand text-white font-medium py-2 px-6 rounded-full hover:bg-red-600 transition-colors">Return Home</button>
    </div>
  );

  const currentStatus = liveStatus || order.status;
  const currentStepIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-100">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
        <p className="text-gray-500">Order ID: <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">{id}</span></p>
      </div>

      <div className="mb-12 relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
          <div style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand transition-all duration-1000 ease-in-out"></div>
        </div>
        <div className="flex justify-between w-full">
          {STATUS_STEPS.map((step, index) => {
            const isActive = index <= currentStepIndex;
            return (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors duration-500 ${isActive ? 'bg-brand text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {isActive ? '✓' : index + 1}
                </div>
                <span className={`text-xs sm:text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b">Order Details</h3>
        <div className="space-y-4">
          {order.items.map((item: any, idx: number) => {
             // Mongoose populates item.menuItem, but if it fails fallback to raw item
             const name = item.menuItem?.name || 'Unknown Item';
             const qty = item.quantity;
             return (
              <div key={idx} className="flex justify-between items-center text-gray-700">
                <span>{qty}x {name}</span>
              </div>
             );
          })}
        </div>
        <div className="mt-6 pt-4 border-t flex justify-between items-center font-bold text-lg text-gray-900">
          <span>Total Paid</span>
          <span className="text-brand">₹{order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
