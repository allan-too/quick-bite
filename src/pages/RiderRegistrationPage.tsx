import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Bike, Camera, Upload } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import toast from 'react-hot-toast';

type FormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  vehicleType: 'bicycle' | 'motorcycle' | 'car';
  licenseNumber: string;
  agreeTerms: boolean;
};

const RiderRegistrationPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<FormValues>();
  
  const password = watch('password', '');
  
  const handleLicenseImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLicenseImage(event.target.files[0]);
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      
      // First create the user account
      const { error, user } = await signUp(
        data.email, 
        data.password, 
        {
          full_name: data.fullName,
          phone: data.phone,
          role: 'rider' // Set role as rider
        }
      );
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      if (!user) {
        toast.error('Failed to create account');
        return;
      }
      
      // Then create rider details
      const { error: riderError } = await supabase
        .from('rider_details')
        .insert({
          user_id: user.id,
          vehicle_type: data.vehicleType,
          license_number: data.licenseNumber,
          is_available: true
        });
      
      if (riderError) {
        toast.error(riderError.message);
        return;
      }
      
      // Upload license image if provided
      if (licenseImage) {
        const fileExt = licenseImage.name.split('.').pop();
        const fileName = `${user.id}-license.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('rider-documents')
          .upload(fileName, licenseImage);
        
        if (uploadError) {
          console.error('Error uploading license image:', uploadError);
          // Continue even if image upload fails
        }
      }
      
      toast.success('Rider account created successfully!');
      navigate('/login');
      
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.pexels.com/photos/7363171/pexels-photo-7363171.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
          alt="Food delivery rider" 
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="absolute inset-0 bg-secondary-600 bg-opacity-30 flex items-center justify-center">
          <div className="text-white text-center p-8">
            <h1 className="text-4xl font-bold mb-4">Become a Rider</h1>
            <p className="text-xl">Join our delivery team and earn money on your own schedule</p>
          </div>
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rider Registration</h1>
            <p className="text-gray-600">Sign up to start delivering with QuickBite</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  {...register('fullName', { 
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Full name must be at least 2 characters'
                    }
                  })}
                  className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 ${
                    errors.fullName ? 'border-red-500' : ''
                  }`}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9+\-\s()]*$/,
                      message: 'Invalid phone number'
                    }
                  })}
                  className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 ${
                    errors.phone ? 'border-red-500' : ''
                  }`}
                  placeholder="+1 234-567-8901"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 ${
                  errors.email ? 'border-red-500' : ''
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                id="vehicleType"
                {...register('vehicleType', { required: 'Please select a vehicle type' })}
                className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 ${
                  errors.vehicleType ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select vehicle type</option>
                <option value="bicycle">Bicycle</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="car">Car</option>
              </select>
              {errors.vehicleType && (
                <p className="mt-1 text-sm text-red-600">{errors.vehicleType.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Driver's License / ID Number
              </label>
              <input
                id="licenseNumber"
                type="text"
                {...register('licenseNumber', { 
                  required: 'License number is required'
                })}
                className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 ${
                  errors.licenseNumber ? 'border-red-500' : ''
                }`}
                placeholder="DL1234567890"
              />
              {errors.licenseNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="licenseImage" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Driver's License / ID (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {licenseImage ? (
                    <div>
                      <p className="text-sm text-gray-600">{licenseImage.name}</p>
                      <button
                        type="button"
                        onClick={() => setLicenseImage(null)}
                        className="mt-2 text-sm text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="licenseImage"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-secondary-600 hover:text-secondary-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="licenseImage"
                            name="licenseImage"
                            type="file"
                            className="sr-only"
                            onChange={handleLicenseImageChange}
                            accept="image/*"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  {...register('agreeTerms', { 
                    required: 'You must agree to the terms and conditions'
                  })}
                  className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeTerms" className="font-medium text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-secondary-600 hover:text-secondary-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-secondary-600 hover:text-secondary-500">
                    Privacy Policy
                  </a>
                </label>
                {errors.agreeTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreeTerms.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-70"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Bike className="h-5 w-5 mr-2" />
                )}
                {isLoading ? 'Creating account...' : 'Register as Rider'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-secondary-600 hover:text-secondary-500">
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Want to order food instead?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Register as a customer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderRegistrationPage;