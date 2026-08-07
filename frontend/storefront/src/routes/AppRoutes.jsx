import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

import Home from '../pages/Home/Home.jsx';
import ProductListing from '../pages/ProductListing/ProductListing.jsx';
import ProductDetails from '../pages/ProductDetails/ProductDetails.jsx';
import Cart from '../pages/Cart/Cart.jsx';
import Checkout from '../pages/Checkout/Checkout.jsx';
import PaymentCallback from '../pages/PaymentCallback/PaymentCallback.jsx';
import OrderConfirmation from '../pages/OrderConfirmation/OrderConfirmation.jsx';
import OrderHistory from '../pages/OrderHistory/OrderHistory.jsx';
import OrderTracking from '../pages/OrderTracking/OrderTracking.jsx';
import Wishlist from '../pages/Wishlist/Wishlist.jsx';
import Profile from '../pages/Profile/Profile.jsx';
import Login from '../pages/Auth/Login.jsx';
import Register from '../pages/Auth/Register.jsx';
import Support from '../pages/Support/Support.jsx';
import NotFound from '../pages/NotFound/NotFound.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<ProductListing />} />
        <Route path="products/:slug" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="support" element={<Support />} />

        {/* Everything below needs a signed-in customer */}
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="payment/callback" element={<PaymentCallback />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="orders/:orderNumber" element={<OrderTracking />} />
          <Route path="orders/:orderNumber/confirmation" element={<OrderConfirmation />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
