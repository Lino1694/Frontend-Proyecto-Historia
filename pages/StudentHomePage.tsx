import { Link } from 'react-router-dom';
import { useClassProgress } from '../contexts/ClassProgressContext';
import '../styles/StudentHomePage.css';

const mockClasses = [
    {
        id: 'organizacion-virreinato',
        title: 'Organización del Virreinato',
        description: 'Es el periodo en que el Perú fue organizado como virreinato desde 1542, con Lima como capital y el sistema de intendencias.',
        icon: '🏛️',
        color: 'bg-stone-300',
        year: '1542 - 1700'
    },
    {
        id: 'reformas-borbonicas',
        title: 'Reformas Borbónicas',
        description: 'Período de cambios administrativos y fiscales impuestos por los reyes Borbones que generaron malestar popular.',
        icon: '📜',
        color: 'bg-yellow-200',
        year: '1700 - 1808'
    },
    {
        id: 'rebeliones',
        title: 'Rebeliones',
        description: 'Movilizaciones indígenas y criollas contra el colonialismo, destacando la de Túpac Amaru II y Micaela Bastidas.',
        icon: '⚔️',
        color: 'bg-red-200',
        year: '1780 - 1814'
    },
    {
        id: 'independencia',
        title: 'Independencia',
        description: 'Campaña libertadora de San Martín que proclamó la independencia del Perú el 28 de julio de 1821.',
        icon: '🕊️',
        color: 'bg-blue-200',
        year: '1821 - 1824'
    },
    {
        id: 'consolidacion',
        title: 'Consolidación',
        description: 'Batallas que pusieron fin al dominio español y la formación del nuevo Estado peruano.',
        icon: '⚓',
        color: 'bg-purple-200',
        year: '1824 - 1825'
    },
];

const StudentHomePage: React.FC = () => {
  const { progress } = useClassProgress();

  return (
    <div className="student-home">
      <h2>Apartado Conocimiento</h2>
      <div className="classes-grid">
        {mockClasses.map((classItem) => (
          <div key={classItem.id} className={`class-card ${classItem.color}`}>
            <div className="class-icon">{classItem.icon}</div>
            <h3>{classItem.title}</h3>
            <p>{classItem.description}</p>
            <span className="year">{classItem.year}</span>
            
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progress[classItem.id] || 0}%` }}
              />
            </div>
            <span className="progress-text">{progress[classItem.id] || 0}%</span>
            
            <Link to={`/clase/${classItem.id}`} className="class-link">
              Ir a la clase
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentHomePage;