import { useState, useEffect, useCallback } from 'react';
import { Project } from '../types';
import { apiService } from '../services/api';

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        const response = await apiService.getProjects();
        if (response.success && response.data) {
            setProjects(response.data);
        } else {
            setError(response.error || 'Failed to fetch projects');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addProject = async (projectData: Omit<Project, 'id' | 'creationDate' | 'files'>) => {
        const response = await apiService.addProject(projectData);
        if (response.success && response.data) {
            setProjects(prevProjects => [response.data!, ...prevProjects]);
        }
        return response;
    };

    const updateProject = async (projectId: string, updates: Partial<Project>) => {
        const response = await apiService.updateProject(projectId, updates);
        if (response.success && response.data) {
            setProjects(prevProjects => prevProjects.map(p => (p.id === projectId ? response.data! : p)));
        }
        return response;
    };

    const deleteProject = async (projectId: string) => {
        const response = await apiService.deleteProject(projectId);
        if (response.success) {
            setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
        }
        return response;
    };

    const addFileToProject = async (projectId: string, file: { name: string, description?: string }) => {
        const response = await apiService.addFileToProject(projectId, file);
        if (response.success && response.data) {
            setProjects(prevProjects => prevProjects.map(p => (p.id === projectId ? response.data! : p)));
        }
        return response;
    };

    const deleteFileFromProject = async (projectId: string, fileName: string) => {
        const response = await apiService.deleteFileFromProject(projectId, fileName);
        if (response.success && response.data) {
            setProjects(prevProjects => prevProjects.map(p => (p.id === projectId ? response.data! : p)));
        }
        return response;
    };


    return { projects, loading, error, fetchProjects, addProject, updateProject, deleteProject, addFileToProject, deleteFileFromProject };
};