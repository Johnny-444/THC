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

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategories(type?: string): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Service methods
  getServices(categoryId?: number): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  
  // Barber methods
  getBarbers(): Promise<Barber[]>;
  getBarberById(id: number): Promise<Barber | undefined>;
  createBarber(barber: InsertBarber): Promise<Barber>;
  
  // Product methods
  getProducts(categoryId?: number): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Appointment methods
  getAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string, stripePaymentId?: string): Promise<Appointment | undefined>;
  getAvailableTimeSlots(date: string, barberId: number): Promise<string[]>;
  
  // Cart methods
  getCartItems(cartId: string): Promise<CartItem[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(cartId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private services: Map<number, Service>;
  private barbers: Map<number, Barber>;
  private products: Map<number, Product>;
  private appointments: Map<number, Appointment>;
  private cartItems: Map<number, CartItem>;
  
  userId: number;
  categoryId: number;
  serviceId: number;
  barberId: number;
  productId: number;
  appointmentId: number;
  cartItemId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.services = new Map();
    this.barbers = new Map();
    this.products = new Map();
    this.appointments = new Map();
    this.cartItems = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.serviceId = 1;
    this.barberId = 1;
    this.productId = 1;
    this.appointmentId = 1;
    this.cartItemId = 1;
    
    // Initialize with some data
    this.initializeData();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getCategories(type?: string): Promise<Category[]> {
    const categories = Array.from(this.categories.values());
    if (type) {
      return categories.filter(category => category.type === type);
    }
    return categories;
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Service methods
  async getServices(categoryId?: number): Promise<Service[]> {
    const services = Array.from(this.services.values());
    if (categoryId) {
      return services.filter(service => service.categoryId === categoryId);
    }
    return services;
  }
  
  async getServiceById(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async createService(service: InsertService): Promise<Service> {
    const id = this.serviceId++;
    const newService: Service = { ...service, id };
    this.services.set(id, newService);
    return newService;
  }
  
  // Barber methods
  async getBarbers(): Promise<Barber[]> {
    return Array.from(this.barbers.values());
  }
  
  async getBarberById(id: number): Promise<Barber | undefined> {
    return this.barbers.get(id);
  }
  
  async createBarber(barber: InsertBarber): Promise<Barber> {
    const id = this.barberId++;
    const newBarber: Barber = { ...barber, id };
    this.barbers.set(id, newBarber);
    return newBarber;
  }
  
  // Product methods
  async getProducts(categoryId?: number): Promise<Product[]> {
    const products = Array.from(this.products.values());
    if (categoryId) {
      return products.filter(product => product.categoryId === categoryId);
    }
    return products;
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  // Appointment methods
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }
  
  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentId++;
    const newAppointment: Appointment = { 
      ...appointment, 
      id, 
      status: 'pending', 
      createdAt: new Date(),
      stripePaymentId: null
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }
  
  async updateAppointmentStatus(id: number, status: string, stripePaymentId?: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (appointment) {
      const updatedAppointment = { 
        ...appointment, 
        status: status as any,
        ...(stripePaymentId ? { stripePaymentId } : {})
      };
      this.appointments.set(id, updatedAppointment);
      return updatedAppointment;
    }
    return undefined;
  }
  
  async getAvailableTimeSlots(date: string, barberId: number): Promise<string[]> {
    // Simulate available time slots (in real app, would check existing appointments)
    const allTimeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '11:30 AM', // Morning
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',   // Afternoon
      '5:00 PM', '6:00 PM', '7:00 PM'               // Evening
    ];
    
    // Filter out slots that are already booked for this barber on this date
    const bookedAppointments = Array.from(this.appointments.values()).filter(
      appointment => {
        const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
        return appointmentDate === date && appointment.barberId === barberId && appointment.status !== 'cancelled';
      }
    );
    
    const bookedTimes = bookedAppointments.map(appointment => appointment.time);
    return allTimeSlots.filter(time => !bookedTimes.includes(time));
  }
  
  // Cart methods
  async getCartItems(cartId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      item => item.cartId === cartId
    );
  }
  
  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if product already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.cartId === cartItem.cartId && item.productId === cartItem.productId
    );
    
    if (existingItem) {
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + cartItem.quantity);
    }
    
    const id = this.cartItemId++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (cartItem) {
      const updatedCartItem = { ...cartItem, quantity };
      this.cartItems.set(id, updatedCartItem);
      return updatedCartItem;
    }
    return undefined;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(cartId: string): Promise<boolean> {
    const cartItemsToDelete = Array.from(this.cartItems.values())
      .filter(item => item.cartId === cartId)
      .map(item => item.id);
    
    cartItemsToDelete.forEach(id => this.cartItems.delete(id));
    return true;
  }
  
  // Initialize with sample data
  private initializeData() {
    // Create categories
    const haircutCategory: Category = { id: this.categoryId++, name: 'Haircuts', type: 'service' };
    const beardCategory: Category = { id: this.categoryId++, name: 'Beard', type: 'service' };
    const packageCategory: Category = { id: this.categoryId++, name: 'Packages', type: 'service' };
    
    const stylingProductCategory: Category = { id: this.categoryId++, name: 'Styling Products', type: 'product' };
    const beardCareCategory: Category = { id: this.categoryId++, name: 'Beard Care', type: 'product' };
    const shavingCategory: Category = { id: this.categoryId++, name: 'Shaving', type: 'product' };
    
    this.categories.set(haircutCategory.id, haircutCategory);
    this.categories.set(beardCategory.id, beardCategory);
    this.categories.set(packageCategory.id, packageCategory);
    this.categories.set(stylingProductCategory.id, stylingProductCategory);
    this.categories.set(beardCareCategory.id, beardCareCategory);
    this.categories.set(shavingCategory.id, shavingCategory);
    
    // Create services
    const classicHaircut: Service = { 
      id: this.serviceId++, 
      name: 'Classic Haircut', 
      description: 'A traditional haircut including a consultation, shampoo, and styling.',
      price: 35,
      duration: 45,
      categoryId: haircutCategory.id
    };
    
    const beardTrim: Service = { 
      id: this.serviceId++, 
      name: 'Beard Trim', 
      description: 'Precision beard shaping and trimming to keep your facial hair looking sharp.',
      price: 25,
      duration: 30,
      categoryId: beardCategory.id
    };
    
    const fullService: Service = { 
      id: this.serviceId++, 
      name: 'Full Service', 
      description: 'Complete package including haircut, beard trim, and hot towel service.',
      price: 55,
      duration: 75,
      categoryId: packageCategory.id
    };
    
    this.services.set(classicHaircut.id, classicHaircut);
    this.services.set(beardTrim.id, beardTrim);
    this.services.set(fullService.id, fullService);
    
    // Create barbers
    const mikeJohnson: Barber = {
      id: this.barberId++,
      name: 'Mike Johnson',
      title: 'Master Barber',
      imageUrl: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      rating: 5.0
    };
    
    const alexRodriguez: Barber = {
      id: this.barberId++,
      name: 'Alex Rodriguez',
      title: 'Senior Barber',
      imageUrl: 'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      rating: 4.5
    };
    
    this.barbers.set(mikeJohnson.id, mikeJohnson);
    this.barbers.set(alexRodriguez.id, alexRodriguez);
    
    // Create products
    const stylingPomade: Product = {
      id: this.productId++,
      name: 'Premium Styling Pomade',
      description: 'Strong hold with medium shine for classic styles',
      price: 24.99,
      imageUrl: 'https://images.unsplash.com/photo-1621607512214-68297480165e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      categoryId: stylingProductCategory.id,
      inStock: true,
      isBestSeller: true,
      rating: 5.0
    };
    
    const beardOil: Product = {
      id: this.productId++,
      name: 'Premium Beard Oil',
      description: 'Nourishing formula for a healthy, soft beard',
      price: 19.99,
      imageUrl: 'https://images.unsplash.com/photo-1594635356394-71bd063b1325?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      categoryId: beardCareCategory.id,
      inStock: true,
      isBestSeller: false,
      rating: 4.0
    };
    
    const shavingKit: Product = {
      id: this.productId++,
      name: 'Luxury Shaving Kit',
      description: 'Complete set for the perfect traditional shave',
      price: 79.99,
      imageUrl: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      categoryId: shavingCategory.id,
      inStock: true,
      isBestSeller: false,
      rating: 5.0
    };
    
    const seaSaltSpray: Product = {
      id: this.productId++,
      name: 'Sea Salt Spray',
      description: 'Create natural, beachy texture with medium hold',
      price: 18.99,
      imageUrl: 'https://images.unsplash.com/photo-1567922045116-2a00fae2ed03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      categoryId: stylingProductCategory.id,
      inStock: true,
      isBestSeller: false,
      rating: 4.0
    };
    
    this.products.set(stylingPomade.id, stylingPomade);
    this.products.set(beardOil.id, beardOil);
    this.products.set(shavingKit.id, shavingKit);
    this.products.set(seaSaltSpray.id, seaSaltSpray);
    
    // Create admin user
    const adminUser: User = {
      id: this.userId++,
      username: 'admin',
      password: 'admin123', // In a real app, this would be hashed
      isAdmin: true
    };
    
    this.users.set(adminUser.id, adminUser);
  }
}

export const storage = new MemStorage();
