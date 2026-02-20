import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { productService } from '../services/productService';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await productService.fetchProducts();
            setProducts(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar produtos.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const addProduct = useCallback(async (newProductData: Omit<Product, 'id'>) => {
        try {
            const newProduct = await productService.addProduct(newProductData);
            setProducts(prev => [newProduct, ...prev]);
            return true;
        } catch (err) {
            console.error(err);
            setError('Erro ao adicionar produto.');
            return false;
        }
    }, []);

    const updateInventory = useCallback(async (id: string | number, delta: number) => {
        // Optimistic update
        setProducts(prev =>
            prev.map(p => {
                if (p.id !== id) return p;
                const newInventory = Math.max(0, p.inventory + delta);
                return { ...p, inventory: newInventory };
            })
        );

        try {
            await productService.updateInventory(id, delta);
        } catch (err) {
            console.error(err);
            setError('Erro ao atualizar estoque. Revertendo...');
            await loadProducts(); // Revert on error
        }
    }, [loadProducts]);

    const editProduct = useCallback(async (product: Product) => {
        try {
            const updated = await productService.updateProduct(product);
            setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
            return true;
        } catch (err) {
            console.error(err);
            setError('Erro ao editar produto.');
            return false;
        }
    }, []);

    const updatePrice = useCallback(async (id: string | number, newPrice: number) => {
        // Optimistic update
        setProducts(prev =>
            prev.map(p => {
                if (p.id !== id) return p;
                return { ...p, price: Math.max(0, newPrice) };
            })
        );

        try {
            await productService.updatePrice(id, newPrice);
        } catch (err) {
            console.error(err);
            setError('Erro ao atualizar preço.');
            await loadProducts(); // Revert
        }
    }, [loadProducts]);

    const deleteProduct = useCallback(async (id: string | number) => {
        // Optimistic update
        const previousProducts = [...products];
        setProducts(prev => prev.filter(p => p.id !== id));

        try {
            await productService.deleteProduct(id);
            return true;
        } catch (err) {
            console.error(err);
            setError('Erro ao excluir produto. Revertendo...');
            setProducts(previousProducts);
            return false;
        }
    }, [products]);

    const togglePromotion = useCallback(async (id: string | number, value: boolean) => {
        // Optimistic update
        setProducts(prev => prev.map(p => p.id === id ? { ...p, isPromotion: value } : p));

        try {
            await productService.togglePromotion(id, value);
        } catch (err) {
            console.error(err);
            setError('Erro ao atualizar promoção. Revertendo...');
            await loadProducts(); // Revert
        }
    }, [loadProducts]);

    const toggleFreeShipping = useCallback(async (id: string | number, value: boolean) => {
        // Optimistic update
        setProducts(prev => prev.map(p => p.id === id ? { ...p, freeShipping: value } : p));

        try {
            await productService.toggleFreeShipping(id, value);
        } catch (err) {
            console.error(err);
            setError('Erro ao atualizar frete grátis. Revertendo...');
            await loadProducts(); // Revert
        }
    }, [loadProducts]);

    const toggleFeatured = useCallback(async (id: string | number, value: boolean) => {
        // Optimistic update
        setProducts(prev => prev.map(p => p.id === id ? { ...p, isFeatured: value } : p));

        try {
            await productService.toggleFeatured(id, value);
        } catch (err) {
            console.error(err);
            setError('Erro ao atualizar destaque. Revertendo...');
            await loadProducts(); // Revert
        }
    }, [loadProducts]);

    return {
        products,
        loading,
        error,
        addProduct,
        editProduct,
        deleteProduct,
        togglePromotion,
        toggleFreeShipping,
        toggleFeatured,
        updateInventory,
        updatePrice,
        refresh: loadProducts
    };
};
