
// FIX: Corrected typo in useState import
import React, { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import StatusBadge from '../ui/StatusBadge';
import { Project, ProjectStatus, ProductionStepStatus } from '../../types';
import ProjectForm from '../forms/ProjectForm';
import { ViewState } from '../../App';
import Card from '../ui/Card';

interface ProjectListViewProps {
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

const ProjectListView: React.FC<ProjectListViewProps> = ({ onNavigate }) => {
    const { projects, loading, error, addProject, updateProject, deleteProject } = useProjects();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const handleOpenAddModal = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${name}" ?`)) {
            await deleteProject(id);
        }
    };

    const handleSaveProject = async (projectData: Omit<Project, 'id' | 'creationDate' | 'files'>, id?: string) => {
        let response;
        if (id) {
            response = await updateProject(id, projectData);
        } else {
            response = await addProject(projectData);
        }

        if (response.success) {
            setIsModalOpen(false);
            setEditingProject(null);
        } else {
            alert(`Erreur: ${response.error || 'Unknown error'}`);
        }
    };


    if (loading) return <div className="text-center p-8">Chargement des projets...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Erreur: {error}</div>;

    return (
        <div>
            {isModalOpen && (
                <ProjectForm
                    onSave={handleSaveProject}
                    onCancel={() => { setIsModalOpen(false); setEditingProject(null); }}
                    projectToEdit={editingProject}
                />
            )}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-semibold text-gray-700 self-start sm:self-center">Liste des Projets</h2>
                <button
                    onClick={handleOpenAddModal}
                    className="w-full sm:w-auto px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50 transition-colors">
                    + Ajouter un Projet
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <th className="px-5 py-3">Nom du Projet</th>
                                <th className="px-5 py-3">Client</th>
                                <th className="px-5 py-3">Date de fin</th>
                                <th className="px-5 py-3">Prix</th>
                                <th className="px-5 py-3">Statut</th>
                                <th className="px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project) => {
                                const dueDateStatus = getDueDateStatus(project.dueDate);
                                return (
                                <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                                    <td onClick={() => onNavigate({ view: 'projectDetail', projectId: project.id })} className="px-5 py-4 text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-semibold">{project.projectName}</p>
                                    </td>
                                     <td onClick={() => onNavigate({ view: 'projectDetail', projectId: project.id })} className="px-5 py-4 text-sm">
                                        <p className="text-gray-600 whitespace-no-wrap">{project.clientName}</p>
                                    </td>
                                     <td onClick={() => onNavigate({ view: 'projectDetail', projectId: project.id })} className="px-5 py-4 text-sm">
                                        <div className={`whitespace-no-wrap flex items-center ${
                                            dueDateStatus === 'overdue' ? 'text-red-600 font-semibold' :
                                            dueDateStatus === 'nearing' ? 'text-yellow-600 font-semibold' :
                                            'text-gray-900'
                                        }`}>
                                            {dueDateStatus === 'overdue' && <AlertIcon />}
                                            {dueDateStatus === 'nearing' && <WarningIcon />}
                                            <span>{new Date(project.dueDate).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    </td>
                                     <td onClick={() => onNavigate({ view: 'projectDetail', projectId: project.id })} className="px-5 py-4 text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">
                                            {project.price.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })}
                                        </p>
                                    </td>
                                     <td onClick={() => onNavigate({ view: 'projectDetail', projectId: project.id })} className="px-5 py-4 text-sm">
                                        <StatusBadge status={project.status} />
                                    </td>
                                    <td className="px-5 py-4 text-sm">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => onNavigate({ view: 'projectDetail', projectId: project.id })} className="text-brand-secondary hover:text-brand-primary p-1" title="Voir les détails">
                                                <EyeIcon />
                                            </button>
                                            <button onClick={() => handleOpenEditModal(project)} className="text-yellow-500 hover:text-yellow-700 p-1" title="Modifier">
                                                <PencilIcon />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id, project.projectName); }} className="text-red-500 hover:text-red-700 p-1" title="Supprimer">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-4">
                {projects.map(project => {
                    const dueDateStatus = getDueDateStatus(project.dueDate);
                    return (
                    <Card key={project.id} className="p-0">
                        <div onClick={() => onNavigate({ view: 'projectDetail', projectId: project.id })} className="cursor-pointer">
                            <div className="p-4 border-b">
                                <p className="font-semibold text-brand-primary">{project.projectName}</p>
                                <p className="text-sm text-gray-500">{project.clientName}</p>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Date de fin</p>
                                    <div className={`font-medium flex items-center ${
                                        dueDateStatus === 'overdue' ? 'text-red-600' :
                                        dueDateStatus === 'nearing' ? 'text-yellow-600' :
                                        'text-gray-800'
                                    }`}>
                                        {dueDateStatus === 'overdue' && <AlertIcon />}
                                        {dueDateStatus === 'nearing' && <WarningIcon />}
                                        <span>{new Date(project.dueDate).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500">Prix</p>
                                    <p className="font-medium text-gray-800">{project.price.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })}</p>
                                </div>
                                <div className="col-span-2">
                                     <p className="text-gray-500 mb-1">Statut</p>
                                     <StatusBadge status={project.status} />
                                </div>
                            </div>
                        </div>
                        <div className="p-2 bg-gray-50 border-t flex justify-end items-center space-x-2">
                             <button onClick={() => handleOpenEditModal(project)} className="text-yellow-500 hover:text-yellow-700 p-2 rounded-full hover:bg-gray-200" title="Modifier">
                                <PencilIcon />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id, project.projectName); }} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-200" title="Supprimer">
                                <TrashIcon />
                            </button>
                        </div>
                    </Card>
                )})}
            </div>
        </div>
    );
};

// Icons
const EyeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>;
const PencilIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const WarningIcon = () => <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>;
const AlertIcon = () => <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v3a1 1 0 11-2 0v-3zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path></svg>;


export default ProjectListView;