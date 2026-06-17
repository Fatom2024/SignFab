import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { CompanySettings } from '../../types';
import Card from '../ui/Card';

const SettingsView: React.FC = () => {
    const { settings, saveSettings, loading } = useSettings();
    const [formData, setFormData] = useState<CompanySettings>(settings);
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl);

    useEffect(() => {
        if (!loading) {
            setFormData(settings);
            setLogoPreview(settings.logoUrl);
        }
    }, [settings, loading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setLogoPreview(base64String);
                setFormData(prev => ({ ...prev, logoUrl: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveSettings(formData);
        alert('Paramètres enregistrés avec succès !');
    };

    if (loading) {
        return <div className="text-center p-8">Chargement des paramètres...</div>;
    }

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm";

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">Paramètres de l'Entreprise</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Logo */}
                    <div className="lg:col-span-1">
                        <Card title="Logo de l'entreprise">
                            <div className="flex flex-col items-center">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Aperçu du logo" className="h-32 w-auto mb-4 object-contain" />
                                ) : (
                                    <div className="h-32 w-full mb-4 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                        Aucun logo
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="logoUpload"
                                    accept="image/png, image/jpeg, image/svg+xml"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="logoUpload"
                                    className="cursor-pointer w-full text-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    Changer le logo
                                </label>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Info */}
                    <div className="lg:col-span-2">
                        <Card title="Informations de l'entreprise">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
                                    <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className={inputClasses} required />
                                </div>
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse</label>
                                    <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ville</label>
                                        <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Code Postal</label>
                                        <input type="text" name="postalCode" id="postalCode" value={formData.postalCode} onChange={handleChange} className={inputClasses} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClasses} />
                                    </div>
                                </div>
                                 <div>
                                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">Site Web</label>
                                    <input type="text" name="website" id="website" value={formData.website} onChange={handleChange} className={inputClasses} />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50 transition-colors"
                    >
                        Enregistrer les Paramètres
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsView;
