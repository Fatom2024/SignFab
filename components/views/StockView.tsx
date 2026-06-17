
import React, { useState } from 'react';
import { useStock } from '../../hooks/useStock';
import { StockItem } from '../../types';
import StockForm from '../forms/StockForm';
import Card from '../ui/Card';
import { Package, AlertTriangle, TrendingDown, TrendingUp, History } from 'lucide-react';

const StockView: React.FC = () => {
    const { stock, loading, error, addStockItem, updateStockItem, deleteStockItem } = useStock();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StockItem | null>(null);
    const [filter, setFilter] = useState('');

    const handleOpenAddModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: StockItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Supprimer l'article "${name}" du stock ?`)) {
            await deleteStockItem(id);
        }
    };

    const handleSaveItem = async (data: Omit<StockItem, 'id' | 'lastUpdated'>, id?: string) => {
        let response;
        if (id) {
            response = await updateStockItem(id, data);
        } else {
            response = await addStockItem(data);
        }

        if (response.success) {
            setIsModalOpen(false);
            setEditingItem(null);
        } else {
            alert(`Erreur: ${response.error || 'Unknown error'}`);
        }
    };

    const filteredStock = stock.filter(item => 
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.category.toLowerCase().includes(filter.toLowerCase())
    );

    const lowStockItems = stock.filter(item => item.quantity <= item.minQuantity);
    const totalValue = stock.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);

    if (loading) return <div className="text-center p-8">Chargement du stock...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Erreur: {error}</div>;

    return (
        <div className="space-y-6">
            {isModalOpen && (
                <StockForm
                    onSave={handleSaveItem}
                    onCancel={() => { setIsModalOpen(false); setEditingItem(null); }}
                    itemToEdit={editingItem}
                />
            )}

            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 flex items-center gap-4 border-l-4 border-brand-primary">
                    <div className="p-3 bg-brand-primary/10 rounded-full text-brand-primary">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Articles en Stock</p>
                        <p className="text-2xl font-bold">{stock.length}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-l-4 border-yellow-500">
                    <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Alertes Stock Bas</p>
                        <p className="text-2xl font-bold">{lowStockItems.length}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-l-4 border-green-500">
                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Valeur Totale Est.</p>
                        <p className="text-2xl font-bold">{totalValue.toLocaleString()} DA</p>
                    </div>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Rechercher un article..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-3 pr-4 py-2 border rounded-md focus:ring-brand-primary outline-none"
                    />
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="w-full sm:w-auto px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors"
                >
                    + Ajouter au Stock
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <th className="px-5 py-3">Article</th>
                            <th className="px-5 py-3">Catégorie</th>
                            <th className="px-5 py-3 text-center">Quantité</th>
                            <th className="px-5 py-3 text-right">Prix Unitaire</th>
                            <th className="px-5 py-3 text-right">Valeur</th>
                            <th className="px-5 py-3 text-center">Statut</th>
                            <th className="px-5 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStock.map((item) => (
                            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-5 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-5 py-4 text-sm text-gray-600">{item.category}</td>
                                <td className="px-5 py-4 text-sm text-center">
                                    <span className="font-semibold">{item.quantity}</span> {item.unit}
                                </td>
                                <td className="px-5 py-4 text-sm text-right">{item.pricePerUnit.toLocaleString()} DA</td>
                                <td className="px-5 py-4 text-sm text-right">{(item.quantity * item.pricePerUnit).toLocaleString()} DA</td>
                                <td className="px-5 py-4 text-sm text-center">
                                    {item.quantity <= item.minQuantity ? (
                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">Réappro.</span>
                                    ) : (
                                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">Ok</span>
                                    )}
                                </td>
                                <td className="px-5 py-4 text-sm text-center">
                                    <div className="flex justify-center space-x-2">
                                        <button onClick={() => handleOpenEditModal(item)} className="text-yellow-500 hover:text-yellow-700">
                                            <PencilIcon />
                                        </button>
                                        <button onClick={() => handleDelete(item.id, item.name)} className="text-red-500 hover:text-red-700">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List */}
            <div className="lg:hidden space-y-4">
                {filteredStock.map(item => (
                    <Card key={item.id} className={`p-4 border-l-4 ${item.quantity <= item.minQuantity ? 'border-red-500' : 'border-green-500'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">{item.category}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenEditModal(item)} className="p-2 text-yellow-500">
                                    <PencilIcon />
                                </button>
                                <button onClick={() => handleDelete(item.id, item.name)} className="p-2 text-red-500">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Quantité</p>
                                <p className="font-semibold">{item.quantity} {item.unit}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Alerte</p>
                                <p className="font-semibold text-gray-800">{item.minQuantity} {item.unit}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Valeur</p>
                                <p className="font-semibold text-brand-primary">{(item.quantity * item.pricePerUnit).toLocaleString()} DA</p>
                            </div>
                            <div className="flex flex-col justify-end">
                                {item.quantity <= item.minQuantity && (
                                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold text-center">STOCK BAS</span>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const PencilIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

export default StockView;
