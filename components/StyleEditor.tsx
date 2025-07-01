import React, { useState, useEffect, useRef } from 'react';
import type { Style } from '../types';
import { XIcon } from './icons';

interface StyleEditorProps {
  initialStyle: Style;
  onStyleChange: (style: Style) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

const StyleEditor: React.FC<StyleEditorProps> = ({ initialStyle, onStyleChange, onClose, position }) => {
  const [backgroundColor, setBackgroundColor] = useState(initialStyle.backgroundColor || '#ffffff');
  const [textColor, setTextColor] = useState(initialStyle.textColor || '#202124');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    // To handle live updates from parent if needed
    setBackgroundColor(initialStyle.backgroundColor || '#ffffff');
    setTextColor(initialStyle.textColor || '#202124');
  }, [initialStyle]);


  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBgColor = e.target.value;
    setBackgroundColor(newBgColor);
    onStyleChange({ backgroundColor: newBgColor, textColor });
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTextColor = e.target.value;
    setTextColor(newTextColor);
    onStyleChange({ backgroundColor, textColor: newTextColor });
  };

  return (
    <div 
      ref={editorRef}
      className="absolute z-30 bg-white dark:bg-surface-dark rounded-lg shadow-xl border border-border-light dark:border-border-dark p-3"
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-sm text-text-primary-light dark:text-text-primary-dark">ערוך סגנון</h4>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
          <XIcon className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-x-4">
          <label htmlFor="bgColor" className="text-sm text-text-secondary-light dark:text-text-secondary-dark">רקע</label>
          <input id="bgColor" type="color" value={backgroundColor} onChange={handleBgChange} className="w-8 h-8 p-0 border-none rounded cursor-pointer" />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <label htmlFor="textColor" className="text-sm text-text-secondary-light dark:text-text-secondary-dark">טקסט</label>
          <input id="textColor" type="color" value={textColor} onChange={handleTextChange} className="w-8 h-8 p-0 border-none rounded cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default StyleEditor;
