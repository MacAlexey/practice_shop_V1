import { Routes, Route } from "react-router-dom";
import ShopPage from "../pages/ShopPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrdersPage from "../pages/OrdersPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "../components/ProtectedRoute";
import VerifyOtpPage from "../pages/VerifyOtpPage";
import ForgotPage from "../pages/ForgotPage";
import VerifyOtpForgotPage from "../pages/VerifyOtpForgotPage";
import ChangePasswordPage from "../pages/ChangePasswordPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Shop */}
      <Route path="/" element={<ShopPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders" element={<OrdersPage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot" element={<ForgotPage />} />
      <Route path="/verify-otp-forgot" element={<VerifyOtpForgotPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
