import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const fetchOrders = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/api/orders`);
  return data;
};

const MyOrders = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders
  });

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>;
  if (error) return <div className="text-red-500 text-center text-xl mt-10">Failed to load orders.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">My Orders</h1>
      
      {(!orders || orders.length === 0) ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't placed any orders.</p>
          <button onClick={() => navigate('/')} className="bg-brand text-white font-medium py-2 px-6 rounded-full hover:bg-red-600 transition-colors">Browse Menu</button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div 
              key={order._id} 
              onClick={() => navigate(`/order/${order.orderId}`)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500 font-mono">Order #{order.orderId}</p>
                  <p className="font-bold text-gray-900">{order.customerDetails.name}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-gray-600 text-sm mb-2">
                  {order.items.map((item: any) => `${item.quantity}x ${item.menuItem?.name || 'Item'}`).join(', ')}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-brand group-hover:underline">View Tracking &rarr;</span>
                  <span className="font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
