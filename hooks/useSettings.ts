import { useState, useEffect, useCallback } from 'react';
import { CompanySettings } from '../types';

const SETTINGS_KEY = 'companySettings';

const defaultSettings: CompanySettings = {
    logoUrl: null,
    companyName: 'SignFab Manager',
    address: '123 Rue de l\'Enseigne',
    city: 'Alger',
    postalCode: '16000',
    phone: '0555 12 34 56',
    email: 'contact@signfab.dz',
    website: 'www.signfab.dz',
};

export const useSettings = () => {
    const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_KEY);
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }
        } catch (error) {
            console.error("Failed to load settings from localStorage", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveSettings = useCallback((newSettings: CompanySettings) => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    }, []);

    return { settings, saveSettings, loading };
};
