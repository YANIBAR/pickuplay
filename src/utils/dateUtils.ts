export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12 || 12;

  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
};

export const formatDateLong = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateShort = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseTime = (time: string) => {
  const [timePart, modifier] = time.split(' '); // "12:19", "pm"
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier.toLowerCase() === 'pm' && hours !== 12) {
    hours += 12;
  }

  if (modifier.toLowerCase() === 'am' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
};