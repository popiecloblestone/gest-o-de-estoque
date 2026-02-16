import React from 'react';

interface BottomNavProps {
  currentView: 'list' | 'add';
  onChangeView: (view: 'list' | 'add') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-slate-200 dark:border-border-dark px-8 py-3 pb-8 z-50">
      <div className="flex items-center justify-around">
        <button 
          onClick={() => onChangeView('list')}
          className={`flex flex-col items-center gap-1.5 transition-colors ${currentView === 'list' ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className={`material-symbols-outlined text-[26px] ${currentView === 'list' ? 'fill-1' : ''}`}>inventory_2</span>
          <span className="text-[10px] font-bold">Estoque</span>
        </button>

        <button 
          onClick={() => onChangeView('add')}
          className={`flex flex-col items-center gap-1.5 transition-colors ${currentView === 'add' ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className={`material-symbols-outlined text-[26px] ${currentView === 'add' ? 'fill-1' : ''}`}>add_circle</span>
          <span className="text-[10px] font-bold">Adicionar</span>
        </button>
      </div>
    </nav>
  );
};