import { eq, and, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  User, 
  InsertUser, 
  services, 
  Service, 
  InsertService,
  categories, 
  Category, 
  InsertCategory,
  barbers, 
  Barber, 
  InsertBarber,
  products, 
  Product, 
  InsertProduct,
  appointments, 
  Appointment, 
  InsertAppointment,
  cartItems,
  CartItem,
  InsertCartItem
} from "@shared/schema";
import { IStorage } from "./storage";

export class PgStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    // Make the first registered user an admin
    const count = await db.select({ count: sql`count(*)` }).from(users);
    const isAdmin = parseInt(count[0].count as string) === 0;
    
    const result = await db.insert(users).values({
      ...user,
      isAdmin
    }).returning();
    
    return result[0];
  }
  
  // Category methods
  async getCategories(type?: string): Promise<Category[]> {
    if (type) {
      return await db.select().from(categories).where(eq(categories.type, type));
    }
    return await db.select().from(categories);
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }
  
  // Service methods
  async getServices(categoryId?: number): Promise<Service[]> {
    if (categoryId) {
      return await db.select().from(services).where(eq(services.categoryId, categoryId));
    }
    return await db.select().from(services);
  }
  
  async getServiceById(id: number): Promise<Service | undefined> {
    const result = await db.select().from(services).where(eq(services.id, id));
    return result[0];
  }
  
  async createService(service: InsertService): Promise<Service> {
    const result = await db.insert(services).values(service).returning();
    return result[0];
  }
  
  // Barber methods
  async getBarbers(): Promise<Barber[]> {
    return await db.select().from(barbers);
  }
  
  async getBarberById(id: number): Promise<Barber | undefined> {
    const result = await db.select().from(barbers).where(eq(barbers.id, id));
    return result[0];
  }
  
  async createBarber(barber: InsertBarber): Promise<Barber> {
    const result = await db.insert(barbers).values(barber).returning();
    return result[0];
  }
  
  // Product methods
  async getProducts(categoryId?: number): Promise<Product[]> {
    if (categoryId) {
      return await db.select().from(products).where(eq(products.categoryId, categoryId));
    }
    return await db.select().from(products);
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }
  
  // Appointment methods
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }
  
  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id));
    return result[0];
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(appointment).returning();
    return result[0];
  }
  
  async updateAppointmentStatus(id: number, status: string, stripePaymentId?: string): Promise<Appointment | undefined> {
    const updateData: any = { status };
    if (stripePaymentId) {
      updateData.stripePaymentId = stripePaymentId;
    }
    
    const result = await db.update(appointments)
      .set(updateData)
      .where(eq(appointments.id, id))
      .returning();
      
    return result[0];
  }
  
  async getAvailableTimeSlots(date: string, barberId: number): Promise<string[]> {
    // Convert date string to Date object
    const appointmentDate = new Date(date);
    
    // Set time to 00:00:00 for start of day
    appointmentDate.setHours(0, 0, 0, 0);
    
    // Set time to 23:59:59 for end of day
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get all appointments for this barber on this date
    const bookedAppointments = await db.select()
      .from(appointments)
      .where(
        and(
          eq(appointments.barberId, barberId),
          sql`${appointments.date}::date = ${appointmentDate}::date`
        )
      );
    
    // Get the barber's service time for calculating slots
    const barber = await this.getBarberById(barberId);
    if (!barber) return [];
    
    // All possible time slots (you may want to customize this based on business hours)
    const allTimeSlots = [
      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
      "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
      "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
    ];
    
    // Filter out booked slots
    const bookedTimes = bookedAppointments.map(app => app.time);
    return allTimeSlots.filter(slot => !bookedTimes.includes(slot));
  }
  
  // Cart methods
  async getCartItems(cartId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  }
  
  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    const result = await db.insert(cartItems).values(cartItem).returning();
    return result[0];
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const result = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
      
    return result[0];
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return true;
  }
  
  async clearCart(cartId: string): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    return true;
  }
}
