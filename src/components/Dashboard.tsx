import React, { useEffect, useState } from 'react';
import {
  Menu, Search, QrCode, ShoppingCart, Plus, ShoppingBag, Truck,
  ArrowLeft, Trash2, Share2, Sparkles, RefreshCw, LogOut, X,
  ChevronDown, Lightbulb, Edit3, FileText, CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/dexieDb';
import type { ProductRecord, SaleRecord } from '../db/dexieDb';
import { syncEngine } from '../db/syncEngine';
import { parseDistributorOrderMessage, generateSmartInventoryInsights } from '../lib/aiService';

// Available active sub-screens
type ScreenView =
  | 'home'
  | 'scan'
  | 'new-sale'
  | 'inventory'
  | 'product-detail'
  | 'supplier-order'
  | 'insights';

export const Dashboard: React.FC = () => {
  const { user, signOut, isOnline } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<ScreenView>('home');
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Selected product for detail screen
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);

  // Filter state for Inventory screen
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low' | 'out'>('low');
  const [inventorySearch, setInventorySearch] = useState<string>('');

  // Cart for New Sale screen (Screen 4)
  const [saleCart, setSaleCart] = useState<
    Array<{
      id: string;
      name: string;
      size: string;
      unitPrice: number;
      quantity: number;
      imageEmoji: string;
    }>
  >([
    { id: 'cart-1', name: 'Parle-G Biscuits', size: '100g', unitPrice: 20, quantity: 2, imageEmoji: '🍪' },
    { id: 'cart-2', name: 'Amul Taaza Milk', size: '1L', unitPrice: 68, quantity: 1, imageEmoji: '🥛' },
    { id: 'cart-3', name: 'Lay\'s Classic Salted', size: '45g', unitPrice: 18, quantity: 3, imageEmoji: '🥔' },
    { id: 'cart-4', name: 'Coca-Cola', size: '750ml', unitPrice: 40, quantity: 1, imageEmoji: '🥤' },
  ]);

  // Supplier Order items (Screen 7)
  const [supplierOrderItems, setSupplierOrderItems] = useState<
    Array<{ id: string; name: string; size: string; quantity: number; emoji: string }>
  >([
    { id: 'ord-1', name: 'Tata Salt', size: '1kg', quantity: 25, emoji: '🧂' },
    { id: 'ord-2', name: 'Maggi 2-Minute Noodles', size: '70g', quantity: 20, emoji: '🍜' },
    { id: 'ord-3', name: 'Amul Butter', size: '100g', quantity: 10, emoji: '🧈' },
    { id: 'ord-4', name: 'Sunfeast Marie', size: '200g', quantity: 15, emoji: '🍪' },
    { id: 'ord-5', name: 'Surf Excel', size: '1kg', quantity: 8, emoji: '🧼' },
  ]);

  // Scanned item modal (Screen 3)
  const [scannedItem, setScannedItem] = useState<{
    name: string;
    size: string;
    mrp: number;
    price: number;
    stock: number;
    emoji: string;
  } | null>(null);

  // Drawer menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // AI Assistant drawer
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiMessageInput, setAiMessageInput] = useState('Parle-G 20 packets, Maggi 10, refined oil 5 litre');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiParsedResult, setAiParsedResult] = useState<string | null>(null);

  // Load IndexedDB data
  const loadData = async () => {
    if (!user) return;
    const prods = await db.products.where('shopId').equals(user.shopId).toArray();
    const pending = await db.syncOutbox.where('status').equals('pending').count();

    if (prods.length === 0) {
      await seedDefaultProducts(user.shopId);
      const reloaded = await db.products.where('shopId').equals(user.shopId).toArray();
      setProducts(reloaded);
      if (reloaded.length > 0) setSelectedProduct(reloaded[1] || reloaded[0]);
    } else {
      setProducts(prods);
      if (!selectedProduct && prods.length > 0) {
        setSelectedProduct(prods[1] || prods[0]);
      }
    }

    setPendingSyncCount(pending);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Seed sample products matching mockup if database is fresh
  const seedDefaultProducts = async (shopId: string) => {
    const now = new Date().toISOString();
    const defaultCatalog: ProductRecord[] = [
      {
        id: 'prod-maggi',
        shopId,
        name: 'Maggi 2-Minute Noodles',
        nameHi: 'मैगी 2-मिनट नूडल्स (70g)',
        baseUnit: 'pkt',
        currentStock: 2,
        lowStockThreshold: 10,
        sellingPrice: 14,
        purchaseCost: 11.5,
        currencyCode: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
      {
        id: 'prod-tata-salt',
        shopId,
        name: 'Tata Salt',
        nameHi: 'टाटा नमक (1kg • HUL)',
        baseUnit: 'pkt',
        currentStock: 3,
        lowStockThreshold: 10,
        sellingPrice: 28,
        purchaseCost: 22,
        currencyCode: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
      {
        id: 'prod-sunfeast',
        shopId,
        name: 'Sunfeast Marie',
        nameHi: 'सनफीस्ट मेरी बिस्कुट (200g)',
        baseUnit: 'pkt',
        currentStock: 4,
        lowStockThreshold: 12,
        sellingPrice: 35,
        purchaseCost: 29,
        currencyCode: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
      {
        id: 'prod-amul-butter',
        shopId,
        name: 'Amul Butter',
        nameHi: 'अमूल मक्खन (100g)',
        baseUnit: 'pkt',
        currentStock: 0,
        lowStockThreshold: 8,
        sellingPrice: 58,
        purchaseCost: 51,
        currencyCode: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
      {
        id: 'prod-aashirvaad',
        shopId,
        name: 'Aashirvaad Atta',
        nameHi: 'आशीर्वाद चक्की आटा (5kg)',
        baseUnit: 'pkt',
        currentStock: 2,
        lowStockThreshold: 6,
        sellingPrice: 265,
        purchaseCost: 232,
        currencyCode: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
      {
        id: 'prod-parle-g',
        shopId,
        name: 'Parle-G Biscuits',
        nameHi: 'पारले-जी ग्लूकोज (100g)',
        baseUnit: 'pkt',
        currentStock: 45,
        lowStockThreshold: 15,
        sellingPrice: 20,
        purchaseCost: 16,
        currencyCode: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
      {
        id: 'prod-lays',
        shopId,
        name: 'Lay\'s Classic Salted',
        nameHi: 'लेज क्लासिक नमकीन (45g)',
        baseUnit: 'pkt',
        currentStock: 12,
        lowStockThreshold: 10,
        sellingPrice: 18,
        purchaseCost: 14,
        currencyCode: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
      {
        id: 'prod-surf-excel',
        shopId,
        name: 'Surf Excel Quick Wash',
        nameHi: 'सर्फ एक्सेल (1kg)',
        baseUnit: 'pkt',
        currentStock: 8,
        lowStockThreshold: 8,
        sellingPrice: 145,
        purchaseCost: 125,
        currencyCode: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        version: 1,
      },
    ];

    for (const p of defaultCatalog) {
      await db.products.put(p);
      await syncEngine.enqueue(shopId, 'product', p.id, 'insert', p);
    }
  };

  // Trigger manual cloud sync
  const handleManualSync = async () => {
    try {
      const res = await syncEngine.processOutbox();
      alert(`Sync complete: ${res.processed} updated, ${res.failed} remaining.`);
      await loadData();
    } catch (e: any) {
      alert(`Sync note: ${e.message}`);
    }
  };

  // Complete sale in New Sale Screen (Screen 4)
  const handleCompleteSale = async () => {
    if (saleCart.length === 0) return;
    const now = new Date().toISOString();
    const saleId = `sale-${Date.now()}`;
    const totalAmount = saleCart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    await db.transaction('rw', db.sales, db.saleItems, db.inventoryMovements, db.products, db.syncOutbox, async () => {
      const saleRec: SaleRecord = {
        id: saleId,
        shopId: user?.shopId || 'demo-shop',
        receiptNumber: `RZK-${Date.now().toString().slice(-4)}`,
        status: 'recorded',
        subtotal: totalAmount,
        discountAmount: 0,
        totalAmount,
        currencyCode: 'INR',
        occurredAt: now,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      await db.sales.put(saleRec);

      for (const item of saleCart) {
        await db.saleItems.put({
          id: `item-${Date.now()}-${item.id}`,
          shopId: user?.shopId || 'demo-shop',
          saleId,
          productId: item.id,
          productNameSnapshot: item.name,
          quantity: item.quantity,
          unit: 'pkt',
          unitPrice: item.unitPrice,
          discountAmount: 0,
          lineTotal: item.unitPrice * item.quantity,
          createdAt: now,
        });

        // Deduct from local stock
        const matched = await db.products.get(item.id);
        if (matched) {
          const nextStock = Math.max(0, matched.currentStock - item.quantity);
          await db.products.update(item.id, { currentStock: nextStock, updatedAt: now });
        }
      }

      await syncEngine.enqueue(user?.shopId || 'demo-shop', 'sale', saleId, 'insert', saleRec);
    });

    // Celebratory visual feedback
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (_) {}

    await loadData();
    alert(`✅ Sale of ₹${totalAmount} recorded successfully! Stock deducted in IndexedDB.`);
    setCurrentScreen('home');
  };

  // WhatsApp Supplier Order Dispatch (Screen 7)
  const handleSendSupplierOrder = () => {
    const lines = supplierOrderItems.map((item) => `• ${item.name} (${item.size}): ${item.quantity} units`);
    const message = `Namaste Sharma Distributors,\nRozKa Order from *${user?.shopName}*:\n\n${lines.join('\n')}\n\nKripya kal subah deliver karwa dijiye. Dhanyawad!`;

    if (navigator.share) {
      navigator.share({
        title: `RozKa Order - ${user?.shopName}`,
        text: message,
      }).catch(() => {});
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    }
  };

  // AI message parser trigger
  const handleParseAiMessage = async () => {
    if (!aiMessageInput.trim()) return;
    setAiLoading(true);
    setAiParsedResult(null);
    try {
      const result = await parseDistributorOrderMessage(aiMessageInput);
      if (result.items.length > 0) {
        setAiParsedResult(`Success! Parsed ${result.items.length} items using ${result.engine.toUpperCase()}.`);
        // Add to supplier order
        const newItems = result.items.map((i, idx) => ({
          id: `ai-${Date.now()}-${idx}`,
          name: i.name,
          size: i.unit,
          quantity: i.quantity,
          emoji: '📦',
        }));
        setSupplierOrderItems([...newItems, ...supplierOrderItems]);
      } else {
        setAiParsedResult('Could not extract items. Please check the text format.');
      }
    } catch (err: any) {
      setAiParsedResult(`Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Calculate live stock health counts
  const inStockCount = products.filter((p) => p.currentStock > p.lowStockThreshold).length;
  const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.lowStockThreshold).length;
  const outOfStockCount = products.filter((p) => p.currentStock === 0).length;
  const totalCount = products.length || 124;

  // Filter products for screen 5
  const filteredInventory = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      (p.nameHi && p.nameHi.toLowerCase().includes(inventorySearch.toLowerCase()));
    if (!matchesSearch) return false;
    if (inventoryFilter === 'low') return p.currentStock <= p.lowStockThreshold && p.currentStock > 0;
    if (inventoryFilter === 'out') return p.currentStock === 0;
    return true;
  });

  return (
    <div className="rozka-mobile-app">
      {/* =========================================================================
          SCREEN 1: HOME DASHBOARD (Matches Image 1 Screen 2)
          ========================================================================= */}
      {currentScreen === 'home' && (
        <div className="screen-layout home-screen-view">
          {/* Top Bar: Hamburger, Shop Name Greeting, Network Badge */}
          <header className="app-top-header">
            <button
              type="button"
              className="icon-circle-btn"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Menu"
            >
              <Menu size={20} color="#1F2937" />
            </button>

            <div className="header-greeting-wrap">
              <span className="greeting-sub">Namaste,</span>
              <h2 className="greeting-shop-title">{user?.shopName || 'Sharma Store'} 👋</h2>
            </div>

            <button
              type="button"
              className={`status-pill-badge ${isOnline ? 'online' : 'offline'}`}
              onClick={handleManualSync}
              title={isOnline ? 'Online • Tap to sync' : 'Offline • Local IndexedDB Active'}
            >
              <span className="status-dot" />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </button>
          </header>

          {/* Search bar + Scan barcode button */}
          <div className="search-scan-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search product or scan barcode"
              className="search-input"
              onFocus={() => setCurrentScreen('inventory')}
            />
            <button
              type="button"
              className="barcode-trigger-btn"
              onClick={() => {
                setScannedItem({
                  name: 'Lay\'s Classic Salted',
                  size: '45g',
                  mrp: 20,
                  price: 18,
                  stock: 12,
                  emoji: '🥔',
                });
                setCurrentScreen('scan');
              }}
              aria-label="Scan barcode"
            >
              <QrCode size={18} color="#0E4334" />
            </button>
          </div>

          {/* Two Stats Cards */}
          <div className="stats-cards-row">
            <div className="dash-stat-box">
              <span className="stat-box-label">Today's Sales</span>
              <div className="stat-box-val-row">
                <span className="stat-amount">₹ 4,820</span>
                <span className="growth-pill">+ 12%</span>
              </div>
            </div>

            <div className="dash-stat-box">
              <span className="stat-box-label">Items Sold</span>
              <div className="stat-box-val-row">
                <span className="stat-amount">28</span>
              </div>
            </div>
          </div>

          {/* 4 Action Tiles Grid (2x2) */}
          <div className="action-tiles-grid">
            <button
              type="button"
              className="action-tile-btn"
              onClick={() => setCurrentScreen('new-sale')}
            >
              <div className="tile-icon-circle green">
                <ShoppingCart size={22} color="#059669" />
              </div>
              <span className="tile-text">Add Sale</span>
            </button>

            <button
              type="button"
              className="action-tile-btn"
              onClick={() => {
                const name = prompt('Enter Product Name:');
                if (name) {
                  const price = parseFloat(prompt('Selling Price (₹):') || '20');
                  const stock = parseInt(prompt('Current Stock Quantity:') || '10', 10);
                  const newP: ProductRecord = {
                    id: `prod-${Date.now()}`,
                    shopId: user?.shopId || 'demo-shop',
                    name,
                    baseUnit: 'pkt',
                    currentStock: stock,
                    lowStockThreshold: 5,
                    sellingPrice: price,
                    purchaseCost: price * 0.8,
                    currencyCode: 'INR',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1,
                  };
                  db.products.put(newP).then(() => loadData());
                }
              }}
            >
              <div className="tile-icon-circle green">
                <Plus size={22} color="#059669" />
              </div>
              <span className="tile-text">Add Product</span>
            </button>

            <button
              type="button"
              className="action-tile-btn"
              onClick={() => {
                setInventoryFilter('low');
                setCurrentScreen('inventory');
              }}
            >
              <div className="tile-icon-circle red-tint">
                <ShoppingBag size={22} color="#DC2626" />
                <span className="badge-count-red">{lowStockCount || 6}</span>
              </div>
              <span className="tile-text">Low Stock</span>
            </button>

            <button
              type="button"
              className="action-tile-btn"
              onClick={() => setCurrentScreen('supplier-order')}
            >
              <div className="tile-icon-circle blue">
                <Truck size={22} color="#2563EB" />
              </div>
              <span className="tile-text">Order to Supplier</span>
            </button>
          </div>

          {/* Stock Health Gauge Card */}
          <div className="stock-health-card">
            <h3 className="card-section-title">Stock Health</h3>
            <div className="stock-health-content">
              {/* Circular Gauge Meter */}
              <div className="donut-chart-wrap">
                <svg viewBox="0 0 100 100" className="donut-chart-svg">
                  {/* Background ring */}
                  <circle cx="50" cy="50" r="40" stroke="#F3F4F6" strokeWidth="12" fill="none" />
                  {/* Green segment (In Stock: ~75%) */}
                  <circle
                    cx="50" cy="50" r="40"
                    stroke="#10B981" strokeWidth="12"
                    strokeDasharray="188 251"
                    strokeDashoffset="0"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Orange segment (Low Stock: ~18%) */}
                  <circle
                    cx="50" cy="50" r="40"
                    stroke="#F59E0B" strokeWidth="12"
                    strokeDasharray="45 251"
                    strokeDashoffset="-190"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Red segment (Out of stock: ~7%) */}
                  <circle
                    cx="50" cy="50" r="40"
                    stroke="#EF4444" strokeWidth="12"
                    strokeDasharray="18 251"
                    strokeDashoffset="-236"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="donut-center-label">
                  <span className="donut-number">{totalCount}</span>
                  <span className="donut-text">Total Products</span>
                </div>
              </div>

              {/* Legend */}
              <div className="donut-legend">
                <div className="legend-row">
                  <div className="legend-indicator">
                    <span className="dot in-stock" />
                    <span className="legend-name">In Stock</span>
                  </div>
                  <span className="legend-val">{inStockCount || 98}</span>
                </div>

                <div className="legend-row">
                  <div className="legend-indicator">
                    <span className="dot low-stock" />
                    <span className="legend-name">Low Stock</span>
                  </div>
                  <span className="legend-val">{lowStockCount || 18}</span>
                </div>

                <div className="legend-row">
                  <div className="legend-indicator">
                    <span className="dot out-of-stock" />
                    <span className="legend-name">Out of Stock</span>
                  </div>
                  <span className="legend-val">{outOfStockCount || 8}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Message Assistant Floating Banner */}
          <div className="ai-assistant-banner" onClick={() => setIsAiModalOpen(true)}>
            <div className="ai-banner-left">
              <Sparkles size={18} color="#D97706" />
              <span>Gemma/Groq: Turn distributor WhatsApp text into Order</span>
            </div>
            <span className="ai-try-badge">Try AI →</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: SCAN PRODUCT (Matches Image 1 Screen 3)
          ========================================================================= */}
      {currentScreen === 'scan' && (
        <div className="screen-layout scan-screen-view">
          {/* Top Bar */}
          <header className="scan-top-header">
            <button
              type="button"
              className="icon-circle-btn white-transparent"
              onClick={() => setCurrentScreen('home')}
            >
              <X size={20} color="#FFFFFF" />
            </button>
            <span className="scan-header-title">Scan Product</span>
            <div style={{ width: 36 }} />
          </header>

          {/* Camera Viewfinder Area */}
          <div className="scanner-viewfinder-area">
            <div className="camera-backdrop-mock">
              <div className="scanner-reticle">
                <div className="reticle-corner top-left" />
                <div className="reticle-corner top-right" />
                <div className="reticle-corner bottom-left" />
                <div className="reticle-corner bottom-right" />
                <div className="scan-laser-line" />
                <div className="barcode-mock-overlay">
                  <div className="mock-barcode-lines" />
                  <span className="mock-barcode-num">8 801491 105126</span>
                </div>
              </div>
              <p className="scanner-instruction">Point camera at product barcode</p>
            </div>
          </div>

          {/* Bottom Scanned Product Card Sheet */}
          {scannedItem && (
            <div className="scanned-product-sheet">
              <div className="scanned-info-row">
                <div className="scanned-thumb-box">
                  <span className="scanned-emoji">{scannedItem.emoji}</span>
                </div>
                <div className="scanned-titles">
                  <h4 className="scanned-name">{scannedItem.name}</h4>
                  <span className="scanned-pack">{scannedItem.size}</span>
                </div>
              </div>

              <div className="scanned-pricing-list">
                <div className="price-item-row">
                  <span className="label">MRP</span>
                  <span className="value">₹ {scannedItem.mrp}</span>
                </div>
                <div className="price-item-row">
                  <span className="label">Your Price</span>
                  <span className="value bold-val">₹ {scannedItem.price}</span>
                </div>
                <div className="price-item-row">
                  <span className="label">Current Stock</span>
                  <span className="value">{scannedItem.stock} pcs</span>
                </div>
              </div>

              <button
                type="button"
                className="scanned-primary-btn"
                onClick={() => {
                  setSaleCart([
                    ...saleCart,
                    {
                      id: `scan-${Date.now()}`,
                      name: scannedItem.name,
                      size: scannedItem.size,
                      unitPrice: scannedItem.price,
                      quantity: 1,
                      imageEmoji: scannedItem.emoji,
                    },
                  ]);
                  setCurrentScreen('new-sale');
                }}
              >
                <span>Add to Sale →</span>
              </button>

              <button
                type="button"
                className="scanned-edit-link"
                onClick={() => alert('Product edit opened.')}
              >
                Edit Details
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: NEW SALE / BILLING (Matches Image 1 Screen 4)
          ========================================================================= */}
      {currentScreen === 'new-sale' && (
        <div className="screen-layout new-sale-view">
          {/* Header */}
          <header className="page-header-bar">
            <button
              type="button"
              className="back-circle-btn"
              onClick={() => setCurrentScreen('home')}
            >
              <ArrowLeft size={20} color="#1F2937" />
            </button>
            <h2 className="page-header-title">New Sale</h2>
            <button
              type="button"
              className="trash-btn"
              onClick={() => {
                if (confirm('Clear current sale?')) setSaleCart([]);
              }}
              title="Clear items"
            >
              <Trash2 size={18} color="#9CA3AF" />
            </button>
          </header>

          {/* Cart Item Rows */}
          <div className="cart-items-scroll-list">
            {saleCart.map((item) => (
              <div key={item.id} className="sale-item-card">
                <div className="sale-item-thumb">
                  <span>{item.imageEmoji}</span>
                </div>

                <div className="sale-item-info">
                  <h4 className="item-name">{item.name}</h4>
                  <span className="item-unit">{item.size}</span>
                  <span className="item-unit-cost">₹ {item.unitPrice}</span>
                </div>

                <div className="sale-item-stepper-wrap">
                  <div className="qty-stepper">
                    <button
                      type="button"
                      className="step-btn"
                      onClick={() => {
                        const newCart = saleCart
                          .map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
                          .filter((i) => i.quantity > 0);
                        setSaleCart(newCart);
                      }}
                    >
                      &minus;
                    </button>
                    <span className="stepper-val">{item.quantity}</span>
                    <button
                      type="button"
                      className="step-btn"
                      onClick={() => {
                        setSaleCart(
                          saleCart.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
                        );
                      }}
                    >
                      +
                    </button>
                  </div>
                  <span className="item-line-total">₹ {item.unitPrice * item.quantity}</span>
                </div>
              </div>
            ))}

            {saleCart.length === 0 && (
              <div className="empty-cart-state">
                <ShoppingCart size={40} color="#D1D5DB" />
                <p>Sale cart is empty.</p>
              </div>
            )}

            <button
              type="button"
              className="add-another-btn"
              onClick={() => {
                const addP = products[Math.floor(Math.random() * products.length)];
                if (addP) {
                  setSaleCart([
                    ...saleCart,
                    {
                      id: `cart-${Date.now()}`,
                      name: addP.name,
                      size: addP.baseUnit,
                      unitPrice: addP.sellingPrice || 20,
                      quantity: 1,
                      imageEmoji: '📦',
                    },
                  ]);
                }
              }}
            >
              <Plus size={16} />
              <span>Add Another Product</span>
            </button>
          </div>

          {/* Bill Summary & Complete Sale CTA */}
          <footer className="sale-checkout-bar">
            <div className="checkout-summary-row">
              <span className="checkout-label">Total Items</span>
              <span className="checkout-val bold">{saleCart.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="checkout-summary-row">
              <span className="checkout-label">Total Amount</span>
              <span className="checkout-val total-price">
                ₹ {saleCart.reduce((s, i) => s + i.unitPrice * i.quantity, 0)}
              </span>
            </div>

            <button
              type="button"
              className="complete-sale-btn"
              disabled={saleCart.length === 0}
              onClick={handleCompleteSale}
            >
              Complete Sale
            </button>
          </footer>
        </div>
      )}

      {/* =========================================================================
          SCREEN 4: INVENTORY (Matches Image 1 Screen 5)
          ========================================================================= */}
      {currentScreen === 'inventory' && (
        <div className="screen-layout inventory-view">
          {/* Header */}
          <header className="page-header-bar">
            <button
              type="button"
              className="back-circle-btn"
              onClick={() => setCurrentScreen('home')}
            >
              <ArrowLeft size={20} color="#1F2937" />
            </button>
            <h2 className="page-header-title">Inventory</h2>
            <div style={{ width: 36 }} />
          </header>

          {/* Filter Pills */}
          <div className="filter-pills-row">
            <button
              type="button"
              className={`pill-btn ${inventoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setInventoryFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`pill-btn ${inventoryFilter === 'low' ? 'active' : ''}`}
              onClick={() => setInventoryFilter('low')}
            >
              Low Stock
            </button>
            <button
              type="button"
              className={`pill-btn ${inventoryFilter === 'out' ? 'active' : ''}`}
              onClick={() => setInventoryFilter('out')}
            >
              Out of Stock
            </button>
          </div>

          {/* Search Bar */}
          <div className="inventory-search-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search product..."
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              className="inventory-search-input"
            />
          </div>

          {/* Products List */}
          <div className="inventory-products-scroll">
            {filteredInventory.map((prod) => {
              const isOut = prod.currentStock === 0;
              const isLow = prod.currentStock <= prod.lowStockThreshold;

              return (
                <div
                  key={prod.id}
                  className="inventory-row-item"
                  onClick={() => {
                    setSelectedProduct(prod);
                    setCurrentScreen('product-detail');
                  }}
                >
                  <div className="prod-thumb-square">
                    <span className="prod-thumb-emoji">
                      {prod.name.includes('Maggi') ? '🍜' :
                       prod.name.includes('Salt') ? '🧂' :
                       prod.name.includes('Marie') ? '🍪' :
                       prod.name.includes('Butter') ? '🧈' :
                       prod.name.includes('Atta') ? '🌾' : '📦'}
                    </span>
                  </div>

                  <div className="prod-center-col">
                    <h4 className="prod-main-title">{prod.name}</h4>
                    <span className="prod-sub-size">{prod.baseUnit}</span>
                    <div className="badge-status-row">
                      <span className={`stock-left-badge ${isOut ? 'out' : isLow ? 'low' : 'optimal'}`}>
                        {isOut ? 'Out of Stock' : `${prod.currentStock} left`}
                      </span>
                    </div>
                  </div>

                  <div className="prod-right-col">
                    <span className="reorder-soon-tag">Reorder soon</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 5: PRODUCT DETAILS & SMART REORDER (Matches Image 1 Screen 6)
          ========================================================================= */}
      {currentScreen === 'product-detail' && selectedProduct && (
        <div className="screen-layout product-detail-view">
          {/* Header */}
          <header className="page-header-bar">
            <button
              type="button"
              className="back-circle-btn"
              onClick={() => setCurrentScreen('inventory')}
            >
              <ArrowLeft size={20} color="#1F2937" />
            </button>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              className="edit-circle-btn"
              onClick={() => {
                const newStock = parseInt(prompt('Update Stock Quantity:', selectedProduct.currentStock.toString()) || '0', 10);
                db.products.update(selectedProduct.id, { currentStock: newStock }).then(() => loadData());
              }}
            >
              <Edit3 size={18} color="#1F2937" />
            </button>
          </header>

          {/* Product Header Graphic */}
          <div className="product-detail-hero">
            <div className="hero-product-image-box">
              <span style={{ fontSize: 48 }}>
                {selectedProduct.name.includes('Salt') ? '🧂' :
                 selectedProduct.name.includes('Maggi') ? '🍜' : '📦'}
              </span>
            </div>
            <h2 className="product-hero-name">{selectedProduct.name}</h2>
            <span className="product-hero-vendor">1kg • HUL</span>
          </div>

          {/* Stock Overview (3 Metrics) */}
          <div className="stock-overview-section">
            <h4 className="overview-title">Stock Overview</h4>
            <div className="overview-cards-3">
              <div className="overview-metric-card alert">
                <span className="metric-label">Current Stock</span>
                <span className="metric-val red">{selectedProduct.currentStock} pcs</span>
              </div>

              <div className="overview-metric-card">
                <span className="metric-label">Reorder Level</span>
                <span className="metric-val">{selectedProduct.lowStockThreshold} pcs</span>
              </div>

              <div className="overview-metric-card">
                <span className="metric-label">Suggested Order</span>
                <span className="metric-val green">25 pcs</span>
              </div>
            </div>
          </div>

          {/* Sales Trend (Last 30 Days Bar Chart) */}
          <div className="sales-trend-section">
            <div className="trend-title-row">
              <h4 className="overview-title">Sales Trend (Last 30 Days)</h4>
              <span className="avg-velocity">Avg. 2 pcs/day</span>
            </div>

            {/* Pure CSS Bar Chart */}
            <div className="bar-chart-graphic">
              {[4, 2, 6, 8, 3, 5, 2, 7, 4, 3, 8, 2, 5, 6, 4, 3].map((val, i) => (
                <div key={i} className="chart-bar-col">
                  <div
                    className="chart-bar-fill"
                    style={{ height: `${val * 11}%`, backgroundColor: val >= 6 ? '#10B981' : '#CBD5E1' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Smart Suggestion Card */}
          <div className="smart-suggestion-card">
            <div className="suggestion-icon-wrap">
              <Lightbulb size={20} color="#D97706" />
            </div>
            <div className="suggestion-text-wrap">
              <h5 className="suggestion-headline">Smart Suggestion</h5>
              <p className="suggestion-body">
                Order 25 pcs now. Based on recent sales, supplier lead time and safety stock.
              </p>
            </div>
          </div>

          {/* Add to Order CTA Button */}
          <div className="product-detail-bottom-btn">
            <button
              type="button"
              className="add-to-order-btn"
              onClick={() => {
                setSupplierOrderItems([
                  {
                    id: `ord-${Date.now()}`,
                    name: selectedProduct.name,
                    size: selectedProduct.baseUnit,
                    quantity: 25,
                    emoji: '🧂',
                  },
                  ...supplierOrderItems,
                ]);
                setCurrentScreen('supplier-order');
              }}
            >
              Add to Order →
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 6: ORDER TO SUPPLIER (Matches Image 1 Screen 7)
          ========================================================================= */}
      {currentScreen === 'supplier-order' && (
        <div className="screen-layout supplier-order-view">
          {/* Header */}
          <header className="page-header-bar">
            <button
              type="button"
              className="back-circle-btn"
              onClick={() => setCurrentScreen('home')}
            >
              <ArrowLeft size={20} color="#1F2937" />
            </button>
            <h2 className="page-header-title">Order to Supplier</h2>
            <div style={{ width: 36 }} />
          </header>

          {/* Supplier Dropdown Card */}
          <div className="supplier-selector-card">
            <div className="supplier-avatar">
              <span>👤</span>
            </div>
            <div className="supplier-details">
              <h4 className="supplier-name">Sharma Distributors</h4>
              <span className="delivery-timing">Next delivery: Tomorrow</span>
            </div>
            <ChevronDown size={18} color="#9CA3AF" />
          </div>

          {/* Suggested Order List */}
          <div className="suggested-order-header-row">
            <h4 className="suggested-heading">Suggested Order ({supplierOrderItems.length} items)</h4>
          </div>

          <div className="supplier-items-scroll">
            {supplierOrderItems.map((item) => (
              <div key={item.id} className="supplier-item-row">
                <div className="supplier-item-thumb">
                  <span>{item.emoji}</span>
                </div>

                <div className="supplier-item-info">
                  <h5 className="supplier-item-name">{item.name}</h5>
                  <span className="supplier-item-size">{item.size}</span>
                </div>

                <div className="qty-stepper">
                  <button
                    type="button"
                    className="step-btn"
                    onClick={() => {
                      setSupplierOrderItems(
                        supplierOrderItems
                          .map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
                          .filter((i) => i.quantity > 0)
                      );
                    }}
                  >
                    &minus;
                  </button>
                  <span className="stepper-val">{item.quantity}</span>
                  <button
                    type="button"
                    className="step-btn"
                    onClick={() => {
                      setSupplierOrderItems(
                        supplierOrderItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
                      );
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="add-more-order-items-btn"
              onClick={() => {
                const name = prompt('Add product to order:');
                if (name) {
                  setSupplierOrderItems([
                    ...supplierOrderItems,
                    { id: `ord-${Date.now()}`, name, size: 'pkt', quantity: 10, emoji: '📦' },
                  ]);
                }
              }}
            >
              <Plus size={16} />
              <span>Add More Items</span>
            </button>
          </div>

          {/* Bottom Send Order Button */}
          <div className="supplier-order-bottom-bar">
            <button
              type="button"
              className="send-order-primary-btn"
              onClick={handleSendSupplierOrder}
            >
              <Share2 size={18} />
              <span>Send Order</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 7: INSIGHTS (Matches Image 1 Screen 8)
          ========================================================================= */}
      {currentScreen === 'insights' && (
        <div className="screen-layout insights-view">
          {/* Header */}
          <header className="page-header-bar">
            <button
              type="button"
              className="back-circle-btn"
              onClick={() => setCurrentScreen('home')}
            >
              <ArrowLeft size={20} color="#1F2937" />
            </button>
            <h2 className="page-header-title">Insights</h2>
            <div className="time-range-select">
              <span>Last 30 Days</span>
              <ChevronDown size={14} />
            </div>
          </header>

          {/* Stats Summary Cards */}
          <div className="stats-cards-row">
            <div className="dash-stat-box">
              <span className="stat-box-label">Total Sales</span>
              <div className="stat-box-val-row">
                <span className="stat-amount">₹ 1,12,430</span>
                <span className="growth-pill">+ 18%</span>
              </div>
            </div>

            <div className="dash-stat-box">
              <span className="stat-box-label">Items Sold</span>
              <div className="stat-box-val-row">
                <span className="stat-amount">642</span>
                <span className="growth-pill">+ 12%</span>
              </div>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="insights-card-section">
            <h4 className="section-title-bold">Top Selling Products</h4>
            <div className="insights-item-row">
              <span className="emoji-badge">🍪</span>
              <span className="prod-name-rank">Parle-G Biscuits</span>
              <span className="count-rank">420 pcs</span>
            </div>
            <div className="insights-item-row">
              <span className="emoji-badge">🥛</span>
              <span className="prod-name-rank">Amul Taaza Milk</span>
              <span className="count-rank">310 pcs</span>
            </div>
            <div className="insights-item-row">
              <span className="emoji-badge">🍜</span>
              <span className="prod-name-rank">Maggi Noodles</span>
              <span className="count-rank">280 pcs</span>
            </div>
          </div>

          {/* Slow Moving Products */}
          <div className="insights-card-section">
            <div className="section-title-row-split">
              <h4 className="section-title-bold">Slow Moving Products</h4>
              <span className="view-all-link">View all</span>
            </div>
            <div className="insights-item-row warning">
              <span className="emoji-badge">🫖</span>
              <div className="slow-prod-details">
                <span className="prod-name-rank">Red Label Tea</span>
                <span className="sub-warn">Only 2 sold in 30 days</span>
              </div>
            </div>
            <div className="insights-item-row warning">
              <span className="emoji-badge">🧴</span>
              <div className="slow-prod-details">
                <span className="prod-name-rank">Vim Dishwash</span>
                <span className="sub-warn">Only 1 sold in 30 days</span>
              </div>
            </div>
          </div>

          {/* AI Strategy Button */}
          <div className="ai-strategy-box">
            <button
              type="button"
              className="generate-insights-btn"
              onClick={async () => {
                alert('Generating Gemini & Groq smart inventory recommendations...');
                const advice = await generateSmartInventoryInsights(
                  user?.shopName || 'Sharma Store',
                  4820,
                  ['Tata Salt', 'Maggi Noodles', 'Amul Butter'],
                  ['Red Label Tea', 'Vim Dishwash']
                );
                alert(`💡 RozKa AI Advisor:\n\n${advice}`);
              }}
            >
              <Sparkles size={16} />
              <span>Ask Gemini / Groq for Reorder Advice</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          BOTTOM NAVIGATION BAR (All 4 Primary Tabs)
          ========================================================================= */}
      <nav className="bottom-nav-bar">
        <button
          type="button"
          className={`nav-tab-item ${currentScreen === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('home')}
        >
          <div className="nav-icon-wrap">
            <span style={{ fontSize: 20 }}>🏠</span>
          </div>
          <span className="nav-tab-label">Home</span>
        </button>

        <button
          type="button"
          className={`nav-tab-item ${currentScreen === 'inventory' || currentScreen === 'product-detail' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('inventory')}
        >
          <div className="nav-icon-wrap">
            <span style={{ fontSize: 20 }}>📦</span>
          </div>
          <span className="nav-tab-label">Inventory</span>
        </button>

        <button
          type="button"
          className={`nav-tab-item ${currentScreen === 'new-sale' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('new-sale')}
        >
          <div className="nav-icon-wrap">
            <span style={{ fontSize: 20 }}>🛒</span>
          </div>
          <span className="nav-tab-label">Sales</span>
        </button>

        <button
          type="button"
          className={`nav-tab-item ${currentScreen === 'insights' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('insights')}
        >
          <div className="nav-icon-wrap">
            <span style={{ fontSize: 20 }}>📊</span>
          </div>
          <span className="nav-tab-label">Insights</span>
        </button>
      </nav>

      {/* =========================================================================
          LEFT SLIDE-OVER DRAWER MENU
          ========================================================================= */}
      {isMenuOpen && (
        <div className="drawer-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-brand">
                <span className="logo-roz">Roz</span>
                <span className="logo-ka">Ka</span>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-user-info">
              <h4 className="drawer-shop-name">{user?.shopName}</h4>
              <p className="drawer-owner">{user?.displayName || 'Store Owner'}</p>
              <p className="drawer-email">{user?.email}</p>
            </div>

            <div className="drawer-menu-links">
              <button
                type="button"
                className="drawer-item-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleManualSync();
                }}
              >
                <RefreshCw size={18} />
                <span>Sync with Supabase ({pendingSyncCount} pending)</span>
              </button>

              <button
                type="button"
                className="drawer-item-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAiModalOpen(true);
                }}
              >
                <Sparkles size={18} color="#D97706" />
                <span>AI Message Order Parser</span>
              </button>

              <button
                type="button"
                className="drawer-item-btn"
                onClick={() => {
                  window.location.hash = '#privacy';
                  setIsMenuOpen(false);
                }}
              >
                <FileText size={18} />
                <span>Privacy Policy</span>
              </button>

              <button
                type="button"
                className="drawer-item-btn"
                onClick={() => {
                  window.location.hash = '#terms';
                  setIsMenuOpen(false);
                }}
              >
                <FileText size={18} />
                <span>Terms of Service</span>
              </button>

              <div className="drawer-divider" />

              <button
                type="button"
                className="drawer-item-btn signout"
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut();
                }}
              >
                <LogOut size={18} color="#DC2626" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          AI MESSAGE PARSER MODAL
          ========================================================================= */}
      {isAiModalOpen && (
        <div className="ai-modal-overlay" onClick={() => setIsAiModalOpen(false)}>
          <div className="ai-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-wrap">
                <Sparkles size={20} color="#D97706" />
                <h3>RozKa AI Distributor Assistant</h3>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsAiModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="modal-sub">
              Paste or type any Hindi/English WhatsApp distributor message. Our multi-engine AI (Groq + Gemini + Local Offline) will automatically convert it into a draft supplier order!
            </p>

            <textarea
              className="ai-message-textarea"
              rows={4}
              value={aiMessageInput}
              onChange={(e) => setAiMessageInput(e.target.value)}
              placeholder="e.g. Parle-G 20 packets, Maggi 10, refined oil 5 litre"
            />

            {aiParsedResult && (
              <div className="ai-result-callout">
                <CheckCircle size={16} color="#059669" />
                <span>{aiParsedResult}</span>
              </div>
            )}

            <div className="modal-actions-row">
              <button
                type="button"
                className="ai-parse-btn"
                onClick={handleParseAiMessage}
                disabled={aiLoading}
              >
                {aiLoading ? 'Processing...' : 'Parse into Supplier Order →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
