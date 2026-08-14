import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Categories from "./pages/Categories";
import Offers from "./pages/Offers";
import Wishlist from "./pages/Wishlist";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import TrackOrder from "./pages/TrackOrder";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";

import AdminLogin from "./admin/pages/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminProductForm from "./admin/pages/AdminProductForm";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminCategories from "./admin/pages/AdminCategories";
import AdminCustomers from "./admin/pages/AdminCustomers";
import AdminPayments from "./admin/pages/AdminPayments";
import AdminCoupons from "./admin/pages/AdminCoupons";
import AdminReviews from "./admin/pages/AdminReviews";
import AdminBanners from "./admin/pages/AdminBanners";
import AdminShipping from "./admin/pages/AdminShipping";
import AdminSuppliers from "./admin/pages/AdminSuppliers";
import AdminReports from "./admin/pages/AdminReports";
import AdminStaff from "./admin/pages/AdminStaff";
import AdminNotifications from "./admin/pages/AdminNotifications";
import AdminSettings from "./admin/pages/AdminSettings";
import AdminLogs from "./admin/pages/AdminLogs";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/:id" element={<AdminProductForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="shipping" element={<AdminShipping />} />
              <Route path="suppliers" element={<AdminSuppliers />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="staff" element={<AdminRoute allow={["superadmin"]}><AdminStaff /></AdminRoute>} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings" element={<AdminRoute allow={["superadmin"]}><AdminSettings /></AdminRoute>} />
              <Route path="logs" element={<AdminLogs />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
