
// utils/stringUtils.ts
export const splitFullName = (fullName?: string): { firstName: string; lastName: string } => {
  if (!fullName) return { firstName: '', lastName: '' };
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: '', lastName: ''};
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }; // Or handle as just firstName or lastName based on convention

  const lastName = parts.pop() || ''; // Last part is lastName
  const firstName = parts.join(' '); // The rest is firstName
  
  return { firstName, lastName };
};
