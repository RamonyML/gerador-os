import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface LogData {
  action: 'create' | 'update' | 'delete';
  targetCollection?: string;
  targetId?: string;
  details?: any;
}

const useLogger = () => {
  const { user } = useAuth();

  const logAction = async ({ action, details, targetId, targetCollection }: LogData) => {
    try {
      if (!user) return;

      const logData = {
        timestamp: serverTimestamp(),
        userEmail: user.email,
        userName: user.name || '',
        action,
        targetCollection,
        targetId,
        details,
      };

      await addDoc(collection(db, 'logs'), logData);
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  };

  return { logAction };
};

export default useLogger; 