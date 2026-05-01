import { useClassProgress } from '../contexts/ClassProgressContext';

// ...existing code...

const StudentProfilePage: React.FC = () => {
  const { progress } = useClassProgress();
  
  const classes = [
    'Caral - La Primera Ciudad',
    'Culturas Pre-Incaicas',
    'La Cultura Inca',
    'Período Virreinal',
    'Período de Independencia',
    'Batalla de Angamos',
  ];

  const generalProgress = Math.round(
    Object.values(progress).reduce((sum, val) => sum + val, 0) / classes.length
  );

  return (
    <div className="student-profile">
      <section className="general-progress">
        <h2>Tu Progreso General</h2>
        <div className="progress-bar-container large">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${generalProgress}%` }}
          />
        </div>
        <span className="progress-percentage">{generalProgress}%</span>
      </section>

      <section className="classes-progress">
        <h3>Progreso por Clase</h3>
        <div className="progress-list">
          {classes.map(className => (
            <div key={className} className="progress-item">
              <span className="class-name">{className}</span>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${progress[className] || 0}%` }}
                />
              </div>
              <span className="progress-text">{progress[className] || 0}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* ...existing code... */}
    </div>
  );
};

export default StudentProfilePage;