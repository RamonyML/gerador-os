import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthNavigatorProps {
  selectedMonth: Date;
  onMonthChange: (newMonth: Date) => void;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ selectedMonth, onMonthChange }) => {
  const handleMonthChange = (change: 'prev' | 'next') => {
    const newMonth = change === 'next' 
      ? addMonths(selectedMonth, 1) 
      : subMonths(selectedMonth, 1);
    onMonthChange(newMonth);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Button onClick={() => handleMonthChange('prev')}>{'<'}</Button>
      <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
        {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
      </Typography>
      <Button onClick={() => handleMonthChange('next')}>{'>'}</Button>
    </Box>
  );
};

export default MonthNavigator; 