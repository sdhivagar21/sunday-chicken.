import { useState, useEffect } from 'react';
import { categoryService } from '@/services/category.service';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    categoryService.getAll()
      .then(res  => setCategories(res.data?.categories || []))
      .catch(()  => setCategories([]))
      .finally(()=> setLoading(false));
  }, []);

  return { categories, loading };
}
