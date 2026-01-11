import React, { useState, useRef, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { Bold, Italic, Image as ImageIcon, Save, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';

export const JournalEditor: React.FC = () => {
  const { data, saveJournal, viewDate } = useHabits();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const dateKey = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}-${viewDate.getDate().toString().padStart(2, '0')}`;

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = data.journals[dateKey] || '';
    }
  }, [dateKey, data.journals]);

  const handleCommand = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  const handleImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (re) => {
        const url = re.target?.result as string;
        document.execCommand('insertImage', false, url);
        const images = editorRef.current?.getElementsByTagName('img');
        if (images) {
          for (let i = 0; i < images.length; i++) {
            images[i].style.maxWidth = '100%';
            images[i].style.borderRadius = '1rem';
            images[i].style.margin = '1rem 0';
          }
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSave = () => {
    if (editorRef.current) {
      saveJournal(dateKey, editorRef.current.innerHTML);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const isToday = new Date().toDateString() === viewDate.toDateString();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-xl">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
              {isToday ? "Today's Journal" : viewDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mindful Reflection</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleCommand('bold')} className="p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><Bold size={16} /></button>
          <button onClick={() => handleCommand('italic')} className="p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><Italic size={16} /></button>
          <button onClick={handleImage} className="p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><ImageIcon size={16} /></button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              isSaved ? 'bg-green-500 text-white' : 'bg-slate-800 dark:bg-rose-500 text-white hover:shadow-lg'
            }`}
          >
            {isSaved ? <><CheckCircle size={14} /> Saved</> : <><Save size={14} /> Save Entry</>}
          </button>
        </div>
      </div>
      <div 
        ref={editorRef}
        contentEditable
        className="flex-1 p-8 min-h-[350px] outline-none text-slate-700 dark:text-slate-200 leading-relaxed font-medium prose dark:prose-invert max-w-none overflow-y-auto custom-scrollbar"
      />
    </div>
  );
};