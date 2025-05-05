import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  ShoppingCart, 
  User, 
  LogOut, 
  ChevronDown,
  Bike,
  Package,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import logo from '../../assets/logo.svg';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, profile, logout, isRider } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };
  
  // Close menus when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);
  
  const headerClasses = `fixed top-0 left-0 right-0 z-20 transition-all duration-300 ${
    isScrolled ? 'bg-white shadow-header py-2' : 'bg-transparent py-4'
  }`;
  
  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="QuickBite" className="h-10 w-auto" />
          <span className="ml-2 text-xl font-semibold text-primary-600">QuickBite</span>
        </Link>
        
        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              {isRider ? (
                <Link 
                  to="/rider-dashboard" 
                  className="text-gray-700 hover:text-primary-600 flex items-center"
                >
                  <Bike className="mr-1 h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link 
                  to="/orders" 
                  className="text-gray-700 hover:text-primary-600 flex items-center"
                >
                  <Package className="mr-1 h-5 w-5" />
                  <span>My Orders</span>
                </Link>
              )}
              
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-gray-700 hover:text-primary-600"
                >
                  <User className="mr-1 h-5 w-5" />
                  <span className="truncate max-w-[100px]">
                    {profile?.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
              
              {!isRider && (
                <Link 
                  to="/cart" 
                  className="relative p-2 text-gray-700 hover:text-primary-600"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-primary-600"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                className="bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          {!isRider && (
            <Link 
              to="/cart" 
              className="relative p-2 mr-2 text-gray-700"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 py-3">
            <div className="relative w-full mb-4">
              <input
                type="text"
                placeholder="Search restaurants or dishes..."
                className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{profile?.full_name || 'User'}</p>
                    <p className="text-sm text-gray-500">{profile?.email}</p>
                  </div>
                </div>
                
                {isRider ? (
                  <Link 
                    to="/rider-dashboard" 
                    className="block py-2 text-gray-700"
                  >
                    <div className="flex items-center">
                      <Bike className="mr-3 h-5 w-5" />
                      <span>Rider Dashboard</span>
                    </div>
                  </Link>
                ) : (
                  <Link 
                    to="/orders" 
                    className="block py-2 text-gray-700"
                  >
                    <div className="flex items-center">
                      <Package className="mr-3 h-5 w-5" />
                      <span>My Orders</span>
                    </div>
                  </Link>
                )}
                
                <Link 
                  to="/profile" 
                  className="block py-2 text-gray-700"
                >
                  <div className="flex items-center">
                    <User className="mr-3 h-5 w-5" />
                    <span>Profile</span>
                  </div>
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full py-2 text-gray-700"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link 
                  to="/login" 
                  className="block py-2 px-4 text-center border border-primary-600 text-primary-600 rounded-full"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="block py-2 px-4 text-center bg-primary-600 text-white rounded-full"
                >
                  Sign Up
                </Link>
                <Link 
                  to="/rider-registration" 
                  className="block py-2 px-4 text-center border border-secondary-500 text-secondary-500 rounded-full"
                >
                  Become a Rider
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;