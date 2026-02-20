import React from 'react';
import { CATEGORIES } from '../constants';

interface HeaderProps {
  totalItems: number;
  lowStockCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  currentView: 'list' | 'add' | 'orders' | 'coupons';
  onChangeView: (view: 'list' | 'add' | 'orders' | 'coupons') => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalItems,
  lowStockCount,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  currentView,
  onChangeView,
}) => {
  return (
    <div className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl border-b border-slate-200 dark:border-border-dark mb-8 transition-all">
      <div className="max-w-[1600px] mx-auto">

        {/* Top Navbar Row */}
        <div className="px-4 md:px-8 h-20 flex items-center justify-between gap-6">

          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChangeView('list')}>
            <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white hidden sm:block">
              Gestão<span className="text-primary">Estoque</span>
            </span>
          </div>

          {/* Center Navigation (Pills) */}
          <nav className="flex items-center p-1 bg-slate-100 dark:bg-card-dark rounded-full border border-slate-200 dark:border-border-dark">
            <button
              onClick={() => onChangeView('list')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${currentView === 'list'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              Lista
            </button>
            <button
              onClick={() => onChangeView('add')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${currentView === 'add'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              <span>Adicionar</span>
            </button>
            <button
              onClick={() => onChangeView('orders')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${currentView === 'orders'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              <span>Pedidos</span>
            </button>
            <button
              onClick={() => onChangeView('coupons')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${currentView === 'coupons'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              <span>Cupons</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full h-10 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-full pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-border-dark mx-1 hidden sm:block"></div>

            <button className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-background-dark"></span>
            </button>
            <button className="size-10 rounded-full bg-gradient-to-tr from-primary to-indigo-500 text-white font-bold flex items-center justify-center shadow-md shadow-primary/20 text-sm">
              JS
            </button>
          </div>
        </div>

        {/* Sub-header / Stats Area (Only visible in List View) */}
        {currentView === 'list' && (
          <div className="px-4 md:px-8 pb-6 pt-2 border-t border-slate-100 dark:border-border-dark/50 bg-white/50 dark:bg-background-dark/50 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">

              {/* Mobile Search (Visible only on small screens) */}
              <div className="md:hidden">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar produtos, SKUs..."
                    className="w-full h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl pl-12 pr-4 text-base font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-sm">
                  <div className="size-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white">{totalItems.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-sm">
                  <div className="size-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Baixo</p>
                    <p className="text-xl font-black text-amber-500">{lowStockCount}</p>
                  </div>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="hidden md:flex gap-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === category
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-border-dark'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};