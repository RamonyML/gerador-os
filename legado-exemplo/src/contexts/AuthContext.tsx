import { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User, UserData, OperadorData, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      try {
      if (firebaseUser) {
          // Tenta buscar os dados do usuário na coleção 'operadores' primeiro
          const operadorDoc = await getDoc(doc(db, 'operadores', firebaseUser.email || ''));
          
          if (operadorDoc.exists()) {
            const operadorData = operadorDoc.data() as OperadorData;
            const userData: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: operadorData.role,
              name: operadorData.nome || firebaseUser.email?.split('@')[0] || '',
              ativo: operadorData.ativo ?? true,
              createdAt: (operadorDoc.data() as any)?.createdAt?.toDate?.()?.toISOString(),
              updatedAt: (operadorDoc.data() as any)?.updatedAt?.toDate?.()?.toISOString()
            };
            setUser(userData);
          } else {
            // Se não encontrar na coleção 'operadores', busca na coleção 'users'
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data() as UserData;
              setUser({
                uid: userDoc.id,
                email: firebaseUser.email || '',
                role: userData.role,
                name: userData.nome,
                ativo: true
              });
            } else {
              // Se não encontrar em nenhuma coleção, define como operador padrão
            setUser({
              uid: firebaseUser.uid,
                email: (firebaseUser as any).email || '',
                role: 'operador',
                name: firebaseUser.email?.split('@')[0] || '',
                ativo: true
            });
          }
          }
        } else {
          setUser(null);
        }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        // Em caso de erro, mantém o usuário como null
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 