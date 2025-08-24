/**
 * Funções utilitárias puras para manipulação de datas
 * Funções puras não causam efeitos colaterais e sempre retornam o mesmo resultado para os mesmos inputs
 */

/**
 * Retorna o número de dias entre duas datas
 */
export const daysBetween = (start: Date, end: Date): number => {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const diffMs = Math.abs(end.getTime() - start.getTime());
  return Math.round(diffMs / millisecondsPerDay);
};

/**
 * Verifica se uma data está no passado
 */
export const isPastDate = (date: Date): boolean => {
  return date < new Date();
};

/**
 * Adiciona dias a uma data
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Formata uma data para o formato dd/mm/yyyy
 */
export const formatDate = (date: Date): string => {
  return `${padZero(date.getDate())}/${padZero(date.getMonth() + 1)}/${date.getFullYear()}`;
};

/**
 * Agrupa datas por período (dia, semana, mês)
 */
export const getPeriodKey = (date: Date, groupBy: 'day' | 'week' | 'month'): string => {
  const year = date.getFullYear();
  
  if (groupBy === 'day') {
    const month = padZero(date.getMonth() + 1);
    const day = padZero(date.getDate());
    return `${year}-${month}-${day}`;
  }
  
  if (groupBy === 'week') {
    const weekNumber = getISOWeek(date);
    return `${year}-W${padZero(weekNumber)}`;
  }
  
  // Mês
  const month = padZero(date.getMonth() + 1);
  return `${year}-${month}`;
};

/**
 * Retorna o número da semana ISO de uma data
 * https://en.wikipedia.org/wiki/ISO_week_date
 */
export const getISOWeek = (date: Date): number => {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

/**
 * Adiciona zero à esquerda para números < 10
 */
const padZero = (num: number): string => {
  return num < 10 ? `0${num}` : `${num}`;
};

/**
 * Traduz período para formato amigável
 */
export const formatPeriod = (periodKey: string, groupBy: 'day' | 'week' | 'month'): string => {
  if (groupBy === 'day') {
    const [year, month, day] = periodKey.split('-').map(Number);
    return `${day}/${month}/${year}`;
  }
  
  if (groupBy === 'week') {
    const [yearStr, weekStr] = periodKey.split('-');
    const weekNum = parseInt(weekStr.substring(1));
    return `Semana ${weekNum} de ${yearStr}`;
  }
  
  // Mês
  const [year, month] = periodKey.split('-');
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};
