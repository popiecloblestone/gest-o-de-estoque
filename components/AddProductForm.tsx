import React, { useState } from 'react';
import { Product, Category, StockOption } from '../types';
import { CATEGORIES } from '../constants';

interface AddProductFormProps {
  onSave: (product: Omit<Product, 'id'>) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Product;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({ onSave, onCancel, isLoading = false, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    sku: initialData?.sku || '', // Now mapped to Brand
    price: initialData?.price?.toString() || '',
    inventory: initialData?.inventory?.toString() || '',
    imageUrl: initialData?.imageUrl || '',
    category: (initialData?.category as Category) || 'Futsal',
    colors: initialData?.colors?.join(', ') || '',
    isPromotion: initialData?.isPromotion || false,
    // New fields
    technologies: initialData?.technologies?.join(', ') || '',
    material: initialData?.material || '',
    weight: initialData?.weight || '',
    description: initialData?.description || '',
    freeShipping: initialData?.freeShipping || false
  });

  const [stockItems, setStockItems] = useState<StockOption[]>(
    initialData?.stock || [{ size: '', color: '', quantity: 0 }]
  );

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        sku: initialData.sku,
        price: initialData.price.toString(),
        inventory: initialData.inventory.toString(),
        imageUrl: initialData.imageUrl,
        category: (initialData.category as Category) || 'Futsal',
        colors: initialData.colors?.join(', ') || '',
        isPromotion: initialData.isPromotion || false,
        technologies: initialData.technologies?.join(', ') || '',
        material: initialData.material || '',
        weight: initialData.weight || '',
        description: initialData.description || '',
        freeShipping: initialData.freeShipping || false
      });
      setStockItems(initialData.stock || [{ size: '', color: '', quantity: 0 }]);
    }
  }, [initialData]);

  const addStockItem = () => {
    setStockItems([...stockItems, { size: '', color: '', quantity: 0 }]);
  };

  const removeStockItem = (index: number) => {
    const newItems = stockItems.filter((_, i) => i !== index);
    setStockItems(newItems);
  };

  const updateStockItem = (index: number, field: keyof StockOption, value: string | number) => {
    const newItems = [...stockItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setStockItems(newItems);
  };

  const calculateTotalInventory = () => {
    return stockItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave({
        name: formData.name || 'Novo Produto',
        sku: formData.sku || 'Marca Padrão',
        price: parseFloat(formData.price) || 0,
        inventory: calculateTotalInventory(),
        imageUrl: formData.imageUrl || '',
        category: formData.category,
        colors: formData.colors.split(',').map(c => c.trim()).filter(c => c.length > 0),
        isPromotion: formData.isPromotion,
        stock: stockItems,
        // New fields mapping
        technologies: formData.technologies.split(',').map(t => t.trim()).filter(t => t.length > 0),
        material: formData.material,
        weight: formData.weight,
        description: formData.description,
        freeShipping: formData.freeShipping,
        brand: formData.sku // Explicitly mapping SKU input to brand field for backend
      });
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar produto. Verifique se você tem permissão ou se o banco de dados permite escritas anônimas.\n\nDetalhe do erro no console.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {initialData ? 'Editar Produto' : 'Adicionar Produto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-[24px] p-6 md:p-8 shadow-sm space-y-8">

        {/* --- SECTION 1: BASIC INFO & IMAGE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Upload Area */}
          <div className="col-span-1 space-y-4">
            <div className="aspect-square rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              ) : (
                <div className="text-center p-4">
                  <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">image</span>
                  <p className="text-xs text-slate-400">Preview da Imagem</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">URL da Imagem</label>
              <input
                type="text"
                placeholder="https://..."
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm"
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Basic Fields */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Produto</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Chuteira Nike Mercurial"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-lg"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marca (Brand)</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Nike"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  value={formData.sku} // Mapping SKU to Brand visually
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preço (R$)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peso (ex: 250g)</label>
                <input
                  type="text"
                  placeholder="Ex: 250g"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição Detalhada</label>
              <textarea
                rows={4}
                placeholder="Descreva o produto..."
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* --- SECTION 2: DETAILS & ATTRIBUTES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria (Surface)</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat as Category })}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all whitespace-nowrap ${formData.category === cat
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-slate-50 dark:bg-black/20 text-slate-500 border-slate-200 dark:border-border-dark hover:border-primary/50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Material</label>
            <input
              type="text"
              placeholder="Ex: Couro Natural"
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.material}
              onChange={e => setFormData({ ...formData, material: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tecnologias (Separe por vírgula)</label>
            <input
              type="text"
              placeholder="Ex: Amortecimento Air, Solado Anti-derrapante"
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.technologies}
              onChange={e => setFormData({ ...formData, technologies: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cores (Visualização)</label>
            <input
              type="text"
              placeholder="Ex: Preto, Branco, Azul"
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.colors}
              onChange={e => setFormData({ ...formData, colors: e.target.value })}
            />
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* --- SECTION 3: OPTIONS --- */}
        <div className="flex gap-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-12 h-7 rounded-full transition-colors relative ${formData.isPromotion ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${formData.isPromotion ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Produto em Promoção</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-12 h-7 rounded-full transition-colors relative ${formData.freeShipping ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${formData.freeShipping ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-500 transition-colors">Frete Grátis</span>
          </label>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* --- SECTION 4: STOCK MANAGEMENT --- */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gerenciar Estoque (Variações e Quantidades)</label>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total: {calculateTotalInventory()}</span>
          </div>

          <div className="bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2">Tamanho</th>
                  <th className="px-4 py-2">Cor (Variação)</th>
                  <th className="px-4 py-2">Qtd</th>
                  <th className="px-4 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {stockItems.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Ex: 40"
                        className="w-full bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary outline-none"
                        value={item.size}
                        onChange={(e) => updateStockItem(index, 'size', e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Ex: Azul Escuro"
                        className="w-full bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary outline-none"
                        value={item.color}
                        onChange={(e) => updateStockItem(index, 'color', e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary outline-none"
                        value={item.quantity}
                        onChange={(e) => updateStockItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeStockItem(index)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                        disabled={stockItems.length === 1}
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={addStockItem}
                className="w-full py-2 text-sm font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Adicionar Variante
              </button>
            </div>
          </div>
        </div>

        {/* --- ACTION BUTTONS --- */}
        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[2] py-3.5 rounded-xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined">check</span>
            )}
            {isLoading ? 'Salvando...' : (initialData ? 'Atualizar Produto' : 'Salvar Produto')}
          </button>
        </div>
      </form>
    </div>
  );
};