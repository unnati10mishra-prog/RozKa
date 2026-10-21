import Dexie, { type Table } from 'dexie';

export interface ProfileRecord {
  id: string;
  displayName: string;
  phoneNumber?: string;
  preferredLanguage: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopRecord {
  id: string;
  name: string;
  ownerUserId: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  currencyCode: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopMemberRecord {
  id: string;
  shopId: string;
  userId: string;
  role: 'owner' | 'manager' | 'staff';
  status: 'active' | 'invited' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRecord {
  id: string;
  shopId: string;
  name: string;
  nameHi?: string;
  description?: string;
  parentCategoryId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRecord {
  id: string;
  shopId: string;
  categoryId?: string;
  name: string;
  nameHi?: string;
  brand?: string;
  barcode?: string;
  description?: string;
  baseUnit: string;
  currentStock: number;
  lowStockThreshold: number;
  safetyStockQuantity?: number;
  supplierLeadTimeDays?: number;
  defaultSupplierId?: string;
  purchaseCost?: number;
  sellingPrice?: number;
  currencyCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  version: number;
}

export interface ProductAliasRecord {
  id: string;
  shopId: string;
  productId: string;
  aliasName: string;
  languageCode?: string;
  source: 'manual' | 'supplier' | 'ai_confirmed';
  createdAt: string;
  updatedAt: string;
}

export interface SupplierRecord {
  id: string;
  shopId: string;
  name: string;
  contactPerson?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  notes?: string;
  defaultLeadTimeDays?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProductRecord {
  id: string;
  shopId: string;
  supplierId: string;
  productId: string;
  supplierProductCode?: string;
  supplierProductName?: string;
  purchaseUnit: string;
  baseUnitsPerPurchaseUnit: number;
  minimumOrderQuantity?: number;
  purchasePrice?: number;
  leadTimeDays?: number;
  isPreferred: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaleRecord {
  id: string;
  shopId: string;
  createdBy?: string;
  deviceId?: string;
  receiptNumber?: string;
  status: 'recorded' | 'reversed' | 'cancelled';
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  currencyCode: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  reversalOfSaleId?: string;
  notes?: string;
  version: number;
}

export interface SaleItemRecord {
  id: string;
  shopId: string;
  saleId: string;
  productId: string;
  productNameSnapshot: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
  createdAt: string;
}

export interface InventoryMovementRecord {
  id: string;
  shopId: string;
  productId: string;
  movementType: 'opening_stock' | 'sale' | 'sale_reversal' | 'stock_adjustment' | 'purchase_received' | 'customer_return' | 'supplier_return';
  quantityDelta: number;
  quantityBefore: number;
  quantityAfter: number;
  unit: string;
  saleId?: string;
  saleItemId?: string;
  reversalOfMovementId?: string;
  reason?: string;
  createdBy?: string;
  occurredAt: string;
  createdAt: string;
}

export interface PurchaseOrderRecord {
  id: string;
  shopId: string;
  supplierId?: string;
  orderNumber?: string;
  status: 'draft' | 'approved' | 'shared' | 'placed' | 'partially_received' | 'received' | 'cancelled';
  createdBy?: string;
  orderDate: string;
  expectedDeliveryAt?: string;
  sharedAt?: string;
  placedAt?: string;
  receivedAt?: string;
  notes?: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface PurchaseOrderItemRecord {
  id: string;
  shopId: string;
  purchaseOrderId: string;
  productId: string;
  supplierProductId?: string;
  productNameSnapshot: string;
  quantityOrdered: number;
  quantityReceived: number;
  purchaseUnit: string;
  baseUnitsPerPurchaseUnit: number;
  unitCost?: number;
  lineTotal: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettingsRecord {
  id: string;
  shopId: string;
  defaultLanguage: string;
  defaultLowStockThreshold?: number;
  defaultLeadTimeDays?: number;
  defaultSafetyStockQuantity?: number;
  defaultLookbackDays: number;
  defaultTargetCoverageDays?: number;
  allowNegativeStock: boolean;
  aiEnabled: boolean;
  cloudAiConsent: boolean;
  settingsJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AITaskLogRecord {
  id: string;
  shopId: string;
  requestedBy?: string;
  taskType: string;
  provider: 'gemma_local' | 'groq' | 'gemini';
  modelName?: string;
  executionMode: 'local' | 'cloud';
  status: 'success' | 'failed' | 'cancelled';
  latencyMs?: number;
  inputSize?: number;
  errorCode?: string;
  createdAt: string;
}

export interface SyncOutboxRecord {
  id: string;
  shopId: string;
  entityType: string;
  entityId: string;
  operation: 'insert' | 'update' | 'delete';
  payload: unknown;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  attemptCount: number;
  lastError: string | null;
  createdAt: string;
}

export interface SyncMetadataRecord {
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface OfflineAuthUser {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  shopName: string;
  shopId: string;
  passwordHash?: string;
  lastLoginAt: string;
}

export class RozKaDatabase extends Dexie {
  profiles!: Table<ProfileRecord, string>;
  shops!: Table<ShopRecord, string>;
  shopMembers!: Table<ShopMemberRecord, string>;
  categories!: Table<CategoryRecord, string>;
  products!: Table<ProductRecord, string>;
  productAliases!: Table<ProductAliasRecord, string>;
  suppliers!: Table<SupplierRecord, string>;
  supplierProducts!: Table<SupplierProductRecord, string>;
  sales!: Table<SaleRecord, string>;
  saleItems!: Table<SaleItemRecord, string>;
  inventoryMovements!: Table<InventoryMovementRecord, string>;
  purchaseOrders!: Table<PurchaseOrderRecord, string>;
  purchaseOrderItems!: Table<PurchaseOrderItemRecord, string>;
  shopSettings!: Table<ShopSettingsRecord, string>;
  aiTaskLogs!: Table<AITaskLogRecord, string>;

  syncOutbox!: Table<SyncOutboxRecord, string>;
  syncMetadata!: Table<SyncMetadataRecord, string>;
  offlineAuthUsers!: Table<OfflineAuthUser, string>;

  constructor() {
    super('RozKaDB');

    this.version(1).stores({
      profiles: 'id',
      shops: 'id, ownerUserId',
      shopMembers: 'id, shopId, userId, [shopId+userId]',
      categories: 'id, shopId, parentCategoryId, isActive',
      products: 'id, shopId, categoryId, name, barcode, isActive, updatedAt',
      productAliases: 'id, shopId, productId, aliasName',
      suppliers: 'id, shopId, name, isActive',
      supplierProducts: 'id, shopId, supplierId, productId, [supplierId+productId]',
      sales: 'id, shopId, occurredAt, status, createdAt',
      saleItems: 'id, shopId, saleId, productId',
      inventoryMovements: 'id, shopId, productId, occurredAt, saleId',
      purchaseOrders: 'id, shopId, supplierId, status, orderDate',
      purchaseOrderItems: 'id, shopId, purchaseOrderId, productId',
      shopSettings: 'id, &shopId',
      aiTaskLogs: 'id, shopId, taskType, createdAt',
      syncOutbox: 'id, shopId, status, createdAt, entityId',
      syncMetadata: 'key',
      offlineAuthUsers: 'id, email',
    });
  }
}

export const db = new RozKaDatabase();
