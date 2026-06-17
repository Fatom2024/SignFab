import React, { useState, useEffect, useMemo } from 'react';
import { Project, ProjectStatus, ProductionStep, ProductionStepStatus, BillingType, Client } from '../../types';
import Card from '../ui/Card';
import { useClients } from '../../hooks/useClients';
import { useProductionSteps } from '../../hooks/useProductionSteps';
import { numberToWordsCurrency, formatCurrency } from '../../utils/formatters';

type StepFormData = Partial<Omit<ProductionStep, 'id' | 'status'>> & {
    localId: number;
    templateId?: string;
};

interface ProjectFormProps {
    onSave: (data: Omit<Project, 'id' | 'creationDate' | 'files'>, id?: string) => void;
    onCancel: () => void;
    projectToEdit?: Project | null;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSave, onCancel, projectToEdit }) => {
    const { clients } = useClients();
    const { stepTemplates } = useProductionSteps();
    
    const [formData, setFormData] = useState({
        clientId: '',
        projectName: '',
        dueDate: '',
        price: 0,
        status: ProjectStatus.DEVIS,
        discount: 0,
        tvaRate: 19,
        timbreRate: 1,
    });
    const [steps, setSteps] = useState<StepFormData[]>([]);
    const [applyTva, setApplyTva] = useState(false);
    const [applyTimbre, setApplyTimbre] = useState(false);
    
    const isEditing = !!projectToEdit;

    const selectedClient = useMemo(() => clients.find(c => c.id === formData.clientId), [clients, formData.clientId]);

    useEffect(() => {
        if (isEditing && projectToEdit) {
            setFormData({
                clientId: projectToEdit.clientId,
                projectName: projectToEdit.projectName,
                dueDate: projectToEdit.dueDate,
                price: projectToEdit.price,
                status: projectToEdit.status,
                discount: projectToEdit.discount,
                tvaRate: projectToEdit.tvaRate > 0 ? projectToEdit.tvaRate : 19,
                timbreRate: projectToEdit.timbreRate > 0 ? projectToEdit.timbreRate : 1,
            });
            setSteps(projectToEdit.productionSteps.map((step, index) => ({
                ...step,
                localId: Date.now() + index,
            })));
            setApplyTva(projectToEdit.tvaRate > 0);
            setApplyTimbre(projectToEdit.timbreRate > 0);
        } else {
            if (clients.length > 0) {
                setFormData(prev => ({ ...prev, clientId: clients[0].id }));
            }
        }
    }, [projectToEdit, isEditing, clients]);

    const subTotal = useMemo(() => {
        if (!selectedClient || stepTemplates.length === 0) return 0;

        return steps.reduce((acc, step) => {
            const template = stepTemplates.find(t => t.id === step.templateId);
            if (!template) return acc;

            const unitPrice = template.pricing[selectedClient.type] || 0;
            const quantity = step.quantity || 0;

            if (template.billingType === BillingType.PER_SQM) {
                const width = step.width || 0;
                const height = step.height || 0;
                return acc + (unitPrice * width * height * quantity);
            } else {
                return acc + (unitPrice * quantity);
            }
        }, 0);
    }, [steps, selectedClient, stepTemplates]);


    useEffect(() => {
        const discountAmount = subTotal * (formData.discount / 100);
        const priceAfterDiscount = subTotal - discountAmount;
        const tvaAmount = applyTva ? priceAfterDiscount * (formData.tvaRate / 100) : 0;
        const timbreAmount = applyTimbre ? priceAfterDiscount * (formData.timbreRate / 100) : 0;
        const finalTotal = priceAfterDiscount + tvaAmount + timbreAmount;
        
        setFormData(prev => ({...prev, price: finalTotal }));

    }, [subTotal, formData.discount, applyTva, formData.tvaRate, applyTimbre, formData.timbreRate]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        const numericValue = (type === 'number') ? parseFloat(value) || 0 : value;

        setFormData(prev => ({
            ...prev,
            [name]: numericValue,
        }));
    };
    
    const handleStepChange = (localId: number, field: keyof StepFormData, value: string | number) => {
        setSteps(currentSteps => currentSteps.map(step => {
            if (step.localId === localId) {
                const updatedStep = { ...step, [field]: value };
                
                if (field === 'templateId') {
                    const template = stepTemplates.find(t => t.id === value);
                    updatedStep.name = template?.name;
                    updatedStep.quantity = 1;
                    if (template?.billingType === BillingType.PER_SQM) {
                        updatedStep.width = 1;
                        updatedStep.height = 1;
                    } else {
                        delete updatedStep.width;
                        delete updatedStep.height;
                    }
                }
                return updatedStep;
            }
            return step;
        }));
    };

    const addStep = () => {
        setSteps(currentSteps => [...currentSteps, { localId: Date.now(), quantity: 1 }]);
    };

    const removeStep = (localId: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir retirer cette étape du projet ?")) {
            setSteps(currentSteps => currentSteps.filter(step => step.localId !== localId));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient) {
            alert('Veuillez sélectionner un client.');
            return;
        }
        if (!formData.projectName || !formData.dueDate) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        const finalProductionSteps: ProductionStep[] = steps
            .filter(s => s.templateId) // Only process steps that have a selected template
            .map((s, index) => {
                const template = stepTemplates.find(t => t.id === s.templateId);
                if (!template) {
                    // This should theoretically not happen due to filter, but safety first
                    return null as any; 
                }
                const unitPrice = template.pricing ? (template.pricing[selectedClient.type] || 0) : 0;
                let stepPrice = 0;
                if (template.billingType === BillingType.PER_SQM) {
                    stepPrice = unitPrice * (s.width || 0) * (s.height || 0) * (s.quantity || 0);
                } else {
                    stepPrice = unitPrice * (s.quantity || 0);
                }
                
                const existingStep = projectToEdit?.productionSteps.find(ps => ps.templateId === s.templateId);

                return {
                    id: existingStep?.id || `step-${projectToEdit?.id || 'new'}-${Date.now()}-${index}`,
                    templateId: s.templateId!,
                    name: template.name,
                    status: existingStep?.status || ProductionStepStatus.A_FAIRE,
                    quantity: s.quantity || 0,
                    width: s.width,
                    height: s.height,
                    price: stepPrice,
                };
            }).filter(s => s !== null);

        const projectData: Omit<Project, 'id' | 'creationDate' | 'files'> = {
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            productionSteps: finalProductionSteps,
            projectName: formData.projectName,
            dueDate: formData.dueDate,
            status: formData.status,
            subTotal: subTotal,
            discount: formData.discount,
            tvaRate: applyTva ? formData.tvaRate : 0,
            timbreRate: applyTimbre ? formData.timbreRate : 0,
            price: formData.price,
        };

        onSave(projectData, projectToEdit?.id);
    };
    
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm";

    const discountAmount = subTotal * (formData.discount / 100);
    const priceAfterDiscount = subTotal - discountAmount;
    const tvaAmount = applyTva ? priceAfterDiscount * (formData.tvaRate / 100) : 0;
    const timbreAmount = applyTimbre ? priceAfterDiscount * (formData.timbreRate / 100) : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
            <Card title={isEditing ? 'Modifier le projet' : 'Ajouter un nouveau projet'} className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Left Column: Project Info & Steps */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">Nom du Projet</label>
                                    <input type="text" id="projectName" name="projectName" value={formData.projectName} onChange={handleChange} className={inputClasses} required />
                                </div>
                                <div>
                                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Client</label>
                                    <select id="clientId" name="clientId" value={formData.clientId} onChange={handleChange} className={inputClasses} required >
                                        <option value="" disabled>Sélectionner un client</option>
                                        {clients.map(client => (<option key={client.id} value={client.id}>{client.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Date de fin</label>
                                    <input type="date" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputClasses} required />
                                </div>
                                 <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Statut</label>
                                    <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputClasses} >
                                        {Object.values(ProjectStatus).map(status => (<option key={status} value={status}>{status}</option>))}
                                    </select>
                                </div>
                            </div>

                            {/* Production Steps */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Étapes de Production</label>
                                <div className="mt-2 space-y-3 p-3 border border-gray-200 rounded-md max-h-64 overflow-y-auto">
                                    {steps.map((step) => {
                                        const template = stepTemplates.find(t => t.id === step.templateId);
                                        return (
                                            <div key={step.localId} className="p-3 bg-gray-50 rounded-lg border space-y-2 animate-fade-in">
                                                <div className="flex items-center space-x-2">
                                                    <select
                                                        value={step.templateId || ''}
                                                        onChange={(e) => handleStepChange(step.localId, 'templateId', e.target.value)}
                                                        className={`flex-grow ${inputClasses}`}
                                                    >
                                                        <option value="" disabled>-- Choisir une étape --</option>
                                                        {stepTemplates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.billingType})</option>)}
                                                    </select>
                                                    <button type="button" onClick={() => removeStep(step.localId)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors" title="Supprimer l'étape" >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                                {template && (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                        {template.billingType === BillingType.PER_SQM && (
                                                            <>
                                                                <div>
                                                                    <label className="font-medium text-gray-600">L (m)</label>
                                                                    <input type="number" placeholder="Largeur" value={step.width || ''} onChange={e => handleStepChange(step.localId, 'width', parseFloat(e.target.value))} className={inputClasses} step="0.01" min="0" />
                                                                </div>
                                                                <div>
                                                                    <label className="font-medium text-gray-600">H (m)</label>
                                                                    <input type="number" placeholder="Hauteur" value={step.height || ''} onChange={e => handleStepChange(step.localId, 'height', parseFloat(e.target.value))} className={inputClasses} step="0.01" min="0" />
                                                                </div>
                                                            </>
                                                        )}
                                                        <div>
                                                            <label className="font-medium text-gray-600">Qté</label>
                                                            <input type="number" placeholder="Quantité" value={step.quantity || ''} onChange={e => handleStepChange(step.localId, 'quantity', parseInt(e.target.value, 10))} className={inputClasses} min="1"/>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <button type="button" onClick={addStep} className="mt-2 w-full px-4 py-2 text-sm border-2 border-dashed border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none transition-colors" >
                                        + Ajouter une étape
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Financials */}
                        <div className="p-4 border border-gray-200 rounded-md bg-gray-50/50 space-y-3 flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Résumé Financier</h3>
                            
                            <div className="flex justify-between items-center text-md">
                                <span className="font-medium text-gray-600">Sous-Total (HT)</span>
                                <span className="font-semibold text-gray-800">{formatCurrency(subTotal)}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <label htmlFor="discount" className="text-sm font-medium text-gray-700 flex-shrink-0">Remise</label>
                                <input type="number" id="discount" name="discount" value={formData.discount} onChange={handleChange} className="w-20 px-2 py-1 text-sm text-right border-gray-300 rounded-md" min="0" max="100"/>
                                <span className="text-sm text-gray-600">%</span>
                                <span className="flex-grow text-right text-red-600">(-{formatCurrency(discountAmount)})</span>
                            </div>

                             <div className="flex justify-between items-center text-md font-semibold border-t pt-2">
                                <span className="text-gray-600">Total (HT) après remise</span>
                                <span className="text-gray-800">{formatCurrency(priceAfterDiscount)}</span>
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="applyTva" checked={applyTva} onChange={(e) => setApplyTva(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-secondary"/>
                                    <label htmlFor="applyTva" className="text-sm font-medium text-gray-700">Appliquer TVA</label>
                                    <input type="number" name="tvaRate" value={formData.tvaRate} onChange={handleChange} className="w-20 px-2 py-1 text-sm text-right border-gray-300 rounded-md" disabled={!applyTva}/>
                                    <span className="text-sm text-gray-600">%</span>
                                    <span className="flex-grow text-right text-green-600">(+{formatCurrency(tvaAmount)})</span>
                                </div>
                                 <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="applyTimbre" checked={applyTimbre} onChange={(e) => setApplyTimbre(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-secondary"/>
                                    <label htmlFor="applyTimbre" className="text-sm font-medium text-gray-700">Appliquer Timbre</label>
                                    <input type="number" name="timbreRate" value={formData.timbreRate} onChange={handleChange} className="w-20 px-2 py-1 text-sm text-right border-gray-300 rounded-md" disabled={!applyTimbre}/>
                                    <span className="text-sm text-gray-600">%</span>
                                    <span className="flex-grow text-right text-green-600">(+{formatCurrency(timbreAmount)})</span>
                                </div>
                            </div>
                             <div className="flex justify-between items-center text-xl font-bold border-t-2 border-brand-primary pt-2 mt-2">
                                <span className="text-brand-primary">TOTAL À PAYER</span>
                                <span className="text-brand-primary">{formatCurrency(formData.price)}</span>
                            </div>
                             <div className="pt-2 text-sm text-gray-600 italic text-center border-t mt-2">
                                <p>Arrêté le présent devis à la somme de :</p>
                                <p className="font-semibold">{numberToWordsCurrency(formData.price)}.</p>
                            </div>

                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400" >
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50" >
                            {isEditing ? 'Enregistrer les modifications' : 'Créer le projet'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

export default ProjectForm;