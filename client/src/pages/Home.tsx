
import type { MenuItem } from '../types';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, updateQuantity, removeFromCart } from '../store/cartSlice';
import type { RootState } from '../store/store';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchMenu = async (): Promise<MenuItem[]> => {
  const { data } = await axios.get('http://localhost:5000/api/menu');
  return data;
};

const Home = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  
  const { data: menuItems, isLoading, error } = useQuery({
    queryKey: ['menu'],
    queryFn: fetchMenu
  });

  const handleAddToCart = (item: MenuItem) => {
    dispatch(addToCart(item));
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>;
  if (error) return <div className="text-red-500 text-center text-xl mt-10">Failed to load menu items.</div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Our Delicious Menu</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover our hand-picked culinary delights prepared fresh daily. Add items to your cart and enjoy a seamless ordering experience.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuItems?.map((item) => {
          const itemId = item.id || (item as any)._id;
          const cartItem = cartItems.find(i => i.id === itemId || (i as any)._id === itemId);
          return (
          <div key={itemId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="relative h-56 overflow-hidden bg-gray-200">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-brand font-bold shadow-sm">
                ₹{item.price.toFixed(2)}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">{item.description}</p>
              
              {cartItem ? (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-1">
                  <button 
                    onClick={() => {
                      if (cartItem.quantity > 1) {
                        dispatch(updateQuantity({ id: itemId, quantity: cartItem.quantity - 1 }));
                      } else {
                        dispatch(removeFromCart(itemId));
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-red-50 hover:text-red-500 text-gray-800 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="font-bold text-gray-900">{cartItem.quantity} added</span>
                  <button 
                    onClick={() => dispatch(updateQuantity({ id: itemId, quantity: cartItem.quantity + 1 }))}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-green-50 hover:text-green-600 text-gray-800 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-gray-900 hover:bg-brand text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Add to Cart +</span>
                </button>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default Home;
