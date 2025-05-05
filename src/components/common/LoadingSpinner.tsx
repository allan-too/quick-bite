import { Loader2 } from 'lucide-react';

type LoadingSpinnerProps = {
  fullScreen?: boolean;
  size?: number;
};

const LoadingSpinner = ({ fullScreen = false, size = 24 }: LoadingSpinnerProps) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <Loader2 size={36} className="animate-spin text-primary-600" />
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center p-4">
      <Loader2 size={size} className="animate-spin text-primary-600" />
    </div>
  );
};

export default LoadingSpinner;