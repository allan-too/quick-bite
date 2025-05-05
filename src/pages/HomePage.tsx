import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Database } from '../utils/database.types';
import { Search, MapPin, Clock, Star } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type Category = {
  name: string;
  image: string;
};

const categories: Category[] = [
  { name: 'Pizza', image: 'https://images.pexels.com/photos/2714722/pexels-photo-2714722.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { name: 'Burgers', image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { name: 'Sushi', image: 'https://images.pexels.com/photos/1148086/pexels-photo-1148086.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { name: 'Italian', image: 'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { name: 'Chinese', image: 'https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { name: 'Mexican', image: 'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { name: 'Indian', image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { name: 'Desserts', image: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=600' }
];

const HomePage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [popularRestaurants, setPopularRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      
      let query = supabase
        .from('restaurants')
        .select('*')
        .eq('is_open', true);
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching restaurants:', error);
      } else {
        setRestaurants(data || []);
      }
      
      // Fetch popular restaurants (highest rated)
      const { data: popularData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_open', true)
        .order('rating', { ascending: false })
        .limit(4);
      
      if (popularData) {
        setPopularRestaurants(popularData);
      }
      
      setIsLoading(false);
    };
    
    fetchRestaurants();
  }, [selectedCategory]);
  
  return (
    <div className="container mx-auto px-4 pb-16 md:pb-8">
      <div className="pt-4 md:pt-8">
        {/* Hero Section */}
        <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden mb-10">
          <img 
            src="https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
            alt="Food delivery" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex flex-col justify-center px-6 md:px-12">
            <h1 className="text-white text-3xl md:text-4xl font-bold mb-4">
              Delicious food,<br />delivered to your door
            </h1>
            <p className="text-white text-lg md:text-xl mb-6 max-w-md">
              Order from your favorite restaurants with just a few taps
            </p>
            
            <div className="relative max-w-md">
              <input 
                type="text" 
                placeholder="Enter your delivery address" 
                className="w-full py-3 pl-10 pr-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <button className="absolute right-2 top-2 bg-primary-600 text-white px-4 py-1.5 rounded-full hover:bg-primary-700 transition-colors">
                Find Food
              </button>
            </div>
          </div>
        </div>
        
        {/* Categories */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Categories</h2>
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`text-sm ${!selectedCategory ? 'text-primary-600 font-medium' : 'text-gray-500'}`}
            >
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <div 
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedCategory === category.name ? 'ring-2 ring-primary-600' : ''
                }`}
              >
                <div className="relative rounded-lg overflow-hidden h-24 md:h-28 group">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-medium text-lg">{category.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Popular Restaurants */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Popular Restaurants</h2>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularRestaurants.map((restaurant) => (
                <Link 
                  key={restaurant.id}
                  to={`/restaurants/${restaurant.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-40">
                    <img 
                      src={restaurant.cover_image} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {restaurant.estimated_delivery_time} min
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                      <div className="flex items-center bg-green-50 px-2 py-0.5 rounded text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-500 text-sm mt-1">{restaurant.category}</p>
                    <p className="text-gray-500 text-sm flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {restaurant.address.split(',')[0]}
                    </p>
                    
                    <div className="flex justify-between items-center mt-3 text-sm">
                      <span className="text-primary-600 font-medium">
                        ${restaurant.delivery_fee.toFixed(2)} delivery
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        
        {/* All Restaurants or Filtered by Category */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {selectedCategory ? `${selectedCategory} Restaurants` : 'All Restaurants'}
            </h2>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-primary-600"
              >
                Clear Filter
              </button>
            )}
          </div>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : restaurants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500">
                {selectedCategory 
                  ? `No restaurants found in the ${selectedCategory} category.` 
                  : 'No restaurants found.'}
              </p>
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="mt-4 text-primary-600 font-medium"
                >
                  View all restaurants
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <Link 
                  key={restaurant.id}
                  to={`/restaurants/${restaurant.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <img 
                      src={restaurant.cover_image} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {restaurant.estimated_delivery_time} min
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">{restaurant.category}</p>
                      </div>
                      <div className="flex items-center bg-green-50 px-2 py-0.5 rounded text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{restaurant.description}</p>
                    
                    <p className="text-gray-500 text-sm flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {restaurant.address.split(',')[0]}
                    </p>
                    
                    <div className="flex justify-between items-center mt-3 text-sm">
                      <span className="text-primary-600 font-medium">
                        ${restaurant.delivery_fee.toFixed(2)} delivery
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        
        {/* App Download Section */}
        <section className="mt-16 bg-primary-50 rounded-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">Get the QuickBite App</h2>
              <p className="text-gray-700 mb-6">
                Order food even faster. Track your delivery in real-time, save your favorite restaurants, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-black text-white py-3 px-6 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5,12.5H6.5V11.5H17.5M17.5,15.5H6.5V14.5H17.5M14.5,18.5H6.5V17.5H14.5M21.41,11.58L20.41,10.58C20.04,10.22 19.45,10.22 19.08,10.58C18.72,10.95 18.72,11.54 19.08,11.91L20.07,12.9L19.08,13.89C18.72,14.26 18.72,14.85 19.08,15.22C19.45,15.58 20.04,15.58 20.41,15.22L21.41,14.22C21.77,13.86 21.77,13.27 21.41,12.9C21.77,12.54 21.77,11.95 21.41,11.58Z" />
                  </svg>
                  App Store
                </button>
                <button className="bg-black text-white py-3 px-6 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  Google Play
                </button>
              </div>
            </div>
            <div className="md:w-1/2 relative hidden md:block">
              <img 
                src="https://images.pexels.com/photos/6169049/pexels-photo-6169049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="App screenshot" 
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;