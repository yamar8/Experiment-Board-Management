
import type { AppData, WeekColumn } from '../types';

function getSundays(startDate: Date, endDate: Date): WeekColumn[] {
  const weeks: WeekColumn[] = [];
  let current = new Date(startDate);
  current.setDate(current.getDate() - current.getDay()); // Find the Sunday of the week of the start date

  while (current <= endDate) {
    weeks.push({
      startDate: current.toISOString().split('T')[0],
      isHidden: false,
    });
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

export function generateInitialData(): AppData {
  const startDate = new Date('2024-11-01');
  const endDate = new Date('2025-12-31');
  const weeks = getSundays(startDate, endDate);
  
  return {
    weeks,
    experiments: [
      {
        id: 'exp_1',
        name: 'ניסוי ראשון',
        cells: {
          [weeks[2].startDate]: {
            tasks: [
              { id: 'task_1', text: 'הכנת חומרים', description: 'איסוף כל הריאגנטים הדרושים.', completed: true },
              { id: 'task_2', text: 'כיול ציוד', description: 'לוודא שכל המכשירים מכוילים.', completed: false },
            ]
          },
          [weeks[3].startDate]: {
            tasks: [
              { id: 'task_3', text: 'הרצה ראשונית', description: 'ניסוי מקדים לבדיקת הפרוטוקול.', completed: false },
            ]
          }
        },
      },
      {
        id: 'exp_2',
        name: 'ניסוי בקרה',
        cells: {},
      },
       {
        id: 'exp_3',
        name: 'פיתוח פרוטוקול חדש',
        cells: {},
      },
    ],
  };
}
