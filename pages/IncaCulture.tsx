import { useClassProgress } from '../contexts/ClassProgressContext';

const IncaCulture: React.FC = () => {
  const { addQueryToClass } = useClassProgress();
  
  const handleSendMessage = async (userMessage: string) => {
    // ...existing code...
    
    addQueryToClass('La Cultura Inca');
    
    // ...existing code...
  };

  return (
    <div>
      {/* ...existing code... */}
    </div>
  );
};

export default IncaCulture;