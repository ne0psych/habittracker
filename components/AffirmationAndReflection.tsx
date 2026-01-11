import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { Edit2, Save, Quote } from 'lucide-react';

export const AffirmationPanel: React.FC = () => {
  const { data, updateAffirmation } = useHabits();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.affirmation.text);
  const [url, setUrl] = useState(data.affirmation.imageUrl);

  useEffect(() => {
    setText(data.affirmation.text);
    setUrl(data.affirmation.imageUrl);
  }, [data.affirmation]);

  const handleSave = () => {
    updateAffirmation(text, url);
    setIsEditing(false);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 shadow-md group border border-transparent dark:border-slate-700">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${url})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent flex flex-col justify-end p-6">
        {isEditing ? (
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl space-y-3">
             <input 
              className="w-full text-sm p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded"
              placeholder="Image URL"
              value={url} 
              onChange={e => setUrl(e.target.value)} 
            />
            <textarea 
              className="w-full text-sm p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded"
              rows={2}
              value={text} 
              onChange={e => setText(e.target.value)} 
            />
            <button onClick={handleSave} className="bg-rose-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max hover:bg-rose-600 transition-colors">
              <Save size={12} /> Save
            </button>
          </div>
        ) : (
          <div className="max-w-2xl">
            <Quote className="text-white/60 mb-2" size={24} />
            <h2 className="text-white text-xl md:text-3xl font-bold leading-tight font-serif italic drop-shadow-md">
              "{text}"
            </h2>
          </div>
        )}
        
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
        >
          <Edit2 size={16} />
        </button>
      </div>
    </div>
  );
};

export const MonthlyReflection: React.FC = () => {
  const { data, saveReflection } = useHabits();
  const [notes, setNotes] = useState(data.monthlyReflection.notes);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNotes(data.monthlyReflection.notes);
  }, [data.monthlyReflection]);

  const handleSave = () => {
    saveReflection(notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Monthly Reflection</h3>
        <span className="text-xs text-slate-400">
          {data.monthlyReflection.savedAt ? `Saved: ${new Date(data.monthlyReflection.savedAt).toLocaleDateString()}` : 'Not saved this month'}
        </span>
      </div>
      <textarea
        className="w-full h-40 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 resize-none text-slate-600 dark:text-slate-200 placeholder:text-slate-400"
        placeholder="What went well this month? What can be improved? Write your thoughts..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="mt-4 flex justify-end">
        <button 
          onClick={handleSave}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            isSaved ? 'bg-green-500 text-white' : 'bg-slate-800 dark:bg-slate-600 text-white hover:bg-slate-700 dark:hover:bg-slate-500'
          }`}
        >
          {isSaved ? 'Saved!' : 'Save Reflection'}
        </button>
      </div>
    </div>
  );
};