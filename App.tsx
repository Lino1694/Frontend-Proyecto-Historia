import React, { useState, useCallback, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import { LoginRole, Role } from './types';
import ActivityView from './components/student/ActivityView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ChatbotView from './components/student/ChatbotView';
import { ClassProgressProvider } from './contexts/ClassProgressContext';
import { ErrorBoundary } from './components/ErrorBoundary';

export type View = 
    | 'auth' 
    | 'student_dashboard' 
    | 'teacher_dashboard'
    | 'student_activity'
    | 'student_chatbot';

const AppContent: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [view, setView] = useState<View>('auth');
    const [userName, setUserName] = useState<string>('');
    const [currentRole, setCurrentRole] = useState<LoginRole>('student');
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            const savedRole = localStorage.getItem('userRole') as Role;
            setUserName(user.nombre);
            if (savedRole === 'student' || savedRole === 'teacher') {
                setCurrentRole(savedRole);
                setView(savedRole === 'student' ? 'student_dashboard' : 'teacher_dashboard');
            } else {
                setCurrentRole('student');
                setView('student_dashboard');
            }
        }
    }, [isAuthenticated, user]);

    const handleLogin = useCallback((name: string, role: Role) => {
        setUserName(name);
        if (role === 'student' || role === 'teacher') {
            setCurrentRole(role);
        } else {
            setCurrentRole('student');
        }

        if (role === 'student') {
            setView('student_dashboard');
        } else if (role === 'teacher') {
            setView('teacher_dashboard');
        }
    }, []);
    
    const handleLogout = useCallback(() => {
        logout();
        setUserName('');
        setView('auth');
    }, [logout]);

    const navigateTo = useCallback((newView: View) => {
        setView(newView);
    }, []);

    const navigateToChatbot = useCallback((topic: string) => {
        setSelectedTopic(topic);
        setView('student_chatbot');
    }, []);

    const renderView = () => {
        if (!isAuthenticated && view !== 'auth') {
            return <AuthPage onLogin={handleLogin} />;
        }

        switch (view) {
            case 'student_dashboard':
                return (
                    <StudentDashboard 
                        userName={userName} 
                        onLogout={handleLogout} 
                        navigateToActivity={() => navigateTo('student_activity')} 
                    />
                );
            case 'teacher_dashboard':
                return (
                    <TeacherDashboard 
                        userName={userName} 
                        onLogout={handleLogout} 
                    />
                );
            case 'student_activity':
                return <ActivityView onBack={() => setView('student_dashboard')} />;
            
            case 'student_chatbot':
                return selectedTopic ? <ChatbotView topicId={selectedTopic} onBack={() => 
                    setView('student_dashboard')} /> : <StudentDashboard userName={user!.nombre} 
                    onLogout={handleLogout} navigateToActivity={() => navigateTo('student_activity')} />;


            case 'auth':
            default:
                return <AuthPage onLogin={handleLogin} />;
        }
    };

    const containerClasses = view === 'auth' 
      ? "w-full h-screen overflow-hidden flex flex-col"
      : "w-full h-screen bg-brand-cream overflow-hidden flex flex-col lg:p-0 lg:m-0";

    return (
        <div className="min-h-screen w-full">
             <div className={containerClasses}>
                {renderView()}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <ThemeProvider>
                    <ClassProgressProvider>
                        <AppContent />
                    </ClassProgressProvider>
                </ThemeProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
};

export default App;
