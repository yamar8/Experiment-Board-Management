
export interface Style {
  backgroundColor?: string;
  textColor?: string;
}

export interface Task {
  id: string;
  text: string;
  description: string;
  completed: boolean;
}

export interface CellData {
  tasks: Task[];
}

export interface Experiment {
  id:string;
  name: string;
  cells: Record<string, CellData>;
  style?: Style;
}

export interface WeekColumn {
  startDate: string; // ISO string for the Sunday of the week
  isHidden: boolean;
  style?: Style;
}

export interface AppData {
  experiments: Experiment[];
  weeks: WeekColumn[];
}

export type Theme = 'light' | 'dark';
