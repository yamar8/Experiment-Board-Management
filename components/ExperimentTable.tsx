import React, { useState, useRef } from 'react';
import type { AppData, Experiment, WeekColumn, Style } from '../types';
import { GhostIcon, PlusIcon, TrashIcon, PaletteIcon } from './icons';
import Tooltip from './Tooltip';
import StyleEditor from './StyleEditor';

interface ExperimentTableProps {
  data: AppData;
  isEditMode: boolean;
  onAddExperiment: () => void;
  onDeleteExperiment: (id: string) => void;
  onUpdateExperimentName: (id: string, newName: string) => void;
  onToggleWeekVisibility: (weekStartDate: string) => void;
  onCellClick: (cell: { experimentId: string; weekStartDate: string }) => void;
  onUpdateExperimentStyle: (id: string, style: Style) => void;
  onUpdateWeekStyle: (startDate: string, style: Style) => void;
}

const ExperimentTable: React.FC<ExperimentTableProps> = ({
  data,
  isEditMode,
  onAddExperiment,
  onDeleteExperiment,
  onUpdateExperimentName,
  onToggleWeekVisibility,
  onCellClick,
  onUpdateExperimentStyle,
  onUpdateWeekStyle,
}) => {
  const [styleEditorState, setStyleEditorState] = useState<{
    type: 'row' | 'col';
    id: string;
    initialStyle: Style;
    position: { top: number; left: number };
  } | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const visibleWeeks = React.useMemo(() => {
    return isEditMode ? data.weeks : data.weeks.filter(w => !w.isHidden);
  }, [data.weeks, isEditMode]);

  const currentWeekStartDate = React.useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today.setDate(today.getDate() - dayOfWeek));
    return sunday.toISOString().split('T')[0];
  }, []);

  const openStyleEditor = (e: React.MouseEvent, type: 'row' | 'col', id: string, initialStyle: Style = {}) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const containerRect = tableContainerRef.current?.getBoundingClientRect();

    if (containerRect && tableContainerRef.current) {
        setStyleEditorState({
            type,
            id,
            initialStyle,
            position: {
                top: rect.bottom - containerRect.top + tableContainerRef.current.scrollTop,
                left: target.offsetLeft,
            }
        });
    }
  };

  const handleStyleChange = (style: Style) => {
    if (!styleEditorState) return;
    if (styleEditorState.type === 'row') {
        onUpdateExperimentStyle(styleEditorState.id, style);
    } else {
        onUpdateWeekStyle(styleEditorState.id, style);
    }
    // Keep editor open but update its initialStyle for live color picker updates
    setStyleEditorState(prev => prev ? {...prev, initialStyle: style} : null);
  };
  
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border-light dark:border-border-dark shadow-md relative" ref={tableContainerRef}>
      {styleEditorState && (
        <StyleEditor
          position={styleEditorState.position}
          initialStyle={styleEditorState.initialStyle}
          onStyleChange={handleStyleChange}
          onClose={() => setStyleEditorState(null)}
        />
      )}
      <div className="w-full overflow-x-auto smooth-scroll" onClick={() => setStyleEditorState(null)}>
        <table className="w-full min-w-max border-collapse">
          <thead className="bg-surface-light dark:bg-surface-dark sticky top-0 z-10">
            <tr>
              <th className="p-3 text-right font-semibold text-text-secondary-light dark:text-text-secondary-dark border-b border-l border-border-light dark:border-border-dark sticky right-0 bg-surface-light dark:bg-surface-dark min-w-[200px]">
                שם ניסוי
              </th>
              {visibleWeeks.map((week) => (
                <WeekHeader
                  key={week.startDate}
                  week={week}
                  isCurrentWeek={week.startDate === currentWeekStartDate}
                  isEditMode={isEditMode}
                  onToggleVisibility={onToggleWeekVisibility}
                  onOpenStyleEditor={(e) => openStyleEditor(e, 'col', week.startDate, week.style)}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {data.experiments.map((exp) => (
              <ExperimentRow
                key={exp.id}
                experiment={exp}
                weeks={visibleWeeks}
                isEditMode={isEditMode}
                onDelete={onDeleteExperiment}
                onUpdateName={onUpdateExperimentName}
                onCellClick={onCellClick}
                onOpenStyleEditor={(e) => openStyleEditor(e, 'row', exp.id, exp.style)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-2 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
        <button
          onClick={onAddExperiment}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-primary-dark dark:text-primary-light hover:bg-primary-light dark:hover:bg-surface-dark rounded-md transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>הוסף ניסוי</span>
        </button>
      </div>
    </div>
  );
};

interface WeekHeaderProps {
  week: WeekColumn;
  isCurrentWeek: boolean;
  isEditMode: boolean;
  onToggleVisibility: (startDate: string) => void;
  onOpenStyleEditor: (e: React.MouseEvent) => void;
}

const WeekHeader: React.FC<WeekHeaderProps> = ({ week, isCurrentWeek, isEditMode, onToggleVisibility, onOpenStyleEditor }) => {
  const date = new Date(week.startDate);
  const month = date.toLocaleString('he-IL', { month: 'short' });
  const day = date.getDate();
  const style = week.style || {};

  return (
    <th
      style={{ backgroundColor: style.backgroundColor, color: style.textColor }}
      className={`p-1 text-center font-medium border-b border-l border-border-light dark:border-border-dark min-w-[90px] transition-opacity relative ${
        week.isHidden && isEditMode ? 'opacity-40' : 'opacity-100'
      } ${isCurrentWeek ? 'border-r-2 border-r-red-500 border-l-2 border-l-red-500' : ''}`}
    >
      <div className={`text-text-secondary-light dark:text-text-secondary-dark ${style.textColor ? 'text-inherit' : ''}`}>
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs">{month}</span>
          <span className={`text-lg font-semibold text-text-primary-light dark:text-text-primary-dark ${style.textColor ? 'text-inherit' : ''}`}>{day}</span>
          {isEditMode && (
             <div className="mt-1 flex items-center justify-center space-x-1">
                <Tooltip text="ערוך סגנון עמודה">
                    <button onClick={onOpenStyleEditor} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                        <PaletteIcon className="w-4 h-4" />
                    </button>
                </Tooltip>
                <Tooltip text={week.isHidden ? "הצג עמודה" : "הסתר עמודה"}>
                    <button onClick={() => onToggleVisibility(week.startDate)} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                        <GhostIcon className="w-4 h-4" />
                    </button>
                </Tooltip>
            </div>
          )}
        </div>
      </div>
    </th>
  );
};


interface ExperimentRowProps {
  experiment: Experiment;
  weeks: WeekColumn[];
  isEditMode: boolean;
  onDelete: (id: string) => void;
  onUpdateName: (id: string, newName: string) => void;
  onCellClick: (cell: { experimentId: string; weekStartDate: string }) => void;
  onOpenStyleEditor: (e: React.MouseEvent) => void;
}

const ExperimentRow: React.FC<ExperimentRowProps> = ({ experiment, weeks, isEditMode, onDelete, onUpdateName, onCellClick, onOpenStyleEditor }) => {
    const rowStyle = experiment.style || {};
    
    return (
        <tr className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" style={{ backgroundColor: rowStyle.backgroundColor }}>
            <td 
              className="p-2 border-b border-l border-border-light dark:border-border-dark sticky right-0 bg-bkg-light dark:bg-bkg-dark group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 min-w-[200px]"
              style={{ backgroundColor: 'inherit' }}
            >
                <div className="flex items-center justify-between">
                    <input
                        type="text"
                        value={experiment.name}
                        onChange={(e) => onUpdateName(experiment.id, e.target.value)}
                        className="font-semibold bg-transparent focus:outline-none focus:ring-1 focus:ring-primary rounded p-1 w-full"
                        style={{ color: rowStyle.textColor }}
                    />
                    {isEditMode && (
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Tooltip text="ערוך סגנון שורה">
                                <button
                                    onClick={onOpenStyleEditor}
                                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    <PaletteIcon className="w-4 h-4"/>
                                </button>
                            </Tooltip>
                            <Tooltip text="מחק ניסוי">
                                <button
                                    onClick={() => onDelete(experiment.id)}
                                    className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                                >
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                            </Tooltip>
                        </div>
                    )}
                </div>
            </td>
            {weeks.map(week => {
                const cellData = experiment.cells[week.startDate];
                const completedTasks = cellData?.tasks.filter(t => t.completed).length || 0;
                const totalTasks = cellData?.tasks.length || 0;
                
                const colStyle = week.style || {};
                const cellStyle = { ...rowStyle, ...colStyle };

                return (
                    <td
                        key={week.startDate}
                        onClick={(e) => { e.stopPropagation(); if(!isEditMode) onCellClick({ experimentId: experiment.id, weekStartDate: week.startDate })}}
                        style={{ backgroundColor: cellStyle.backgroundColor }}
                        className={`p-2 border-b border-l border-border-light dark:border-border-dark transition-all ${
                          !isEditMode ? 'cursor-pointer' : 'cursor-default'
                        } ${ week.isHidden && isEditMode ? 'opacity-40' : 'opacity-100'
                        } ${totalTasks > 0 && !cellStyle.backgroundColor ? 'bg-primary-light/30 dark:bg-primary-dark/20' : ''}`}
                    >
                        <div className="flex flex-col items-center justify-center h-full text-xs" style={{ color: cellStyle.textColor }}>
                            {totalTasks > 0 && (
                                <>
                                    <span className={!cellStyle.textColor ? 'text-text-secondary-light dark:text-text-secondary-dark' : ''}>{`${completedTasks}/${totalTasks} הושלמו`}</span>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 dark:bg-gray-700">
                                        <div 
                                            className="bg-green-500 h-1.5 rounded-full"
                                            style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </>
                            )}
                        </div>
                    </td>
                );
            })}
        </tr>
    );
};


export default React.memo(ExperimentTable);
