import React, { useState, useMemo, useRef } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { Project, ProductionStep, ProductionStepStatus, ProjectStatus, ProjectFile } from '../../types';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import { ViewState } from '../../App';
import ProjectForm from '../forms/ProjectForm';
import { numberToWordsCurrency, formatCurrency } from '../../utils/formatters';
import { useSettings } from '../../hooks/useSettings';

interface ProjectDetailViewProps {
    projectId: string;
    onNavigate: (viewState: ViewState) => void;
}

// Helper function to determine due date status
const getDueDateStatus = (dueDateString: string): 'overdue' | 'nearing' | 'normal' => {
  const dueDate = new Date(dueDateString);
  const today = new Date();

  // To compare dates without time, we can set hours to 0
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'overdue';
  }
  if (diffDays <= 3) { // 3 days or less, including today
    return 'nearing';
  }
  return 'normal';
};


const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ projectId, onNavigate }) => {
    const { projects, updateProject, deleteProject, addFileToProject, deleteFileFromProject } = useProjects();
    const { settings } = useSettings();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [fileDescription, setFileDescription] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const project = useMemo(() => projects.find(p => p.id === projectId), [projects, projectId]);

    const handleShare = async () => {
        if (!project) return;
    
        const subTotal = project.subTotal;
        const discountAmount = subTotal * (project.discount / 100);
        const priceAfterDiscount = subTotal - discountAmount;
        const tvaAmount = priceAfterDiscount * (project.tvaRate / 100);
        const timbreAmount = priceAfterDiscount * (project.timbreRate / 100);
    
        const stepsText = project.productionSteps.map(step =>
            `- ${step.name}: ${formatCurrency(step.price)}`
        ).join('\n');
    
        const shareText = `
*Devis: ${project.projectName}*

*Client:* ${project.clientName}

*Détails des prestations:*
${stepsText}

--------------------

*Résumé Financier:*
- Sous-Total: ${formatCurrency(subTotal)}
- Remise (${project.discount}%): -${formatCurrency(discountAmount)}
- Total HT: ${formatCurrency(priceAfterDiscount)}
- TVA (${project.tvaRate}%): +${formatCurrency(tvaAmount)}
- Timbre (${project.timbreRate}%): +${formatCurrency(timbreAmount)}

*TOTAL À PAYER: ${formatCurrency(project.price)}*

Arrêté le présent devis à la somme de : ${numberToWordsCurrency(project.price)}.
        `.trim().replace(/^\s+/gm, '');
    
        const shareData = {
            title: `Devis: ${project.projectName}`,
            text: shareText,
        };
    
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    // User cancelled the share sheet, which is expected behavior.
                    console.log('Share action cancelled.');
                } else {
                    console.error('Erreur lors du partage:', err);
                }
            }
        } else {
            // Fallback for desktop
            const mailtoLink = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text)}`;
            window.open(mailtoLink, '_blank');
        }
    };

    if (!project) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-red-500">Projet non trouvé</h2>
                <button onClick={() => onNavigate({ view: 'projects' })} className="mt-4 text-brand-secondary hover:underline">
                    Retour à la liste des projets
                </button>
            </div>
        );
    }
    
    const handleStatusChange = (stepId: string, newStatus: ProductionStepStatus) => {
        const updatedSteps = project.productionSteps.map(step =>
            step.id === stepId ? { ...step, status: newStatus } : step
        );
        updateProject(project.id, { productionSteps: updatedSteps });
    };

    const handleDeleteProject = async () => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.projectName}" ?`)) {
            await deleteProject(project.id);
            onNavigate({ view: 'projects' });
        }
    };
    
    const handleSaveProject = async (projectData: Omit<Project, 'id' | 'creationDate' | 'files'>, id?: string) => {
        if (id) {
            const response = await updateProject(id, projectData);
            if (response.success) {
                setIsModalOpen(false);
            } else {
                 alert(`Erreur: ${response.error || 'Unknown error'}`);
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
        }
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileToUpload) {
            alert('Veuillez sélectionner un fichier.');
            return;
        }
        await addFileToProject(project.id, {
            name: fileToUpload.name,
            description: fileDescription
        });
        
        setFileToUpload(null);
        setFileDescription('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileDelete = async (fileName: string) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le fichier "${fileName}" ?`)) {
            await deleteFileFromProject(project.id, fileName);
        }
    };
    
    const subTotal = project.subTotal;
    const discountAmount = subTotal * (project.discount / 100);
    const priceAfterDiscount = subTotal - discountAmount;
    const tvaAmount = priceAfterDiscount * (project.tvaRate / 100);
    const timbreAmount = priceAfterDiscount * (project.timbreRate / 100);
    const dueDateStatus = getDueDateStatus(project.dueDate);

    return (
        <div className="printable-area">
             {isModalOpen && (
                <ProjectForm
                    onSave={handleSaveProject}
                    onCancel={() => setIsModalOpen(false)}
                    projectToEdit={project}
                />
            )}
            
            <div className="non-printable">
                {/* Breadcrumbs */}
                <div className="mb-4 text-sm text-gray-600">
                    <span onClick={() => onNavigate({ view: 'projects' })} className="hover:underline cursor-pointer text-brand-secondary">
                        Projets
                    </span>
                    <span className="mx-2">/</span>
                    <span>{project.projectName}</span>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-800">{project.projectName}</h2>
                        <p className="text-lg text-gray-500">{project.clientName}</p>
                    </div>
                    <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:items-center gap-2">
                         <button onClick={() => window.print()} className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                            <PrintIcon />
                            <span>Imprimer</span>
                        </button>
                        <button onClick={handleShare} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                            <ShareIcon />
                            <span>Partager</span>
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors">Modifier</button>
                        <button onClick={handleDeleteProject} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Supprimer</button>
                    </div>
                </div>
            </div>

            {/* Quote Document Layout */}
            <div className="bg-white p-4 sm:p-8 rounded-lg shadow-md">
                 {/* Quote Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b gap-4">
                    <div className="space-y-1">
                        {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-16 mb-2 max-w-xs object-contain"/>}
                        <h1 className="text-3xl font-bold text-brand-primary">{settings.companyName || 'SignFab Manager'}</h1>
                        {settings.address && <p className="text-gray-500">{settings.address}, {settings.city}, {settings.postalCode}</p>}
                        {(settings.phone || settings.email) && <p className="text-gray-500">{settings.phone} {settings.phone && settings.email && '|'} {settings.email}</p>}
                        {settings.website && <p className="text-gray-500">{settings.website}</p>}
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                        <h2 className="text-2xl font-semibold text-gray-700">DEVIS</h2>
                        <p className="text-gray-600">Numéro: {project.id}</p>
                        <p className="text-gray-600">Date: {new Date(project.creationDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
                
                 {/* Client & Project Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6">
                    <Card className="printable-card !shadow-none !border">
                         <h4 className="text-lg font-semibold text-gray-700 mb-2">Client</h4>
                         <p className="font-bold text-gray-800">{project.clientName}</p>
                         {/* Add more client details here if available */}
                    </Card>
                     <Card className="printable-card !shadow-none !border">
                         <h4 className="text-lg font-semibold text-gray-700 mb-2">Projet</h4>
                         <p className="font-bold text-gray-800">{project.projectName}</p>
                         <div className={`text-sm flex items-center ${
                             dueDateStatus === 'overdue' ? 'text-red-600' :
                             dueDateStatus === 'nearing' ? 'text-yellow-600' :
                             'text-gray-600'
                         }`}>
                            <span className="mr-1">Date de fin prévue:</span>
                            {dueDateStatus === 'overdue' && <AlertIcon />}
                            {dueDateStatus === 'nearing' && <WarningIcon />}
                            <span className={dueDateStatus !== 'normal' ? 'font-semibold' : ''}>{new Date(project.dueDate).toLocaleDateString('fr-FR')}</span>
                         </div>
                         <div className="mt-2"><StatusBadge status={project.status}/></div>
                    </Card>
                </div>

                {/* Production Steps Table */}
                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Détails des Prestations</h3>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {project.productionSteps.map(step => (
                                    <tr key={step.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{step.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{step.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {(step.width && step.height) ? `${step.width}m x ${step.height}m` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-semibold">{formatCurrency(step.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-center sm:justify-end mt-8">
                    <div className="w-full max-w-sm space-y-3">
                        <FinancialRow label="Sous-Total (HT)" value={formatCurrency(subTotal)} />
                        {project.discount > 0 && <FinancialRow label={`Remise (${project.discount}%)`} value={`-${formatCurrency(discountAmount)}`} className="text-red-600" />}
                        <FinancialRow label="Total (HT) après remise" value={formatCurrency(priceAfterDiscount)} isBold={true} />
                        {project.tvaRate > 0 && <FinancialRow label={`TVA (${project.tvaRate}%)`} value={`+${formatCurrency(tvaAmount)}`} className="text-green-600" />}
                        {project.timbreRate > 0 && <FinancialRow label={`Timbre (${project.timbreRate}%)`} value={`+${formatCurrency(timbreAmount)}`} className="text-green-600" />}
                        <div className="border-t-2 border-brand-primary mt-2 pt-2 flex justify-between items-center text-xl font-bold text-brand-primary">
                            <span>TOTAL À PAYER</span>
                            <span>{formatCurrency(project.price)}</span>
                        </div>
                    </div>
                </div>
                
                 {/* Amount in words */}
                <div className="mt-8 pt-4 border-t text-sm text-gray-600 text-center">
                    <p>Arrêté le présent devis à la somme de :</p>
                    <p className="font-semibold">{numberToWordsCurrency(project.price)}.</p>
                </div>
                
                 {/* Files Section (for on-screen only) */}
                <div className="mt-8 non-printable">
                     <Card title="Fichiers Attachés" className="printable-card">
                        <form onSubmit={handleFileUpload} className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-3">
                            <h5 className="font-semibold text-gray-700">Ajouter un nouveau fichier</h5>
                            <div>
                                <label htmlFor="file-upload" className="sr-only">Choisir un fichier</label>
                                <input id="file-upload" ref={fileInputRef} type="file" onChange={handleFileSelect} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"/>
                            </div>
                             <div>
                                <label htmlFor="file-description" className="sr-only">Description</label>
                                <input 
                                    type="text"
                                    id="file-description"
                                    placeholder="Description du fichier..." 
                                    value={fileDescription} 
                                    onChange={(e) => setFileDescription(e.target.value)}
                                    className="block w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                                />
                            </div>
                            <button type="submit" disabled={!fileToUpload} className="w-full sm:w-auto px-4 py-2 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                                Ajouter le fichier
                            </button>
                        </form>
                        {project.files.length > 0 ? (
                             <ul className="space-y-2">
                                {project.files.map(file => (
                                    <li key={file.name} className="flex items-start justify-between p-2 hover:bg-gray-50 rounded">
                                        <div className="flex-1 flex items-start">
                                            <FileIcon />
                                            <div className="ml-3">
                                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:underline font-medium">
                                                    {file.name}
                                                </a>
                                                {file.description && <p className="text-sm text-gray-500">{file.description}</p>}
                                            </div>
                                        </div>
                                        <button onClick={() => handleFileDelete(file.name)} className="text-gray-400 hover:text-red-500 p-1" title="Supprimer le fichier"><TrashIcon/></button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-center py-4">Aucun fichier attaché.</p>
                        )}
                       
                    </Card>
                </div>
            </div>
        </div>
    );
};

const FinancialRow: React.FC<{label: string; value: React.ReactNode; isBold?: boolean; className?: string}> = ({label, value, isBold, className}) => (
    <div className={`flex justify-between items-center ${className || ''}`}>
        <span className={`text-gray-600 ${isBold ? 'font-semibold' : ''}`}>{label}</span>
        <span className={`text-gray-800 text-right ${isBold ? 'font-semibold' : ''}`}>{value}</span>
    </div>
);

// Icons
const FileIcon = () => <svg className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const ShareIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg>;
const PrintIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-14a2 2 0 10-4 0 2 2 0 004 0z"></path></svg>;
const WarningIcon = () => <svg className="w-4 h-4 inline-block mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>;
const AlertIcon = () => <svg className="w-4 h-4 inline-block mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v3a1 1 0 11-2 0v-3zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path></svg>;


export default ProjectDetailView;