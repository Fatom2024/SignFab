import React from 'react';

type View = 'dashboard' | 'projects' | 'projectDetail' | 'clients' | 'settings' | 'svgAnalyzer' | 'productionSteps' | 'stock';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: 'dashboard' | 'projects' | 'clients' | 'settings' | 'svgAnalyzer' | 'productionSteps' | 'stock') => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{
  // FIX: Replaced JSX.Element with React.ReactElement to resolve namespace error.
  icon: React.ReactElement;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <a
    href="#"
    onClick={(e) => { e.preventDefault(); onClick(); }}
    className={`flex items-center px-6 py-3 text-gray-100 hover:bg-brand-secondary/80 transition-colors duration-200 ${isActive ? 'bg-brand-secondary' : ''}`}
  >
    {icon}
    <span className="mx-4 font-medium">{label}</span>
  </a>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
  // FIX: Replaced JSX.Element with React.ReactElement to resolve namespace error.
  const navItems: { id: 'dashboard' | 'projects' | 'svgAnalyzer' | 'clients' | 'productionSteps' | 'stock' | 'settings'; label: string; icon: React.ReactElement }[] = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: <DashboardIcon /> },
    { id: 'projects', label: 'Projets', icon: <ProjectsIcon /> },
    { id: 'stock', label: 'Stock', icon: <StockIcon /> },
    { id: 'clients', label: 'Clients', icon: <ClientsIcon /> },
    { id: 'productionSteps', label: 'Étapes & Tarifs', icon: <StepsIcon /> },
    { id: 'svgAnalyzer', label: 'Analyseur SVG', icon: <AnalyzerIcon /> },
    { id: 'settings', label: 'Paramètres', icon: <SettingsIcon /> },
  ];
  
  const isProjectsActive = currentView === 'projects' || currentView === 'projectDetail';

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>

      <div className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-brand-primary text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-20 border-b border-gray-700 px-6">
          <div className="flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-brand-accent" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm10 2H6v2h8V4zM6 8v2h8V8H6zm0 4v2h5v-2H6z" clipRule="evenodd" />
            </svg>
            <span className="text-2xl font-bold">SignFab</span>
          </div>
           <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white md:hidden" aria-label="Close menu">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={item.id === 'projects' ? isProjectsActive : currentView === item.id}
              onClick={() => setCurrentView(item.id)}
            />
          ))}
        </nav>
      </div>
    </>
  );
};

// SVG Icons defined as components
const DashboardIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
);
const ProjectsIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
);
const AnalyzerIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7L3 3m0 0l7 7M3 3v4m0 0h4"></path></svg>
);
const ClientsIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
);
const SettingsIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);
const StepsIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
);
const StockIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
);


export default Sidebar;