import React from 'react';

interface SidebarProps {
  currentView: 'list' | 'add';
  onChangeView: (view: 'list' | 'add') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  return (
    <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-card-dark border-r border-slate-200 dark:border-border-dark h-screen sticky top-0 p-6 z-40">
       <div className="flex items-center gap-3 mb-10 text-primary px-2">
          <span className="material-symbols-outlined text-4xl fill-1">inventory_2</span>
          <span className="text-2xl font-extrabold tracking-tight">Estoque</span>
       </div>

       <nav className="flex-1 space-y-2">
          <NavItem 
            icon="inventory_2" 
            label="Estoque" 
            active={currentView === 'list'} 
            onClick={() => onChangeView('list')}
          />
          <NavItem 
            icon="add_circle" 
            label="Adicionar" 
            active={currentView === 'add'} 
            onClick={() => onChangeView('add')}
          />
       </nav>

       <div className="mt-auto pt-6 border-t border-slate-100 dark:border-border-dark">
          <div className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer">
             <div className="size-10 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                JD
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">João Silva</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Gerente da Loja</p>
             </div>
             <span className="material-symbols-outlined text-slate-400">more_vert</span>
          </div>
       </div>
    </aside>
  );
}

const NavItem = ({ icon, label, active, onClick }: { icon: string, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 group ${
     active
     ? 'bg-primary text-white shadow-xl shadow-primary/25'
     : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
  }`}>
     <span className={`material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform ${active ? 'fill-1' : ''}`}>{icon}</span>
     <span>{label}</span>
  </button>
);