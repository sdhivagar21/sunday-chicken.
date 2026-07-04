import { useState, useEffect, useCallback } from 'react';
import { orderService } from '@/services/order.service';

export function useMyOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    orderService.getMyOrders()
      .then(res  => setOrders(res.data?.orders || []))
      .catch(err => setError(err.message))
      .finally(()=> setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { orders, loading, error, refetch: fetch };
}

export function useOrder(id) {
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(() => {
    if (!id) return;
    setLoading(true);
    orderService.getById(id)
      .then(res  => setOrder(res.data?.order || null))
      .catch(err => setError(err.message))
      .finally(()=> setLoading(false));
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { order, loading, error, refetch: fetch };
}
