import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Check for Stripe keys
if (process.env.NODE_ENV === 'production' && !import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Stripe public key (VITE_STRIPE_PUBLIC_KEY) is missing. Payment features will not work correctly.');
}

createRoot(document.getElementById("root")!).render(<App />);
