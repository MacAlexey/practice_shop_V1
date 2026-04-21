import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen bg-grey-100">
          <Navbar />
          <AppRoutes />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
