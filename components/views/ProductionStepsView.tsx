import React, { useState } from 'react';
import { useProductionSteps } from '../../hooks/useProductionSteps';
import { ClientType, ProductionStepTemplate, BillingType } from '../../types';
import Card from '../ui/Card';

const ProductionStepsView: React.FC = () => {
    const { stepTemplates, loading, error, updateStepTemplate, addStepTemplate, deleteStepTemplate } = useProductionSteps();
    const [editState, setEditState] = useState<{ [key: string]: Partial<ProductionStepTemplate> }>({});

    type EditableFields = keyof ProductionStepTemplate | ClientType;

    const handleInputChange = (id: string, field: EditableFields, value: string) => {
        const currentUpdates = editState[id] || {};
        
        if (field === 'name' || field === 'billingType') {
             setEditState({
                ...editState,
                [id]: { ...currentUpdates, [field]: value },
            });
        } else {
            const newPricing = { ...(stepTemplates.find(t=> t.id === id)?.pricing), ...(currentUpdates.pricing || {}), [field]: parseFloat(value) || 0 };
             setEditState({
                ...editState,
                [id]: { ...currentUpdates, pricing: newPricing },
            });
        }
    };

    const handleBlur = (id: string) => {
        const updates = editState[id];
        if (updates && Object.keys(updates).length > 0) {
            updateStepTemplate(id, updates);
            const newEditState = { ...editState };
            delete newEditState[id];
            setEditState(newEditState);
        }
    };

    const getDisplayValue = (template: ProductionStepTemplate, field: EditableFields): string | number => {
        const id = template.id;
        if (editState[id]) {
            if ((field === 'name' || field === 'billingType') && editState[id]?.[field] !== undefined) {
                return editState[id]![field] as string;
            }
             if (editState[id]?.pricing && editState[id]!.pricing![field as ClientType] !== undefined) {
                return editState[id]!.pricing![field as ClientType]!;
            }
        }
        
        if (field === 'name' || field === 'billingType') {
            return template[field];
        }
        return template.pricing ? (template.pricing[field as ClientType] || 0) : 0;
    };
    
    const handleAddStep = () => {
        addStepTemplate();
    };

    const handleDeleteStep = async (id: string, name: string) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'étape "${name}" ? Cette action est irréversible.`)) {
            await deleteStepTemplate(id);
        }
    };

    if (loading) return <div className="text-center p-8">Chargement des étapes de production...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Erreur: {error}</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-semibold text-gray-700 self-start sm:self-center">Gestion des Étapes & Tarifs</h2>
                <button 
                    onClick={handleAddStep}
                    className="w-full sm:w-auto px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50 transition-colors">
                    + Ajouter une Étape
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <th className="px-5 py-3 w-1/4">Nom de l'étape</th>
                                <th className="px-5 py-3">Type de Facturation</th>
                                <th className="px-5 py-3">{ClientType.PARTICULIER} (DZD)</th>
                                <th className="px-5 py-3">{ClientType.REVENDEUR} (DZD)</th>
                                <th className="px-5 py-3">{ClientType.ENTREPRISE} (DZD)</th>
                                <th className="px-5 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stepTemplates.map((template) => (
                                <tr key={template.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-5 py-2 text-sm">
                                        <input
                                            type="text"
                                            value={getDisplayValue(template, 'name') as string}
                                            onChange={(e) => handleInputChange(template.id, 'name', e.target.value)}
                                            onBlur={() => handleBlur(template.id)}
                                            className="w-full p-2 bg-transparent border border-transparent focus:bg-white focus:border-gray-300 rounded-md outline-none"
                                        />
                                    </td>
                                    <td className="px-5 py-2 text-sm">
                                        <select
                                            value={getDisplayValue(template, 'billingType') as string}
                                            onChange={(e) => handleInputChange(template.id, 'billingType', e.target.value)}
                                            onBlur={() => handleBlur(template.id)}
                                            className="w-full p-2 bg-transparent border border-transparent focus:bg-white focus:border-gray-300 rounded-md outline-none"
                                        >
                                            {Object.values(BillingType).map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </td>
                                    {Object.values(ClientType).map(clientType => (
                                        <td key={clientType} className="px-5 py-2 text-sm">
                                             <input
                                                type="number"
                                                value={getDisplayValue(template, clientType) as number}
                                                onChange={(e) => handleInputChange(template.id, clientType, e.target.value)}
                                                onBlur={() => handleBlur(template.id)}
                                                className="w-full p-2 bg-transparent border border-transparent focus:bg-white focus:border-gray-300 rounded-md outline-none"
                                            />
                                        </td>
                                    ))}
                                    <td className="px-5 py-2 text-sm text-center">
                                        <button 
                                            onClick={() => handleDeleteStep(template.id, template.name)}
                                            className="text-red-500 hover:text-red-700 p-1" 
                                            title="Supprimer l'étape"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-4">
                {stepTemplates.map(template => (
                    <Card key={template.id} className="p-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Nom de l'étape</label>
                                <input
                                    type="text"
                                    value={getDisplayValue(template, 'name') as string}
                                    onChange={(e) => handleInputChange(template.id, 'name', e.target.value)}
                                    onBlur={() => handleBlur(template.id)}
                                    className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-md outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Type de Facturation</label>
                                <select
                                    value={getDisplayValue(template, 'billingType') as string}
                                    onChange={(e) => handleInputChange(template.id, 'billingType', e.target.value)}
                                    onBlur={() => handleBlur(template.id)}
                                    className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-md outline-none text-sm"
                                >
                                    {Object.values(BillingType).map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-3 pt-2">
                                {Object.values(ClientType).map(clientType => (
                                    <div key={clientType}>
                                        <label className="block text-xs font-medium text-gray-500">{clientType} (DZD)</label>
                                        <input
                                            type="number"
                                            value={getDisplayValue(template, clientType) as number}
                                            onChange={(e) => handleInputChange(template.id, clientType, e.target.value)}
                                            onBlur={() => handleBlur(template.id)}
                                            className="mt-1 w-full p-2 bg-white border border-gray-300 rounded-md outline-none text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-2 border-t">
                                <button 
                                    onClick={() => handleDeleteStep(template.id, template.name)}
                                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-200" 
                                    title="Supprimer l'étape"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <p className="text-sm text-gray-500 mt-4 italic">
                Modifiez une valeur et cliquez en dehors du champ pour sauvegarder automatiquement.
            </p>
        </div>
    );
};

const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

export default ProductionStepsView;