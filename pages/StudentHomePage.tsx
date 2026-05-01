import { Link } from 'react-router-dom';
import { useClassProgress } from '../contexts/ClassProgressContext';
import '../styles/StudentHomePage.css';

const mockClasses = [
    {
        id: 'caral-ciudad',
        title: 'Caral - La Primera Ciudad',
        description: 'Es el origen de la civilización en el Perú y América, perteneciente al periodo precerámico.',
        icon: '🏛️',
        color: 'bg-stone-300',
        year: '3000 - 1800 a.C.'
    },
    {
        id: 'pre-inca',
        title: 'Culturas Pre-Incaicas',
        description: 'Este es un periodo muy amplio que abarca todas las civilizaciones que surgieron después de Caral y antes del apogeo inca.',
        icon: '🏺',
        color: 'bg-yellow-200',
        year: '1500 a.C. - 1400 d.C.'
    },
    {
        id: 'cultura-inca',
        title: 'La Cultura Inca',
        description: 'Representa el último y más grande imperio que se desarrolló en el Perú antes de la llegada de los españoles.',
        icon: '🏛️',
        color: 'bg-amber-300',
        year: '1400 - 1532 d.C.'
    },
    {
        id: 'virreinato',
        title: 'El Virreinato del Perú',
        description: 'Se inicia con la conquista española del Imperio Inca y se consolida como la entidad política que gobernó la región durante casi 300 años.',
        icon: '📜',
        color: 'bg-blue-200',
        year: '1542 - 1824'
    },
    {
        id: 'independencia',
        title: 'La Independencia',
        description: 'Este proceso culmina con la declaración de la independencia del Perú, marcando el fin del Virreinato.',
        icon: '🕊️',
        color: 'bg-red-200',
        year: 'Proclamada en 1821'
    },
    {
        id: 'batalla-angamos',
        title: 'La Batalla de Angamos',
        description: 'Un evento clave dentro de la Guerra del Pacífico (1879-1884), que ocurrió varias décadas después de consolidada la independencia.',
        icon: '⚓',
        color: 'bg-blue-300',
        year: '8 de octubre de 1879'
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
                style={{ width: `${progress[classItem.title] || 0}%` }}
              />
            </div>
            <span className="progress-text">{progress[classItem.title] || 0}%</span>
            
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