
import React, { useState, useEffect } from 'react';
import { StockItem } from '../../types';
import Card from '../ui/Card';

interface StockFormProps {
    onSave: (data: Omit<StockItem, 'id' | 'lastUpdated'>, id?: string) => void;
    onCancel: () => void;
    itemToEdit?: StockItem | null;
}

const StockForm: React.FC<StockFormProps> = ({ onSave, onCancel, itemToEdit }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [unit, setUnit] = useState('unité');
    const [minQuantity, setMinQuantity] = useState(0);
    const [pricePerUnit, setPricePerUnit] = useState(0);

    useEffect(() => {
        if (itemToEdit) {
            setName(itemToEdit.name);
            setCategory(itemToEdit.category || '');
            setQuantity(itemToEdit.quantity);
            setUnit(itemToEdit.unit);
            setMinQuantity(itemToEdit.minQuantity || 0);
            setPricePerUnit(itemToEdit.pricePerUnit || 0);
        }
    }, [itemToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            category,
            quantity,
            unit,
            minQuantity,
            pricePerUnit
        }, itemToEdit?.id);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl my-auto">
                <h3 className="text-xl font-bold mb-4 text-gray-700">
                    {itemToEdit ? 'Modifier l\'article' : 'Ajouter au Stock'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Désignation *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-brand-primary outline-none"
                                required
                                placeholder="ex: PVC 3mm, Vinyle Blanc..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Catégorie</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-brand-primary outline-none"
                                placeholder="ex: Supports, Consommables..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Unité (ex: m², kg, u)</label>
                            <input
                                type="text"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-brand-primary outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Quantité Actuelle</label>
                            <input
                                type="number"
                                step="0.01"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md focus:ring-brand-primary outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Alerte (Quantité Min)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={minQuantity}
                                onChange={(e) => setMinQuantity(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md focus:ring-brand-primary outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Prix par Unité (DA)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={pricePerUnit}
                                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md focus:ring-brand-primary outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default StockForm;
