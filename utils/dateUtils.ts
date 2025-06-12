// Function to format date string (e.g., YYYY-MM-DD or ISO) to DD/MM/YYYY
export const formatDateForDisplay = (dateStr?: string | Date): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    if (isNaN(day as any) || isNaN(month as any) || isNaN(year as any)) return typeof dateStr === 'string' ? dateStr : 'Date invalide';
    return `${day}/${month}/${year}`;
  } catch {
    return typeof dateStr === 'string' ? dateStr : 'Date invalide'; // fallback if parsing fails
  }
};

// Function to add days to a date string (DD/MM/YYYY) and return a Date object
export const addDaysToDate = (dateStrDdMmYyyy: string, daysToAdd: number): Date => {
  const parts = dateStrDdMmYyyy.split('/');
  // Month in JavaScript Date is 0-indexed, so subtract 1
  const dateObj = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  dateObj.setDate(dateObj.getDate() + daysToAdd);
  return dateObj;
};
