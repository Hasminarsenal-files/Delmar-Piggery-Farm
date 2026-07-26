"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabasePlaceholder } from "@/utils/supabaseClient";
import { generateFixedBatchSchedule, calculateBatchEndDate, evaluateInstallmentStatus } from "@/utils/paluwaganScheduler";

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

export type OrderType = "Cash" | "Reservation" | "Paluwagan";

export interface PaluwaganInstallment {
  date: string;
  amount: number;
  remarks?: string;
}

export interface PaluwaganScheduleItem {
  installmentNumber: number;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  status: "UPCOMING" | "DUE" | "PAID" | "PARTIALLY PAID" | "OVERDUE" | "MISSED";
  paymentDate?: string;
  receiptNumber?: string;
  collector?: string;
  remarks?: string;
}

export interface PaluwaganBatch {
  id: string;
  name: string;
  startDate: string;
  durationMonths: 8 | 12;
  endDate: string;
  status: "Active" | "Archived" | "Completed";
  createdAt?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  product: string;
  quantity: number;
  orderType: OrderType;
  totalAmount: number;
  paymentStatus: "Paid" | "Pending" | "Partially Paid" | "Unpaid";
  status: "Pending" | "Approved" | "Preparing" | "Ready for Pickup" | "Out for Delivery" | "Delivered" | "Completed" | "Cancelled" | "Processing" | "Shipped";
  driverName?: string;
  estimatedArrival?: string;
  dateCreated: string;
  customerPhone?: string;
  customerAddress?: string;
  batchId?: string;
  paluwaganSchedule?: PaluwaganScheduleItem[];
  
  // Cash fields
  deliveryOrPickup?: "Delivery" | "Pickup";
  paymentMethod?: string;

  // Reservation fields
  reservationDate?: string;
  pickupDate?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  eventType?: string;
  specialInstructions?: string;

  // Paluwagan fields
  downPayment?: number;
  remainingBalance?: number;
  installmentAmount?: number;
  numberOfPayments?: number;
  paymentSchedule?: "Weekly" | "Bi-Weekly" | "Monthly";
  nextDueDate?: string;
  installmentsLog?: PaluwaganInstallment[];
}

export interface PaluwaganApplication {
  id: string;
  customerEmail: string;
  fullName: string;
  birthdate: string;
  age: number;
  civilStatus: string;
  mobileNumber: string;
  emailAddress: string;
  completeAddress: string;
  barangay: string;
  municipalityCity: string;
  province: string;
  idType: string;
  idFileName: string;
  googleDriveFileId?: string; // Private Google Drive File ID reference (NO PDF binary stored in database)
  pdfFileName?: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactNumber: string;
  occupation: string;
  employerName: string;
  monthlyIncomeRange: string;
  status: "Pending" | "Approved" | "Rejected" | "Requires Additional Information";
  dateSubmitted: string;
  dateApproved?: string;
  adminRemarks?: string;
  memberId?: string;
  assignedBatchId?: string;
  allowReapply?: boolean;
}

export interface PaluwaganLedgerEntry {
  id: string;
  receiptNumber: string;
  paymentDate: string;
  memberId: string;
  memberName: string;
  customerEmail: string;
  batchId: string;
  batchName: string;
  orderId: string;
  installmentNumber: number;
  amountDue: number;
  amountPaid: number;
  remainingBalanceAfter: number;
  paymentMethod: string;
  collector: string;
  status: "Paid" | "Partial Payment" | "Overdue" | "Voided";
  remarks?: string;
}

export interface CustomerAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  status: "Active" | "Suspended" | "Pending";
  registrationDate: string;
  lastLogin: string;
}


export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "order" | "reservation" | "system";
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  adminEmail: string;
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

export interface Batch {
  id: string;
  name: string;
  totalDue: number;
  status: "Active" | "Archived";
  createdAt?: string;
}

export interface Member {
  id: string;
  memberId: string;
  fullName: string;
  contactNumber: string;
  email: string;
  address: string;
  dateRegistered: string;
  membershipStatus: "Active" | "Inactive" | "Archived";
  batchId?: string;
  totalDue: number;
  notes?: string;
  createdAt?: string;
}

export interface MemberPayment {
  id: string;
  receiptNumber: string;
  memberId: string;
  batchId?: string;
  paymentDate: string;
  paymentMethod: string;
  amountPaid: number;
  collector: string;
  remarks?: string;
  createdAt?: string;
}

interface RoleContextProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
  updateProfile: (name: string, email: string, phone: string, address: string) => void;
  userId: string | null;
  isLoading: boolean;
  
  // Data Store
  inventory: InventoryItem[];
  inventoryLogs: InventoryLog[];
  reservations: Reservation[];
  orders: Order[];
  notifications: Notification[];
  toast: { title: string; message: string; type: "info" | "success" | "warning" } | null;
  showToast: (title: string, message: string, type?: "info" | "success" | "warning") => void;
  cart: CartItem[];
  chatbotGuidelines: string;
  chatbotFaqs: ChatbotFAQ[];
  batches: Batch[];
  members: Member[];
  memberPayments: MemberPayment[];
  paluwaganBatches: PaluwaganBatch[];
  auditLogs: AuditLog[];
  customers: CustomerAccount[];
  paluwaganApplications: PaluwaganApplication[];
  paluwaganLedger: PaluwaganLedgerEntry[];

  // Mutators
  addCustomerAccount: (cust: Omit<CustomerAccount, "id" | "registrationDate" | "lastLogin">) => Promise<boolean>;
  addInventoryItem: (item: Omit<InventoryItem, "id" | "status">) => Promise<boolean>;
  updateInventoryItem: (id: string, updatedItem: Partial<InventoryItem>) => Promise<boolean>;
  deleteInventoryItem: (id: string) => Promise<boolean>;
  updateStockLevel: (id: string, quantityChanged: number, action: InventoryLog["action"], notes?: string) => Promise<boolean>;
  addReservation: (res: Omit<Reservation, "id" | "customerName" | "customerEmail" | "reservationDate" | "status"> & { orderType?: OrderType; batchId?: string }) => Promise<boolean>;
  updateReservationStatus: (id: string, status: Reservation["status"]) => Promise<boolean>;
  addOrder: (order: Omit<Order, "id" | "customerName" | "customerEmail" | "dateCreated" | "status" | "paymentStatus">) => Promise<boolean>;
  updateOrderStatus: (id: string, status: Order["status"], paymentStatus?: Order["paymentStatus"]) => Promise<boolean>;
  updateOrder: (id: string, updatedOrder: Partial<Order>) => Promise<boolean>;
  addPaluwaganBatch: (batch: Omit<PaluwaganBatch, "id" | "status">) => Promise<boolean>;
  updatePaluwaganBatch: (id: string, fields: Partial<PaluwaganBatch>) => Promise<boolean>;
  recordPaluwaganPayment: (orderId: string, installmentNumber: number, payment: { paymentDate: string, amountPaid: number, collector: string, receiptNumber: string, remarks?: string }) => Promise<boolean>;
  submitPaluwaganApplication: (app: Omit<PaluwaganApplication, "id" | "status" | "dateSubmitted">) => Promise<boolean>;
  approvePaluwaganApplication: (id: string, batchId: string) => Promise<boolean>;
  rejectPaluwaganApplication: (id: string, remarks: string, allowReapply?: boolean) => Promise<boolean>;
  updatePaluwaganApplicationStatus: (id: string, status: PaluwaganApplication["status"], remarks?: string) => Promise<boolean>;
  archivePaluwaganMembership: (memberId: string) => Promise<boolean>;
  addLedgerPayment: (entry: Omit<PaluwaganLedgerEntry, "id" | "receiptNumber" | "remainingBalanceAfter">) => Promise<boolean>;
  voidLedgerPayment: (id: string, voidedBy: string) => Promise<boolean>;
  correctLedgerPayment: (id: string, updatedFields: Partial<PaluwaganLedgerEntry>, editedBy: string) => Promise<boolean>;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  
  // Cart Actions
  addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;

  // Chatbot Actions
  updateChatbotSettings: (guidelines: string, faqs: ChatbotFAQ[]) => Promise<boolean>;

  // Member Management Actions
  addBatch: (batch: Omit<Batch, "id" | "status">) => Promise<boolean>;
  updateBatch: (id: string, updatedBatch: Partial<Batch>) => Promise<boolean>;
  archiveBatch: (id: string) => Promise<boolean>;
  addMember: (member: Omit<Member, "id" | "memberId" | "membershipStatus">) => Promise<boolean>;
  updateMember: (id: string, updatedMember: Partial<Member>) => Promise<boolean>;
  archiveMember: (id: string) => Promise<boolean>;
  restoreMember: (id: string) => Promise<boolean>;
  recordMemberPayment: (payment: Omit<MemberPayment, "id" | "receiptNumber" | "paymentDate">) => Promise<boolean>;
  addNotification: (notif: { title: string; message: string; type: "order" | "reservation" | "system" }) => Promise<void>;

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
  {
    id: "ORD-9021",
    customerName: "Maria Santos",
    customerEmail: "maria.santos@email.com",
    product: "Fresh Pork Belly",
    quantity: 20,
    orderType: "Cash",
    totalAmount: 6400,
    paymentStatus: "Paid",
    status: "Delivered",
    dateCreated: "2026-05-29",
    deliveryOrPickup: "Delivery",
    paymentMethod: "GCash"
  },
  {
    id: "ORD-9022",
    customerName: "John Doe",
    customerEmail: "john.doe@email.com",
    product: "Crispy Lechon Package (Large)",
    quantity: 1,
    orderType: "Reservation",
    totalAmount: 13500,
    paymentStatus: "Paid",
    status: "Approved",
    dateCreated: "2026-07-10",
    reservationDate: "2026-07-16",
    pickupDate: "2026-07-20",
    deliveryDate: "2026-07-20",
    deliveryAddress: "123 Mahogany St, Cabanatuan City",
    eventType: "Birthday Party",
    specialInstructions: "Please deliver hot and with extra lechon sauce."
  },
  {
    id: "ORD-9023",
    customerName: "Juan Dela Cruz",
    customerEmail: "juan.delacruz@email.com",
    customerPhone: "0917-123-4567",
    customerAddress: "Cabanatuan City, Nueva Ecija",
    product: "Catering Buffet Set A (50 pax)",
    quantity: 50,
    orderType: "Paluwagan",
    totalAmount: 12500,
    paymentStatus: "Partially Paid",
    status: "Approved",
    dateCreated: "2026-06-01",
    downPayment: 2500,
    remainingBalance: 7500,
    installmentAmount: 2500,
    numberOfPayments: 4,
    paymentSchedule: "Weekly",
    nextDueDate: "2026-07-16",
    batchId: "pb1",
    paluwaganSchedule: [
      { installmentNumber: 1, dueDate: "2026-06-16", amountDue: 2500, amountPaid: 2500, status: "PAID", paymentDate: "2026-06-16", receiptNumber: "REC-301", collector: "Elena Delmar", remarks: "Installment 1 check" },
      { installmentNumber: 2, dueDate: "2026-07-01", amountDue: 2500, amountPaid: 2500, status: "PAID", paymentDate: "2026-07-01", receiptNumber: "REC-302", collector: "Elena Delmar", remarks: "Installment 2 check" },
      { installmentNumber: 3, dueDate: "2026-07-16", amountDue: 2500, amountPaid: 0, status: "UPCOMING" },
      { installmentNumber: 4, dueDate: "2026-08-01", amountDue: 2500, amountPaid: 0, status: "UPCOMING" }
    ],
    installmentsLog: [
      { date: "2026-06-01", amount: 2500, remarks: "Down Payment" },
      { date: "2026-06-16", amount: 2500, remarks: "REC-301 Paid" },
      { date: "2026-07-01", amount: 2500, remarks: "REC-302 Paid" }
    ]
  },
  {
    id: "ORD-9024",
    customerName: "Maria Santos",
    customerEmail: "maria.santos@email.com",
    customerPhone: "0918-987-6543",
    customerAddress: "Aliaga, Nueva Ecija",
    product: "Crispy Lechon Package (Medium)",
    quantity: 1,
    orderType: "Paluwagan",
    totalAmount: 10500,
    paymentStatus: "Partially Paid",
    status: "Approved",
    dateCreated: "2026-06-01",
    downPayment: 2500,
    remainingBalance: 8000,
    installmentAmount: 2000,
    numberOfPayments: 4,
    paymentSchedule: "Bi-Weekly",
    nextDueDate: "2026-07-16",
    batchId: "pb1",
    paluwaganSchedule: [
      { installmentNumber: 1, dueDate: "2026-06-16", amountDue: 2000, amountPaid: 0, status: "OVERDUE" },
      { installmentNumber: 2, dueDate: "2026-07-01", amountDue: 2000, amountPaid: 0, status: "OVERDUE" },
      { installmentNumber: 3, dueDate: "2026-07-16", amountDue: 2000, amountPaid: 0, status: "UPCOMING" },
      { installmentNumber: 4, dueDate: "2026-08-01", amountDue: 2000, amountPaid: 0, status: "UPCOMING" }
    ],
    installmentsLog: [
      { date: "2026-06-01", amount: 2500, remarks: "Down Payment" }
    ]
  },
  {
    id: "ORD-9025",
    customerName: "Pedro Reyes",
    customerEmail: "pedro.reyes@email.com",
    customerPhone: "0922-555-1234",
    customerAddress: "Santa Rosa, Nueva Ecija",
    product: "Catering Buffet Set B (30 pax)",
    quantity: 30,
    orderType: "Paluwagan",
    totalAmount: 8700,
    paymentStatus: "Partially Paid",
    status: "Approved",
    dateCreated: "2026-07-01",
    downPayment: 2700,
    remainingBalance: 6000,
    installmentAmount: 1500,
    numberOfPayments: 4,
    paymentSchedule: "Weekly",
    nextDueDate: "2026-07-16",
    batchId: "pb2",
    paluwaganSchedule: [
      { installmentNumber: 1, dueDate: "2026-07-16", amountDue: 1500, amountPaid: 0, status: "UPCOMING" },
      { installmentNumber: 2, dueDate: "2026-08-01", amountDue: 1500, amountPaid: 0, status: "UPCOMING" },
      { installmentNumber: 3, dueDate: "2026-08-16", amountDue: 1500, amountPaid: 0, status: "UPCOMING" },
      { installmentNumber: 4, dueDate: "2026-08-31", amountDue: 1500, amountPaid: 0, status: "UPCOMING" }
    ],
    installmentsLog: [
      { date: "2026-07-01", amount: 2700, remarks: "Down Payment" }
    ]
  }
];

const initialPaluwaganBatches: PaluwaganBatch[] = [
  { id: "pb1", name: "Batch 1", startDate: "2026-07-15", durationMonths: 8, endDate: "2027-02-28", status: "Active" },
  { id: "pb2", name: "Batch 2", startDate: "2026-09-15", durationMonths: 8, endDate: "2027-04-30", status: "Active" },
  { id: "pb3", name: "Batch 3", startDate: "2026-11-15", durationMonths: 12, endDate: "2027-11-30", status: "Active" }
];

const initialNotifications: Notification[] = [
  { id: "1", title: "Supabase Mode Initialized", message: "Connect your project credentials inside .env.local to link live schemas.", timestamp: "Just now", read: false, type: "system" },
];

const initialBatches: Batch[] = [
  { id: "b1", name: "Batch 1", totalDue: 5000, status: "Active" },
  { id: "b2", name: "Batch 2", totalDue: 6000, status: "Active" },
  { id: "b3", name: "Batch 3", totalDue: 5000, status: "Active" }
];

const initialMembers: Member[] = [
  { id: "m1", memberId: "DPF-M-10001", fullName: "Juan Dela Cruz", contactNumber: "0917-123-4567", email: "juan.delacruz@email.com", address: "Cabanatuan City, Nueva Ecija", dateRegistered: "2026-06-01", membershipStatus: "Active", batchId: "b1", totalDue: 5000, notes: "Founder member" },
  { id: "m2", memberId: "DPF-M-10002", fullName: "Pedro Penduko", contactNumber: "0918-987-6543", email: "pedro.penduko@email.com", address: "Aliaga, Nueva Ecija", dateRegistered: "2026-06-15", membershipStatus: "Active", batchId: "b1", totalDue: 5000 },
  { id: "m3", memberId: "DPF-M-10003", fullName: "Maria Clara", contactNumber: "0922-555-1234", email: "maria.clara@email.com", address: "Santa Rosa, Nueva Ecija", dateRegistered: "2026-07-01", membershipStatus: "Active", batchId: "b2", totalDue: 6000, notes: "Prefers evening communications" }
];

const initialMemberPayments: MemberPayment[] = [
  { id: "p1", receiptNumber: "REC-20001", memberId: "m1", batchId: "b1", paymentDate: "2026-06-05", paymentMethod: "GCash", amountPaid: 3000, collector: "Elena Delmar", remarks: "Partial payment" },
  { id: "p2", receiptNumber: "REC-20002", memberId: "m1", batchId: "b1", paymentDate: "2026-07-02", paymentMethod: "Cash", amountPaid: 2000, collector: "Elena Delmar", remarks: "Final payment - fully paid" },
  { id: "p3", receiptNumber: "REC-20003", memberId: "m2", batchId: "b1", paymentDate: "2026-06-20", paymentMethod: "Bank Transfer", amountPaid: 1500, collector: "Elena Delmar", remarks: "Down payment" }
];

const initialCustomers: CustomerAccount[] = [
  { id: "CUST-10001", fullName: "John Doe", email: "john.doe@email.com", phone: "0912 345 6789", address: "Purok 2, Brgy. San Juan, Aliaga, Nueva Ecija", status: "Active", registrationDate: "2026-07-10", lastLogin: "2026-07-16" },
  { id: "CUST-10002", fullName: "Maria Santos", email: "maria.santos@email.com", phone: "0923-456-7890", address: "Aliaga, Nueva Ecija", status: "Active", registrationDate: "2026-06-01", lastLogin: "2026-07-15" },
  { id: "CUST-10003", fullName: "Juan Dela Cruz", email: "juan.delacruz@email.com", phone: "0917-123-4567", address: "Cabanatuan City, Nueva Ecija", status: "Active", registrationDate: "2026-06-01", lastLogin: "2026-07-16" },
  { id: "CUST-10004", fullName: "Pedro Reyes", email: "pedro.reyes@email.com", phone: "0922-555-1234", address: "Santa Rosa, Nueva Ecija", status: "Active", registrationDate: "2026-07-01", lastLogin: "2026-07-16" }
];

const initialAuditLogs: AuditLog[] = [
  { id: "audit-1", action: "SYSTEM_INITIALIZATION", details: "Elena Delmar initialized CRM and financial ledger configurations.", timestamp: "2026-07-10T08:00:00.000Z", adminEmail: "admin@delmarfarm.com" },
  { id: "audit-2", action: "CREATE_BATCH", details: "Elena Delmar created Program cohort 'Batch 1' with ₱5,000 default due.", timestamp: "2026-07-11T09:15:00.000Z", adminEmail: "admin@delmarfarm.com" },
  { id: "audit-3", action: "REGISTER_MEMBER", details: "Elena Delmar registered member 'Juan Dela Cruz' under Batch 1.", timestamp: "2026-07-11T10:30:00.000Z", adminEmail: "admin@delmarfarm.com" },
  { id: "audit-4", action: "RECORD_PAYMENT", details: "Elena Delmar recorded payment of ₱3,000 for member 'Juan Dela Cruz' via GCash.", timestamp: "2026-07-12T11:45:00.000Z", adminEmail: "admin@delmarfarm.com" }
];

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>("guest");
  const [userName, setUserName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("delmar_user_name") || "John Doe";
    }
    return "John Doe";
  });
  const [userEmail, setUserEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("delmar_user_email") || "john.doe@email.com";
    }
    return "john.doe@email.com";
  });
  const [userPhone, setUserPhone] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("delmar_user_phone") || "09464544973";
    }
    return "09464544973";
  });
  const [userAddress, setUserAddress] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("delmar_user_address") || "Purok Lapu-Lapu, Tickwas, Dumalinao, Zamboanga del Sur";
    }
    return "Purok Lapu-Lapu, Tickwas, Dumalinao, Zamboanga del Sur";
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // In-Memory sync stores (also serve as fallbacks)
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(initialLogs);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [customers, setCustomers] = useState<CustomerAccount[]>(initialCustomers);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [memberPayments, setMemberPayments] = useState<MemberPayment[]>(initialMemberPayments);
  const [paluwaganBatches, setPaluwaganBatches] = useState<PaluwaganBatch[]>(initialPaluwaganBatches);
  const [paluwaganApplications, setPaluwaganApplications] = useState<PaluwaganApplication[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("savorlicious_paluwagan_applications");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [
      {
        id: "app-1",
        customerEmail: "alice.smith@email.com",
        fullName: "Alice Smith",
        birthdate: "1995-04-12",
        age: 31,
        civilStatus: "Single",
        mobileNumber: "09123456789",
        emailAddress: "alice.smith@email.com",
        completeAddress: "Purok 1, Barangay Liloan",
        barangay: "Liloan",
        municipalityCity: "Dumalinao",
        province: "Zamboanga del Sur",
        idType: "Driver's License",
        idFileName: "driver_license_alice.jpg",
        emergencyContactName: "Robert Smith",
        emergencyContactRelationship: "Father",
        emergencyContactNumber: "09998887777",
        occupation: "Teacher",
        employerName: "DepEd Dumalinao",
        monthlyIncomeRange: "₱20,000 - ₱40,000",
        status: "Pending",
        dateSubmitted: "2026-07-15",
      },
      {
        id: "app-2",
        customerEmail: "bob.jones@email.com",
        fullName: "Bob Jones",
        birthdate: "1988-11-23",
        age: 37,
        civilStatus: "Married",
        mobileNumber: "09234567890",
        emailAddress: "bob.jones@email.com",
        completeAddress: "Purok Gabi, Barangay Tickwas",
        barangay: "Tickwas",
        municipalityCity: "Dumalinao",
        province: "Zamboanga del Sur",
        idType: "National ID",
        idFileName: "national_id_bob.png",
        emergencyContactName: "Mary Jones",
        emergencyContactRelationship: "Spouse",
        emergencyContactNumber: "09776665555",
        occupation: "Accountant",
        employerName: "Jones Accounting Firm",
        monthlyIncomeRange: "Above ₱40,000",
        status: "Approved",
        dateSubmitted: "2026-07-12",
        dateApproved: "2026-07-13",
        memberId: "DPF-PM-10001",
        assignedBatchId: "pb-1"
      },
      {
        id: "app-3",
        customerEmail: "charlie.brown@email.com",
        fullName: "Charlie Brown",
        birthdate: "1990-08-30",
        age: 35,
        civilStatus: "Single",
        mobileNumber: "09345678901",
        emailAddress: "charlie.brown@email.com",
        completeAddress: "Purok Central, Barangay Dumalinao",
        barangay: "Barangay Dumalinao",
        municipalityCity: "Dumalinao",
        province: "Zamboanga del Sur",
        idType: "Passport",
        idFileName: "passport_charlie.jpg",
        emergencyContactName: "Sally Brown",
        emergencyContactRelationship: "Sister",
        emergencyContactNumber: "09554443333",
        occupation: "Freelancer",
        employerName: "Self Employed",
        monthlyIncomeRange: "Below ₱10,000",
        status: "Rejected",
        dateSubmitted: "2026-07-14",
        adminRemarks: "Government ID photo was blurry. Please reapply with a clearer picture.",
        allowReapply: true
      }
    ];
  });
  const [paluwaganLedger, setPaluwaganLedger] = useState<PaluwaganLedgerEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("savorlicious_paluwagan_ledger");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [
      {
        id: "pay-1",
        receiptNumber: "DPF-OR-20001",
        paymentDate: "2026-07-12",
        memberId: "DPF-PM-10001",
        memberName: "Bob Jones",
        customerEmail: "bob.jones@email.com",
        batchId: "pb-1",
        batchName: "Cohort Alpha",
        orderId: "ORD-101",
        installmentNumber: 0,
        amountDue: 2500,
        amountPaid: 2500,
        remainingBalanceAfter: 7500,
        paymentMethod: "GCash",
        collector: "Elena Delmar",
        status: "Paid",
        remarks: "Downpayment for Paluwagan Lechon Plan."
      },
      {
        id: "pay-2",
        receiptNumber: "DPF-OR-20002",
        paymentDate: "2026-07-15",
        memberId: "DPF-PM-10001",
        memberName: "Bob Jones",
        customerEmail: "bob.jones@email.com",
        batchId: "pb-1",
        batchName: "Cohort Alpha",
        orderId: "ORD-101",
        installmentNumber: 1,
        amountDue: 1875,
        amountPaid: 1875,
        remainingBalanceAfter: 5625,
        paymentMethod: "GCash",
        collector: "Elena Delmar",
        status: "Paid",
        remarks: "Regular installment #1 payment."
      },
      {
        id: "pay-3",
        receiptNumber: "DPF-OR-20003",
        paymentDate: "2026-07-10",
        memberId: "DPF-PM-10002",
        memberName: "Grace Hopper",
        customerEmail: "grace.hopper@email.com",
        batchId: "pb-1",
        batchName: "Cohort Alpha",
        orderId: "ORD-102",
        installmentNumber: 0,
        amountDue: 2700,
        amountPaid: 2700,
        remainingBalanceAfter: 8100,
        paymentMethod: "Bank Transfer",
        collector: "Elena Delmar",
        status: "Paid",
        remarks: "Downpayment for Paluwagan Lechon Plan."
      },
      {
        id: "pay-4",
        receiptNumber: "DPF-OR-20004",
        paymentDate: "2026-07-14",
        memberId: "DPF-PM-10002",
        memberName: "Grace Hopper",
        customerEmail: "grace.hopper@email.com",
        batchId: "pb-1",
        batchName: "Cohort Alpha",
        orderId: "ORD-102",
        installmentNumber: 1,
        amountDue: 2025,
        amountPaid: 1000,
        remainingBalanceAfter: 7100,
        paymentMethod: "Cash",
        collector: "Elena Delmar",
        status: "Partial Payment",
        remarks: "Short on cash, will settle remainder next week."
      },
      {
        id: "pay-5",
        receiptNumber: "DPF-OR-20005",
        paymentDate: "2026-07-17",
        memberId: "DPF-PM-10002",
        memberName: "Grace Hopper",
        customerEmail: "grace.hopper@email.com",
        batchId: "pb-1",
        batchName: "Cohort Alpha",
        orderId: "ORD-102",
        installmentNumber: 2,
        amountDue: 2025,
        amountPaid: 0,
        remainingBalanceAfter: 7100,
        paymentMethod: "Cash",
        collector: "Elena Delmar",
        status: "Overdue",
        remarks: "Installment past due."
      }
    ];
  });
  const [chatbotGuidelines, setChatbotGuidelines] = useState<string>("You are a friendly customer support agent for Savorlicious Food Services. Answer user questions about products, services, order statuses, and FAQs.");
  const [chatbotFaqs, setChatbotFaqs] = useState<ChatbotFAQ[]>([
    { q: "What are your delivery areas?", a: "We deliver regularly within Dumalinao and Zamboanga del Sur. Deliveries to nearby municipalities can be arranged with logistics fees." },
    { q: "How can I pay for my order?", a: "We accept GCash, Bank Transfer, and Cash On Delivery (COD)." },
    { q: "What is your return policy?", a: "Due to the perishable nature of fresh meat, returns are only accepted upon inspection at delivery. Live hogs can be replaced if health issues are verified within 24 hours of delivery." },
  ]);

  const [toast, setToast] = useState<{ title: string; message: string; type: "info" | "success" | "warning" } | null>(null);

  const showToast = (title: string, message: string, type: "info" | "success" | "warning" = "success") => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Load audit logs on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLogs = localStorage.getItem("delmar_audit_logs");
      if (savedLogs) {
        setAuditLogs(JSON.parse(savedLogs));
      } else {
        setAuditLogs(initialAuditLogs);
        localStorage.setItem("delmar_audit_logs", JSON.stringify(initialAuditLogs));
      }
    }
  }, []);

  const logAction = async (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      adminEmail: userEmail || "admin@delmarfarm.com"
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_audit_logs", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const router = useRouter();

  // Handle Session State Changes
  const handleSession = async (session: any) => {
    setIsLoading(true);
    if (!session) {
      if (typeof window !== "undefined") {
        const savedRememberMe = localStorage.getItem("delmar_remember_me");
        if (savedRememberMe === "admin") {
          setRoleState("admin");
          setUserName("Elena Delmar");
          setUserEmail("admin@delmarfarm.com");
          setUserId("admin-mock-id");
          setIsLoading(false);
          return;
        } else if (savedRememberMe === "customer") {
          setRoleState("customer");
          setUserName(localStorage.getItem("delmar_user_name") || "John Doe");
          setUserEmail(localStorage.getItem("delmar_user_email") || "john.doe@email.com");
          setUserPhone(localStorage.getItem("delmar_user_phone") || "09464544973");
          setUserAddress(localStorage.getItem("delmar_user_address") || "Purok Lapu-Lapu, Tickwas, Dumalinao, Zamboanga del Sur");
          setUserId("customer-mock-id");
          setIsLoading(false);
          return;
        }
      }
      setRoleState("guest");
      setUserName("Visitor");
      setUserEmail("visitor@delmarfarm.com");
      setUserPhone("N/A");
      setUserAddress("N/A");
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
        if (profile.role === "admin" && user.email === "admin@delmarfarm.com") {
          setRoleState("admin");
        } else {
          setRoleState("customer");
        }
      } else {
        // Fallback default
        setUserName(user.raw_user_metadata?.full_name || "Customer");
        if (user.email === "admin@delmarfarm.com") {
          setRoleState("admin");
        } else {
          setRoleState("customer");
        }
      }
    } catch {
      setUserName(user.raw_user_metadata?.full_name || "Customer");
      if (user.email === "admin@delmarfarm.com") {
        setRoleState("admin");
      } else {
        setRoleState("customer");
      }
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

  // Load mock data from localStorage (or fallback to initial static lists)
  const loadMockData = () => {
    if (typeof window !== "undefined") {
      const savedOrders = localStorage.getItem("delmar_orders");
      if (savedOrders) {
        try { setOrders(JSON.parse(savedOrders)); } catch {}
      } else {
        setOrders(initialOrders);
        localStorage.setItem("delmar_orders", JSON.stringify(initialOrders));
      }
      
      const savedReservations = localStorage.getItem("delmar_reservations");
      if (savedReservations) {
        try { setReservations(JSON.parse(savedReservations)); } catch {}
      } else {
        setReservations(initialReservations);
        localStorage.setItem("delmar_reservations", JSON.stringify(initialReservations));
      }

      const savedInventory = localStorage.getItem("delmar_inventory");
      if (savedInventory) {
        try { setInventory(JSON.parse(savedInventory)); } catch {}
      } else {
        setInventory(initialInventory);
        localStorage.setItem("delmar_inventory", JSON.stringify(initialInventory));
      }

      const savedInventoryLogs = localStorage.getItem("delmar_inventory_logs");
      if (savedInventoryLogs) {
        try { setInventoryLogs(JSON.parse(savedInventoryLogs)); } catch {}
      } else {
        setInventoryLogs(initialLogs);
        localStorage.setItem("delmar_inventory_logs", JSON.stringify(initialLogs));
      }

      const savedNotifications = localStorage.getItem("delmar_notifications");
      if (savedNotifications) {
        try { setNotifications(JSON.parse(savedNotifications)); } catch {}
      } else {
        setNotifications(initialNotifications);
        localStorage.setItem("delmar_notifications", JSON.stringify(initialNotifications));
      }

      const savedBatches = localStorage.getItem("delmar_batches");
      if (savedBatches) {
        try { setBatches(JSON.parse(savedBatches)); } catch {}
      } else {
        setBatches(initialBatches);
        localStorage.setItem("delmar_batches", JSON.stringify(initialBatches));
      }

      const savedMembers = localStorage.getItem("delmar_members");
      if (savedMembers) {
        try { setMembers(JSON.parse(savedMembers)); } catch {}
      } else {
        setMembers(initialMembers);
        localStorage.setItem("delmar_members", JSON.stringify(initialMembers));
      }

      const savedMemberPayments = localStorage.getItem("delmar_member_payments");
      if (savedMemberPayments) {
        try { setMemberPayments(JSON.parse(savedMemberPayments)); } catch {}
      } else {
        setMemberPayments(initialMemberPayments);
        localStorage.setItem("delmar_member_payments", JSON.stringify(initialMemberPayments));
      }

      const savedPaluwaganBatches = localStorage.getItem("savorlicious_paluwagan_batches");
      if (savedPaluwaganBatches) {
        try { setPaluwaganBatches(JSON.parse(savedPaluwaganBatches)); } catch {}
      } else {
        setPaluwaganBatches(initialPaluwaganBatches);
        localStorage.setItem("savorlicious_paluwagan_batches", JSON.stringify(initialPaluwaganBatches));
      }

      const savedCustomers = localStorage.getItem("delmar_customers");
      if (savedCustomers) {
        try { setCustomers(JSON.parse(savedCustomers)); } catch {}
      } else {
        setCustomers(initialCustomers);
        localStorage.setItem("delmar_customers", JSON.stringify(initialCustomers));
      }

      const savedCart = localStorage.getItem("delmar_cart");
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch {}
      }

      const savedGuidelines = localStorage.getItem("chatbot_guidelines");
      if (savedGuidelines) {
        setChatbotGuidelines(savedGuidelines);
      }

      const savedFaqs = localStorage.getItem("chatbot_faqs");
      if (savedFaqs) {
        try { setChatbotFaqs(JSON.parse(savedFaqs)); } catch {}
      }
    }
  };

  // Hydrate client-only state on mount and register listeners
  useEffect(() => {
    loadMockData();

    // Cross-tab real-time storage listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "delmar_orders" && e.newValue) {
        try { setOrders(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "delmar_reservations" && e.newValue) {
        try { setReservations(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "delmar_inventory" && e.newValue) {
        try { setInventory(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "delmar_inventory_logs" && e.newValue) {
        try { setInventoryLogs(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "delmar_notifications" && e.newValue) {
        try { setNotifications(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "delmar_members" && e.newValue) {
        try { setMembers(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "delmar_member_payments" && e.newValue) {
        try { setMemberPayments(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "delmar_batches" && e.newValue) {
        try { setBatches(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "savorlicious_paluwagan_batches" && e.newValue) {
        try { setPaluwaganBatches(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "delmar_customers" && e.newValue) {
        try { setCustomers(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "delmar_user_name" && e.newValue) {
        setUserName(e.newValue);
      }
      if (e.key === "delmar_user_email" && e.newValue) {
        setUserEmail(e.newValue);
      }
      if (e.key === "delmar_user_phone" && e.newValue) {
        setUserPhone(e.newValue);
      }
      if (e.key === "delmar_user_address" && e.newValue) {
        setUserAddress(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Observers to automatically synchronize in-memory state modifications to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("delmar_orders", JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("delmar_reservations", JSON.stringify(reservations));
    }
  }, [reservations]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("delmar_inventory", JSON.stringify(inventory));
    }
  }, [inventory]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("delmar_inventory_logs", JSON.stringify(inventoryLogs));
    }
  }, [inventoryLogs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("delmar_notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("delmar_batches", JSON.stringify(batches));
    }
  }, [batches]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("delmar_members", JSON.stringify(members));
    }
  }, [members]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("delmar_member_payments", JSON.stringify(memberPayments));
    }
  }, [memberPayments]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("delmar_customers", JSON.stringify(customers));
    }
  }, [customers]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("savorlicious_paluwagan_batches", JSON.stringify(paluwaganBatches));
    }
  }, [paluwaganBatches]);

  // Fetch data dynamically on role updates
  useEffect(() => {
    if (isSupabasePlaceholder) {
      loadMockData();
      return;
    }

    if (role === "guest") {
      setInventory(initialInventory);
      setInventoryLogs(initialLogs);
      setReservations(initialReservations);
      setOrders(initialOrders);
      setBatches(initialBatches);
      setMembers(initialMembers);
      setMemberPayments(initialMemberPayments);
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
            product: o.order_items?.map((item: any) => item.name).join(", ") || "Fresh Pork Meat",
            quantity: o.order_items?.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0) || 1,
            orderType: (o.order_type as OrderType) || "Cash",
            totalAmount: o.total_amount,
            paymentStatus: o.payment_status || "Pending",
            status: o.status || "Pending",
            dateCreated: o.order_date || o.created_at || new Date().toISOString().split("T")[0],
            deliveryOrPickup: o.delivery_or_pickup || "Pickup",
            paymentMethod: o.payment_method || "Cash",
            reservationDate: o.reservation_date || undefined,
            pickupDate: o.pickup_date || undefined,
            deliveryDate: o.delivery_date || undefined,
            deliveryAddress: o.delivery_address || undefined,
            eventType: o.event_type || undefined,
            specialInstructions: o.special_instructions || undefined,
            downPayment: o.down_payment || undefined,
            remainingBalance: o.remaining_balance || undefined,
            installmentAmount: o.installment_amount || undefined,
            numberOfPayments: o.number_of_payments || undefined,
            paymentSchedule: o.payment_schedule || undefined,
            nextDueDate: o.next_due_date || undefined,
            installmentsLog: o.installments_log || undefined,
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

        // 5. Fetch Member and Payment Management tables (Admin Only)
        if (role === "admin") {
          const { data: bData } = await supabase.from("batches").select("*").order("created_at", { ascending: false });
          if (bData) {
            setBatches(bData.map(b => ({
              id: b.id,
              name: b.name,
              totalDue: Number(b.total_due),
              status: b.status as any,
              createdAt: b.created_at,
            })));
          }

          const { data: mData } = await supabase.from("members").select("*").order("created_at", { ascending: false });
          if (mData) {
            setMembers(mData.map(m => ({
              id: m.id,
              memberId: m.member_id,
              fullName: m.full_name,
              contactNumber: m.contact_number,
              email: m.email,
              address: m.address,
              dateRegistered: m.date_registered,
              membershipStatus: m.membership_status as any,
              batchId: m.batch_id || undefined,
              totalDue: Number(m.total_due),
              notes: m.notes || undefined,
              createdAt: m.created_at,
            })));
          }

          const { data: mpData } = await supabase.from("member_payments").select("*").order("created_at", { ascending: false });
          if (mpData) {
            setMemberPayments(mpData.map(p => ({
              id: p.id,
              receiptNumber: p.receipt_number,
              memberId: p.member_id,
              batchId: p.batch_id || undefined,
              paymentDate: p.payment_date,
              paymentMethod: p.payment_method,
              amountPaid: Number(p.amount_paid),
              collector: p.collector,
              remarks: p.remarks || undefined,
              createdAt: p.created_at,
            })));
          }
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
      setUserPhone("0915 765 4321");
      setUserAddress("Savorlicious Food Services Headquarters, Dumalinao, Zamboanga del Sur");
      router.push("/admin/dashboard");
    } else {
      if (typeof window !== "undefined") {
        setUserName(localStorage.getItem("delmar_user_name") || "John Doe");
        setUserEmail(localStorage.getItem("delmar_user_email") || "john.doe@email.com");
        setUserPhone(localStorage.getItem("delmar_user_phone") || "09464544973");
        setUserAddress(localStorage.getItem("delmar_user_address") || "Purok Lapu-Lapu, Tickwas, Dumalinao, Zamboanga del Sur");
      } else {
        setUserName("John Doe");
        setUserEmail("john.doe@email.com");
        setUserPhone("09464544973");
        setUserAddress("Purok Lapu-Lapu, Tickwas, Dumalinao, Zamboanga del Sur");
      }
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
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    const itemName = order.product;
    const quantity = order.quantity || 1;
    let matchedItem = inventory.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(i.name.toLowerCase()));
    
    if (matchedItem) {
      await updateStockLevel(
        matchedItem.id, 
        -quantity, 
        "Sale", 
        `Auto-decrement from completed order ${order.id} (${itemName})`
      );
    }
  };

  const addReservation = async (res: Omit<Reservation, "id" | "customerName" | "customerEmail" | "reservationDate" | "status"> & { orderType?: OrderType; batchId?: string }): Promise<boolean> => {
    try {
      if (!userId) throw new Error("No user logged in");
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

      // Determine product description
      let productDesc = res.category as string;
      if (res.category === "Piglets") {
        productDesc = `Weanling Piglets`;
      } else if (res.category === "Fattening Pigs") {
        productDesc = "Fattening Hogs";
      } else if (res.category === "Crispylicious Lechon") {
        productDesc = `Crispy Lechon`;
      } else if (res.category === "Catering Services") {
        productDesc = `Catering Service / Dessert Package`;
      }

      const isPaluwagan = res.orderType === "Paluwagan";
      const dp = isPaluwagan ? res.price * 0.25 : undefined;
      const rem = isPaluwagan ? res.price - (res.price * 0.25) : undefined;

      await addOrder({
        product: productDesc,
        quantity: res.quantity,
        orderType: res.orderType || "Reservation",
        totalAmount: res.price,
        reservationDate: new Date().toISOString().split("T")[0],
        pickupDate: res.pickupDate,
        deliveryOrPickup: "Pickup",
        paymentMethod: res.orderType === "Cash" ? "Cash" : "Bank Transfer",
        deliveryAddress: userAddress || "",
        batchId: res.batchId,
        downPayment: dp,
        remainingBalance: rem,
        installmentAmount: isPaluwagan && rem !== undefined ? rem / 4 : undefined,
        numberOfPayments: isPaluwagan ? 4 : undefined,
        paymentSchedule: isPaluwagan ? "Bi-Weekly" : undefined,
      });

      simulateEmail(userEmail, "Reservation Received", `Your reservation request for ${res.category} (Qty: ${res.quantity}) was successfully logged.`, "reservation");
      simulateEmail("admin@delmarfarm.com", "New Reservation Alert", `Customer ${userName} placed a new reservation for ${res.category}.`, "reservation");
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

      // Determine product description
      let productDesc = res.category as string;
      if (res.category === "Piglets") {
        productDesc = `Weanling Piglets`;
      } else if (res.category === "Fattening Pigs") {
        productDesc = "Fattening Hogs";
      } else if (res.category === "Crispylicious Lechon") {
        productDesc = `Crispy Lechon`;
      } else if (res.category === "Catering Services") {
        productDesc = `Catering Service / Dessert Package`;
      }

      const isPaluwagan = res.orderType === "Paluwagan";
      const dp = isPaluwagan ? res.price * 0.25 : undefined;
      const rem = isPaluwagan ? res.price - (res.price * 0.25) : undefined;

      await addOrder({
        product: productDesc,
        quantity: res.quantity,
        orderType: res.orderType || "Reservation",
        totalAmount: res.price,
        reservationDate: new Date().toISOString().split("T")[0],
        pickupDate: res.pickupDate,
        deliveryOrPickup: "Pickup",
        paymentMethod: res.orderType === "Cash" ? "Cash" : "Bank Transfer",
        deliveryAddress: userAddress || "",
        batchId: res.batchId,
        downPayment: dp,
        remainingBalance: rem,
        installmentAmount: isPaluwagan && rem !== undefined ? rem / 4 : undefined,
        numberOfPayments: isPaluwagan ? 4 : undefined,
        paymentSchedule: isPaluwagan ? "Bi-Weekly" : undefined,
      });

      simulateEmail(userEmail, "Reservation Received", `Your reservation request for ${res.category} (Qty: ${res.quantity}) was successfully logged.`, "reservation");
      simulateEmail("admin@delmarfarm.com", "New Reservation Alert", `Customer ${userName} placed a new reservation for ${res.category}.`, "reservation");
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
      
      const rObj = reservations.find(item => item.id === id);
      if (rObj) {
        simulateEmail(rObj.customerEmail, `Reservation Status: ${status}`, `Your reservation booking request (ID: ${id}) status has been updated to ${status}.`, "reservation");
      }
      return true;
    } catch {
      setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
      const rObj = reservations.find(item => item.id === id);
      if (rObj) {
        simulateEmail(rObj.customerEmail, `Reservation Status: ${status}`, `Your reservation booking request (ID: ${id}) status has been updated to ${status}.`, "reservation");
      }
      return true;
    }
  };

  const addOrder = async (order: Omit<Order, "id" | "customerName" | "customerEmail" | "dateCreated" | "status" | "paymentStatus">): Promise<boolean> => {
    try {
      if (!userId) throw new Error("No user logged in");
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
        product: order.product,
        quantity: order.quantity,
        orderType: order.orderType,
        totalAmount: data.total_amount,
        dateCreated: data.order_date || new Date().toISOString().split("T")[0],
        status: data.status || "Pending",
        paymentStatus: data.payment_status || "Pending",
        deliveryOrPickup: order.deliveryOrPickup,
        paymentMethod: order.paymentMethod,
        reservationDate: order.reservationDate,
        pickupDate: order.pickupDate,
        deliveryDate: order.deliveryDate,
        deliveryAddress: order.deliveryAddress,
        eventType: order.eventType,
        specialInstructions: order.specialInstructions,
        downPayment: order.downPayment,
        remainingBalance: order.remainingBalance,
        installmentAmount: order.installmentAmount,
        numberOfPayments: order.numberOfPayments,
        paymentSchedule: order.paymentSchedule,
        nextDueDate: order.nextDueDate,
        installmentsLog: order.installmentsLog,
        batchId: order.batchId,
        paluwaganSchedule: order.paluwaganSchedule,
      };

      setOrders([newOrder, ...orders]);
      simulateEmail(userEmail, "Order Received Confirmation", `Your order for ${order.product} (Qty: ${order.quantity}) has been successfully received.`, "order");
      simulateEmail("admin@delmarfarm.com", "New Order Submitted", `Customer ${userName} has submitted a new order for ${order.product}.`, "order");
      return true;
    } catch {
      const fallbackOrder: Order = {
        ...order,
        id: `ORD-${Math.floor(9000 + Math.random() * 999)}`,
        customerName: userName,
        customerEmail: userEmail,
        dateCreated: new Date().toISOString().split("T")[0],
        status: "Pending",
        paymentStatus: "Pending",
      };
      setOrders([fallbackOrder, ...orders]);
      simulateEmail(userEmail, "Order Received Confirmation", `Your order for ${order.product} (Qty: ${order.quantity}) has been successfully received.`, "order");
      simulateEmail("admin@delmarfarm.com", "New Order Submitted", `Customer ${userName} has submitted a new order for ${order.product}.`, "order");
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

      setOrders(orders.map(o => {
        if (o.id === id) {
          const nextStatus = status;
          let schedule = o.paluwaganSchedule;
          let remBal = o.remainingBalance;
          let nextDueDate = o.nextDueDate;

          if (nextStatus === "Approved" && o.orderType === "Paluwagan" && !schedule) {
            const down = o.downPayment || Math.round(o.totalAmount * 0.25);
            const batchObj = paluwaganBatches.find(b => b.id === o.batchId);
            const bStart = batchObj?.startDate || o.dateCreated || new Date().toISOString().split("T")[0];
            const bDur = batchObj?.durationMonths || 8;
            
            const generated = generateFixedBatchSchedule(bStart, bDur, o.totalAmount, down);
            schedule = generated;
            remBal = Math.max(0, o.totalAmount - down);
            nextDueDate = generated.find(i => i.status === "UPCOMING" || i.status === "DUE" || i.status === "OVERDUE")?.dueDate;
          }

          return {
            ...o,
            status: nextStatus,
            paymentStatus: paymentStatus || o.paymentStatus,
            paluwaganSchedule: schedule,
            remainingBalance: remBal,
            nextDueDate
          };
        }
        return o;
      }));

      if (isTransitionToDelivered && order) {
        await handleAutoDecrementForOrder(order);
      }

      const ordObj = orders.find(o => o.id === id);
      if (ordObj) {
        const s = status as any;
        if (s === "Approved") {
          simulateEmail(ordObj.customerEmail, "Order Approved", `Your order (ID: ${id}) has been APPROVED and is now in preparation.`, "order");
        } else if (s === "Completed") {
          simulateEmail(ordObj.customerEmail, "Order Completed", `Thank you for your business! Your order (ID: ${id}) has been marked as COMPLETED.`, "order");
        } else if (s === "Out for Delivery") {
          simulateEmail(ordObj.customerEmail, "Delivery Scheduled / Out for Delivery", `Your order (ID: ${id}) has been dispatched with driver/courier.`, "order");
        } else {
          simulateEmail(ordObj.customerEmail, `Order Status Update: ${status}`, `Your order (ID: ${id}) status has been updated to ${status}.`, "order");
        }
      }

      return true;
    } catch {
      const order = orders.find(o => o.id === id);
      const isTransitionToDelivered = order && order.status !== "Delivered" && status === "Delivered";

      setOrders(orders.map(o => {
        if (o.id === id) {
          const nextStatus = status;
          let schedule = o.paluwaganSchedule;
          let remBal = o.remainingBalance;
          let nextDueDate = o.nextDueDate;

          if (nextStatus === "Approved" && o.orderType === "Paluwagan" && !schedule) {
            const matchedBatch = paluwaganBatches.find(b => b.id === o.batchId) || paluwaganBatches[0];
            const bStart = matchedBatch?.startDate || "2026-07-15";
            const bDuration = matchedBatch?.durationMonths || 8;
            const down = o.downPayment || Math.round(o.totalAmount * 0.25);
            
            schedule = generateFixedBatchSchedule(bStart, bDuration, o.totalAmount, down);
            remBal = Math.max(0, o.totalAmount - down);
            const nextItem = schedule.find(i => i.status === "UPCOMING" || i.status === "DUE" || i.status === "OVERDUE");
            nextDueDate = nextItem ? nextItem.dueDate : undefined;
          }

          return {
            ...o,
            status: nextStatus,
            paymentStatus: paymentStatus || o.paymentStatus,
            paluwaganSchedule: schedule,
            remainingBalance: remBal,
            nextDueDate
          };
        }
        return o;
      }));

      if (isTransitionToDelivered && order) {
        await handleAutoDecrementForOrder(order);
      }

      const ordObj = orders.find(o => o.id === id);
      if (ordObj) {
        const s = status as any;
        if (s === "Approved") {
          simulateEmail(ordObj.customerEmail, "Order Approved", `Your order (ID: ${id}) has been APPROVED and is now in preparation.`, "order");
        } else if (s === "Completed") {
          simulateEmail(ordObj.customerEmail, "Order Completed", `Thank you for your business! Your order (ID: ${id}) has been marked as COMPLETED.`, "order");
        } else if (s === "Out for Delivery") {
          simulateEmail(ordObj.customerEmail, "Delivery Scheduled / Out for Delivery", `Your order (ID: ${id}) has been dispatched with driver/courier.`, "order");
        } else {
          simulateEmail(ordObj.customerEmail, `Order Status Update: ${status}`, `Your order (ID: ${id}) status has been updated to ${status}.`, "order");
        }
      }

      return true;
    }
  };

  const updateOrder = async (id: string, updatedFields: Partial<Order>): Promise<boolean> => {
    try {
      setOrders(prevOrders => prevOrders.map(o => o.id === id ? { ...o, ...updatedFields } : o));
      return true;
    } catch (err) {
      console.warn("Update order failed:", err);
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

  // Member Management Actions
  const addBatch = async (batch: Omit<Batch, "id" | "status">): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("batches")
        .insert({
          name: batch.name,
          total_due: batch.totalDue,
          status: "Active"
        })
        .select()
        .single();
      if (error) throw error;
      const newBatch: Batch = {
        id: data.id,
        name: data.name,
        totalDue: Number(data.total_due),
        status: data.status as any,
        createdAt: data.created_at
      };
      const updatedBatches = [newBatch, ...batches];
      setBatches(updatedBatches);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_batches", JSON.stringify(updatedBatches));
      }
      return true;
    } catch (err) {
      console.warn("Supabase add batch failed, using fallback:", err);
      const newBatch: Batch = {
        ...batch,
        id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: "Active"
      };
      const updatedBatches = [newBatch, ...batches];
      setBatches(updatedBatches);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_batches", JSON.stringify(updatedBatches));
      }
      return true;
    }
  };

  const updateBatch = async (id: string, updatedBatch: Partial<Batch>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("batches")
        .update({
          name: updatedBatch.name,
          total_due: updatedBatch.totalDue,
          status: updatedBatch.status
        })
        .eq("id", id);
      if (error) throw error;
      const updatedBatches = batches.map(b => b.id === id ? { ...b, ...updatedBatch } : b);
      setBatches(updatedBatches);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_batches", JSON.stringify(updatedBatches));
      }
      return true;
    } catch (err) {
      console.warn("Supabase update batch failed, using fallback:", err);
      const updatedBatches = batches.map(b => b.id === id ? { ...b, ...updatedBatch } : b);
      setBatches(updatedBatches);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_batches", JSON.stringify(updatedBatches));
      }
      return true;
    }
  };

  const archiveBatch = async (id: string): Promise<boolean> => {
    return updateBatch(id, { status: "Archived" });
  };

  const addNotification = async (notif: { title: string; message: string; type: "order" | "reservation" | "system" }) => {
    showToast(notif.title, notif.message, notif.type === "system" ? "warning" : "success");
    try {
      const { data, error } = await supabase.from("notifications").insert({
        title: notif.title,
        message: notif.message,
        type: notif.type,
        read: false
      }).select().single();
      if (error) throw error;
      setNotifications(prev => [{
        id: data.id,
        title: data.title,
        message: data.message,
        timestamp: new Date(data.created_at).toLocaleDateString(),
        read: data.read,
        type: data.type
      }, ...prev]);
    } catch {
      const newNotif: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: notif.title,
        message: notif.message,
        timestamp: "Just now",
        read: false,
        type: notif.type
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const addMember = async (member: Omit<Member, "id" | "memberId" | "membershipStatus">): Promise<boolean> => {
    const nextNum = 10001 + members.length;
    const generatedId = `DPF-M-${nextNum}`;
    try {
      const { data, error } = await supabase
        .from("members")
        .insert({
          member_id: generatedId,
          full_name: member.fullName,
          contact_number: member.contactNumber,
          email: member.email,
          address: member.address,
          date_registered: member.dateRegistered,
          membership_status: "Active",
          batch_id: member.batchId || null,
          total_due: member.totalDue,
          notes: member.notes || null
        })
        .select()
        .single();
      if (error) throw error;
      const newMember: Member = {
        id: data.id,
        memberId: data.member_id,
        fullName: data.full_name,
        contactNumber: data.contact_number,
        email: data.email,
        address: data.address,
        dateRegistered: data.date_registered,
        membershipStatus: data.membership_status as any,
        batchId: data.batch_id || undefined,
        totalDue: Number(data.total_due),
        notes: data.notes || undefined,
        createdAt: data.created_at
      };
      const updatedMembers = [newMember, ...members];
      setMembers(updatedMembers);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_members", JSON.stringify(updatedMembers));
      }
      
      await addNotification({
        title: "New Member Registered",
        message: `Member ${newMember.fullName} (${newMember.memberId}) has been registered under ${
          batches.find(b => b.id === newMember.batchId)?.name || "No Batch"
        }.`,
        type: "system"
      });
      
      await logAction("REGISTER_MEMBER", `Registered member "${newMember.fullName}" (${newMember.memberId}) under ${
        batches.find(b => b.id === newMember.batchId)?.name || "No Batch"
      }`);
      return true;
    } catch (err) {
      console.warn("Supabase add member failed, using fallback:", err);
      const newMember: Member = {
        ...member,
        id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        memberId: generatedId,
        membershipStatus: "Active"
      };
      const updatedMembers = [newMember, ...members];
      setMembers(updatedMembers);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_members", JSON.stringify(updatedMembers));
      }

      await addNotification({
        title: "New Member Registered (Offline)",
        message: `Member ${newMember.fullName} (${newMember.memberId}) has been registered offline.`,
        type: "system"
      });

      await logAction("REGISTER_MEMBER", `Registered member "${newMember.fullName}" (${newMember.memberId}) offline`);
      return true;
    }
  };

  const updateMember = async (id: string, updatedMember: Partial<Member>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("members")
        .update({
          full_name: updatedMember.fullName,
          contact_number: updatedMember.contactNumber,
          email: updatedMember.email,
          address: updatedMember.address,
          date_registered: updatedMember.dateRegistered,
          membership_status: updatedMember.membershipStatus,
          batch_id: updatedMember.batchId === undefined ? undefined : (updatedMember.batchId || null),
          total_due: updatedMember.totalDue,
          notes: updatedMember.notes
        })
        .eq("id", id);
      if (error) throw error;
      const updatedMembers = members.map(m => m.id === id ? { ...m, ...updatedMember } : m);
      setMembers(updatedMembers);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_members", JSON.stringify(updatedMembers));
      }
      const memberObj = members.find(m => m.id === id);
      const mName = memberObj ? memberObj.fullName : id;
      if (updatedMember.membershipStatus === "Active") {
        await logAction("RESTORE_MEMBER", `Restored archived member "${mName}"`);
      } else if (updatedMember.membershipStatus === "Archived") {
        await logAction("ARCHIVE_MEMBER", `Archived member "${mName}"`);
      } else {
        await logAction("UPDATE_MEMBER", `Modified member details for "${mName}"`);
      }
      return true;
    } catch (err) {
      console.warn("Supabase update member failed, using fallback:", err);
      const updatedMembers = members.map(m => m.id === id ? { ...m, ...updatedMember } : m);
      setMembers(updatedMembers);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_members", JSON.stringify(updatedMembers));
      }
      const memberObj = members.find(m => m.id === id);
      const mName = memberObj ? memberObj.fullName : id;
      if (updatedMember.membershipStatus === "Active") {
        await logAction("RESTORE_MEMBER", `Restored archived member "${mName}" offline`);
      } else if (updatedMember.membershipStatus === "Archived") {
        await logAction("ARCHIVE_MEMBER", `Archived member "${mName}" offline`);
      } else {
        await logAction("UPDATE_MEMBER", `Modified member details for "${mName}" offline`);
      }
      return true;
    }
  };

  const archiveMember = async (id: string): Promise<boolean> => {
    return updateMember(id, { membershipStatus: "Archived" });
  };

  const restoreMember = async (id: string): Promise<boolean> => {
    return updateMember(id, { membershipStatus: "Active" });
  };

  const recordMemberPayment = async (payment: Omit<MemberPayment, "id" | "receiptNumber" | "paymentDate">): Promise<boolean> => {
    const nextRec = 20001 + memberPayments.length;
    const generatedReceipt = `REC-${nextRec}`;
    const todayStr = new Date().toISOString().split("T")[0];
    try {
      const { data, error } = await supabase
        .from("member_payments")
        .insert({
          receipt_number: generatedReceipt,
          member_id: payment.memberId,
          batch_id: payment.batchId || null,
          payment_date: todayStr,
          payment_method: payment.paymentMethod,
          amount_paid: payment.amountPaid,
          collector: payment.collector,
          remarks: payment.remarks || null
        })
        .select()
        .single();
      if (error) throw error;
      const newPayment: MemberPayment = {
        id: data.id,
        receiptNumber: data.receipt_number,
        memberId: data.member_id,
        batchId: data.batch_id || undefined,
        paymentDate: data.payment_date,
        paymentMethod: data.payment_method,
        amountPaid: Number(data.amount_paid),
        collector: data.collector,
        remarks: data.remarks || undefined,
        createdAt: data.created_at
      };
      
      const updatedPayments = [newPayment, ...memberPayments];
      setMemberPayments(updatedPayments);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_member_payments", JSON.stringify(updatedPayments));
      }

      const memberObj = members.find(m => m.id === payment.memberId);
      if (memberObj) {
        const totalPaidForMember = updatedPayments
          .filter(p => p.memberId === memberObj.id)
          .reduce((sum, p) => sum + p.amountPaid, 0);
        const remBal = memberObj.totalDue - totalPaidForMember;
        
        await addNotification({
          title: "Payment Recorded",
          message: `Received ₱${payment.amountPaid.toLocaleString()} from ${memberObj.fullName}. Remaining Balance: ₱${remBal.toLocaleString()}.`,
          type: "system"
        });

        if (remBal > 0) {
          await addNotification({
            title: "Outstanding Balance Due",
            message: `${memberObj.fullName} has an outstanding balance of ₱${remBal.toLocaleString()}.`,
            type: "system"
          });
        }

        simulateEmail(memberObj.email, "Payment Recorded", `We have recorded your payment of ₱${payment.amountPaid.toLocaleString()} for Receipt: ${generatedReceipt}. Remaining Balance: ₱${remBal.toLocaleString()}.`, "system");
        simulateEmail("admin@delmarfarm.com", "Payment Submitted", `A ledger payment of ₱${payment.amountPaid.toLocaleString()} has been recorded for ${memberObj.fullName}.`, "system");

        if (memberObj.batchId) {
          const batchMembers = members.filter(m => m.batchId === memberObj.batchId && m.membershipStatus !== "Archived");
          const allPaid = batchMembers.every(m => {
            const mPaid = updatedPayments
              .filter(p => p.memberId === m.id)
              .reduce((sum, p) => sum + p.amountPaid, 0);
            return m.totalDue - mPaid <= 0;
          });
          if (allPaid && batchMembers.length > 0) {
            const batchObj = batches.find(b => b.id === memberObj.batchId);
            await addNotification({
              title: "Batch Completed",
              message: `All members in ${batchObj?.name || "the batch"} are now fully paid.`,
              type: "system"
            });
          }
        }
      }

      const mName = memberObj ? memberObj.fullName : payment.memberId;
      await logAction("RECORD_PAYMENT", `Recorded collection payment of ₱${payment.amountPaid.toLocaleString()} for member "${mName}" via ${payment.paymentMethod}`);
      return true;
    } catch (err) {
      console.warn("Supabase record payment failed, using fallback:", err);
      const newPayment: MemberPayment = {
        ...payment,
        id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        receiptNumber: generatedReceipt,
        paymentDate: todayStr
      };
      
      const updatedPayments = [newPayment, ...memberPayments];
      setMemberPayments(updatedPayments);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_member_payments", JSON.stringify(updatedPayments));
      }

      const memberObj = members.find(m => m.id === payment.memberId);
      if (memberObj) {
        const totalPaidForMember = updatedPayments
          .filter(p => p.memberId === memberObj.id)
          .reduce((sum, p) => sum + p.amountPaid, 0);
        const remBal = memberObj.totalDue - totalPaidForMember;

        await addNotification({
          title: "Payment Recorded (Offline)",
          message: `Received ₱${payment.amountPaid.toLocaleString()} from ${memberObj.fullName}. Remaining Balance: ₱${remBal.toLocaleString()}.`,
          type: "system"
        });

        if (remBal > 0) {
          await addNotification({
            title: "Outstanding Balance Due (Offline)",
            message: `${memberObj.fullName} has an outstanding balance of ₱${remBal.toLocaleString()}.`,
            type: "system"
          });
        }

        simulateEmail(memberObj.email, "Payment Recorded", `We have recorded your payment of ₱${payment.amountPaid.toLocaleString()} for Receipt: ${generatedReceipt}. Remaining Balance: ₱${remBal.toLocaleString()}.`, "system");
        simulateEmail("admin@delmarfarm.com", "Payment Submitted", `A ledger payment of ₱${payment.amountPaid.toLocaleString()} has been recorded for ${memberObj.fullName}.`, "system");

        if (memberObj.batchId) {
          const batchMembers = members.filter(m => m.batchId === memberObj.batchId && m.membershipStatus !== "Archived");
          const allPaid = batchMembers.every(m => {
            const mPaid = updatedPayments
              .filter(p => p.memberId === m.id)
              .reduce((sum, p) => sum + p.amountPaid, 0);
            return m.totalDue - mPaid <= 0;
          });
          if (allPaid && batchMembers.length > 0) {
            const batchObj = batches.find(b => b.id === memberObj.batchId);
            await addNotification({
              title: "Batch Completed (Offline)",
              message: `All members in ${batchObj?.name || "the batch"} are now fully paid.`,
              type: "system"
            });
          }
        }
      }
      const mName = memberObj ? memberObj.fullName : payment.memberId;
      await logAction("RECORD_PAYMENT", `Recorded collection payment of ₱${payment.amountPaid.toLocaleString()} for member "${mName}" offline via ${payment.paymentMethod}`);
      return true;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoleState("guest");
    setUserId(null);
    setUserEmail("visitor@delmarfarm.com");
    setUserName("Visitor");
    if (typeof window !== "undefined") {
      localStorage.removeItem("delmar_remember_me");
      localStorage.removeItem("delmar_admin_session_start");
    }
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

  const addPaluwaganBatch = async (batch: Omit<PaluwaganBatch, "id" | "status" | "endDate"> & { durationMonths?: 8 | 12; endDate?: string }): Promise<boolean> => {
    const durationMonths = batch.durationMonths || 8;
    const endDate = batch.endDate || calculateBatchEndDate(batch.startDate, durationMonths);
    const newBatch: PaluwaganBatch = {
      ...batch,
      durationMonths,
      endDate,
      id: `pb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "Active"
    };
    const updated = [newBatch, ...paluwaganBatches];
    setPaluwaganBatches(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("savorlicious_paluwagan_batches", JSON.stringify(updated));
    }
    await logAction("CREATE_PALUWAGAN_BATCH", `Created Paluwagan Batch "${newBatch.name}" starting ${newBatch.startDate} (${durationMonths} Months, End: ${endDate})`);
    return true;
  };

  const updatePaluwaganBatch = async (id: string, fields: Partial<PaluwaganBatch>): Promise<boolean> => {
    const updated = paluwaganBatches.map(b => b.id === id ? { ...b, ...fields } : b);
    setPaluwaganBatches(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("savorlicious_paluwagan_batches", JSON.stringify(updated));
    }
    await logAction("UPDATE_PALUWAGAN_BATCH", `Updated Paluwagan Batch details for ID: ${id}`);
    return true;
  };

  const recordPaluwaganPayment = async (
    orderId: string,
    installmentNumber: number,
    payment: { paymentDate: string, amountPaid: number, collector: string, receiptNumber: string, remarks?: string }
  ): Promise<boolean> => {
    let orderName = orderId;
    let newRem = 0;
    
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        orderName = o.customerName;
        
        // Update schedule
        const updatedSchedule = o.paluwaganSchedule?.map(item => {
          if (item.installmentNumber === installmentNumber) {
            return {
              ...item,
              amountPaid: payment.amountPaid,
              status: "PAID" as const,
              paymentDate: payment.paymentDate,
              receiptNumber: payment.receiptNumber,
              collector: payment.collector,
              remarks: payment.remarks
            };
          }
          return item;
        }) || [];

        // Compute total paid
        const schedulePaid = updatedSchedule.reduce((sum, item) => sum + item.amountPaid, 0);
        const totalPaid = (o.downPayment || 0) + schedulePaid;
        const remaining = Math.max(0, o.totalAmount - totalPaid);
        newRem = remaining;

        // Installments logs
        const newInstallmentLog: PaluwaganInstallment = {
          date: payment.paymentDate,
          amount: payment.amountPaid,
          remarks: `${payment.receiptNumber} - ${payment.remarks || "Installment payment"}`
        };
        const updatedLogs = [...(o.installmentsLog || []), newInstallmentLog];

        // Find next due date
        const nextDueItem = updatedSchedule.find(i => i.status === "UPCOMING" || i.status === "DUE" || i.status === "OVERDUE");
        const nextDue = nextDueItem ? nextDueItem.dueDate : undefined;

        // Payment status transition
        const payStatus = remaining <= 0 ? ("Paid" as const) : ("Partially Paid" as const);
        const orderStatus = remaining <= 0 ? ("Completed" as const) : o.status;

        return {
          ...o,
          paluwaganSchedule: updatedSchedule,
          remainingBalance: remaining,
          installmentsLog: updatedLogs,
          nextDueDate: nextDue,
          paymentStatus: payStatus,
          status: orderStatus
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    
    // Add system notification
    await addNotification({
      title: "Paluwagan Payment Recorded",
      message: `Recorded payment of ₱${payment.amountPaid.toLocaleString()} for ${orderName}. Remaining: ₱${newRem.toLocaleString()}.`,
      type: "system"
    });

    const oObj = orders.find(item => item.id === orderId);
    if (oObj) {
      simulateEmail(oObj.customerEmail, "Payment Recorded", `We have recorded your installment payment of ₱${payment.amountPaid.toLocaleString()} for Paluwagan Order ID: ${orderId}. Receipt: ${payment.receiptNumber}. Remaining Balance: ₱${newRem.toLocaleString()}.`, "order");
      simulateEmail("admin@delmarfarm.com", "Payment Submitted", `Customer ${orderName} has submitted an installment payment of ₱${payment.amountPaid.toLocaleString()} for Paluwagan Order ID: ${orderId}.`, "order");
    }

    await logAction("RECORD_PALUWAGAN_PAYMENT", `Recorded Paluwagan installment payment for "${orderName}" (Order: ${orderId})`);
    return true;
  };

  const submitPaluwaganApplication = async (app: Omit<PaluwaganApplication, "id" | "status" | "dateSubmitted">): Promise<boolean> => {
    const newApp: PaluwaganApplication = {
      ...app,
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "Pending",
      dateSubmitted: new Date().toISOString().split("T")[0],
    };
    const updated = [...paluwaganApplications, newApp];
    setPaluwaganApplications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("savorlicious_paluwagan_applications", JSON.stringify(updated));
    }
    
    // Automatically send an email confirming receipt of the application
    simulateEmail(app.customerEmail, "Paluwagan Application Received", `Hi ${app.fullName}, we have received your Paluwagan Membership application. It is currently under review.`, "system");
    await logAction("SUBMIT_PALUWAGAN_APP", `Customer "${app.fullName}" submitted Paluwagan application`);
    return true;
  };

  const approvePaluwaganApplication = async (id: string, batchId: string): Promise<boolean> => {
    const approvedCount = paluwaganApplications.filter(a => a.status === "Approved").length;
    const nextMemberNum = 10001 + approvedCount;
    const generatedMemberId = `DPF-PM-${nextMemberNum}`;

    const updated = paluwaganApplications.map(app => {
      if (app.id === id) {
        simulateEmail(app.customerEmail, "Paluwagan Membership Approved!", `Congratulations ${app.fullName}! Your Paluwagan Membership has been APPROVED. Your Member ID is ${generatedMemberId} and you have been assigned to batch ID: ${batchId}.`, "system");
        
        return {
          ...app,
          status: "Approved" as const,
          dateApproved: new Date().toISOString().split("T")[0],
          memberId: generatedMemberId,
          assignedBatchId: batchId
        };
      }
      return app;
    });

    setPaluwaganApplications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("savorlicious_paluwagan_applications", JSON.stringify(updated));
    }

    const appObj = paluwaganApplications.find(a => a.id === id);
    if (appObj) {
      await logAction("APPROVE_PALUWAGAN_APP", `Approved Paluwagan application for "${appObj.fullName}", assigned Member ID: ${generatedMemberId}`);
    }
    return true;
  };

  const rejectPaluwaganApplication = async (id: string, remarks: string, allowReapply: boolean = true): Promise<boolean> => {
    const updated = paluwaganApplications.map(app => {
      if (app.id === id) {
        simulateEmail(
          app.customerEmail,
          "Paluwagan Membership Application Status",
          `Dear ${app.fullName}, we regret to inform you that your Paluwagan Membership application was not approved.\n\nReason: ${remarks}\n\nReapplication allowed: ${allowReapply ? "Yes" : "No"}.\n\nIf allowed, you may submit a new application through your customer portal.`,
          "system"
        );
        
        return {
          ...app,
          status: "Rejected" as const,
          adminRemarks: remarks,
          allowReapply
        };
      }
      return app;
    });

    setPaluwaganApplications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("savorlicious_paluwagan_applications", JSON.stringify(updated));
    }

    const appObj = paluwaganApplications.find(a => a.id === id);
    if (appObj) {
      await logAction("REJECT_PALUWAGAN_APP", `Rejected Paluwagan application for "${appObj.fullName}" (Remarks: ${remarks})`);
    }
    return true;
  };

  const updatePaluwaganApplicationStatus = async (
    id: string,
    status: PaluwaganApplication["status"],
    remarks?: string
  ): Promise<boolean> => {
    const updated = paluwaganApplications.map(app => {
      if (app.id === id) {
        simulateEmail(
          app.customerEmail,
          `Paluwagan Membership Application Status: ${status}`,
          `Dear ${app.fullName}, your Paluwagan Membership application status has been updated to "${status}".${remarks ? `\n\nAdmin Remarks: ${remarks}` : ""}`,
          "system"
        );
        return {
          ...app,
          status,
          adminRemarks: remarks || app.adminRemarks,
        };
      }
      return app;
    });

    setPaluwaganApplications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("savorlicious_paluwagan_applications", JSON.stringify(updated));
    }
    await logAction("UPDATE_PALUWAGAN_APP_STATUS", `Updated status for application ID "${id}" to "${status}"`);
    return true;
  };

  const archivePaluwaganMembership = async (memberId: string): Promise<boolean> => {
    const updated = paluwaganApplications.map(app => {
      if (app.memberId === memberId) {
        return {
          ...app,
          status: "Rejected" as const,
          allowReapply: false,
          adminRemarks: "Membership archived by administrator."
        };
      }
      return app;
    });

    setPaluwaganApplications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("savorlicious_paluwagan_applications", JSON.stringify(updated));
    }

    await logAction("ARCHIVE_PALUWAGAN_MEMBER", `Archived Paluwagan Membership ID: ${memberId}`);
    return true;
  };

  const addLedgerPayment = async (entry: Omit<PaluwaganLedgerEntry, "id" | "receiptNumber" | "remainingBalanceAfter">): Promise<boolean> => {
    const generatedReceipt = `DPF-OR-${20000 + paluwaganLedger.length + 1}`;
    
    const orderObj = orders.find(o => o.id === entry.orderId);
    let totalAmt = orderObj ? orderObj.totalAmount : 10000;
    
    const totalPaidSoFar = paluwaganLedger
      .filter(p => p.orderId === entry.orderId && p.status !== "Voided")
      .reduce((sum, p) => sum + p.amountPaid, 0);
      
    const newRemainingBalance = Math.max(0, totalAmt - totalPaidSoFar - entry.amountPaid);

    const newEntry: PaluwaganLedgerEntry = {
      ...entry,
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      receiptNumber: generatedReceipt,
      remainingBalanceAfter: newRemainingBalance
    };

    const updatedLedger = [newEntry, ...paluwaganLedger];
    setPaluwaganLedger(updatedLedger);
    if (typeof window !== "undefined") {
      localStorage.setItem("savorlicious_paluwagan_ledger", JSON.stringify(updatedLedger));
    }

    const updatedOrders = orders.map(o => {
      if (o.id === entry.orderId) {
        let updatedSchedule = o.paluwaganSchedule;
        let downPayment = o.downPayment || 0;

        if (entry.installmentNumber === 0) {
          downPayment = entry.amountPaid;
        } else if (o.paluwaganSchedule) {
          updatedSchedule = o.paluwaganSchedule.map(item => {
            if (item.installmentNumber === entry.installmentNumber) {
              return {
                ...item,
                amountPaid: entry.amountPaid,
                status: (entry.status === "Paid" ? "Paid" : "Pending") as any,
                paymentDate: entry.paymentDate,
                receiptNumber: generatedReceipt,
                collector: entry.collector,
                remarks: entry.remarks
              };
            }
            return item;
          });
        }

        const schedPaid = updatedSchedule?.reduce((sum, item) => sum + item.amountPaid, 0) || 0;
        const totalPaidVal = downPayment + schedPaid;
        const remainingVal = Math.max(0, o.totalAmount - totalPaidVal);
        const nextDueItem = updatedSchedule?.find(item => item.status === "UPCOMING" || item.status === "DUE" || item.status === "OVERDUE");
        const nextDueStr = nextDueItem ? nextDueItem.dueDate : undefined;

        const payStatus = remainingVal <= 0 ? ("Paid" as const) : ("Partially Paid" as const);
        const orderStatus = remainingVal <= 0 ? ("Completed" as const) : o.status;

        const newLogItem = {
          date: entry.paymentDate,
          amount: entry.amountPaid,
          remarks: `${generatedReceipt} - Inst #${entry.installmentNumber}`
        };
        const updatedLogs = o.installmentsLog ? [...o.installmentsLog, newLogItem] : [newLogItem];

        return {
          ...o,
          downPayment,
          paluwaganSchedule: updatedSchedule,
          remainingBalance: remainingVal,
          installmentsLog: updatedLogs,
          nextDueDate: nextDueStr,
          paymentStatus: payStatus,
          status: orderStatus
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    if (typeof window !== "undefined") {
      localStorage.setItem("delmar_orders", JSON.stringify(updatedOrders));
    }

    await addNotification({
      title: "Ledger Payment Recorded",
      message: `Recorded collection of ₱${entry.amountPaid.toLocaleString()} (OR: ${generatedReceipt}) for ${entry.memberName}.`,
      type: "system"
    });

    simulateEmail(
      entry.customerEmail,
      "Official Payment Receipt",
      `Dear ${entry.memberName},\n\nWe have received your payment of ₱${entry.amountPaid.toLocaleString()} for installment #${entry.installmentNumber}.\n\nReceipt Number: ${generatedReceipt}\nRemaining Balance: ₱${newRemainingBalance.toLocaleString()}.\n\nThank you for choosing Delmar Farm!`,
      "system"
    );

    const logDetails = `Action: RECORD_PAYMENT | Member: ${entry.memberName} (${entry.memberId}) | Order: ${entry.orderId} | Installment: ${entry.installmentNumber} | Paid: ₱${entry.amountPaid} | Receipt: ${generatedReceipt}`;
    await logAction("PALUWAGAN_RECORD_PAYMENT", logDetails);

    return true;
  };

  const voidLedgerPayment = async (id: string, voidedBy: string): Promise<boolean> => {
    let affectedMember = "";
    let affectedReceipt = "";
    let prevDetailsStr = "";

    const updatedLedger = paluwaganLedger.map(entry => {
      if (entry.id === id) {
        affectedMember = entry.memberName;
        affectedReceipt = entry.receiptNumber;
        prevDetailsStr = `Status: ${entry.status}, Paid: ₱${entry.amountPaid}`;
        return {
          ...entry,
          status: "Voided" as const,
          remarks: `${entry.remarks ? entry.remarks + " | " : ""}Voided by ${voidedBy} on ${new Date().toISOString().split("T")[0]}`
        };
      }
      return entry;
    });

    setPaluwaganLedger(updatedLedger);
    if (typeof window !== "undefined") {
      localStorage.setItem("savorlicious_paluwagan_ledger", JSON.stringify(updatedLedger));
    }

    const voidedEntry = paluwaganLedger.find(e => e.id === id);
    if (voidedEntry) {
      const updatedOrders = orders.map(o => {
        if (o.id === voidedEntry.orderId) {
          let downPayment = o.downPayment || 0;
          let updatedSchedule = o.paluwaganSchedule;

          if (voidedEntry.installmentNumber === 0) {
            downPayment = 0;
          } else if (o.paluwaganSchedule) {
            updatedSchedule = o.paluwaganSchedule.map(item => {
              if (item.installmentNumber === voidedEntry.installmentNumber) {
                return {
                  ...item,
                  amountPaid: 0,
                  status: "UPCOMING" as const,
                  paymentDate: "",
                  receiptNumber: "",
                  collector: "",
                  remarks: ""
                };
              }
              return item;
            });
          }

          const schedPaid = updatedSchedule?.reduce((sum, item) => sum + item.amountPaid, 0) || 0;
          const totalPaidVal = downPayment + schedPaid;
          const remainingVal = Math.max(0, o.totalAmount - totalPaidVal);
          const nextDueItem = updatedSchedule?.find(item => item.status === "UPCOMING" || item.status === "DUE" || item.status === "OVERDUE");
          const nextDueStr = nextDueItem ? nextDueItem.dueDate : undefined;

          const updatedLogs = o.installmentsLog?.filter(log => !log.remarks?.includes(voidedEntry.receiptNumber)) || [];

          return {
            ...o,
            downPayment,
            paluwaganSchedule: updatedSchedule,
            remainingBalance: remainingVal,
            installmentsLog: updatedLogs,
            nextDueDate: nextDueStr,
            paymentStatus: "Partially Paid" as const,
            status: "Processing" as const
          };
        }
        return o;
      });

      setOrders(updatedOrders);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_orders", JSON.stringify(updatedOrders));
      }

      simulateEmail(
        voidedEntry.customerEmail,
        "Paluwagan Payment Void Notice",
        `Dear ${voidedEntry.memberName},\n\nPlease be informed that your payment of ₱${voidedEntry.amountPaid.toLocaleString()} under Receipt: ${voidedEntry.receiptNumber} has been VOIDED by our administrator.\n\nYour remaining balance has been adjusted. Please contact customer support if you believe this was a mistake.`,
        "system"
      );
    }

    await addNotification({
      title: "Ledger Payment Voided",
      message: `Voided payment transaction OR: ${affectedReceipt} for ${affectedMember}.`,
      type: "system"
    });

    const logDetails = `Action: VOID_PAYMENT | Receipt: ${affectedReceipt} | Member: ${affectedMember} | Previous Value: [${prevDetailsStr}] | Updated Value: [Status: Voided] | Voided By: ${voidedBy}`;
    await logAction("PALUWAGAN_VOID_PAYMENT", logDetails);

    return true;
  };

  const correctLedgerPayment = async (
    id: string,
    updatedFields: Partial<PaluwaganLedgerEntry>,
    editedBy: string
  ): Promise<boolean> => {
    let affectedMember = "";
    let affectedReceipt = "";
    let prevDetailsStr = "";
    let updatedDetailsStr = "";

    const updatedLedger = paluwaganLedger.map(entry => {
      if (entry.id === id) {
        affectedMember = entry.memberName;
        affectedReceipt = entry.receiptNumber;
        prevDetailsStr = `AmountPaid: ₱${entry.amountPaid}, Method: ${entry.paymentMethod}, Status: ${entry.status}`;
        updatedDetailsStr = `AmountPaid: ₱${updatedFields.amountPaid ?? entry.amountPaid}, Method: ${updatedFields.paymentMethod ?? entry.paymentMethod}, Status: ${updatedFields.status ?? entry.status}`;
        
        return {
          ...entry,
          ...updatedFields,
          remarks: `${updatedFields.remarks ?? entry.remarks} (Edited by ${editedBy})`
        };
      }
      return entry;
    });

    setPaluwaganLedger(updatedLedger);
    if (typeof window !== "undefined") {
      localStorage.setItem("savorlicious_paluwagan_ledger", JSON.stringify(updatedLedger));
    }

    const correctedEntry = updatedLedger.find(e => e.id === id);
    if (correctedEntry) {
      const updatedOrders = orders.map(o => {
        if (o.id === correctedEntry.orderId) {
          let downPayment = o.downPayment || 0;
          let updatedSchedule = o.paluwaganSchedule;

          if (correctedEntry.installmentNumber === 0) {
            downPayment = correctedEntry.amountPaid;
          } else if (o.paluwaganSchedule) {
            updatedSchedule = o.paluwaganSchedule.map(item => {
              if (item.installmentNumber === correctedEntry.installmentNumber) {
                return {
                  ...item,
                  amountPaid: correctedEntry.amountPaid,
                  status: (correctedEntry.status === "Paid" ? "Paid" : "Pending") as any,
                  paymentDate: correctedEntry.paymentDate,
                  paymentMethod: correctedEntry.paymentMethod,
                  collector: correctedEntry.collector,
                  remarks: correctedEntry.remarks
                };
              }
              return item;
            });
          }

          const schedPaid = updatedSchedule?.reduce((sum, item) => sum + item.amountPaid, 0) || 0;
          const totalPaidVal = downPayment + schedPaid;
          const remainingVal = Math.max(0, o.totalAmount - totalPaidVal);
          const nextDueItem = updatedSchedule?.find(item => item.status === "UPCOMING" || item.status === "DUE" || item.status === "OVERDUE");
          const nextDueStr = nextDueItem ? nextDueItem.dueDate : undefined;

          const updatedLogs = o.installmentsLog?.map(log => {
            if (log.remarks?.includes(correctedEntry.receiptNumber)) {
              return {
                ...log,
                date: correctedEntry.paymentDate,
                amount: correctedEntry.amountPaid
              };
            }
            return log;
          }) || [];

          return {
            ...o,
            downPayment,
            paluwaganSchedule: updatedSchedule,
            remainingBalance: remainingVal,
            installmentsLog: updatedLogs,
            nextDueDate: nextDueStr,
            paymentStatus: remainingVal <= 0 ? ("Paid" as const) : ("Partially Paid" as const)
          };
        }
        return o;
      });

      setOrders(updatedOrders);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_orders", JSON.stringify(updatedOrders));
      }

      simulateEmail(
        correctedEntry.customerEmail,
        "Paluwagan Payment Adjustment Notice",
        `Dear ${correctedEntry.memberName},\n\nPlease be informed that your payment transaction under Receipt: ${correctedEntry.receiptNumber} has been CORRECTED by our administrator.\n\nNew Payment Details: ₱${correctedEntry.amountPaid.toLocaleString()} | Date: ${correctedEntry.paymentDate}.\nYour remaining balance has been updated.`,
        "system"
      );
    }

    await addNotification({
      title: "Ledger Payment Corrected",
      message: `Adjusted payment transaction details OR: ${affectedReceipt} for ${affectedMember}.`,
      type: "system"
    });

    const logDetails = `Action: CORRECT_PAYMENT | Receipt: ${affectedReceipt} | Member: ${affectedMember} | Previous Value: [${prevDetailsStr}] | Updated Value: [${updatedDetailsStr}] | Corrected By: ${editedBy}`;
    await logAction("PALUWAGAN_CORRECT_PAYMENT", logDetails);

    return true;
  };

  // Automated Watcher Effect for Paluwagan Overdues & Email dispatch reminders
  useEffect(() => {
    if (orders.length === 0) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const today = new Date(todayStr);
    let hasChanges = false;

    const nextOrders = orders.map(order => {
      if (order.orderType === "Paluwagan" && order.paluwaganSchedule) {
        let orderChanged = false;
        const updatedSchedule = order.paluwaganSchedule.map(item => {
          const dueDate = new Date(item.dueDate);

          // 1. Mark Overdue if past due and status is UPCOMING or DUE
          if ((item.status === "UPCOMING" || item.status === "DUE") && dueDate < today) {
            orderChanged = true;
            hasChanges = true;
            return { ...item, status: "OVERDUE" as const };
          }

          // 2. Dispatch reminder exactly 2 days before
          const timeDiff = dueDate.getTime() - today.getTime();
          const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
          if ((item.status === "UPCOMING" || item.status === "DUE") && daysDiff === 2 && !item.remarks?.includes("Reminder Sent")) {
            orderChanged = true;
            hasChanges = true;

            // Trigger alert notification
            addNotification({
              title: "Email Reminder Dispatched",
              message: `Simulated notification sent to ${order.customerName} for payment due in 2 days (₱${item.amountDue.toLocaleString()}).`,
              type: "system"
            });

            return {
              ...item,
              remarks: (item.remarks ? item.remarks + " | " : "") + "Reminder Sent"
            };
          }

          return item;
        });

        if (orderChanged) {
          const hasOverdue = updatedSchedule.some(i => i.status === "OVERDUE");
          const nextDueItem = updatedSchedule.find(i => i.status === "UPCOMING" || i.status === "DUE" || i.status === "OVERDUE");
          
          return {
            ...order,
            paluwaganSchedule: updatedSchedule,
            nextDueDate: nextDueItem ? nextDueItem.dueDate : undefined,
            paymentStatus: hasOverdue ? ("Unpaid" as const) : order.paymentStatus
          };
        }
      }
      return order;
    });

    if (hasChanges) {
      setOrders(nextOrders);
    }
  }, [orders.length]);

  const updateProfile = (name: string, email: string, phone: string, address: string) => {
    setUserName(name);
    setUserEmail(email);
    setUserPhone(phone);
    setUserAddress(address);
    if (typeof window !== "undefined") {
      localStorage.setItem("delmar_user_name", name);
      localStorage.setItem("delmar_user_email", email);
      localStorage.setItem("delmar_user_phone", phone);
      localStorage.setItem("delmar_user_address", address);
    }

    setCustomers(prev => {
      const updated = prev.map(c => c.email === email ? { ...c, fullName: name, phone, address } : c);
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_customers", JSON.stringify(updated));
      }
      return updated;
    });

    showToast("Profile Updated", "Your profile details have been saved successfully.", "success");
  };

  const simulateEmail = (recipient: string, subject: string, body: string, type: "order" | "reservation" | "system") => {
    addNotification({
      title: `✉️ Email Dispatched: ${subject}`,
      message: `To: ${recipient} | ${body}`,
      type
    });
  };

  const addCustomerAccount = async (cust: Omit<CustomerAccount, "id" | "registrationDate" | "lastLogin">): Promise<boolean> => {
    const newCust: CustomerAccount = {
      ...cust,
      id: `CUST-${Math.floor(10000 + Math.random() * 9000)}`,
      registrationDate: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString().split("T")[0]
    };
    setCustomers(prev => {
      const updated = [newCust, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("delmar_customers", JSON.stringify(updated));
      }
      return updated;
    });
    simulateEmail(cust.email, "Registration Successful", "Welcome to Savorlicious Food Services! Your customer account has been registered successfully.", "system");
    simulateEmail("admin@delmarfarm.com", "New Registration", `Customer ${cust.fullName} (${cust.email}) has created an account.`, "system");
    return true;
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        userName,
        userEmail,
        userPhone,
        userAddress,
        updateProfile,
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
        batches,
        members,
        memberPayments,
        paluwaganBatches,
        auditLogs,
        customers,
        paluwaganApplications,
        paluwaganLedger,
        addCustomerAccount,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        updateStockLevel,
        addReservation,
        updateReservationStatus,
        addOrder,
        updateOrderStatus,
        updateOrder,
        addPaluwaganBatch,
        updatePaluwaganBatch,
        recordPaluwaganPayment,
        submitPaluwaganApplication,
        approvePaluwaganApplication,
        rejectPaluwaganApplication,
        updatePaluwaganApplicationStatus,
        archivePaluwaganMembership,
        addLedgerPayment,
        voidLedgerPayment,
        correctLedgerPayment,
        markNotificationRead,
        clearNotifications,
        addToCart,
        removeFromCart,
        clearCart,
        updateChatbotSettings,
        signOut,
        sendPasswordReset,
        addBatch,
        updateBatch,
        archiveBatch,
        addMember,
        updateMember,
        archiveMember,
        restoreMember,
        recordMemberPayment,
        addNotification,
        toast,
        showToast
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
