import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/views/Dashboard';
import ProjectListView from './components/views/ProjectListView';
import ProjectDetailView from './components/views/ProjectDetailView';
import SvgAnalyzerView from './components/views/SvgAnalyzerView';
import ClientListView from './components/views/ClientListView';
import ProductionStepsView from './components/views/ProductionStepsView';
import StockView from './components/views/StockView';
import SettingsView from './components/views/SettingsView';
import LoginView from './components/views/LoginView';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './services/firebase';
import { Loader2, ShieldAlert } from 'lucide-react';

type View = 'dashboard' | 'projects' | 'projectDetail' | 'clients' | 'settings' | 'svgAnalyzer' | 'productionSteps' | 'stock';

export interface ViewState {
  view: View;
  projectId?: string | null;
}

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>({ view: 'dashboard' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
              email: currentUser.email,
              isAuthorized: currentUser.email === 'guaves.consulting@gmail.com',
              createdAt: new Date().toISOString()
            });
            setIsAuthorized(currentUser.email === 'guaves.consulting@gmail.com');
          } else {
            setIsAuthorized(userDocSnap.data().isAuthorized === true || currentUser.email === 'guaves.consulting@gmail.com');
          }
        } catch (error) {
          console.error("Error fetching user authorization:", error);
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const navigate = (newViewState: ViewState) => {
    setViewState(newViewState);
  };

  const renderView = () => {
    switch (viewState.view) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <ProjectListView onNavigate={navigate} />;
      case 'projectDetail':
        if (viewState.projectId) {
          return <ProjectDetailView projectId={viewState.projectId} onNavigate={navigate} />;
        }
        // Fallback to project list if no ID is provided
        return <ProjectListView onNavigate={navigate} />;
      case 'svgAnalyzer':
        return <SvgAnalyzerView />;
      case 'clients':
        return <ClientListView />;
      case 'productionSteps':
        return <ProductionStepsView />;
      case 'stock':
        return <StockView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  const handleSidebarNav = (view: View) => {
    navigate({ view });
    setIsSidebarOpen(false); // Close sidebar after navigation on mobile
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-brand-primary">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-600 mb-8">
            Votre compte n'est pas encore autorisé à accéder à cette application. Veuillez contacter un administrateur pour valider votre compte.
          </p>
          <button 
            onClick={() => signOut(auth)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-lg transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 text-gray-800">
      <Sidebar 
        currentView={viewState.view} 
        setCurrentView={handleSidebarNav}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <main className="md:ml-64 pt-16">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;