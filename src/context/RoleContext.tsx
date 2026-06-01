"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabasePlaceholder } from "@/utils/supabaseClient";

export type UserRole = "guest" | "customer" | "admin";

export type InventoryCategory =
  | "Piglets"
  | "Fattening Pigs"
  | "Fresh Pork Meat"
  | "Lechon Packages"
  | "Catering Packages"
  | "Sweet Corners"
  | "Food Packages";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  price: number;
  minStockLevel: number;
  status: "Available" | "Low Stock" | "Out of Stock";
  tagNumber?: string;
  breed?: string;
  ageWeeks?: number;
  weightKg?: number;
  penNumber?: string;
  healthStatus?: "Healthy" | "Under Treatment" | "Sick" | "N/A";
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryLog {
  id: string;
  inventoryId: string;
  itemName: string;
  itemCategory: InventoryCategory;
  action: "Stock In" | "Stock Out" | "Sale" | "Manual Adjustment" | "Status Update";
  quantityChanged: number;
  notes: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  category: "Piglets" | "Fattening Pigs" | "Crispylicious Lechon" | "Catering Services";
  quantity: number;
  reservationDate: string;
  pickupDate: string;
  status: "Pending" | "Approved" | "Declined" | "Completed";
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: string;
  category: "Piglets" | "Fattening Pigs" | "Fresh Pork Meat" | "Crispylicious Lechon" | "Food Packages";
  totalAmount: number;
  orderDate: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "Paid" | "Pending";
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "order" | "reservation" | "system";
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface ChatbotFAQ {
  q: string;
  a: string;
}

interface RoleContextProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  userEmail: string;
  userId: string | null;
  isLoading: boolean;
  
  // Data Store
  inventory: InventoryItem[];
  inventoryLogs: InventoryLog[];
  reservations: Reservation[];
  orders: Order[];
  notifications: Notification[];
  cart: CartItem[];
  chatbotGuidelines: string;
  chatbotFaqs: ChatbotFAQ[];

  // Mutators
  addInventoryItem: (item: Omit<InventoryItem, "id" | "status">) => Promise<boolean>;
  updateInventoryItem: (id: string, updatedItem: Partial<InventoryItem>) => Promise<boolean>;
  deleteInventoryItem: (id: string) => Promise<boolean>;
  updateStockLevel: (id: string, quantityChanged: number, action: InventoryLog["action"], notes?: string) => Promise<boolean>;
  addReservation: (res: Omit<Reservation, "id" | "customerName" | "customerEmail" | "reservationDate" | "status">) => Promise<boolean>;
  updateReservationStatus: (id: string, status: Reservation["status"]) => Promise<boolean>;
  addOrder: (order: Omit<Order, "id" | "customerName" | "customerEmail" | "orderDate" | "status" | "paymentStatus">) => Promise<boolean>;
  updateOrderStatus: (id: string, status: Order["status"], paymentStatus?: Order["paymentStatus"]) => Promise<boolean>;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  
  // Cart Actions
  addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;

  // Chatbot Actions
  updateChatbotSettings: (guidelines: string, faqs: ChatbotFAQ[]) => Promise<boolean>;

  // Supabase Auth Methods
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<boolean>;
}

const RoleContext = createContext<RoleContextProps | undefined>(undefined);

// Mock Fallbacks
const initialInventory: InventoryItem[] = [
  { id: "1", name: "Duroc Piglets (DPF-0102)", category: "Piglets", quantity: 12, unit: "head", price: 3500, minStockLevel: 5, status: "Available", tagNumber: "DPF-0102", breed: "Duroc", ageWeeks: 12, weightKg: 45, penNumber: "Pen A-3", healthStatus: "Healthy" },
  { id: "2", name: "Large White Hog (DPF-0105)", category: "Fattening Pigs", quantity: 8, unit: "head", price: 8500, minStockLevel: 3, status: "Available", tagNumber: "DPF-0105", breed: "Large White", ageWeeks: 16, weightKg: 85, penNumber: "Pen B-1", healthStatus: "Healthy" },
  { id: "3", name: "Berkshire Fattening (DPF-0108)", category: "Fattening Pigs", quantity: 2, unit: "head", price: 9200, minStockLevel: 3, status: "Low Stock", tagNumber: "DPF-0108", breed: "Berkshire", ageWeeks: 14, weightKg: 62, penNumber: "Pen A-4", healthStatus: "Under Treatment" },
  { id: "4", name: "Fresh Pork Belly (1kg)", category: "Fresh Pork Meat", quantity: 45, unit: "kg", price: 320, minStockLevel: 10, status: "Available" },
  { id: "5", name: "Fresh Pork Chop (1kg)", category: "Fresh Pork Meat", quantity: 0, unit: "kg", price: 280, minStockLevel: 5, status: "Out of Stock" },
  { id: "6", name: "Regular Crispy Lechon (Small)", category: "Lechon Packages", quantity: 5, unit: "set", price: 8500, minStockLevel: 2, status: "Available" },
  { id: "7", name: "Classic Buffet Package A", category: "Catering Packages", quantity: 4, unit: "set", price: 12000, minStockLevel: 2, status: "Available" },
  { id: "8", name: "Signature Lechon Cake", category: "Sweet Corners", quantity: 12, unit: "pcs", price: 1800, minStockLevel: 3, status: "Available" },
  { id: "9", name: "Family Pork Combo Pack", category: "Food Packages", quantity: 1, unit: "set", price: 4500, minStockLevel: 3, status: "Low Stock" },
];

const initialLogs: InventoryLog[] = [
  { id: "log-1", inventoryId: "1", itemName: "Duroc Piglets (DPF-0102)", itemCategory: "Piglets", action: "Stock In", quantityChanged: 12, notes: "Initial farm register", createdAt: "2026-05-25 09:12:00" },
  { id: "log-2", inventoryId: "4", itemName: "Fresh Pork Belly (1kg)", itemCategory: "Fresh Pork Meat", action: "Manual Adjustment", quantityChanged: 20, notes: "Restocked from local butcher dispatch", createdAt: "2026-05-28 14:30:00" },
  { id: "log-3", inventoryId: "4", itemName: "Fresh Pork Belly (1kg)", itemCategory: "Fresh Pork Meat", action: "Sale", quantityChanged: -15, notes: "Auto-decrement from completed order ORD-9021", createdAt: "2026-05-29 16:45:00" },
  { id: "log-4", inventoryId: "5", itemName: "Fresh Pork Chop (1kg)", itemCategory: "Fresh Pork Meat", action: "Status Update", quantityChanged: 0, notes: "System alert: stock level reached zero", createdAt: "2026-05-30 11:00:00" },
];

const initialReservations: Reservation[] = [
  { id: "RES-101", customerName: "Maria Santos", customerEmail: "maria.santos@email.com", category: "Piglets", quantity: 5, reservationDate: "2026-05-25", pickupDate: "2026-06-15", status: "Pending", price: 17500 },
  { id: "RES-102", customerName: "John Doe", customerEmail: "john.doe@email.com", category: "Crispylicious Lechon", quantity: 1, reservationDate: "2026-05-28", pickupDate: "2026-06-08", status: "Approved", price: 8500 },
];

const initialOrders: Order[] = [
  { id: "ORD-9021", customerName: "Maria Santos", customerEmail: "maria.santos@email.com", items: "15kg Fresh Pork Belly", category: "Fresh Pork Meat", totalAmount: 6400, orderDate: "2026-05-29", status: "Processing", paymentStatus: "Paid" },
];

const initialNotifications: Notification[] = [
  { id: "1", title: "Supabase Mode Initialized", message: "Connect your project credentials inside .env.local to link live schemas.", timestamp: "Just now", read: false, type: "system" },
];

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>("guest");
  const [userName, setUserName] = useState("Visitor");
  const [userEmail, setUserEmail] = useState("visitor@delmarfarm.com");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // In-Memory sync stores (also serve as fallbacks)
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(initialLogs);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [chatbotGuidelines, setChatbotGuidelines] = useState<string>("You are a friendly customer support agent for Delmar Piggery Farm. Answer user questions about products, services, order statuses, and FAQs.");
  const [chatbotFaqs, setChatbotFaqs] = useState<ChatbotFAQ[]>([
    { q: "What are your delivery areas?", a: "We deliver regularly within Nueva Ecija. Deliveries to nearby provinces (Tarlac, Pampanga, Bulacan) can be arranged with logistics fees." },
    { q: "How can I pay for my order?", a: "We accept GCash, Bank Transfer, and Cash On Delivery (COD)." },
    { q: "What is your return policy?", a: "Due to the perishable nature of fresh meat, returns are only accepted upon inspection at delivery. Live hogs can be replaced if health issues are verified within 24 hours of delivery." },
  ]);

  const router = useRouter();

  // Handle Session State Changes
  const handleSession = async (session: any) => {
    setIsLoading(true);
    if (!session) {
      setRoleState("guest");
      setUserName("Visitor");
      setUserEmail("visitor@delmarfarm.com");
      setUserId(null);
      setIsLoading(false);
      return;
    }

    const { user } = session;
    setUserId(user.id);
    setUserEmail(user.email || "");

    try {
      // Fetch profile row
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile && !error) {
        setUserName(profile.full_name || "Customer");
        setRoleState(profile.role as UserRole);
      } else {
        // Fallback default
        setUserName(user.raw_user_metadata?.full_name || "Customer");
        setRoleState("customer");
      }
    } catch {
      setUserName(user.raw_user_metadata?.full_name || "Customer");
      setRoleState("customer");
    } finally {
      setIsLoading(false);
    }
  };

  // Setup listeners
  useEffect(() => {
    if (isSupabasePlaceholder) {
      handleSession(null);
      return;
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        handleSession(session);
      })
      .catch((err) => {
        console.warn("Supabase auth session fetch failed, falling back to guest mode:", err);
        handleSession(null);
      });

    let subscription: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        handleSession(session).catch((err) => {
          console.warn("Error handling auth state change:", err);
        });
      });
      subscription = data?.subscription;
    } catch (err) {
      console.warn("Failed to subscribe to auth state changes:", err);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Hydrate client-only state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("delmar_cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch {}
      }
      const savedGuidelines = localStorage.getItem("chatbot_guidelines");
      if (savedGuidelines) {
        setChatbotGuidelines(savedGuidelines);
      }
      const savedFaqs = localStorage.getItem("chatbot_faqs");
      if (savedFaqs) {
        try {
          setChatbotFaqs(JSON.parse(savedFaqs));
        } catch {}
      }
    }
  }, []);

  // Fetch data dynamically on role updates
  useEffect(() => {
    if (role === "guest") {
      setInventory(initialInventory);
      setInventoryLogs(initialLogs);
      setReservations(initialReservations);
      setOrders(initialOrders);
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch Inventory (Admin Only)
        if (role === "admin") {
          const { data: inv } = await supabase.from("inventory").select("*").order("created_at", { ascending: false });
          if (inv) {
            setInventory(inv.map(p => ({
              id: p.id,
              name: p.name,
              category: p.category as InventoryCategory,
              quantity: p.quantity,
              unit: p.unit,
              price: Number(p.price),
              minStockLevel: p.min_stock_level,
              status: p.status as any,
              tagNumber: p.tag_number || undefined,
              breed: p.breed || undefined,
              ageWeeks: p.age_weeks || undefined,
              weightKg: p.weight_kg || undefined,
              penNumber: p.pen_number || undefined,
              healthStatus: p.health_status as any,
              createdAt: p.created_at,
              updatedAt: p.updated_at,
            })));
          }

          // 1b. Fetch Inventory Logs (Admin Only)
          const { data: logs } = await supabase.from("inventory_logs").select("*, inventory(name, category)").order("created_at", { ascending: false });
          if (logs) {
            setInventoryLogs(logs.map(l => ({
              id: l.id,
              inventoryId: l.inventory_id,
              itemName: l.inventory?.name || "Unknown Item",
              itemCategory: (l.inventory?.category || "Fresh Pork Meat") as InventoryCategory,
              action: l.action as any,
              quantityChanged: l.quantity_changed,
              notes: l.notes,
              createdAt: new Date(l.created_at).toLocaleString(),
            })));
          }
        }

        // 2. Fetch Reservations
        let resQuery = supabase.from("reservations").select("*, users(full_name, email)");
        if (role === "customer") {
          resQuery = resQuery.eq("user_id", userId);
        }
        const { data: resData } = await resQuery.order("created_at", { ascending: false });
        if (resData) {
          setReservations(resData.map(r => ({
            id: r.id,
            customerName: r.users?.full_name || "Customer",
            customerEmail: r.users?.email || "",
            category: r.category,
            quantity: r.quantity,
            reservationDate: r.reservation_date,
            pickupDate: r.pickup_date,
            status: r.status,
            price: r.price,
          })));
        }

        // 3. Fetch Orders
        let ordQuery = supabase.from("orders").select("*, users(full_name, email), order_items(*)");
        if (role === "customer") {
          ordQuery = ordQuery.eq("user_id", userId);
        }
        const { data: ordData } = await ordQuery.order("created_at", { ascending: false });
        if (ordData) {
          setOrders(ordData.map(o => ({
            id: o.id,
            customerName: o.users?.full_name || "Customer",
            customerEmail: o.users?.email || "",
            items: o.order_items?.map((item: any) => `${item.quantity}x item`).join(", ") || "Fresh Meat Items",
            category: "Fresh Pork Meat",
            totalAmount: o.total_amount,
            orderDate: o.order_date,
            status: o.status,
            paymentStatus: o.payment_status,
          })));
        }

        // 4. Fetch Notifications
        let notQuery = supabase.from("notifications").select("*");
        if (role === "customer") {
          notQuery = notQuery.eq("user_id", userId);
        }
        const { data: notData } = await notQuery.order("created_at", { ascending: false });
        if (notData) {
          setNotifications(notData.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            timestamp: new Date(n.created_at).toLocaleDateString(),
            read: n.read,
            type: n.type,
          })));
        }

      } catch (err) {
        console.warn("Supabase fetch failed, using fallback mock variables:", err);
      }
    };

    fetchData();
  }, [role, userId]);

  // Session Switching override (Used by Simulator HUD)
  const setRole = async (newRole: UserRole) => {
    if (newRole === "guest") {
      await signOut();
      router.push("/");
      return;
    }

    // Set simulator role flags directly in mock state
    setRoleState(newRole);
    if (newRole === "admin") {
      setUserName("Elena Delmar");
      setUserEmail("admin@delmarfarm.com");
      router.push("/admin/dashboard");
    } else {
      setUserName("John Doe");
      setUserEmail("john.doe@email.com");
      router.push("/customer/dashboard");
    }
  };

  // Supabase Database Mutators
  const addInventoryItem = async (item: Omit<InventoryItem, "id" | "status">): Promise<boolean> => {
    const computedStatus = item.quantity === 0 ? "Out of Stock" : item.quantity <= item.minStockLevel ? "Low Stock" : "Available";
    try {
      const { data, error } = await supabase
        .from("inventory")
        .insert({
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          min_stock_level: item.minStockLevel,
          status: computedStatus,
          tag_number: item.tagNumber || null,
          breed: item.breed || null,
          age_weeks: item.ageWeeks || null,
          weight_kg: item.weightKg || null,
          pen_number: item.penNumber || null,
          health_status: item.healthStatus || "N/A",
        })
        .select()
        .single();

      if (error) throw error;
      
      const newItem: InventoryItem = {
        id: data.id,
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        price: Number(data.price),
        minStockLevel: data.min_stock_level,
        status: data.status,
        tagNumber: data.tag_number || undefined,
        breed: data.breed || undefined,
        ageWeeks: data.age_weeks || undefined,
        weightKg: data.weight_kg || undefined,
        penNumber: data.pen_number || undefined,
        healthStatus: data.health_status as any,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setInventory([newItem, ...inventory]);

      await addInventoryLog({
        inventoryId: newItem.id,
        itemName: newItem.name,
        itemCategory: newItem.category,
        action: "Stock In",
        quantityChanged: newItem.quantity,
        notes: `Registered item: ${newItem.name} with ${newItem.quantity} initial stock`,
      });

      return true;
    } catch (err) {
      console.warn("Supabase add inventory failed, using fallback:", err);
      const fallbackId = `item-${inventory.length + 1}`;
      const newItem: InventoryItem = {
        ...item,
        id: fallbackId,
        status: computedStatus,
      };
      setInventory([newItem, ...inventory]);

      const newLog: InventoryLog = {
        id: `log-${Date.now()}`,
        inventoryId: fallbackId,
        itemName: newItem.name,
        itemCategory: newItem.category,
        action: "Stock In",
        quantityChanged: newItem.quantity,
        notes: `Registered item: ${newItem.name} with ${newItem.quantity} initial stock (Offline)`,
        createdAt: new Date().toLocaleString(),
      };
      setInventoryLogs([newLog, ...inventoryLogs]);
      return true;
    }
  };

  const updateInventoryItem = async (id: string, updated: Partial<InventoryItem>): Promise<boolean> => {
    try {
      const existing = inventory.find(i => i.id === id);
      if (!existing) return false;

      const newQty = updated.quantity !== undefined ? updated.quantity : existing.quantity;
      const newMin = updated.minStockLevel !== undefined ? updated.minStockLevel : existing.minStockLevel;
      const computedStatus = newQty === 0 ? "Out of Stock" : newQty <= newMin ? "Low Stock" : "Available";

      const payload: any = {
        name: updated.name,
        category: updated.category,
        quantity: updated.quantity,
        unit: updated.unit,
        price: updated.price,
        min_stock_level: updated.minStockLevel,
        status: computedStatus,
        tag_number: updated.tagNumber,
        breed: updated.breed,
        age_weeks: updated.ageWeeks,
        weight_kg: updated.weightKg,
        pen_number: updated.penNumber,
        health_status: updated.healthStatus,
        updated_at: new Date().toISOString(),
      };

      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      const { error } = await supabase
        .from("inventory")
        .update(payload)
        .eq("id", id);

      if (error) throw error;

      setInventory(inventory.map(p => p.id === id ? { ...p, ...updated, status: computedStatus } : p));

      if (updated.quantity !== undefined && updated.quantity !== existing.quantity) {
        const diff = updated.quantity - existing.quantity;
        await addInventoryLog({
          inventoryId: id,
          itemName: updated.name || existing.name,
          itemCategory: updated.category || existing.category,
          action: diff > 0 ? "Stock In" : "Stock Out",
          quantityChanged: diff,
          notes: `Stock level updated from ${existing.quantity} to ${updated.quantity}`,
        });
      }

      return true;
    } catch (err) {
      console.warn("Supabase update inventory failed, using fallback:", err);
      const existing = inventory.find(i => i.id === id);
      if (!existing) return false;

      const newQty = updated.quantity !== undefined ? updated.quantity : existing.quantity;
      const newMin = updated.minStockLevel !== undefined ? updated.minStockLevel : existing.minStockLevel;
      const computedStatus = newQty === 0 ? "Out of Stock" : newQty <= newMin ? "Low Stock" : "Available";

      setInventory(inventory.map(p => p.id === id ? { ...p, ...updated, status: computedStatus } : p));

      if (updated.quantity !== undefined && updated.quantity !== existing.quantity) {
        const diff = updated.quantity - existing.quantity;
        const newLog: InventoryLog = {
          id: `log-${Date.now()}`,
          inventoryId: id,
          itemName: updated.name || existing.name,
          itemCategory: (updated.category || existing.category) as any,
          action: diff > 0 ? "Stock In" : "Stock Out",
          quantityChanged: diff,
          notes: `Stock level updated from ${existing.quantity} to ${updated.quantity} (Offline)`,
          createdAt: new Date().toLocaleString(),
        };
        setInventoryLogs([newLog, ...inventoryLogs]);
      }
      return true;
    }
  };

  const deleteInventoryItem = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("inventory").delete().eq("id", id);
      if (error) throw error;
      setInventory(inventory.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.warn("Supabase delete inventory failed, using fallback:", err);
      setInventory(inventory.filter(p => p.id !== id));
      return true;
    }
  };

  const updateStockLevel = async (id: string, quantityChanged: number, action: InventoryLog["action"], notes?: string): Promise<boolean> => {
    try {
      const existing = inventory.find(i => i.id === id);
      if (!existing) return false;

      const newQty = Math.max(0, existing.quantity + quantityChanged);
      const computedStatus = newQty === 0 ? "Out of Stock" : newQty <= existing.minStockLevel ? "Low Stock" : "Available";

      const { error } = await supabase
        .from("inventory")
        .update({
          quantity: newQty,
          status: computedStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setInventory(inventory.map(p => p.id === id ? { ...p, quantity: newQty, status: computedStatus } : p));

      await addInventoryLog({
        inventoryId: id,
        itemName: existing.name,
        itemCategory: existing.category,
        action,
        quantityChanged,
        notes: notes || `Stock level adjusted manually by ${quantityChanged > 0 ? "+" : ""}${quantityChanged}`,
      });

      if (computedStatus === "Low Stock" || computedStatus === "Out of Stock") {
        await supabase.from("notifications").insert({
          title: `Low Stock Alert: ${existing.name}`,
          message: `Inventory item ${existing.name} is running low on stock. Current level: ${newQty} (Threshold: ${existing.minStockLevel}).`,
          type: "system",
        });
      }

      return true;
    } catch (err) {
      console.warn("Supabase update stock level failed, using fallback:", err);
      const existing = inventory.find(i => i.id === id);
      if (!existing) return false;

      const newQty = Math.max(0, existing.quantity + quantityChanged);
      const computedStatus = newQty === 0 ? "Out of Stock" : newQty <= existing.minStockLevel ? "Low Stock" : "Available";

      setInventory(inventory.map(p => p.id === id ? { ...p, quantity: newQty, status: computedStatus } : p));

      const newLog: InventoryLog = {
        id: `log-${Date.now()}`,
        inventoryId: id,
        itemName: existing.name,
        itemCategory: existing.category,
        action,
        quantityChanged,
        notes: (notes || `Stock level adjusted manually by ${quantityChanged > 0 ? "+" : ""}${quantityChanged}`) + " (Offline)",
        createdAt: new Date().toLocaleString(),
      };
      setInventoryLogs([newLog, ...inventoryLogs]);

      if (computedStatus === "Low Stock" || computedStatus === "Out of Stock") {
        const newNotif: Notification = {
          id: `notif-${Date.now()}`,
          title: `Low Stock Alert: ${existing.name}`,
          message: `Inventory item ${existing.name} is running low on stock. Current level: ${newQty} (Threshold: ${existing.minStockLevel}).`,
          timestamp: "Just now",
          read: false,
          type: "system",
        };
        setNotifications([newNotif, ...notifications]);
      }
      return true;
    }
  };

  const addInventoryLog = async (log: Omit<InventoryLog, "id" | "createdAt">): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("inventory_logs")
        .insert({
          inventory_id: log.inventoryId,
          action: log.action,
          quantity_changed: log.quantityChanged,
          notes: log.notes,
        })
        .select()
        .single();

      if (error) throw error;

      const newLog: InventoryLog = {
        id: data.id,
        inventoryId: data.inventory_id,
        itemName: log.itemName,
        itemCategory: log.itemCategory,
        action: data.action as any,
        quantityChanged: data.quantity_changed,
        notes: data.notes,
        createdAt: new Date(data.created_at).toLocaleString(),
      };

      setInventoryLogs([newLog, ...inventoryLogs]);
      return true;
    } catch {
      const fallbackLog: InventoryLog = {
        ...log,
        id: `log-${Date.now()}`,
        createdAt: new Date().toLocaleString(),
      };
      setInventoryLogs([fallbackLog, ...inventoryLogs]);
      return true;
    }
  };

  const handleAutoDecrementForOrder = async (order: Order) => {
    const itemParts = order.items.split(",");
    for (const itemPart of itemParts) {
      const trimmed = itemPart.trim();
      if (!trimmed) continue;
      
      let quantity = 1;
      let itemName = trimmed;
      const regexMatch = trimmed.match(/^(\d+)(?:\s*(?:x|kg|pcs|packages|heads|set))?\s+(.*)/i);
      if (regexMatch) {
        quantity = parseInt(regexMatch[1]) || 1;
        itemName = regexMatch[2].trim();
      }
      
      let matchedItem = inventory.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(i.name.toLowerCase()));
      if (!matchedItem) {
        matchedItem = inventory.find(i => i.category.toLowerCase() === order.category.toLowerCase());
      }
      
      if (matchedItem) {
        await updateStockLevel(
          matchedItem.id, 
          -quantity, 
          "Sale", 
          `Auto-decrement from completed order ${order.id} (${itemName})`
        );
      }
    }
  };

  const addReservation = async (res: Omit<Reservation, "id" | "customerName" | "customerEmail" | "reservationDate" | "status">): Promise<boolean> => {
    try {
      if (!userId) return false;
      const { data, error } = await supabase
        .from("reservations")
        .insert({
          user_id: userId,
          category: res.category,
          quantity: res.quantity,
          price: res.price,
          pickup_date: res.pickupDate,
        })
        .select()
        .single();

      if (error) throw error;

      const newRes: Reservation = {
        id: data.id,
        customerName: userName,
        customerEmail: userEmail,
        category: data.category,
        quantity: data.quantity,
        reservationDate: data.reservation_date,
        pickup_date: data.pickup_date,
        status: data.status,
        price: data.price,
      } as any;

      setReservations([newRes, ...reservations]);
      return true;
    } catch {
      const fallbackRes: Reservation = {
        ...res,
        id: `RES-${Math.floor(100 + Math.random() * 900)}`,
        customerName: userName,
        customerEmail: userEmail,
        reservationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
      };
      setReservations([fallbackRes, ...reservations]);
      return true;
    }
  };

  const updateReservationStatus = async (id: string, status: Reservation["status"]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
      return true;
    } catch {
      setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
      return true;
    }
  };

  const addOrder = async (order: Omit<Order, "id" | "customerName" | "customerEmail" | "orderDate" | "status" | "paymentStatus">): Promise<boolean> => {
    try {
      if (!userId) return false;
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          total_amount: order.totalAmount,
        })
        .select()
        .single();

      if (error) throw error;

      const newOrder: Order = {
        id: data.id,
        customerName: userName,
        customerEmail: userEmail,
        items: order.items,
        category: order.category,
        totalAmount: data.total_amount,
        orderDate: data.order_date,
        status: data.status,
        paymentStatus: data.payment_status,
      };

      setOrders([newOrder, ...orders]);
      return true;
    } catch {
      const fallbackOrder: Order = {
        ...order,
        id: `ORD-${Math.floor(9000 + Math.random() * 999)}`,
        customerName: userName,
        customerEmail: userEmail,
        orderDate: new Date().toISOString().split("T")[0],
        status: "Processing",
        paymentStatus: "Pending",
      };
      setOrders([fallbackOrder, ...orders]);
      return true;
    }
  };

  const updateOrderStatus = async (id: string, status: Order["status"], paymentStatus?: Order["paymentStatus"]): Promise<boolean> => {
    try {
      const order = orders.find(o => o.id === id);
      const isTransitionToDelivered = order && order.status !== "Delivered" && status === "Delivered";

      const updatePayload: any = { status };
      if (paymentStatus) updatePayload.payment_status = paymentStatus;

      const { error } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", id);

      if (error) throw error;

      setOrders(orders.map(o => o.id === id ? {
        ...o,
        status,
        paymentStatus: paymentStatus || o.paymentStatus
      } : o));

      if (isTransitionToDelivered && order) {
        await handleAutoDecrementForOrder(order);
      }

      return true;
    } catch {
      const order = orders.find(o => o.id === id);
      const isTransitionToDelivered = order && order.status !== "Delivered" && status === "Delivered";

      setOrders(orders.map(o => o.id === id ? {
        ...o,
        status,
        paymentStatus: paymentStatus || o.paymentStatus
      } : o));

      if (isTransitionToDelivered && order) {
        await handleAutoDecrementForOrder(order);
      }

      return true;
    }
  };

  const markNotificationRead = async (id: string): Promise<void> => {
    try {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const clearNotifications = async (): Promise<void> => {
    try {
      if (userId) {
        await supabase.from("notifications").delete().eq("user_id", userId);
      }
      setNotifications([]);
    } catch {
      setNotifications([]);
    }
  };

  // Auth Methods
  const signOut = async () => {
    await supabase.auth.signOut();
    setRoleState("guest");
    setUserId(null);
    setUserEmail("visitor@delmarfarm.com");
    setUserName("Visitor");
    router.push("/");
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });
      if (error) throw error;
      return true;
    } catch {
      // Mock Success fallback
      return true;
    }
  };

  // Cart Actions
  const addToCart = (item: Omit<CartItem, "quantity">, qty = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      let newCart;
      if (existing) {
        newCart = prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
        );
      } else {
        newCart = [...prevCart, { ...item, quantity: qty }];
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_cart", JSON.stringify(newCart));
      }
      return newCart;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((i) => i.id !== itemId);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_cart", JSON.stringify(newCart));
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("delmar_cart");
    }
  };

  // Chatbot Actions
  const updateChatbotSettings = async (guidelines: string, faqs: ChatbotFAQ[]): Promise<boolean> => {
    setChatbotGuidelines(guidelines);
    setChatbotFaqs(faqs);
    if (typeof window !== "undefined") {
      localStorage.setItem("chatbot_guidelines", guidelines);
      localStorage.setItem("chatbot_faqs", JSON.stringify(faqs));
    }
    return true;
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        userName,
        userEmail,
        userId,
        isLoading,
        inventory,
        inventoryLogs,
        reservations,
        orders,
        notifications,
        cart,
        chatbotGuidelines,
        chatbotFaqs,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        updateStockLevel,
        addReservation,
        updateReservationStatus,
        addOrder,
        updateOrderStatus,
        markNotificationRead,
        clearNotifications,
        addToCart,
        removeFromCart,
        clearCart,
        updateChatbotSettings,
        signOut,
        sendPasswordReset,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
