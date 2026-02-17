import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { FloatingActionButton } from './components/FloatingActionButton';
import { AddProductForm } from './components/AddProductForm';
import { OrdersTab } from './components/OrdersTab';
import { CouponsTab } from './components/CouponsTab';
import { useProducts } from './hooks/useProducts';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';

function Dashboard() {
  // Logic extracted to custom hook
  const { products, addProduct, editProduct, updateInventory, updatePrice, loading, error } = useProducts();
  const { signOut, user } = useAuth(); // Get user and signOut

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'orders' | 'coupons'>('list');
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Derived State (View Logic)
  const filteredProducts = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.sku.toLowerCase().includes(lowerQuery)
    );
  }, [products, searchQuery]);

  const totalItems = useMemo(
    () => products.reduce((acc, curr) => acc + curr.inventory, 0),
    [products]
  );

  const lowStockCount = useMemo(
    () => products.filter((p) => p.inventory < 10).length,
    [products]
  );

  const handleSaveProduct = async (data: any) => {
    setIsSaving(true);
    let success = false;

    if (editingProduct) {
      success = await editProduct({ ...data, id: editingProduct.id });
    } else {
      success = await addProduct(data);
    }

    setIsSaving(false);

    if (success) {
      setCurrentView('list');
      setEditingProduct(null);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setCurrentView('add');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col transition-colors duration-500">

      {/* Absolute Logout Button specifically requested/needed for Dashboard */}
      <div className="absolute top-4 right-4 z-50 md:hidden">
        <button onClick={signOut} className="p-2 text-slate-400 hover:text-white">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>

      <Header
        totalItems={totalItems}
        lowStockCount={lowStockCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      {/* Desktop Logout - Integrated? checking header... adding explicit logout option near header if needed or just absolute top right */}
      <div className="hidden md:block absolute top-6 right-6 z-50">
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm font-bold"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Sair
        </button>
      </div>

      <div className="flex-1 flex flex-col min-w-0 w-full pb-12">
        {currentView === 'list' ? (
          <>
            <main className="flex-1 px-4 md:px-8 max-w-[1600px] mx-auto w-full">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onUpdateInventory={updateInventory}
                      onUpdatePrice={updatePrice}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 h-[50vh]">
                  <span className="material-symbols-outlined text-6xl mb-4 text-slate-300">inventory_2</span>
                  <p className="text-xl font-bold text-slate-500">Nenhum item encontrado</p>
                  <p className="text-base text-slate-400 mt-1">Tente buscar por outro termo</p>
                </div>
              )}
            </main>

            <FloatingActionButton onClick={() => {
              setEditingProduct(null);
              setCurrentView('add');
            }} />
          </>
        ) : currentView === 'add' ? (
          <main className="flex-1 px-4 md:px-8 pt-8 pb-8 flex justify-center">
            <AddProductForm
              onSave={handleSaveProduct}
              onCancel={() => {
                setCurrentView('list');
                setEditingProduct(null);
              }}
              isLoading={isSaving}
              initialData={editingProduct}
            />
          </main>
        ) : currentView === 'orders' ? (
          <main className="flex-1">
            <OrdersTab />
          </main>
        ) : (
          <main className="flex-1">
            <CouponsTab />
          </main>
        )}
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;