import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import ProtectedAdminRoute from './ProtectedAdminRoute.jsx';
import Spinner from '../components/common/Spinner.jsx';
import Login from '../pages/Login/Login.jsx';

// Route-level code splitting: Dashboard alone pulls in recharts, by far
// the heaviest dependency in this app — lazy-loading every page means
// that cost (and each other page's) is only paid when actually visited,
// not on initial login.
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard.jsx'));
const ProductList = lazy(() => import('../pages/Products/ProductList.jsx'));
const CategoryList = lazy(() => import('../pages/Categories/CategoryList.jsx'));
const OrderList = lazy(() => import('../pages/Orders/OrderList.jsx'));
const OrderDetail = lazy(() => import('../pages/Orders/OrderDetail.jsx'));
const CustomerList = lazy(() => import('../pages/Customers/CustomerList.jsx'));
const CustomerDetail = lazy(() => import('../pages/Customers/CustomerDetail.jsx'));
const DeliveryZoneList = lazy(() => import('../pages/DeliveryZones/DeliveryZoneList.jsx'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound.jsx'));

export default function AdminRoutes() {
  return (
    <Suspense fallback={<Spinner label="Loading" />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:orderNumber" element={<OrderDetail />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="delivery-zones" element={<DeliveryZoneList />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
