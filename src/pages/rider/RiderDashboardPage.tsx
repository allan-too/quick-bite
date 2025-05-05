import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
  Bike, 
  Clock, 
  MapPin, 
  Package, 
  ChevronRight, 
  CheckCircle, 
  XCircle,
  Bell
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Database } from '../../utils/database.types';

type Order = Database['public']['Tables']['orders']['Row'] & {
  restaurant: Pick<Database['public']['Tables']['restaurants']['Row'], 'name' | 'address'>,
  customer: Pick<Database['public']['Tables']['users']['Row'], 'full_name' | 'phone'>
};

const RiderDashboardPage = () => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });
  
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      
      // Check rider availability
      const { data: riderData } = await supabase
        .from('rider_details')
        .select('is_available')
        .eq('user_id', user.id)
        .single();
      
      if (riderData) {
        setIsAvailable(riderData.is_available);
      }
      
      // Fetch available orders (with status 'ready')
      const { data: availableOrdersData, error: availableOrdersError } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurant_id (name, address),
          customer:customer_id (full_name, phone)
        `)
        .eq('status', 'ready')
        .is('rider_id', null);
      
      if (availableOrdersError) {
        console.error('Error fetching available orders:', availableOrdersError);
      } else {
        setAvailableOrders(availableOrdersData as Order[]);
      }
      
      // Fetch rider's current orders
      const { data: myOrdersData, error: myOrdersError } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurant_id (name, address),
          customer:customer_id (full_name, phone)
        `)
        .eq('rider_id', user.id)
        .in('status', ['assigned', 'in_delivery'])
        .order('created_at', { ascending: false });
      
      if (myOrdersError) {
        console.error('Error fetching my orders:', myOrdersError);
      } else {
        setMyOrders(myOrdersData as Order[]);
      }
      
      // Calculate earnings (dummy data for now)
      setEarnings({
        today: Math.floor(Math.random() * 50) + 20,
        week: Math.floor(Math.random() * 200) + 100,
        month: Math.floor(Math.random() * 1000) + 500
      });
      
      setIsLoading(false);
    };
    
    fetchData();
    
    // Set up real-time subscription for new orders
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'orders',
        filter: 'status=eq.ready'
      }, () => {
        fetchData();
        // Play notification sound or show toast
        toast('New order available!', {
          icon: '🔔'
        });
      })
      .subscribe();
    
    return () => {
      ordersSubscription.unsubscribe();
    };
  }, [user]);
  
  const toggleAvailability = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('rider_details')
        .update({ is_available: !isAvailable })
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      setIsAvailable(!isAvailable);
      toast.success(isAvailable ? 'You are now offline' : 'You are now online');
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update status');
    }
  };
  
  const acceptOrder = async (orderId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          rider_id: user.id,
          status: 'assigned',
          estimated_delivery_time: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min from now
        })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      toast.success('Order accepted!');
      
      // Update local state
      const acceptedOrder = availableOrders.find(order => order.id === orderId);
      if (acceptedOrder) {
        acceptedOrder.status = 'assigned';
        acceptedOrder.rider_id = user.id;
        setMyOrders([...myOrders, acceptedOrder]);
        setAvailableOrders(availableOrders.filter(order => order.id !== orderId));
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
    }
  };
  
  const updateOrderStatus = async (orderId: string, status: 'in_delivery' | 'delivered') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      toast.success(status === 'in_delivery' ? 'Pickup confirmed!' : 'Delivery confirmed!');
      
      // Update local state
      if (status === 'in_delivery') {
        setMyOrders(myOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
      } else {
        setMyOrders(myOrders.filter(order => order.id !== orderId));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order');
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Rider Dashboard</h1>
        <p className="text-gray-600">Welcome back, {profile?.full_name}</p>
      </div>
      
      {/* Status Toggle and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-card p-6 col-span-1 flex flex-col items-center justify-center">
          <div className={`rounded-full p-4 mb-3 ${
            isAvailable ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Bike className={`h-8 w-8 ${
              isAvailable ? 'text-green-600' : 'text-gray-500'
            }`} />
          </div>
          
          <p className="text-center mb-3">You are currently</p>
          <div className="relative inline-block w-16 h-8 mb-3">
            <input 
              type="checkbox" 
              id="availabilityToggle" 
              className="opacity-0 w-0 h-0"
              checked={isAvailable}
              onChange={toggleAvailability}
            />
            <label 
              htmlFor="availabilityToggle"
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                isAvailable ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span 
                className={`absolute h-6 w-6 left-1 bottom-1 bg-white rounded-full transition-transform ${
                  isAvailable ? 'transform translate-x-8' : ''
                }`}
              ></span>
            </label>
          </div>
          <span className={`font-medium ${
            isAvailable ? 'text-green-600' : 'text-gray-500'
          }`}>
            {isAvailable ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="bg-white rounded-xl shadow-card p-6 col-span-1">
          <h3 className="text-gray-500 mb-2">Today's Earnings</h3>
          <p className="text-2xl font-bold">${earnings.today.toFixed(2)}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="flex items-center">
              <Package className="h-4 w-4 mr-1" />
              {myOrders.length} Active Orders
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-card p-6 col-span-1">
          <h3 className="text-gray-500 mb-2">This Week</h3>
          <p className="text-2xl font-bold">${earnings.week.toFixed(2)}</p>
          <div className="mt-2 text-sm text-green-500 font-medium">+12% from last week</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-card p-6 col-span-1">
          <h3 className="text-gray-500 mb-2">This Month</h3>
          <p className="text-2xl font-bold">${earnings.month.toFixed(2)}</p>
          <div className="mt-2 text-sm text-green-500 font-medium">+5% from last month</div>
        </div>
      </div>
      
      {/* My Active Orders */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">My Active Orders</h2>
        
        {myOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card p-6 text-center">
            <div className="flex justify-center mb-3">
              <Package className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium mb-2">No active orders</h3>
            <p className="text-gray-500 mb-4">
              You don't have any active orders right now. Accept new orders below!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="p-4 bg-secondary-50 border-b border-secondary-100 flex justify-between items-center">
                  <div>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium uppercase bg-secondary-100 text-secondary-800">
                      {order.status === 'assigned' ? 'Pickup' : 'Delivery'}
                    </span>
                    <h3 className="font-medium mt-1">Order #{order.id.slice(-6)}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="p-4">
                  {order.status === 'assigned' ? (
                    <div className="flex items-start mb-4">
                      <div className="bg-secondary-100 rounded-full p-2 mr-3">
                        <MapPin className="h-5 w-5 text-secondary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Pickup from</h4>
                        <p className="text-sm">{order.restaurant.name}</p>
                        <p className="text-sm text-gray-500">{order.restaurant.address}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start mb-4">
                      <div className="bg-primary-100 rounded-full p-2 mr-3">
                        <MapPin className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Deliver to</h4>
                        <p className="text-sm">{order.customer.full_name}</p>
                        <p className="text-sm text-gray-500">{order.delivery_address}</p>
                        {order.customer.phone && (
                          <p className="text-sm text-blue-600">{order.customer.phone}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Estimated delivery by {new Date(order.estimated_delivery_time || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  <button
                    onClick={() => updateOrderStatus(
                      order.id, 
                      order.status === 'assigned' ? 'in_delivery' : 'delivered'
                    )}
                    className={`w-full py-2 rounded-lg font-medium flex items-center justify-center ${
                      order.status === 'assigned' 
                        ? 'bg-secondary-600 text-white' 
                        : 'bg-primary-600 text-white'
                    }`}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {order.status === 'assigned' ? 'Confirm Pickup' : 'Confirm Delivery'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Available Orders */}
      <div>
        <h2 className="text-xl font-bold mb-4">Available Orders</h2>
        
        {!isAvailable ? (
          <div className="bg-white rounded-xl shadow-card p-6 text-center">
            <p className="text-gray-500">
              You're currently offline. Go online to see available orders.
            </p>
            <button
              onClick={toggleAvailability}
              className="mt-4 px-4 py-2 bg-secondary-600 text-white rounded-lg font-medium"
            >
              Go Online
            </button>
          </div>
        ) : availableOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card p-6 text-center">
            <div className="flex justify-center mb-3">
              <Bell className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium mb-2">No available orders</h3>
            <p className="text-gray-500">
              There are no available orders right now. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-card hover:shadow-lg transition-shadow">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Order #{order.id.slice(-6)}</h3>
                    <span className="text-gray-500 text-sm">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start mb-4">
                    <div className="bg-gray-100 rounded-full p-2 mr-3">
                      <MapPin className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium">{order.restaurant.name}</p>
                      </div>
                      <p className="text-sm text-gray-500">{order.restaurant.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <div className="bg-primary-100 rounded-full p-2 mr-3">
                      <MapPin className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium">Delivery Address</p>
                      <p className="text-sm text-gray-500">{order.delivery_address}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Payout</p>
                      <p className="font-medium">${(order.total_amount * 0.1).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Distance</p>
                      <p className="font-medium">2.3 miles</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => acceptOrder(order.id)}
                      className="flex-grow py-2 bg-secondary-600 text-white rounded-lg font-medium hover:bg-secondary-700 transition-colors flex items-center justify-center"
                    >
                      Accept
                    </button>
                    <button
                      className="py-2 px-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderDashboardPage;