import { useState, useEffect } from 'react';
import { productService } from '@/services/product.service';

export function useProducts(params = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productService.getAll(params)
      .then(res  => { if (!cancelled) setProducts(res.data?.products || []); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(()=> { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [JSON.stringify(params)]);

  return { products, loading, error, setProducts };
}

export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productService.getById(id)
      .then(res  => setProduct(res.data?.product || null))
      .catch(err => setError(err.message))
      .finally(()=> setLoading(false));
  }, [id]);

  return { product, loading, error };
}
