import { db } from './dexieDb';
import type { SyncOutboxRecord } from './dexieDb';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

class SyncEngine {
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[RozKa SyncEngine] Online connection restored. Triggering sync...');
        this.processOutbox();
      });
    }
  }

  /**
   * Enqueues an operation into the IndexedDB outbox
   */
  async enqueue(
    shopId: string,
    entityType: string,
    entityId: string,
    operation: 'insert' | 'update' | 'delete',
    payload: unknown
  ): Promise<string> {
    const id = `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const record: SyncOutboxRecord = {
      id,
      shopId,
      entityType,
      entityId,
      operation,
      payload,
      status: 'pending',
      attemptCount: 0,
      lastError: null,
      createdAt: new Date().toISOString(),
    };

    await db.syncOutbox.put(record);

    // If online, immediately process in background
    if (navigator.onLine && isSupabaseConfigured) {
      this.processOutbox().catch(console.error);
    }

    return id;
  }

  /**
   * Processes all pending operations in the sync outbox
   */
  async processOutbox(): Promise<{ processed: number; failed: number }> {
    if (this.isSyncing || !navigator.onLine || !isSupabaseConfigured) {
      return { processed: 0, failed: 0 };
    }

    this.isSyncing = true;
    let processed = 0;
    let failed = 0;

    try {
      const pendingItems = await db.syncOutbox
        .where('status')
        .equals('pending')
        .limit(50)
        .toArray();

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await db.syncOutbox.update(item.id, {
            status: 'synced',
            lastError: null,
          });
          processed++;
        } catch (err: any) {
          failed++;
          await db.syncOutbox.update(item.id, {
            status: 'failed',
            attemptCount: item.attemptCount + 1,
            lastError: err.message || 'Sync failed',
          });
        }
      }
    } finally {
      this.isSyncing = false;
    }

    return { processed, failed };
  }

  /**
   * Syncs a single outbox record to Supabase
   */
  private async syncItem(item: SyncOutboxRecord) {
    const tableName = this.mapEntityTypeToTable(item.entityType);
    if (!tableName) return;

    const payload = item.payload as any;

    if (item.operation === 'insert' || item.operation === 'update') {
      const { error } = await supabase.from(tableName).upsert(payload);
      if (error) throw error;
    } else if (item.operation === 'delete') {
      const { error } = await supabase.from(tableName).delete().eq('id', item.entityId);
      if (error) throw error;
    }
  }

  private mapEntityTypeToTable(entityType: string): string | null {
    const tableMap: Record<string, string> = {
      product: 'products',
      sale: 'sales',
      sale_item: 'sale_items',
      inventory_movement: 'inventory_movements',
      purchase_order: 'purchase_orders',
      purchase_order_item: 'purchase_order_items',
      supplier: 'suppliers',
      category: 'categories',
      shop_settings: 'shop_settings',
    };
    return tableMap[entityType] || null;
  }
}

export const syncEngine = new SyncEngine();
