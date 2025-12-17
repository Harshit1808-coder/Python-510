
import React, { useState, useEffect, useCallback } from 'react';
import { AuthenticatedUser, User, NGO, UserRole, RescueReport } from './types';
import * as mockApi from './services/mockApiService';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import AuthForm from './components/AuthForm';
import UserDashboard from './pages/user/UserDashboard';
import NgoDashboard from './pages/ngo/NgoDashboard';
import NewReport from './pages/user/NewReport';
import ReportDetails from './pages/ReportDetails';

type View = 
  | { name: 'landing' }
  | { name: 'auth'; role: UserRole; form: 'login' | 'register' }
  | { name: 'userDashboard' }
  | { name: 'ngoDashboard' }
  | { name: 'newReport' }
  | { name: 'reportDetails'; reportId: string };

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser>(null);
  const [view, setView] = useState<View>({ name: 'landing' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = (newView: View) => {
    setView(newView);
    setError(null);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    navigate({ name: 'landing' });
  };

  const handleAuth = async (formData: Record<string, string>, role: UserRole, form: 'login' | 'register') => {
    setLoading(true);
    setError(null);
    try {
      let user;
      if (form === 'login') {
        user = await mockApi.login(formData.email, formData.password, role);
      } else {
        user = await mockApi.register(formData, role);
      }
      setCurrentUser(user);
      if (user.role === UserRole.USER) {
        navigate({ name: 'userDashboard' });
      } else {
        navigate({ name: 'ngoDashboard' });
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (reportData: Omit<RescueReport, 'id' | 'userId' | 'status' | 'ngoId' | 'createdAt' | 'updatedAt' | 'chat'>) => {
      if(currentUser && currentUser.role === UserRole.USER) {
        await mockApi.createReport(reportData, currentUser.id);
        const updatedUser = await mockApi.getUserById(currentUser.id);
        setCurrentUser(updatedUser);
        navigate({name: 'userDashboard'});
      }
  }

  const renderContent = () => {
    switch (view.name) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'auth':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
             <div className="w-full max-w-md">
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}
                <AuthForm
                    formType={view.form}
                    userRole={view.role}
                    onSubmit={(formData) => handleAuth(formData, view.role, view.form)}
                    onSwitchForm={() => navigate({ ...view, form: view.form === 'login' ? 'register' : 'login' })}
                    loading={loading}
                />
             </div>
          </div>
        );
      case 'userDashboard':
        return <UserDashboard user={currentUser as User} onNavigate={navigate} />;
      case 'ngoDashboard':
        return <NgoDashboard ngo={currentUser as NGO} onNavigate={navigate} />;
      case 'newReport':
        return <NewReport onBack={() => navigate({name: 'userDashboard'})} onSubmit={handleCreateReport} />;
      case 'reportDetails':
        return <ReportDetails reportId={view.reportId} currentUser={currentUser!} onBack={() => navigate(currentUser?.role === UserRole.USER ? {name: 'userDashboard'} : {name: 'ngoDashboard'})} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  const showHeader = view.name !== 'landing' && view.name !== 'auth';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {showHeader && <Header user={currentUser} onLogout={handleLogout} />}
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
