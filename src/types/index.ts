export type UnitType = 'pcs' | 'pkt' | 'kg' | 'g' | 'L' | 'ml' | 'dozen' | 'box';

export type CategoryType = 
  | 'Grains & Flours'
  | 'Dairy & Bakery'
  | 'Snacks & Biscuits'
  | 'Spices & Oils'
  | 'Personal Care'
  | 'Cleaning & Household'
  | 'Beverages & Tea'
  | 'Instant Foods & Noodles'
  | 'Other';

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  category: CategoryType | string;
  unit: UnitType;
  isFractional: boolean;
  currentStock: number;
  lowStockThreshold: number;
  costPrice: number;
  sellingPrice: number;
  barcode?: string;
  supplierName?: string;
  leadTimeDays?: number; // Lead time in days (defaults to store setting)
  safetyStock?: number;   // Buffer units
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  hindiName?: string;
  unit: UnitType;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  total: number;
}

export type PaymentMode = 'cash' | 'upi' | 'credit';

export interface Sale {
  id: string;
  receiptNumber: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  customerName?: string;
  customerPhone?: string;
  status: 'completed' | 'cancelled';
  timestamp: string;
  notes?: string;
}

export type AdjustmentReason = 
  | 'restock'      // Fresh stock received (माल आया)
  | 'damage'       // Damaged / broken (टूटा / खराब)
  | 'expiry'       // Expired (तारीख निकल गई)
  | 'count_audit'  // Physical stock check difference (गिनती में फर्क)
  | 'customer_return' // Customer returned product (वापसी)
  | 'correction';  // Error correction (गलती सुधार)

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: AdjustmentReason;
  quantityChange: number; // Positive (added) or Negative (deducted)
  previousStock: number;
  newStock: number;
  notes?: string;
  timestamp: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  hindiName?: string;
  unit: UnitType;
  currentStock: number;
  avgDailySales: number;
  suggestedQuantity: number;
  orderedQuantity: number;
  costPrice: number;
  estimatedCost: number;
}

export interface SupplierOrder {
  id: string;
  orderNumber: string;
  supplierName: string;
  items: OrderItem[];
  totalCost: number;
  status: 'draft' | 'placed' | 'received' | 'cancelled';
  createdAt: string;
  placedAt?: string;
  receivedAt?: string;
  notes?: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  address: string;
  language: 'en' | 'hi';
  theme: 'dark' | 'light';
  currencySymbol: string;
  defaultLeadTimeDays: number;
  defaultSafetyStockRatio: number;
  enableAlertSounds: boolean;
}

export interface ReorderSuggestion {
  product: Product;
  currentStock: number;
  avgDailySales: number;
  salesCountDays: number;
  leadTimeDays: number;
  safetyStock: number;
  targetStock: number;
  outstandingOrder: number;
  suggestedQuantity: number;
  urgency: 'critical' | 'moderate' | 'low';
  estimatedCost: number;
  reason: string;
}
