
import { useState, useEffect, useCallback } from 'react';
import { StockItem } from '../types';
import { apiService } from '../services/api';

export const useStock = () => {
    const [stock, setStock] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStock = useCallback(async () => {
        setLoading(true);
        setError(null);
        const response = await apiService.getStock();
        if (response.success && response.data) {
            setStock(response.data);
        } else {
            setError(response.error || 'Failed to fetch stock');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchStock();
    }, [fetchStock]);

    const addStockItem = async (itemData: Omit<StockItem, 'id' | 'lastUpdated'>) => {
        const response = await apiService.addStockItem(itemData);
        if (response.success && response.data) {
            setStock(prev => [response.data!, ...prev]);
        }
        return response;
    };

    const updateStockItem = async (itemId: string, updates: Partial<StockItem>) => {
        const response = await apiService.updateStockItem(itemId, updates);
        if (response.success && response.data) {
            setStock(prev => prev.map(item => (item.id === itemId ? response.data! : item)));
        }
        return response;
    };

    const deleteStockItem = async (itemId: string) => {
        const response = await apiService.deleteStockItem(itemId);
        if (response.success) {
            setStock(prev => prev.filter(item => item.id !== itemId));
        }
        return response;
    };

    return { stock, loading, error, fetchStock, addStockItem, updateStockItem, deleteStockItem };
};
