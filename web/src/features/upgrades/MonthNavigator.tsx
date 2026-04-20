import { Box, Button, Typography } from '@mui/material'
import { addMonths, format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Props = {
  selectedMonth: Date
  onMonthChange: (next: Date) => void
}

export function MonthNavigator({ selectedMonth, onMonthChange }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Button
        type="button"
        size="small"
        onClick={() => onMonthChange(subMonths(selectedMonth, 1))}
        aria-label="Mês anterior"
      >
        {'<'}
      </Button>
      <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
        {format(selectedMonth, 'LLLL yyyy', { locale: ptBR })}
      </Typography>
      <Button
        type="button"
        size="small"
        onClick={() => onMonthChange(addMonths(selectedMonth, 1))}
        aria-label="Próximo mês"
      >
        {'>'}
      </Button>
    </Box>
  )
}
