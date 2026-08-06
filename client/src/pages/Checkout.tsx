import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { RootState } from '../store/store';
import { clearCart, updateQuantity, removeFromCart } from '../store/cartSlice';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Please provide a full address'),
  phone: z.string().min(10, 'Please provide a valid phone number')
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema)
  });

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const mutation = useMutation({
    mutationFn: (newOrder: any) => {
      return axios.post(`${API_BASE_URL}/api/orders`, newOrder);
    },
    onSuccess: (response) => {
      dispatch(clearCart());
      navigate(`/order/${response.data.orderId || response.data._id}`);
    }
  });

  const onSubmit = (data: CheckoutForm) => {
    if (cartItems.length === 0) return;
    
    const newOrder = {
      items: cartItems.map(item => ({ 
        menuItemId: item.id || (item as any)._id, 
        quantity: item.quantity 
      })),
      customerDetails: data
    };
    mutation.mutate(newOrder);
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any delicious food yet.</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-brand text-white font-medium py-3 px-8 rounded-full hover:bg-red-600 transition-colors shadow-sm"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Checkout Form */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Delivery Details</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input 
              {...register('name')} 
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
            <input 
              {...register('address')} 
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
              placeholder="123 Main St, Apt 4B"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input 
              {...register('phone')} 
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
              placeholder="(555) 123-4567"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full bg-brand hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {mutation.isPending ? 'Placing Order...' : `Place Order • ₹${totalAmount.toFixed(2)}`}
          </button>
        </form>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 self-start">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">Order Summary</h2>
        <div className="space-y-4 mb-6">
          {cartItems.map(item => (
            <div key={item.id || (item as any)._id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-4">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                <div>
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <p className="text-brand font-medium">₹{item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                  <button 
                    type="button"
                    onClick={() => {
                      const id = item.id || (item as any)._id;
                      if (item.quantity > 1) {
                        dispatch(updateQuantity({ id, quantity: item.quantity - 1 }));
                      } else {
                        dispatch(removeFromCart(id));
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-red-50 hover:text-red-500 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                  <button 
                    type="button"
                    onClick={() => dispatch(updateQuantity({ id: item.id || (item as any)._id, quantity: item.quantity + 1 }))}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-green-50 hover:text-green-600 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => dispatch(removeFromCart(item.id || (item as any)._id))}
                  className="text-gray-400 hover:text-red-500 p-2 transition-colors rounded-full hover:bg-red-50"
                  title="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
          <span>Total</span>
          <span className="text-brand">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
