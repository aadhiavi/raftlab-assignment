import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import OrderStatus from './pages/OrderStatus';
import MyOrders from './pages/MyOrders';
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';

function App() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <nav className="bg-brand text-white shadow-md p-4 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">
              🍽️ FoodieExpress
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="hover:text-red-100 font-medium transition-colors">Menu</Link>
              <Link to="/orders" className="hover:text-red-100 font-medium transition-colors">My Orders</Link>
              <Link to="/checkout" className="relative hover:text-red-100 font-medium transition-colors flex items-center">
                🛒 Cart
                <span className="absolute -top-2 -right-3 bg-white text-brand text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </nav>
        
        <main className="flex-grow max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/order/:id" element={<OrderStatus />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-gray-400 py-6 text-center">
          <p>&copy; 2026 FoodieExpress. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
