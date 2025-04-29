import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { PgStorage } from "./pg-storage";
import { insertAppointmentSchema, insertCartItemSchema } from "@shared/schema";
import { z } from "zod";

// Initialize PostgreSQL storage
const storage = new PgStorage();
import { setupAuth } from "./auth";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: Missing STRIPE_SECRET_KEY. Stripe payment processing will not work.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  // Categories endpoints
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.get("/api/categories/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const categories = await storage.getCategories(type);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  // Services endpoints
  app.get("/api/services", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const services = await storage.getServices(categoryId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Error fetching services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const service = await storage.getServiceById(Number(id));
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Error fetching service" });
    }
  });

  // Barbers endpoints
  app.get("/api/barbers", async (_req, res) => {
    try {
      const barbers = await storage.getBarbers();
      res.json(barbers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching barbers" });
    }
  });

  app.get("/api/barbers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const barber = await storage.getBarberById(Number(id));
      if (!barber) {
        return res.status(404).json({ message: "Barber not found" });
      }
      res.json(barber);
    } catch (error) {
      res.status(500).json({ message: "Error fetching barber" });
    }
  });

  // Products endpoints
  app.get("/api/products", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const products = await storage.getProducts(categoryId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProductById(Number(id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  // Appointments endpoints
  app.get("/api/appointments", async (_req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await storage.getAppointmentById(Number(id));
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointment" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      // Debug log
      console.log("Appointment request body:", JSON.stringify(req.body));
      
      // Pre-process the date field to ensure it's a Date object
      const rawData = req.body;
      
      // Explicitly handle date conversion
      if (rawData.date) {
        if (typeof rawData.date === 'string') {
          console.log("Converting string date to Date object:", rawData.date);
          rawData.date = new Date(rawData.date);
        } else if (rawData.date instanceof Date) {
          console.log("Date is already a Date object");
        } else {
          console.log("Date is of unexpected type:", typeof rawData.date);
        }
      } else {
        console.log("No date field found in request");
      }
      
      console.log("Parsed date:", rawData.date);
      
      const appointmentData = insertAppointmentSchema.parse(rawData);
      console.log("After Zod validation:", JSON.stringify(appointmentData));
      
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Appointment creation error:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", JSON.stringify(error.errors));
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating appointment", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Time slots endpoint
  app.get("/api/time-slots", async (req, res) => {
    try {
      const { date, barberId } = req.query;
      if (!date || !barberId) {
        return res.status(400).json({ message: "Date and barberId are required" });
      }
      
      const timeSlots = await storage.getAvailableTimeSlots(date as string, Number(barberId));
      res.json(timeSlots);
    } catch (error) {
      res.status(500).json({ message: "Error fetching time slots" });
    }
  });

  // Cart endpoints
  app.get("/api/cart/:cartId", async (req, res) => {
    try {
      const { cartId } = req.params;
      const cartItems = await storage.getCartItems(cartId);
      
      // Fetch product details for each cart item
      const cartItemsWithDetails = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json(cartItemsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addCartItem(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Error adding item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
      
      const updatedCartItem = await storage.updateCartItemQuantity(Number(id), quantity);
      if (!updatedCartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(updatedCartItem);
    } catch (error) {
      res.status(500).json({ message: "Error updating cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.removeCartItem(Number(id));
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error removing item from cart" });
    }
  });

  app.delete("/api/cart/clear/:cartId", async (req, res) => {
    try {
      const { cartId } = req.params;
      await storage.clearCart(cartId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error clearing cart" });
    }
  });

  // Stripe payment intent for appointments
  app.post("/api/create-appointment-payment", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const { appointmentId, amount } = req.body;
      
      if (!appointmentId || !amount) {
        return res.status(400).json({ message: "appointmentId and amount are required" });
      }
      
      const appointment = await storage.getAppointmentById(Number(appointmentId));
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          appointmentId: String(appointmentId)
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Webhook for handling Stripe events
  app.post("/api/stripe-webhook", async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }
    
    const signature = req.headers["stripe-signature"] as string;
    let event;
    
    try {
      // This will throw an error if the signature is invalid
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const { appointmentId } = paymentIntent.metadata;
      
      if (appointmentId) {
        await storage.updateAppointmentStatus(
          Number(appointmentId),
          "confirmed",
          paymentIntent.id
        );
      }
    }
    
    res.status(200).json({ received: true });
  });

  // Stripe payment intent for product purchases
  app.post("/api/create-product-payment", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const { cartId, amount } = req.body;
      
      if (!cartId || !amount) {
        return res.status(400).json({ message: "cartId and amount are required" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          cartId
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });
  
  // Admin routes
  app.post("/api/services", async (req, res) => {
    try {
      const service = await storage.createService(req.body);
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ message: "Error creating service" });
    }
  });
  
  app.post("/api/barbers", async (req, res) => {
    try {
      const barber = await storage.createBarber(req.body);
      res.status(201).json(barber);
    } catch (error) {
      res.status(500).json({ message: "Error creating barber" });
    }
  });
  
  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Error creating product" });
    }
  });
  
  app.post("/api/categories", async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Error creating category" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
