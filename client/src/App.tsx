import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { CartProvider } from "./context/cart-context";
import { BookingProvider } from "./context/booking-context";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import Home from "./pages/home";
import Booking from "./pages/booking";
import Shop from "./pages/shop";
import Checkout from "./pages/checkout";
import PaymentSuccess from "./pages/payment-success";
import PaymentFailed from "./pages/payment-failed";
import AdminDashboard from "./pages/admin/dashboard";

function Router() {
  return (
    <>
      <Header />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/booking" component={Booking} />
          <Route path="/shop" component={Shop} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/payment-failed" component={PaymentFailed} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BookingProvider>
          <CartProvider>
            <Toaster />
            <Router />
          </CartProvider>
        </BookingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
