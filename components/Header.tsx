
import React from 'react';
import type { Theme } from '../types';
import { SunIcon, MoonIcon, PencilIcon, DownloadIcon } from './icons';

interface HeaderProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ isEditMode, onToggleEditMode, theme, onToggleTheme, onExport }) => {
  return (
    <header className="flex items-center justify-between p-3 sm:p-4 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark shadow-sm sticky top-0 z-20">
      <h1 className="text-lg sm:text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
        ניהול לוח ניסויים
      </h1>
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={onExport}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="ייצוא ל-Excel"
        >
          <DownloadIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="שנה ערכת נושא"
        >
          {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
        <button
          onClick={onToggleEditMode}
          className={`px-3 py-2 rounded-full flex items-center space-x-2 transition-colors ${
            isEditMode
              ? 'bg-primary-dark text-white'
              : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
          }`}
          title="מצב עריכה מיוחד"
        >
          <PencilIcon className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">{isEditMode ? 'צא ממצב עריכה' : 'מצב עריכה'}</span>
        </button>
      </div>
    </header>
  );
};

export default React.memo(Header);
