
import type { AppData } from '../types';

declare var XLSX: any;

export function exportToExcel(data: AppData): void {
  const visibleWeeks = data.weeks.filter(w => !w.isHidden);

  // Header Row
  const header = ['שם ניסוי', ...visibleWeeks.map(week => {
    const date = new Date(week.startDate);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  })];
  
  // Data Rows
  const rows = data.experiments.map(exp => {
    const row: string[] = [exp.name];
    visibleWeeks.forEach(week => {
      const cellData = exp.cells[week.startDate];
      const tasksSummary = cellData?.tasks.map(t => `${t.text} (${t.completed ? 'V' : 'X'})`).join('\n') || '';
      row.push(tasksSummary);
    });
    return row;
  });

  const worksheetData = [header, ...rows];
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  const colWidths = [{ wch: 25 }]; // Experiment name
  for (let i = 0; i < visibleWeeks.length; i++) {
    colWidths.push({ wch: 15 });
  }
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'לוח ניסויים');
  
  // Force RTL direction in the sheet
  if(!workbook.Workbook) workbook.Workbook = {};
  if(!workbook.Workbook.Views) workbook.Workbook.Views = [];
  if(!workbook.Workbook.Views[0]) workbook.Workbook.Views[0] = {};
  workbook.Workbook.Views[0].RTL = true;
  
  XLSX.writeFile(workbook, 'לוח_ניסויים.xlsx');
}
