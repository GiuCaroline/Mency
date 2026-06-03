export function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(month, year) {
  return new Date(year, month, 1).getDay();
}

export function generateCalendar(month, year) {
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);

  const daysArray = [];

  // Dias vazios antes do mês começar
  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }

  // Dias do mês
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  return daysArray;
}