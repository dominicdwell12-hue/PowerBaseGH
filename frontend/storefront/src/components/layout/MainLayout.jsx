import { Outlet } from 'react-router-dom';
import TopBar from './TopBar.jsx';
import Navbar from './Navbar.jsx';
import CategoryNav from './CategoryNav.jsx';
import Footer from './Footer.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-900">
      <TopBar />
      <Navbar />
      <CategoryNav />
      {/* pb-16 clears the fixed mobile bottom nav so page content/footer
          links are never hidden behind it; md:pb-0 since that nav is
          hidden at md and up. */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
