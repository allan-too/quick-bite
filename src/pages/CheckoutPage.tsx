import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { MapPin, CreditCard, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { items, totalPrice, clearCart, restaurantId } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(profile?.address || '');
  
  // Dummy delivery fee and tax
  const deliveryFee = 2.99;
  const taxRate = 0.1; // 10% tax
  const tax = totalPrice * taxRate;
  const finalTotal = totalPrice + deliveryFee + tax;
  
  const handleSubmitOrder = async () => {
    if (!user || !restaurantId) return;
    
    try {
      setIsLoading(true);
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          restaurant_id: restaurantId,
          total_amount: finalTotal,
          delivery_address: deliveryAddress,
          status: 'pending'
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        special_instructions: item.special_instructions
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Clear cart and redirect to order tracking
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${order.id}`);
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="lg:flex lg:gap-6">
        {/* Order Details */}
        <div className="lg:w-2/3">
          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg">Delivery Address</h2>
            </div>
            <div className="p-4">
              <div className="flex items-start mb-4">
                <MapPin className="h-5 w-5 text-gray-400 mt-1 mr-2" />
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your delivery address..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              {!deliveryAddress && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Please enter a delivery address
                </p>
              )}
            </div>
          </div>
          
          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg">Payment Method</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="h-6 w-6 text-gray-400 mr-2" />
                  <span>Cash on Delivery</span>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-primary-600 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg">Order Summary</h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {items.map(item => (
                <li key={item.id} className="p-4 flex items-center">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    {item.special_instructions && (
                      <p className="text-sm text-gray-500 italic">
                        "{item.special_instructions}"
                      </p>
                    )}
                  </div>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3 mt-6 lg:mt-0">
          <div className="bg-white rounded-xl shadow-card overflow-hidden sticky top-20">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg">Payment Details</h2>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  Estimated delivery time: 30-45 minutes
                </div>
                
                <button
                  onClick={handleSubmitOrder}
                  disabled={isLoading || !deliveryAddress}
                  className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  By placing your order, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;