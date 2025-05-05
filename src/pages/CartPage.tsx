import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { 
    items, 
    totalPrice, 
    isCartEmpty, 
    updateQuantity, 
    removeItem, 
    updateInstructions,
    clearCart,
    restaurantId
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [specialInstructions, setSpecialInstructions] = useState<Record<string, string>>({});
  const [isEditingInstructions, setIsEditingInstructions] = useState<Record<string, boolean>>({});
  
  // Dummy delivery fee and tax
  const deliveryFee = 2.99;
  const taxRate = 0.1; // 10% tax
  const tax = totalPrice * taxRate;
  const finalTotal = totalPrice + deliveryFee + tax;
  
  const handleUpdateInstructions = (itemId: string, instructions: string) => {
    updateInstructions(itemId, instructions);
    setIsEditingInstructions(prev => ({ ...prev, [itemId]: false }));
    toast.success('Special instructions updated');
  };
  
  const handleCheckout = () => {
    if (!user) {
      toast.error('Please log in to proceed to checkout');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    
    navigate('/checkout');
  };
  
  if (isCartEmpty) {
    return (
      <div className="container mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Looks like you haven't added anything to your cart yet
        </p>
        <Link 
          to="/"
          className="bg-primary-600 text-white px-6 py-3 rounded-full hover:bg-primary-700 transition-colors flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Browse Restaurants
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      
      <div className="lg:flex lg:gap-6">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg">Items in Your Cart</h2>
            </div>
            
            <ul className="divide-y divide-gray-100">
              {items.map(item => (
                <li key={item.id} className="p-4">
                  <div className="flex items-start">
                    <img 
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md mr-4"
                    />
                    
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-1">${item.price.toFixed(2)} each</p>
                      
                      {/* Special instructions */}
                      {isEditingInstructions[item.id] ? (
                        <div className="mt-2">
                          <textarea
                            placeholder="Add special instructions..."
                            value={specialInstructions[item.id] || item.special_instructions || ''}
                            onChange={(e) => setSpecialInstructions({
                              ...specialInstructions,
                              [item.id]: e.target.value
                            })}
                            className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                            rows={2}
                          />
                          <div className="flex justify-end mt-1 space-x-2">
                            <button 
                              onClick={() => setIsEditingInstructions({
                                ...isEditingInstructions,
                                [item.id]: false
                              })}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleUpdateInstructions(
                                item.id, 
                                specialInstructions[item.id] || ''
                              )}
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          {item.special_instructions ? (
                            <p className="text-xs text-gray-600 italic">
                              "{item.special_instructions}"
                            </p>
                          ) : null}
                          <button 
                            onClick={() => setIsEditingInstructions({
                              ...isEditingInstructions,
                              [item.id]: true
                            })}
                            className="text-xs text-primary-600 mt-1 flex items-center"
                          >
                            {item.special_instructions ? 'Edit' : 'Add'} special instructions
                          </button>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="mx-2">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 focus:outline-none"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="p-4 border-t border-gray-100 flex justify-between">
              <button 
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-600 focus:outline-none flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Cart
              </button>
              <Link 
                to={`/restaurants/${restaurantId}`}
                className="text-sm text-primary-600 hover:text-primary-700 focus:outline-none"
              >
                Add more items
              </Link>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg">Order Summary</h2>
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
              
              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-4 text-xs text-gray-500 flex items-start">
                <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                <p>
                  By proceeding to checkout, you agree to our Terms of Service and our delivery partner's terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;