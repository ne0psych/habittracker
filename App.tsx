import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HabitProvider, useHabits } from './context/HabitContext';
import { HabitGrid } from './components/HabitGrid';
import { Dashboard } from './components/Dashboard';
import { AffirmationPanel, MonthlyReflection } from './components/AffirmationAndReflection';
import { Settings } from './components/Settings';
import { TimeTracker } from './components/TimeTracker';
import { LayoutGrid, Download, ChevronLeft, ChevronRight, PieChart, Flame, Settings as SettingsIcon, Clock, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, collapsed }: { to: string, icon: any, label: string, collapsed: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
        isActive 
          ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 font-semibold shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100'
      }`}
    >
      <Icon size={22} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
      {!collapsed && <span className="whitespace-nowrap overflow-hidden transition-all duration-300">{label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
          {label}
        </div>
      )}
    </Link>
  );
};

const Header = () => {
  const { data, changeMonth, exportData } = useHabits();
  const bestStreak = Math.max(0, ...Object.values(data.analytics.streaks));

  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Welcome back, <span className="text-rose-500">{data.user.name.split(' ')[0]}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Let's make today count towards your long-term growth.</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
        <div className="flex-1 lg:flex-none flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-5 py-2.5 rounded-2xl border border-orange-100 dark:border-orange-900/30 shadow-sm transition-transform hover:scale-105">
          <Flame size={22} className="fill-orange-500 animate-pulse" />
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest opacity-70">Best Streak</span>
            <span className="block text-xl font-black leading-none">{bestStreak} <span className="text-xs font-bold">days</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center min-w-[100px]">
            <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{data.user.month}</span>
            <span className="block text-[10px] font-bold text-slate-400 tracking-tighter uppercase">{data.user.year}</span>
          </div>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 transition-all active:scale-90"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button 
          onClick={exportData}
          className="p-3 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-all shadow-md hover:shadow-lg active:scale-95"
          title="Export Data"
        >
          <Download size={20} />
        </button>
      </div>
    </header>
  );
};

const MainContent = () => {
  return (
    <main className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full pb-24 md:pb-8">
      <Header />
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <Routes>
          <Route path="/" element={
            <div className="space-y-10">
              <AffirmationPanel />
              <HabitGrid />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
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
    </main>
  );
};

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-[#fcfdfe] dark:bg-slate-950 transition-colors duration-500">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 h-screen sticky top-0 transition-all duration-500 ease-in-out z-40 ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className={`p-8 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 text-rose-500 dark:text-rose-400 font-black text-2xl tracking-tighter">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/50 rounded-2xl flex items-center justify-center shadow-inner">
                <PieChart size={22} />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-rose-500 to-orange-400">PastelHabits</span>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
               <PieChart size={20} />
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-3 mt-4">
          <SidebarLink to="/" icon={LayoutGrid} label="Habit Tracker" collapsed={collapsed} />
          <SidebarLink to="/time" icon={Clock} label="Time Tracker" collapsed={collapsed} />
          <SidebarLink to="/analytics" icon={PieChart} label="Analytics Hub" collapsed={collapsed} />
          <SidebarLink to="/settings" icon={SettingsIcon} label="Account Settings" collapsed={collapsed} />
        </nav>

        <div className="p-4">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            {collapsed ? <PanelLeftOpen size={22} /> : <div className="flex items-center gap-2"><PanelLeftClose size={20} /> <span className="text-sm font-bold">Collapse Sidebar</span></div>}
          </button>
          
          {!collapsed && (
            <div className="mt-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-700/50">
               <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Growth Mindset</p>
               <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
               </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 z-50 flex justify-around p-3 rounded-3xl shadow-2xl">
        <Link to="/" className="text-slate-400 dark:text-slate-500 p-3 hover:text-rose-500 transition-colors"><LayoutGrid size={24} /></Link>
        <Link to="/time" className="text-slate-400 dark:text-slate-500 p-3 hover:text-rose-500 transition-colors"><Clock size={24} /></Link>
        <Link to="/analytics" className="text-slate-400 dark:text-slate-500 p-3 hover:text-rose-500 transition-colors"><PieChart size={24} /></Link>
        <Link to="/settings" className="text-slate-400 dark:text-slate-500 p-3 hover:text-rose-500 transition-colors"><SettingsIcon size={24} /></Link>
      </nav>

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
