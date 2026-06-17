
import { useState, useEffect, useCallback } from 'react';
import { Client } from '../types';
import { apiService } from '../services/api';

export const useClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClients = useCallback(async () => {
        setLoading(true);
        setError(null);
        const response = await apiService.getClients();
        if (response.success && response.data) {
            setClients(response.data);
        } else {
            setError(response.error || 'Failed to fetch clients');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchClients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addClient = async (clientData: Omit<Client, 'id' | 'projectIds'>) => {
        const response = await apiService.addClient(clientData);
        if (response.success && response.data) {
            setClients(prevClients => [response.data!, ...prevClients]);
        }
        return response;
    };

    const updateClient = async (clientId: string, updates: Partial<Client>) => {
        const response = await apiService.updateClient(clientId, updates);
        if (response.success && response.data) {
            setClients(prevClients => prevClients.map(c => (c.id === clientId ? response.data! : c)));
        }
        return response;
    };

    const deleteClient = async (clientId: string) => {
        const response = await apiService.deleteClient(clientId);
        if (response.success) {
            setClients(prevClients => prevClients.filter(c => c.id !== clientId));
        }
        return response;
    };

    return { clients, loading, error, fetchClients, addClient, updateClient, deleteClient };
};
