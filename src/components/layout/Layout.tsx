import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MobileNav from './MobileNav';

const Layout = () => {
  const location = useLocation();
  const { isRider } = useAuth();

  // Don't show MobileNav on rider dashboard or login/register pages
  const showMobileNav = !isRider && 
    !location.pathname.includes('/rider-dashboard') &&
    !location.pathname.includes('/login') &&
    !location.pathname.includes('/register');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
      {showMobileNav && <MobileNav />}
    </div>
  );
};

export default Layout;