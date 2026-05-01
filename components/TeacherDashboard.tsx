import React, { useState } from 'react';
import TeacherHomePage from './teacher/TeacherHomePage';
import CreateActivityPage from './teacher/CreateActivityPage';
import RewardsCenter from './teacher/RewardsCenter';
import ReportsPage from './teacher/ReportsPage';
import ClassManagementPage from './teacher/ClassManagementPage';
import ContentManagementPage from './teacher/ContentManagementPage';
import ChallengesCenter from './teacher/ChallengesCenter';
import TeacherProfilePage from './teacher/TeacherProfilePage';
import CreateLessonPage from './teacher/CreateLessonPage';
import DynamicGenerationPage from './teacher/DynamicGenerationPage';
import { Activity } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { HomeIcon } from './icons/HomeIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { useAuth } from '../contexts/AuthContext';

interface TeacherDashboardProps {
    onLogout: () => void;
}

type TeacherView = 'home' | 'create_activity' | 'rewards_center' | 'reports' | 'class_management' | 'content_management' | 'challenges' | 'profile' | 'create_lesson' | 'dynamic_generation';


const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
    const { user } = useAuth();
    const [view, setView] = useState<TeacherView>('home');
    const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
    const [lessonToEdit, setLessonToEdit] = useState<any | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const navigateTo = (newView: TeacherView) => setView(newView);

    const handleCreateNew = () => {
        setActivityToEdit(null);
        navigateTo('create_activity');
    };

    const handleEdit = (activity: Activity) => {
        setActivityToEdit(activity);
        navigateTo('create_activity');
    }

    const renderContent = () => {
        switch (view) {
            case 'create_activity':
                return <CreateActivityPage onBack={() => navigateTo('home')} activityToEdit={activityToEdit} />;
            case 'rewards_center':
                return <RewardsCenter onBack={() => navigateTo('home')} />;
            case 'reports':
                return <ReportsPage onBack={() => navigateTo('home')} />;
            case 'class_management':
                return <ClassManagementPage onBack={() => navigateTo('home')} />;
            case 'content_management':
                return <ContentManagementPage onBack={() => navigateTo('home')} onCreateNew={handleCreateNew} onEdit={handleEdit} onCreateLesson={() => { setLessonToEdit(null); navigateTo('create_lesson'); }} onEditLesson={(lesson) => { setLessonToEdit(lesson); navigateTo('create_lesson'); }} />;
            case 'challenges':
                return <ChallengesCenter onBack={() => navigateTo('home')} />;
            case 'profile':
                return <TeacherProfilePage onBack={() => navigateTo('home')} />;
            case 'create_lesson':
                return <CreateLessonPage onBack={() => navigateTo('content_management')} lessonToEdit={lessonToEdit} />;
            case 'dynamic_generation':
                return <DynamicGenerationPage onBack={() => navigateTo('home')} />;
            case 'home':
            default:
                return (
                    <TeacherHomePage
                        userName={user?.nombre || 'Usuario'}
                        onLogout={onLogout}
                        navigateToRewardsCenter={() => navigateTo('rewards_center')}
                        navigateToReports={() => navigateTo('reports')}
                        navigateToClassManagement={() => navigateTo('class_management')}
                        navigateToContentManagement={() => navigateTo('content_management')}
                        navigateToChallenges={() => navigateTo('challenges')}
                    />
                );
        }
    };

    const SidebarButton: React.FC<{Icon: React.ElementType, label: string, onClick: () => void, isActive?: boolean}> = ({ Icon, label, onClick, isActive = false }) => (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors text-left ${
                isActive
                    ? 'bg-brand-orange text-white'
                    : 'text-slate-700 hover:bg-brand-orange/10'
            }`}
        >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="flex h-full bg-brand-cream">
            {/* Sidebar for desktop */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-brand-offwhite lg:shadow-lg">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">Panel Docente</h2>
                    <p className="text-sm text-slate-600">5to "A"</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <SidebarButton Icon={HomeIcon} label="Inicio" onClick={() => navigateTo('home')} isActive={view === 'home'} />
                    <SidebarButton Icon={DocumentTextIcon} label="Contenido" onClick={() => navigateTo('content_management')} isActive={view === 'content_management'} />
                    <SidebarButton Icon={ChartBarIcon} label="Reportes" onClick={() => navigateTo('reports')} isActive={view === 'reports'} />
                    <SidebarButton Icon={UsersIcon} label="Clase" onClick={() => navigateTo('class_management')} isActive={view === 'class_management'} />
                    <SidebarButton Icon={TrophyIcon} label="Retos" onClick={() => navigateTo('challenges')} isActive={view === 'challenges'} />
                    <SidebarButton Icon={SparklesIcon} label="Generación IA" onClick={() => navigateTo('dynamic_generation')} isActive={view === 'dynamic_generation'} />
                    <SidebarButton Icon={SparklesIcon} label="Insignias" onClick={() => navigateTo('rewards_center')} isActive={view === 'rewards_center'} />
                    <SidebarButton Icon={UserCircleIcon} label="Perfil" onClick={() => navigateTo('profile')} isActive={view === 'profile'} />
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">Hola, {user?.nombre || 'Usuario'}</p>
                    <button onClick={onLogout} className="w-full bg-brand-red-orange/20 text-brand-red-orange font-semibold px-3 py-2 rounded-lg hover:bg-brand-red-orange/30 transition-colors">
                        Salir
                    </button>
                </div>
            </aside>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
                    <div className="absolute right-4 top-16 bg-white rounded-lg shadow-lg p-4 min-w-48" onClick={(e) => e.stopPropagation()}>
                        <nav className="space-y-2">
                            <button onClick={() => { navigateTo('home'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full p-2 rounded-lg text-slate-700 hover:bg-brand-orange/10">
                                <HomeIcon className="h-5 w-5" />
                                <span>Inicio</span>
                            </button>
                            <button onClick={() => { navigateTo('content_management'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full p-2 rounded-lg text-slate-700 hover:bg-brand-orange/10">
                                <DocumentTextIcon className="h-5 w-5" />
                                <span>Contenido</span>
                            </button>
                            <button onClick={() => { navigateTo('reports'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full p-2 rounded-lg text-slate-700 hover:bg-brand-orange/10">
                                <ChartBarIcon className="h-5 w-5" />
                                <span>Reportes</span>
                            </button>
                            <button onClick={() => { navigateTo('class_management'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full p-2 rounded-lg text-slate-700 hover:bg-brand-orange/10">
                                <UsersIcon className="h-5 w-5" />
                                <span>Clase</span>
                            </button>
                            <button onClick={() => { navigateTo('challenges'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full p-2 rounded-lg text-slate-700 hover:bg-brand-orange/10">
                                <TrophyIcon className="h-5 w-5" />
                                <span>Retos</span>
                            </button>
                            <button onClick={() => { navigateTo('dynamic_generation'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full p-2 rounded-lg text-slate-700 hover:bg-brand-orange/10">
                                <SparklesIcon className="h-5 w-5" />
                                <span>Generación IA</span>
                            </button>
                            <button onClick={() => { navigateTo('rewards_center'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full p-2 rounded-lg text-slate-700 hover:bg-brand-orange/10">
                                <SparklesIcon className="h-5 w-5" />
                                <span>Insignias</span>
                            </button>
                            <button onClick={() => { navigateTo('profile'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full p-2 rounded-lg text-slate-700 hover:bg-brand-orange/10">
                                <UserCircleIcon className="h-5 w-5" />
                                <span>Perfil</span>
                            </button>
                        </nav>
                        <div className="border-t border-slate-200 mt-4 pt-4">
                            <p className="text-sm text-slate-600 mb-2">Hola, {user?.nombre || 'Usuario'}</p>
                            <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="w-full bg-brand-red-orange/20 text-brand-red-orange font-semibold px-3 py-2 rounded-lg hover:bg-brand-red-orange/30 transition-colors">
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <main className="flex-1 flex flex-col">
                {/* Mobile header */}
                <div className="lg:hidden p-4 bg-brand-offwhite shadow-sm flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-800">Panel Docente</h1>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 hover:text-slate-800">
                        <span className="text-2xl">☰</span>
                    </button>
                </div>
                {renderContent()}
            </main>
        </div>
    );
};

export default TeacherDashboard;