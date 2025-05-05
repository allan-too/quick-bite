import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Database } from '../utils/database.types';
import { useCart } from '../context/CartContext';
import { MapPin, Clock, Star, Search, Plus, Minus, Info, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];

type MenuCategory = {
  name: string;
  items: MenuItem[];
};

const RestaurantPage = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const { addItem, items } = useCart();
  
  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      // Fetch restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();
      
      if (restaurantError) {
        console.error('Error fetching restaurant:', restaurantError);
        setIsLoading(false);
        return;
      }
      
      setRestaurant(restaurantData);
      
      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', id)
        .eq('is_available', true);
      
      if (menuError) {
        console.error('Error fetching menu items:', menuError);
        setIsLoading(false);
        return;
      }
      
      setMenuItems(menuData || []);
      
      // Group menu items by category
      const categories: Record<string, MenuItem[]> = {};
      
      menuData?.forEach(item => {
        if (!categories[item.category]) {
          categories[item.category] = [];
        }
        categories[item.category].push(item);
      });
      
      const categoriesArray = Object.keys(categories).map(name => ({
        name,
        items: categories[name]
      }));
      
      setMenuCategories(categoriesArray);
      if (categoriesArray.length > 0) {
        setActiveCategory(categoriesArray[0].name);
      }
      
      setIsLoading(false);
    };
    
    fetchRestaurantData();
  }, [id]);
  
  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image_url: item.image_url,
      restaurant_id: item.restaurant_id
    });
    
    toast.success(`Added ${item.name} to cart!`);
  };
  
  const getItemQuantityInCart = (itemId: string): number => {
    const cartItem = items.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };
  
  const filteredMenuItems = searchQuery
    ? menuItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Restaurant not found</h2>
        <p className="mt-2 text-gray-600">The restaurant you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }
  
  return (
    <div className="pb-16 md:pb-8">
      {/* Restaurant Header */}
      <div className="relative h-56 md:h-72 w-full">
        <img 
          src={restaurant.cover_image} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent h-24"></div>
        
        <div className="absolute bottom-4 left-4 md:left-8 flex items-end">
          <div className="bg-white p-2 rounded-xl shadow-md mr-4 hidden md:block">
            <img 
              src={restaurant.logo_url} 
              alt={restaurant.name} 
              className="w-20 h-20 object-cover rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center text-white mb-1">
              <span className="mr-3">{restaurant.category}</span>
              <span className="flex items-center mr-3">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                {restaurant.rating.toFixed(1)}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {restaurant.estimated_delivery_time} min
              </span>
            </div>
            <p className="flex items-center text-white text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {restaurant.address}
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Search menu items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        {/* Restaurant Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">About {restaurant.name}</h2>
          <p className="text-gray-600">{restaurant.description}</p>
        </div>
        
        {searchQuery ? (
          // Search Results
          <div>
            <h2 className="text-xl font-bold mb-4">Search Results</h2>
            {filteredMenuItems.length === 0 ? (
              <p className="text-gray-500">No items found matching "{searchQuery}"</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenuItems.map(item => (
                  <div 
                    key={item.id}
                    className="bg-white p-4 rounded-lg shadow-card flex overflow-hidden"
                  >
                    <div className="flex-grow pr-4">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                        <button 
                          onClick={() => handleAddToCart(item)}
                          className="bg-primary-600 text-white p-1 rounded-full hover:bg-primary-700 transition-colors"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="w-24 h-24 flex-shrink-0">
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Menu Categories and Items
          <div className="flex flex-col md:flex-row gap-6">
            {/* Categories Sidebar */}
            <div className="md:w-1/4">
              <h2 className="text-xl font-bold mb-3">Menu</h2>
              <div className="bg-white rounded-lg shadow-card overflow-hidden sticky top-20">
                <ul className="divide-y divide-gray-100">
                  {menuCategories.map(category => (
                    <li key={category.name}>
                      <button 
                        onClick={() => setActiveCategory(category.name)}
                        className={`w-full text-left py-3 px-4 hover:bg-gray-50 transition-colors ${
                          activeCategory === category.name ? 'font-medium text-primary-600 bg-primary-50' : 'text-gray-700'
                        }`}
                      >
                        {category.name} ({category.items.length})
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="md:w-3/4">
              {menuCategories.map(category => (
                <div 
                  key={category.name}
                  id={category.name}
                  className={`mb-8 ${activeCategory === category.name ? 'block' : 'hidden md:block'}`}
                >
                  <h2 className="text-xl font-bold mb-4">{category.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.items.map(item => (
                      <div 
                        key={item.id}
                        className="bg-white rounded-lg shadow-card overflow-hidden"
                      >
                        <div className="h-48 w-full relative">
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {getItemQuantityInCart(item.id) > 0 && (
                            <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                              In Cart: {getItemQuantityInCart(item.id)}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className={`text-sm text-gray-600 mt-1 ${
                            expandedItem === item.id ? '' : 'line-clamp-2'
                          }`}>
                            {item.description}
                          </p>
                          
                          {item.description.length > 100 && (
                            <button 
                              className="text-xs text-primary-600 mt-1 flex items-center"
                              onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                            >
                              {expandedItem === item.id ? (
                                <>Show less <ChevronUp className="h-3 w-3 ml-1" /></>
                              ) : (
                                <>Read more <ChevronDown className="h-3 w-3 ml-1" /></>
                              )}
                            </button>
                          )}
                          
                          <div className="flex justify-between items-center mt-4">
                            <span className="font-medium text-lg">${item.price.toFixed(2)}</span>
                            <button 
                              onClick={() => handleAddToCart(item)}
                              className="bg-primary-600 text-white py-1 px-3 rounded-full flex items-center hover:bg-primary-700 transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantPage;