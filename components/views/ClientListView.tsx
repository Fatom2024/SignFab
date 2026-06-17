

import React, { useState } from 'react';
import { useClients } from '../../hooks/useClients';
import { Client } from '../../types';
import ClientForm from '../forms/ClientForm';
import Card from '../ui/Card';

const ClientListView: React.FC = () => {
    const { clients, loading, error, addClient, updateClient, deleteClient } = useClients();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const handleOpenAddModal = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${name}" ?`)) {
            await deleteClient(id);
        }
    };

    const handleSaveClient = async (data: Omit<Client, 'id' | 'projectIds'>, id?: string) => {
        let response;
        if (id) {
            response = await updateClient(id, data);
        } else {
            response = await addClient(data);
        }

        if (response.success) {
            setIsModalOpen(false);
            setEditingClient(null);
        } else {
            alert(`Erreur: ${response.error || 'Unknown error'}`);
        }
    };

    if (loading) return <div className="text-center p-8">Chargement des clients...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Erreur: {error}</div>;

    return (
        <div>
            {isModalOpen && (
                <ClientForm
                    onSave={handleSaveClient}
                    onCancel={() => { setIsModalOpen(false); setEditingClient(null); }}
                    clientToEdit={editingClient}
                />
            )}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-semibold text-gray-700 self-start sm:self-center">Liste des Clients</h2>
                <button
                    onClick={handleOpenAddModal}
                    className="w-full sm:w-auto px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50 transition-colors">
                    + Ajouter un Client
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <th className="px-5 py-3">Nom du Client</th>
                                <th className="px-5 py-3">Type</th>
                                <th className="px-5 py-3">Email</th>
                                <th className="px-5 py-3">Téléphone</th>
                                <th className="px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-5 py-4 text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-semibold">{client.name}</p>
                                    </td>
                                    <td className="px-5 py-4 text-sm">
                                        <p className="text-gray-600 whitespace-no-wrap">{client.type}</p>
                                    </td>
                                    <td className="px-5 py-4 text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{client.contactEmail}</p>
                                    </td>
                                    <td className="px-5 py-4 text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{client.contactPhone}</p>
                                    </td>
                                    <td className="px-5 py-4 text-sm">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => handleOpenEditModal(client)} className="text-yellow-500 hover:text-yellow-700 p-1" title="Modifier">
                                                <PencilIcon />
                                            </button>
                                            <button onClick={() => handleDelete(client.id, client.name)} className="text-red-500 hover:text-red-700 p-1" title="Supprimer">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

             {/* Mobile Card List */}
            <div className="md:hidden space-y-4">
                {clients.map(client => (
                    <Card key={client.id} className="p-4">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-semibold text-brand-primary">{client.name}</p>
                                <p className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">{client.type}</p>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                                <button onClick={() => handleOpenEditModal(client)} className="text-yellow-500 hover:text-yellow-700 p-2 rounded-full hover:bg-gray-200" title="Modifier">
                                    <PencilIcon />
                                </button>
                                <button onClick={() => handleDelete(client.id, client.name)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-200" title="Supprimer">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 text-sm space-y-2">
                            <p className="text-gray-700 truncate"><span className="font-medium text-gray-500">Email:</span> {client.contactEmail}</p>
                            <p className="text-gray-700"><span className="font-medium text-gray-500">Tél:</span> {client.contactPhone}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// Icons
const PencilIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

export default ClientListView;