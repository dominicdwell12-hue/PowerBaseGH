import { Outlet } from 'react-router-dom';
import TopBar from './TopBar.jsx';
import Navbar from './Navbar.jsx';
import CategoryNav from './CategoryNav.jsx';
import Footer from './Footer.jsx';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Navbar />
      <CategoryNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
