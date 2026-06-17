import { useState, useEffect, useCallback } from 'react';
import { ProductionStepTemplate } from '../types';
import { apiService } from '../services/api';

export const useProductionSteps = () => {
    const [stepTemplates, setStepTemplates] = useState<ProductionStepTemplate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStepTemplates = useCallback(async () => {
        setLoading(true);
        setError(null);
        const response = await apiService.getProductionStepTemplates();
        if (response.success && response.data) {
            setStepTemplates(response.data);
        } else {
            setError(response.error || 'Failed to fetch production step templates');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchStepTemplates();
    }, [fetchStepTemplates]);

    const updateStepTemplate = async (templateId: string, updates: Partial<ProductionStepTemplate>) => {
        const response = await apiService.updateProductionStepTemplate(templateId, updates);
        if (response.success && response.data) {
            setStepTemplates(prevTemplates => 
                prevTemplates.map(t => (t.id === templateId ? response.data! : t))
            );
        }
        return response;
    };

    const addStepTemplate = async () => {
        const response = await apiService.addProductionStepTemplate();
        if (response.success && response.data) {
            setStepTemplates(prevTemplates => [...prevTemplates, response.data!]);
        }
        return response;
    };

    const deleteStepTemplate = async (templateId: string) => {
        const response = await apiService.deleteProductionStepTemplate(templateId);
        if (response.success) {
            setStepTemplates(prevTemplates => prevTemplates.filter(t => t.id !== templateId));
        }
        return response;
    };

    return { stepTemplates, loading, error, fetchStepTemplates, updateStepTemplate, addStepTemplate, deleteStepTemplate };
};