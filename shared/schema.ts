import { pgTable, text, serial, integer, boolean, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define enums
export const timeOfDayEnum = pgEnum('time_of_day', ['morning', 'afternoon', 'evening']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['pending', 'confirmed', 'cancelled', 'completed']);

// Categories table for organizing services and products
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'service' or 'product'
});

// Services table for haircuts, beard trims, etc.
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: numeric('price').notNull(),
  duration: integer('duration').notNull(), // in minutes
  categoryId: integer('category_id').references(() => categories.id),
});

// Barbers table
export const barbers = pgTable('barbers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  imageUrl: text('image_url'),
  rating: numeric('rating'),
});

// Appointments table
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  barberId: integer('barber_id').references(() => barbers.id).notNull(),
  date: timestamp('date').notNull(),
  time: text('time').notNull(),
  timeOfDay: timeOfDayEnum('time_of_day'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  notes: text('notes'),
  status: appointmentStatusEnum('status').default('pending'),
  totalPrice: numeric('total_price').notNull(),
  stripePaymentId: text('stripe_payment_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table for the online shop
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: numeric('price').notNull(),
  imageUrl: text('image_url'),
  categoryId: integer('category_id').references(() => categories.id),
  inStock: boolean('in_stock').default(true),
  isBestSeller: boolean('is_best_seller').default(false),
  rating: numeric('rating').default('4.0'),
});

// Cart items table
export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  cartId: text('cart_id').notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull().default(1),
});

// Users table (for admins)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

// Schemas for data validation and insertion
export const insertCategorySchema = createInsertSchema(categories);
export const insertServiceSchema = createInsertSchema(services);
export const insertBarberSchema = createInsertSchema(barbers);
// Base schema from drizzle
const baseAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true, status: true, stripePaymentId: true });

// Custom appointment schema with date handling
export const insertAppointmentSchema = baseAppointmentSchema.extend({
  date: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});
export const insertProductSchema = createInsertSchema(products);
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).pick({ username: true, password: true });

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Barber = typeof barbers.$inferSelect;
export type InsertBarber = z.infer<typeof insertBarberSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
