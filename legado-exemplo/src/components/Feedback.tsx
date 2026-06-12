import React from 'react';
import { Toaster } from 'react-hot-toast';

const Feedback: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#4caf50',
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#f44336',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default Feedback; 