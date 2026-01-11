import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HabitProvider, useHabits } from './context/HabitContext';
import { HabitGrid } from './components/HabitGrid';
import { Dashboard } from './components/Dashboard';
import { AffirmationPanel, MonthlyReflection } from './components/AffirmationAndReflection';
import { Settings } from './components/Settings';
import { TimeTracker } from './components/TimeTracker';
import { LayoutGrid, Download, ChevronLeft, ChevronRight, PieChart, Flame, Settings as SettingsIcon, Clock } from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive 
          ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 font-medium' 
          : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

const Header = () => {
  const { data, changeMonth, exportData } = useHabits();
  
  // Calculate best current streak
  const bestStreak = Math.max(0, ...Object.values(data.analytics.streaks));

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome back, {data.user.name.split(' ')[0]}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Let's make today count.</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        {/* Streak Badge */}
        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-xl border border-orange-100 dark:border-orange-900/30 shadow-sm">
          <Flame size={20} className="fill-orange-500" />
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider opacity-70">Best Streak</span>
            <span className="block text-lg font-bold leading-none">{bestStreak} <span className="text-xs font-normal">days</span></span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center w-32">
            <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{data.user.month}</span>
            <span className="block text-xs text-slate-400">{data.user.year}</span>
          </div>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button 
          onClick={exportData}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Export
        </button>
      </div>
    </header>
  );
};

const MainContent = () => {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <Header />
      <Routes>
        <Route path="/" element={
          <div className="space-y-8">
            <AffirmationPanel />
            <HabitGrid />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Dashboard />
              <MonthlyReflection />
            </div>
          </div>
        } />
        <Route path="/time" element={<TimeTracker />} />
        <Route path="/analytics" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
};

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-slate-900 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 h-screen sticky top-0 transition-colors duration-300">
        <div className="p-8">
          <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900/50 rounded-lg flex items-center justify-center">
              <PieChart size={18} />
            </div>
            PastelHabits
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <SidebarLink to="/" icon={LayoutGrid} label="Tracker" />
          <SidebarLink to="/time" icon={Clock} label="Time Tracking" />
          <SidebarLink to="/analytics" icon={PieChart} label="Analytics" />
          <SidebarLink to="/settings" icon={SettingsIcon} label="Settings" />
        </nav>
        <div className="p-4 border-t border-slate-50 dark:border-slate-700">
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
             <p className="text-xs text-slate-400 mb-2">Pro Tip</p>
             <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Consistency {'>'} Intensity. Keep showing up!</p>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-50 flex justify-around p-4">
        <Link to="/" className="text-slate-500 dark:text-slate-400 p-2"><LayoutGrid size={24} /></Link>
        <Link to="/time" className="text-slate-500 dark:text-slate-400 p-2"><Clock size={24} /></Link>
        <Link to="/analytics" className="text-slate-500 dark:text-slate-400 p-2"><PieChart size={24} /></Link>
        <Link to="/settings" className="text-slate-500 dark:text-slate-400 p-2"><SettingsIcon size={24} /></Link>
      </div>

      <MainContent />
    </div>
  );
};

const App = () => {
  return (
    <HabitProvider>
      <Router>
        <Layout />
      </Router>
    </HabitProvider>
  );
};

export default App;
