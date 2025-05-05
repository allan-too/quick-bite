import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Menu } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const MobileNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
      <div className="flex justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center py-2 ${
            isActive('/') ? 'text-primary-600' : 'text-gray-500'
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link
          to="/search"
          className={`flex flex-col items-center py-2 ${
            isActive('/search') ? 'text-primary-600' : 'text-gray-500'
          }`}
        >
          <Search size={24} />
          <span className="text-xs mt-1">Search</span>
        </Link>
        
        <Link
          to="/cart"
          className={`flex flex-col items-center py-2 relative ${
            isActive('/cart') ? 'text-primary-600' : 'text-gray-500'
          }`}
        >
          <ShoppingCart size={24} />
          {totalItems > 0 && (
            <span className="absolute top-0 right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
          <span className="text-xs mt-1">Cart</span>
        </Link>
        
        <Link
          to="/profile"
          className={`flex flex-col items-center py-2 ${
            isActive('/profile') ? 'text-primary-600' : 'text-gray-500'
          }`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
        
        <Link
          to="/more"
          className={`flex flex-col items-center py-2 ${
            isActive('/more') ? 'text-primary-600' : 'text-gray-500'
          }`}
        >
          <Menu size={24} />
          <span className="text-xs mt-1">More</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;