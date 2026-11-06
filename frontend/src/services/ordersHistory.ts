export interface SavedCustomerOrder {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus?: string;
  totalPrice: number;
  depositAmount?: number;
  remainingAmount?: number;
  subtotal?: number;
  deliveryFee?: number;
  notes?: string;
  items: Array<{
    id?: number;
    name: string;
    price: number;
    quantity: number;
    total?: number;
    size?: string;
    image?: string;
    addons?: any[];
  }>;
}

const STORAGE_KEY = 'loqma_customer_orders';

export function saveOrderToHistory(order: SavedCustomerOrder) {
  try {
    const existing = getCustomerOrdersHistory();
    // تجنب التكرار
    const filtered = existing.filter((o) => o.orderNumber !== order.orderNumber);
    const updated = [order, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving order to history:', e);
  }
}

export function getCustomerOrdersHistory(): SavedCustomerOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearOrdersHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * جلب سجل الطلبات من السيرفر ومزامنتها مع التخزين المحلي
 */
export async function syncAndFetchOrders(phone?: string, name?: string): Promise<SavedCustomerOrder[]> {
  try {
    const params = new URLSearchParams();
    if (phone) params.set('phone', phone);
    if (name) params.set('name', name);

    const res = await fetch(`/api/orders-history?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const local = getCustomerOrdersHistory();
        const mergedMap = new Map<string, SavedCustomerOrder>();
        
        // أضف المحلي أولاً
        local.forEach((o) => mergedMap.set(o.orderNumber, o));
        
        // أضف أو حدّث من السيرفر
        data.data.forEach((o: SavedCustomerOrder) => {
          mergedMap.set(o.orderNumber, {
            ...mergedMap.get(o.orderNumber),
            ...o,
          });
        });

        const merged = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.error('Failed to sync orders from server:', err);
  }
  return getCustomerOrdersHistory();
}
