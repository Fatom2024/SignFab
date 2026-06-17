
import React, { useState, useEffect } from 'react';
import { Client, ClientType, ClientEntreprise } from '../../types';
import Card from '../ui/Card';

interface ClientFormProps {
    onSave: (data: Omit<Client, 'id' | 'projectIds'>, id?: string) => void;
    onCancel: () => void;
    clientToEdit?: Client | null;
}

const defaultFormData = {
    type: ClientType.PARTICULIER,
    name: '',
    contactEmail: '',
    contactPhone: '',
    rc: '',
    nif: '',
    nis: '',
    bankAccount: '',
};

const ClientForm: React.FC<ClientFormProps> = ({ onSave, onCancel, clientToEdit }) => {
    const [formData, setFormData] = useState(defaultFormData);
    const isEditing = !!clientToEdit;

    useEffect(() => {
        if (isEditing && clientToEdit) {
            const entrepriseData = clientToEdit.type === ClientType.ENTREPRISE ? clientToEdit as ClientEntreprise : {} as Partial<ClientEntreprise>;
            setFormData({
                type: clientToEdit.type,
                name: clientToEdit.name,
                contactEmail: clientToEdit.contactEmail,
                contactPhone: clientToEdit.contactPhone,
                rc: entrepriseData.rc || '',
                nif: entrepriseData.nif || '',
                nis: entrepriseData.nis || '',
                bankAccount: entrepriseData.bankAccount || '',
            });
        } else {
            setFormData(defaultFormData);
        }
    }, [clientToEdit, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.contactEmail) {
            alert('Veuillez remplir le nom et l\'email du client.');
            return;
        }

        // FIX: The explicit type annotation on `dataToSave` caused an excess property error
        // because the object literal was checked against the entire union. Removing it
        // allows TypeScript to infer the correct union type from the branches.
        let dataToSave;

        if (formData.type === ClientType.ENTREPRISE) {
            // FIX: Explicitly construct the `ClientEntreprise` object to avoid errors with
            // spreading into a variable typed as a discriminated union. This ensures all
            // required properties are present and correctly typed.
            dataToSave = {
                type: ClientType.ENTREPRISE,
                name: formData.name,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                rc: formData.rc,
                nif: formData.nif,
                nis: formData.nis,
                bankAccount: formData.bankAccount,
            };
        } else {
            // FIX: Explicitly construct the object for non-enterprise clients to avoid
            // spreading properties ('rc', 'nif', etc.) that don't belong to this client type.
            // This resolves the TypeScript error about unknown properties.
            dataToSave = {
                type: formData.type as ClientType.PARTICULIER | ClientType.REVENDEUR,
                name: formData.name,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone
            };
        }

        onSave(dataToSave, clientToEdit?.id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
            <Card title={isEditing ? 'Modifier le client' : 'Ajouter un nouveau client'} className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type de Client</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                        >
                            {Object.values(ClientType).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom du Client</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="contactEmail" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                            <input type="tel" id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                        </div>
                    </div>
                    
                    {formData.type === ClientType.ENTREPRISE && (
                        <div className="p-4 border border-gray-200 rounded-md space-y-4 bg-gray-50 animate-fade-in">
                             <h3 className="text-md font-semibold text-gray-600">Informations de l'entreprise</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="rc" className="block text-sm font-medium text-gray-700">N° RC</label>
                                    <input type="text" id="rc" name="rc" value={formData.rc} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="nif" className="block text-sm font-medium text-gray-700">NIF</label>
                                    <input type="text" id="nif" name="nif" value={formData.nif} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="nis" className="block text-sm font-medium text-gray-700">NIS</label>
                                    <input type="text" id="nis" name="nis" value={formData.nis} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                                </div>
                                 <div>
                                    <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700">Compte Bancaire</label>
                                    <input type="text" id="bankAccount" name="bankAccount" value={formData.bankAccount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
                                </div>
                             </div>
                        </div>
                    )}
                    
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50">{isEditing ? 'Enregistrer' : 'Créer le client'}</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ClientForm;