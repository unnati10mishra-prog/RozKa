import React, { useEffect, useState } from 'react';
import { Store, LogOut, Wifi, WifiOff, RefreshCw, Package, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/dexieDb';
import type { ProductRecord, SaleRecord } from '../db/dexieDb';
import { syncEngine } from '../db/syncEngine';

export const Dashboard: React.FC = () => {
  const { user, signOut, isOnline } = useAuth();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Load local store data from IndexedDB
  const loadData = async () => {
    if (!user) return;
    const prods = await db.products.where('shopId').equals(user.shopId).toArray();
    const sls = await db.sales.where('shopId').equals(user.shopId).toArray();
    const pending = await db.syncOutbox.where('status').equals('pending').count();

    // If store is empty, seed initial staple products for instant experience
    if (prods.length === 0) {
      await seedInitialProducts(user.shopId);
      const reloadedProds = await db.products.where('shopId').equals(user.shopId).toArray();
      setProducts(reloadedProds);
    } else {
      setProducts(prods);
    }

    setSales(sls);
    setPendingSyncCount(pending);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const seedInitialProducts = async (shopId: string) => {
    const now = new Date().toISOString();
    const initialItems: ProductRecord[] = [
      {
        id: `prod-${Date.now()}-1`,
        shopId,
        name: 'Aashirvaad Shudh Chakki Atta (5kg)',
        nameHi: 'आशीर्वाद चक्की आटा (5 किलो)',
        baseUnit: 'pkt',
        currentStock: 4,
        lowStockThreshold: 6,
        sellingPrice: 265,
        purchaseCost: 235,
        currencyCode: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
      {
        id: `prod-${Date.now()}-2`,
        shopId,
        name: 'Tata Salt Vacuum Evaporated (1kg)',
        nameHi: 'टाटा नमक (1 किलो)',
        baseUnit: 'pkt',
        currentStock: 25,
        lowStockThreshold: 10,
        sellingPrice: 28,
        purchaseCost: 23,
        currencyCode: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
      {
        id: `prod-${Date.now()}-3`,
        shopId,
        name: 'Fortune Sunlite Refined Oil (1L)',
        nameHi: 'फॉर्च्यून सनलाइट तेल (1 ली)',
        baseUnit: 'pkt',
        currentStock: 2,
        lowStockThreshold: 8,
        sellingPrice: 140,
        purchaseCost: 122,
        currencyCode: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
      {
        id: `prod-${Date.now()}-4`,
        shopId,
        name: 'Amul Butter Salted (100g)',
        nameHi: 'अमूल मक्खन (100 ग्रा)',
        baseUnit: 'pkt',
        currentStock: 0,
        lowStockThreshold: 8,
        sellingPrice: 58,
        purchaseCost: 50,
        currencyCode: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
      {
        id: `prod-${Date.now()}-5`,
        shopId,
        name: 'Maggi 2-Minute Masala Noodles (70g)',
        nameHi: 'मैगी मसाला नूडल्स (70 ग्रा)',
        baseUnit: 'pkt',
        currentStock: 36,
        lowStockThreshold: 15,
        sellingPrice: 14,
        purchaseCost: 12,
        currencyCode: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
    ];

    for (const item of initialItems) {
      await db.products.put(item);
      await syncEngine.enqueue(shopId, 'product', item.id, 'insert', item);
    }
  };

  const handleQuickSale = async (product: ProductRecord) => {
    if (product.currentStock <= 0) return;
    const now = new Date().toISOString();
    const newStock = product.currentStock - 1;

    // 1. Transactional local update
    await db.transaction('rw', db.products, db.sales, db.saleItems, db.inventoryMovements, db.syncOutbox, async () => {
      await db.products.update(product.id, {
        currentStock: newStock,
        updatedAt: now,
        version: product.version + 1,
      });

      const saleId = `sale-${Date.now()}`;
      const saleRecord: SaleRecord = {
        id: saleId,
        shopId: product.shopId,
        receiptNumber: `RZK-${Date.now().toString().slice(-4)}`,
        status: 'recorded',
        subtotal: product.sellingPrice || 0,
        discountAmount: 0,
        totalAmount: product.sellingPrice || 0,
        currencyCode: 'INR',
        occurredAt: now,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      await db.sales.put(saleRecord);

      await db.saleItems.put({
        id: `sale-item-${Date.now()}`,
        shopId: product.shopId,
        saleId,
        productId: product.id,
        productNameSnapshot: product.name,
        quantity: 1,
        unit: product.baseUnit,
        unitPrice: product.sellingPrice || 0,
        discountAmount: 0,
        lineTotal: product.sellingPrice || 0,
        createdAt: now,
      });

      await db.inventoryMovements.put({
        id: `mov-${Date.now()}`,
        shopId: product.shopId,
        productId: product.id,
        movementType: 'sale',
        quantityDelta: -1,
        quantityBefore: product.currentStock,
        quantityAfter: newStock,
        unit: product.baseUnit,
        saleId,
        reason: 'Quick sale at counter',
        occurredAt: now,
        createdAt: now,
      });

      // 2. Queue for cloud sync
      await syncEngine.enqueue(product.shopId, 'product', product.id, 'update', {
        id: product.id,
        current_stock: newStock,
        updated_at: now,
      });
      await syncEngine.enqueue(product.shopId, 'sale', saleId, 'insert', saleRecord);
    });

    await loadData();
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncEngine.processOutbox();
      setSyncFeedback(`Sync complete: ${res.processed} updated, ${res.failed} pending.`);
      await loadData();
    } catch (e: any) {
      setSyncFeedback(`Sync error: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const lowStockCount = products.filter((p) => p.currentStock <= p.lowStockThreshold).length;

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <header className="dashboard-header">
        <div className="dashboard-brand-info">
          <div className="dashboard-logo-icon">
            <Store size={22} />
          </div>
          <div>
            <h1 className="dashboard-shop-name">{user?.shopName}</h1>
            <p className="dashboard-owner-name">Owner: {user?.displayName} • {user?.email}</p>
          </div>
        </div>

        <div className="dashboard-header-actions">
          <div className={`network-badge ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? 'Online (Supabase Connected)' : 'Offline (Local IndexedDB Active)'}</span>
          </div>

          <button
            type="button"
            className="sync-btn"
            onClick={handleManualSync}
            disabled={isSyncing || !isOnline}
            title={isOnline ? 'Sync pending items with Supabase' : 'Offline: items will sync when online'}
          >
            <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
            <span>Sync ({pendingSyncCount})</span>
          </button>

          <button type="button" className="signout-btn" onClick={signOut} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Sync Feedback Message */}
      {syncFeedback && (
        <div className="sync-feedback-bar">
          <CheckCircle size={15} color="#059669" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Overview Stats */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap green">
            <Package size={20} />
          </div>
          <div>
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{products.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap amber">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="stat-label">Low Stock Alerts</div>
            <div className="stat-value">{lowStockCount} items</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap emerald">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="stat-label">Recorded Sales</div>
            <div className="stat-value">{sales.length}</div>
          </div>
        </div>
      </div>

      {/* Quick Counter Section */}
      <section className="inventory-section">
        <div className="section-title-row">
          <div>
            <h2>Quick Counter Stock &amp; Sale</h2>
            <p className="section-desc">Tap <b>-1 Becha</b> to deduct stock and record sale instantly offline.</p>
          </div>
        </div>

        <div className="products-list">
          {products.map((prod) => {
            const isLow = prod.currentStock <= prod.lowStockThreshold;
            const isOut = prod.currentStock <= 0;

            return (
              <div key={prod.id} className={`product-card ${isOut ? 'out' : isLow ? 'low' : ''}`}>
                <div className="product-info">
                  <div className="product-title-row">
                    <span className="prod-name">{prod.name}</span>
                    {prod.nameHi && <span className="prod-name-hi">{prod.nameHi}</span>}
                  </div>
                  <div className="prod-pricing">
                    <span className="selling-price">₹{prod.sellingPrice}</span>
                    <span className="unit-label">/{prod.baseUnit}</span>
                  </div>
                </div>

                <div className="product-stock-actions">
                  <div className={`stock-badge ${isOut ? 'out' : isLow ? 'low' : 'optimal'}`}>
                    {isOut ? 'Khali (0)' : `${prod.currentStock} ${prod.baseUnit}`}
                  </div>

                  <button
                    type="button"
                    className="sell-one-btn"
                    disabled={isOut}
                    onClick={() => handleQuickSale(prod)}
                  >
                    <span>-1 Becha</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
