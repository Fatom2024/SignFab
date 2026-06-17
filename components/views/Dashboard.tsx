import React, { useMemo } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { ProjectStatus } from '../../types';
import Card from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement }> = ({ title, value, icon }) => (
    <Card className="flex items-center p-4 transition-transform transform hover:scale-105">
        <div className="p-3 rounded-full bg-brand-secondary/20 text-brand-secondary mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-600 uppercase">{title}</p>
            <p className="text-2xl font-semibold text-gray-700">{value}</p>
        </div>
    </Card>
);

// Define colors for the chart based on project status
const CHART_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.DEVIS]: '#616161',       // status-gray
  [ProjectStatus.EN_COURS]: '#FBC02D',  // status-yellow
  [ProjectStatus.TERMINE]: '#1976D2',    // status-blue
  [ProjectStatus.LIVRE]: '#2E7D32',      // status-green
};


const Dashboard: React.FC = () => {
    const { projects, loading, error } = useProjects();

    const stats = useMemo(() => {
        const totalProjects = projects.length;
        const inProgressProjects = projects.filter(p => p.status === ProjectStatus.EN_COURS);
        const completedProjects = projects.filter(p => p.status === ProjectStatus.TERMINE).length;
        const totalRevenue = projects.reduce((acc, p) => acc + p.price, 0);
        return {
            totalProjects,
            inProgressProjects,
            completedProjects,
            totalRevenue: totalRevenue.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' }),
        };
    }, [projects]);

    const chartData = useMemo(() => {
        const statusCounts = projects.reduce((acc, project) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
        }, {} as Record<ProjectStatus, number>);

        return Object.values(ProjectStatus).map(status => ({
            name: status,
            projets: statusCounts[status] || 0,
            fill: CHART_COLORS[status],
        }));
    }, [projects]);


    if (loading) return <div className="text-center p-8">Chargement des données...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Erreur: {error}</div>;

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">Tableau de Bord</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Projets Totaux" value={stats.totalProjects} icon={<ProjectsIcon />} />
                <StatCard title="Projets Terminés" value={stats.completedProjects} icon={<CompletedIcon />} />
                <StatCard title="Revenu Total" value={stats.totalRevenue} icon={<RevenueIcon />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card title="Projets en Cours" className="lg:col-span-2">
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {stats.inProgressProjects.length > 0 ? (
                            stats.inProgressProjects.map(project => (
                                <div key={project.id} className="p-3 bg-gray-50 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-100 transition-colors">
                                    <div>
                                        <p className="font-semibold text-brand-primary">{project.projectName}</p>
                                        <p className="text-sm text-gray-500">{project.clientName}</p>
                                    </div>
                                    <div className="text-left sm:text-right text-xs text-gray-600 mt-2 sm:mt-0">
                                        <p>Début: <span className="font-medium">{new Date(project.creationDate).toLocaleDateString('fr-FR')}</span></p>
                                        <p>Fin: <span className="font-medium">{new Date(project.dueDate).toLocaleDateString('fr-FR')}</span></p>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
                                <InProgressIcon />
                                <p className="mt-2">Aucun projet en cours pour le moment.</p>
                            </div>
                        )}
                    </div>
                </Card>
                <Card title="Répartition des Projets" className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 12}} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="projets">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

// Icons
const ProjectsIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>;
const InProgressIcon = () => <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const CompletedIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const RevenueIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;

export default Dashboard;