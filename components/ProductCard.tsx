import React from 'react';
import { Product, StockStatus } from '../types';

interface ProductCardProps {
  product: Product;
  onUpdateInventory: (id: string | number, delta: number) => void;
  onUpdatePrice: (id: string | number, newPrice: number) => void;
  onEdit: (product: Product) => void;
}

const getStockStatus = (count: number): StockStatus => {
  if (count === 0) return StockStatus.OUT_OF_STOCK;
  if (count < 10) return StockStatus.LOW_STOCK;
  return StockStatus.IN_STOCK;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onUpdateInventory,
  onUpdatePrice,
  onEdit,
}) => {
  const status = getStockStatus(product.inventory);

  const renderBadge = () => {
    switch (status) {
      case StockStatus.IN_STOCK:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border border-emerald-100 dark:border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
            Em Estoque
          </span>
        );
      case StockStatus.LOW_STOCK:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border border-amber-100 dark:border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
            Estoque Baixo
          </span>
        );
      case StockStatus.OUT_OF_STOCK:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-500 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border border-rose-100 dark:border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></span>
            Sem Estoque
          </span>
        );
    }
  };

  const isOutOfStock = status === StockStatus.OUT_OF_STOCK;

  return (
    <div
      className={`group bg-white dark:bg-card-dark border border-slate-100 dark:border-border-dark rounded-3xl p-6 shadow-soft hover:shadow-soft-hover transition-all duration-300 ${isOutOfStock ? 'opacity-75 hover:opacity-100' : ''
        }`}
    >
      <div className="flex items-start gap-5 mb-6">
        <div
          className={`size-20 rounded-2xl bg-slate-50 dark:bg-slate-800 flex-shrink-0 bg-cover bg-center shadow-inner ${isOutOfStock ? 'grayscale' : ''
            }`}
          style={{ backgroundImage: `url('${product.imageUrl}')` }}
        />
        <div className="flex-1 min-w-0 py-1">
          <div className="mb-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate" title={product.name}>
              {product.name}
            </h3>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate mt-1">
              SKU: {product.sku}
            </p>
          </div>
          {renderBadge()}
        </div>
        <button
          onClick={() => onEdit(product)}
          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
          title="Editar Produto"
        >
          <span className="material-symbols-outlined">edit</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5 pt-2">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Estoque
          </label>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-black/20 rounded-2xl p-1.5 border border-slate-100 dark:border-slate-800/50">
            <button
              onClick={() => onUpdateInventory(product.id, -1)}
              disabled={product.inventory <= 0}
              className={`size-9 flex items-center justify-center rounded-xl transition-all ${product.inventory <= 0
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'text-slate-700 dark:text-white hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm active:scale-95'
                }`}
            >
              <span className="material-symbols-outlined text-lg font-bold">remove</span>
            </button>
            <span
              className={`text-lg font-bold tabular-nums ${status === StockStatus.LOW_STOCK
                ? 'text-amber-500'
                : status === StockStatus.OUT_OF_STOCK
                  ? 'text-rose-500'
                  : 'text-slate-700 dark:text-slate-200'
                }`}
            >
              {product.inventory}
            </span>
            <button
              onClick={() => onUpdateInventory(product.id, 1)}
              className="size-9 flex items-center justify-center text-slate-700 dark:text-white hover:bg-white dark:hover:bg-slate-700 rounded-xl hover:shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg font-bold">add</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Preço
          </label>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none group-focus-within:text-primary transition-colors">
              R$
            </span>
            <input
              className="w-full h-[52px] bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-slate-800/50 border rounded-2xl pl-9 pr-4 text-lg font-bold text-right text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white dark:focus:bg-black/40 transition-all outline-none"
              type="number"
              step="0.01"
              value={product.price}
              onChange={(e) => onUpdatePrice(product.id, parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};