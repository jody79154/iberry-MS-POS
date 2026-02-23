
export enum RepairStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  READY = 'Ready for Pickup',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export type Category = 'Covers' | 'Screenguards' | 'Cables' | 'Earphones' | 'Chargers' | 'Speakers' | 'Accessories' | 'Other';

export interface Product {
  id: string;
  title: string;
  price: number;
  model: string;
  category: Category;
  stock: number;
  image: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Repair {
  id: string;
  customerId: string;
  customerName: string;
  model: string;
  imei: string;
  fault: string;
  status: RepairStatus;
  price: number;
  dateAdded: string;
  notes?: string;
}

export interface Sale {
  id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    type: 'product' | 'repair';
  }>;
  total: number;
  date: string;
  userId: string;
  customerName: string;
}

export interface StockOrder {
  id: string;
  itemDescription: string;
  requestedBy: string;
  date: string;
  status: 'Requested' | 'Ordered' | 'Received';
}

export interface User {
  id: string;
  username: string;
  role: 'Admin' | 'Technician' | 'Sales';
  avatar: string;
}
