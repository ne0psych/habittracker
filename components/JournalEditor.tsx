
import React, { useState, useRef, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { Bold, Italic, Image as ImageIcon, Save, CheckCircle } from 'lucide-react';

export const JournalEditor: React.FC = () => {
  const { data, saveJournal } = useHabits();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

  useEffect(() => {
    if (editorRef.current && data.journals[dateKey]) {
      editorRef.current.innerHTML = data.journals[dateKey];
    }
  }, [dateKey]);

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
        // Add styling to images in contentEditable
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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daily Journal</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capture your thoughts for today</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleCommand('bold')} 
            className="p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button 
            onClick={() => handleCommand('italic')} 
            className="p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <button 
            onClick={handleImage} 
            className="p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
            title="Insert Image"
          >
            <ImageIcon size={18} />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
              isSaved ? 'bg-green-500 text-white' : 'bg-slate-800 dark:bg-rose-500 text-white hover:shadow-lg'
            }`}
          >
            {isSaved ? <><CheckCircle size={14} /> Saved</> : <><Save size={14} /> Save Entry</>}
          </button>
        </div>
      </div>
      {/* Fix: Removed invalid placeholder attribute from div as it is not supported in React HTMLAttributes for div elements */}
      <div 
        ref={editorRef}
        contentEditable
        className="flex-1 p-8 min-h-[300px] outline-none text-slate-700 dark:text-slate-200 leading-relaxed font-medium prose dark:prose-invert max-w-none overflow-y-auto custom-scrollbar"
      />
    </div>
  );
};
