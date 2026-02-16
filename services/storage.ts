import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

const STORAGE_KEY = 'inventory_app_products';

export const storageService = {
    loadProducts: (): Product[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return INITIAL_PRODUCTS;
            return JSON.parse(stored);
        } catch (error) {
            console.error('Failed to load products from storage:', error);
            return INITIAL_PRODUCTS;
        }
    },

    saveProducts: (products: Product[]): void => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        } catch (error) {
            console.error('Failed to save products to storage:', error);
        }
    },

    clearStorage: (): void => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear storage:', error);
        }
    }
};
