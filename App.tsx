
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { AppData, Experiment, Task, CellData, WeekColumn, Theme, Style } from './types';
import { generateInitialData } from './utils/dataGenerator';
import { exportToExcel } from './utils/excelExporter';
import Header from './components/Header';
import ExperimentTable from './components/ExperimentTable';
import TaskModal from './components/TaskModal';

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [activeCell, setActiveCell] = useState<{ experimentId: string; weekStartDate: string } | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('experimentBoardData');
    if (savedData) {
      setData(JSON.parse(savedData));
    } else {
      setData(generateInitialData());
    }

    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (data) {
      localStorage.setItem('experimentBoardData', JSON.stringify(data));
    }
  }, [data]);

  const handleThemeToggle = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  }, []);

  const handleUpdate = useCallback(<T,>(updater: (prevData: AppData) => AppData) => {
    setData(prevData => {
      if (!prevData) return null;
      return updater(prevData);
    });
  }, []);

  const handleAddExperiment = useCallback(() => {
    handleUpdate(prevData => ({
      ...prevData,
      experiments: [
        ...prevData.experiments,
        {
          id: `exp_${Date.now()}`,
          name: `ניסוי ${prevData.experiments.length + 1}`,
          cells: {},
        },
      ],
    }));
  }, [handleUpdate]);

  const handleDeleteExperiment = useCallback((experimentId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הניסוי הזה?')) {
        handleUpdate(prevData => ({
        ...prevData,
        experiments: prevData.experiments.filter(exp => exp.id !== experimentId),
        }));
    }
  }, [handleUpdate]);

  const handleUpdateExperimentName = useCallback((experimentId: string, newName: string) => {
    handleUpdate(prevData => ({
      ...prevData,
      experiments: prevData.experiments.map(exp =>
        exp.id === experimentId ? { ...exp, name: newName } : exp
      ),
    }));
  }, [handleUpdate]);

  const handleToggleWeekVisibility = useCallback((weekStartDate: string) => {
    handleUpdate(prevData => ({
        ...prevData,
        weeks: prevData.weeks.map(week =>
            week.startDate === weekStartDate ? { ...week, isHidden: !week.isHidden } : week
        )
    }));
  }, [handleUpdate]);

  const handleUpdateExperimentStyle = useCallback((experimentId: string, style: Style) => {
    handleUpdate(prevData => ({
      ...prevData,
      experiments: prevData.experiments.map(exp => 
        exp.id === experimentId ? { ...exp, style } : exp
      )
    }));
  }, [handleUpdate]);

  const handleUpdateWeekStyle = useCallback((weekStartDate: string, style: Style) => {
    handleUpdate(prevData => ({
      ...prevData,
      weeks: prevData.weeks.map(week =>
        week.startDate === weekStartDate ? { ...week, style } : week
      )
    }));
  }, [handleUpdate]);
  
  const handleUpdateCellTasks = useCallback((experimentId: string, weekStartDate: string, newTasks: Task[]) => {
    handleUpdate(prevData => {
      const newExperiments = prevData.experiments.map(exp => {
        if (exp.id === experimentId) {
          const newCells = { ...exp.cells };
          const cellData = newCells[weekStartDate] || { tasks: [] };
          newCells[weekStartDate] = { ...cellData, tasks: newTasks };
          return { ...exp, cells: newCells };
        }
        return exp;
      });
      return { ...prevData, experiments: newExperiments };
    });
  }, [handleUpdate]);

  const handleExport = useCallback(() => {
    if (data) {
      exportToExcel(data);
    }
  }, [data]);

  const activeCellData = useMemo(() => {
    if (!activeCell || !data) return null;
    const experiment = data.experiments.find(exp => exp.id === activeCell.experimentId);
    return experiment?.cells[activeCell.weekStartDate] || { tasks: [] };
  }, [activeCell, data]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">טוען נתונים...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        theme={theme}
        onToggleTheme={handleThemeToggle}
        onExport={handleExport}
      />
      <main className="flex-grow p-2 sm:p-4">
        <ExperimentTable
            data={data}
            isEditMode={isEditMode}
            onAddExperiment={handleAddExperiment}
            onDeleteExperiment={handleDeleteExperiment}
            onUpdateExperimentName={handleUpdateExperimentName}
            onToggleWeekVisibility={handleToggleWeekVisibility}
            onUpdateExperimentStyle={handleUpdateExperimentStyle}
            onUpdateWeekStyle={handleUpdateWeekStyle}
            onCellClick={setActiveCell}
        />
      </main>
      {activeCell && activeCellData && (
        <TaskModal
          isOpen={!!activeCell}
          onClose={() => setActiveCell(null)}
          tasks={activeCellData.tasks}
          onUpdateTasks={(newTasks) => handleUpdateCellTasks(activeCell.experimentId, activeCell.weekStartDate, newTasks)}
          weekStartDate={activeCell.weekStartDate}
          experimentName={data.experiments.find(e => e.id === activeCell.experimentId)?.name || ''}
        />
      )}
    </div>
  );
};

export default App;
