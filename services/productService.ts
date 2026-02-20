
import { supabase } from './supabase';
import { Product, Category } from '../types';

export const productService = {
    async fetchProducts(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            throw error;
        }

        return data.map((item: any) => {
            // DIRECT COLUMN MAPPING
            // No more _unpackMetadata. We read directly from columns.

            return {
                id: item.id,
                name: item.name || 'Sem nome',
                sku: item.brand || '', // Mapping 'brand' column to 'sku' frontend field
                price: item.price || 0,
                imageUrl: item.image || '',
                category: (item.surface as Category) || 'Futsal',
                colors: item.colors || [], // Direct column access
                isPromotion: item.is_promotion || false, // Direct column access
                stock: Array.isArray(item.stock) ? item.stock : [],
                // Optional fields for compatibility
                technologies: item.technologies || [],
                material: item.material || '',
                weight: item.weight || '',
                description: item.description || '',
                freeShipping: item.free_shipping || false,

                // Calculate total inventory from stock JSON
                inventory: Array.isArray(item.stock)
                    ? item.stock.reduce((acc: number, curr: any) => acc + (Number(curr.quantity) || 0), 0)
                    : 0
            };
        });
    },

    async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
        // Use provided stock or create default if empty
        const stock = product.stock && product.stock.length > 0
            ? product.stock
            : [{ size: 'Único', color: product.colors?.[0] || 'Padrão', quantity: product.inventory }];

        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    name: product.name,
                    brand: product.sku, // Saving 'sku' input to 'brand' column
                    price: product.price,
                    image: product.imageUrl,
                    surface: product.category,
                    stock: stock,
                    colors: product.colors, // Direct write
                    is_promotion: product.isPromotion, // Direct write
                    description: product.description || '', // Direct write
                    technologies: product.technologies || [],
                    material: product.material || '',
                    weight: product.weight || '',
                    free_shipping: product.freeShipping || false
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error adding product:', error);
            throw error;
        }

        return this._mapToFrontend(data, product.inventory);
    },

    async updateInventory(id: string | number, delta: number): Promise<void> {
        // 1. Get current stock
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        let stock: any[] = Array.isArray(product.stock) ? product.stock : [];

        // 2. Update logic (simplistic: update first item or create default)
        if (stock.length > 0) {
            stock[0].quantity = Math.max(0, (Number(stock[0].quantity) || 0) + delta);
        } else {
            stock = [{ size: 'Único', color: 'Padrão', quantity: Math.max(0, delta) }];
        }

        // 3. Save back
        const { error: updateError } = await supabase
            .from('products')
            .update({ stock })
            .eq('id', id);

        if (updateError) throw updateError;
    },

    async updatePrice(id: string | number, newPrice: number): Promise<void> {
        const { error } = await supabase
            .from('products')
            .update({ price: newPrice })
            .eq('id', id);

        if (error) throw error;
    },

    async updateProduct(product: Product): Promise<Product> {
        // 1. Get current stock to preserve structure if needed, or we just overwrite with what's passed
        // For robust updates, if the user didn't modify stock in the UI, we might want to keep it?
        // Assuming the UI passes the full 'stock' object correctly.

        let stock = product.stock;

        // Fallback logic if stock array is empty/malformed but inventory number is positive
        if (!stock || stock.length === 0) {
            const stockColor = product.colors.length > 0 ? product.colors[0] : 'Padrão';
            stock = [{ size: 'Único', color: stockColor, quantity: product.inventory }];
        }

        const { data, error } = await supabase
            .from('products')
            .update({
                name: product.name,
                brand: product.sku,
                price: product.price,
                image: product.imageUrl,
                surface: product.category,
                stock: stock,
                colors: product.colors, // Direct write
                is_promotion: product.isPromotion, // Direct write
                description: product.description || '',
                technologies: product.technologies || [],
                material: product.material || '',
                weight: product.weight || '',
                free_shipping: product.freeShipping || false
            })
            .eq('id', product.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating product:', error);
            throw error;
        }

        return this._mapToFrontend(data, product.inventory);
    },

    async deleteProduct(id: string | number): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    // Helper to standardise return object
    _mapToFrontend(data: any, originalInventory?: number): Product {
        return {
            id: data.id,
            name: data.name,
            sku: data.brand,
            price: data.price,
            imageUrl: data.image,
            category: data.surface,
            colors: data.colors || [],
            isPromotion: data.is_promotion || false,
            stock: data.stock || [],
            technologies: data.technologies || [],
            material: data.material || '',
            weight: data.weight || '',
            description: data.description || '',
            freeShipping: data.free_shipping || false,
            inventory: Array.isArray(data.stock)
                ? data.stock.reduce((acc: number, curr: any) => acc + (Number(curr.quantity) || 0), 0)
                : (originalInventory || 0)
        };
    }
};
