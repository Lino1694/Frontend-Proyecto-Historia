import React, { useState } from 'react';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { HomeIcon } from './icons/HomeIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import StudentHomePage from './student/StudentHomePage';
import StudentAchievementsPage from './student/StudentAchievementsPage';
import StudentChallengesPage from './student/StudentChallengesPage';
import StudentProfilePage from './student/StudentProfilePage';
import ChatbotPage from './student/ChatbotPage';
import { useTheme } from '../contexts/ThemeContext';

interface StudentDashboardProps {
    userName: string;
    onLogout: () => void;
    navigateToActivity: () => void;
}

type StudentTab = 'home' | 'achievements' | 'challenges' | 'profile' | 'chatbot';

const StudentDashboard: React.FC<StudentDashboardProps> = ({ userName, onLogout, navigateToActivity }) => {
    const [activeTab, setActiveTab] = useState<StudentTab>('home');
    const { themeClasses } = useTheme();

    const renderContent = () => {
        switch(activeTab) {
            case 'home':
                return <StudentHomePage userName={userName} onLogout={onLogout} navigateToActivity={navigateToActivity} />;
            case 'achievements':
                return <StudentAchievementsPage />;
            case 'challenges':
                return <StudentChallengesPage navigateToActivity={navigateToActivity} />;
            case 'profile':
                return <StudentProfilePage userName={userName} />;
            case 'chatbot':
                return <ChatbotPage />;
            default:
                return <StudentHomePage userName={userName} onLogout={onLogout} navigateToActivity={navigateToActivity} />;
        }
    }

    const NavItem: React.FC<{tab: StudentTab, label: string, Icon: React.ElementType}> = ({tab, label, Icon}) => (
        <button onClick={() => setActiveTab(tab)} className={`flex flex-col items-center w-full justify-center transition-colors duration-200 lg:flex-row lg:items-center lg:justify-start lg:w-full lg:px-4 lg:py-3 lg:rounded-lg lg:hover:bg-brand-cream/50 ${activeTab === tab ? 'text-brand-orange lg:bg-brand-cream/70' : 'text-slate-500 hover:text-brand-orange'}`}>
            <Icon className="h-6 w-6 lg:mr-3" />
            <span className="text-xs font-bold lg:text-sm lg:text-left">{label}</span>
        </button>
    );

    return (
        <div className={`flex flex-col h-full ${themeClasses.bg} lg:flex-row`}>
            <nav className={`lg:flex lg:flex-col lg:w-64 lg:${themeClasses.headerBg}/90 lg:backdrop-blur-lg lg:shadow-lg lg:relative lg:h-full absolute bottom-0 left-0 right-0 ${themeClasses.headerBg}/90 backdrop-blur-lg shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.1)] lg:shadow-none`}>
                <div className="flex justify-around items-center h-16 lg:flex-col lg:justify-start lg:items-start lg:p-4 lg:space-y-4 lg:h-full">
                    <NavItem tab="home" label="Inicio" Icon={HomeIcon} />
                    <NavItem tab="achievements" label="Logros" Icon={TrophyIcon} />
                    <NavItem tab="challenges" label="Retos" Icon={BookOpenIcon} />
                    <NavItem tab="chatbot" label="Chatbot" Icon={SparklesIcon} />
                    <NavItem tab="profile" label="Perfil" Icon={UserCircleIcon} />
                </div>
            </nav>
            <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
                {renderContent()}
            </main>
        </div>
    );
};

export default StudentDashboard;
