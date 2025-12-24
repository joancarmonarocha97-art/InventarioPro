import React, { useState, useEffect } from 'react';
import { InventoryItem, ViewState, ProductDef, LocationDef, CategoryDef } from './types';
import Header from './components/Header';
import EntryForm from './components/EntryForm';
import ResultsDashboard from './components/ResultsDashboard';
import ProductManager from './components/ProductManager';
import Settings from './components/Settings';
import { ClipboardPen, BarChart3, Settings as SettingsIcon, Tags, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const App: React.FC = () => {
  // Data State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<ProductDef[]>([]);
  const [locations, setLocations] = useState<LocationDef[]>([]);
  const [categories, setCategories] = useState<CategoryDef[]>([]);
  
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [loading, setLoading] = useState(isSupabaseConfigured);

  // Initial Fetch from Supabase
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: cats } = await supabase.from('categories').select('*');
      if (cats) setCategories(cats);

      const { data: locs } = await supabase.from('locations').select('*');
      if (locs) setLocations(locs);

      const { data: prods } = await supabase.from('products').select('*');
      if (prods) setProducts(prods);

      const { data: inv } = await supabase.from('inventory').select('*').order('timestamp', { ascending: false });
      if (inv) {
        const mappedInv = inv.map((item: any) => ({
          id: item.id,
          productName: item.product_name,
          category: item.category,
          location: item.location,
          quantity: item.quantity,
          timestamp: parseInt(item.timestamp)
        }));
        setInventory(mappedInv);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Error screen if keys are missing
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Falta Configuración</h1>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Para que la base de datos de <strong>Supabase</strong> funcione, necesitas añadir las variables de entorno en tu panel de control de despliegue (Vercel/Netlify) o en un archivo <code className="bg-slate-100 px-1 rounded text-red-500">.env.local</code>.
          </p>
          <div className="space-y-3 text-left mb-8">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
              VITE_SUPABASE_URL=...
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
              VITE_SUPABASE_ANON_KEY=...
            </div>
          </div>
          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-6 rounded-xl transition-all w-full justify-center"
          >
            Ir a Supabase <ExternalLink size={16} />
          </a>
        </div>
      </div>
    );
  }

  // Handlers
  const handleAddItem = async (newItem: Omit<InventoryItem, 'id' | 'timestamp'>) => {
    const timestamp = Date.now();
    const tempId = crypto.randomUUID();
    const tempItem = { ...newItem, id: tempId, timestamp };
    setInventory(prev => [tempItem, ...prev]);

    const { data, error } = await supabase.from('inventory').insert([{
      product_name: newItem.productName,
      category: newItem.category,
      location: newItem.location,
      quantity: newItem.quantity,
      timestamp: timestamp
    }]).select();

    if (error) {
      console.error("Error inserting inventory:", error);
      alert("Error al guardar en la nube.");
      setInventory(prev => prev.filter(i => i.id !== tempId));
    } else if (data) {
      setInventory(prev => prev.map(i => i.id === tempId ? { ...i, id: data[0].id } : i));
    }
  };

  const handleDeleteInventoryItem = async (id: string) => {
    // Optimistic update
    const previousInventory = [...inventory];
    setInventory(prev => prev.filter(item => item.id !== id));

    const { error } = await supabase.from('inventory').delete().eq('id', id);

    if (error) {
      console.error("Error deleting inventory item:", error);
      alert("Error al eliminar el registro.");
      setInventory(previousInventory);
    }
  };

  const handleAddProduct = async (newProduct: Omit<ProductDef, 'id'>) => {
    const tempId = crypto.randomUUID();
    setProducts(prev => [...prev, { ...newProduct, id: tempId }]);
    const { data, error } = await supabase.from('products').insert([newProduct]).select();
    if (error) {
      setProducts(prev => prev.filter(p => p.id !== tempId));
    } else if (data) {
      setProducts(prev => prev.map(p => p.id === tempId ? { ...p, id: data[0].id } : p));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    await supabase.from('products').delete().eq('id', id);
  };

  const handleAddLocation = async (newLoc: Omit<LocationDef, 'id'>) => {
    const tempId = crypto.randomUUID();
    setLocations(prev => [...prev, { ...newLoc, id: tempId }]);
    const { data, error } = await supabase.from('locations').insert([newLoc]).select();
    if (error) {
      setLocations(prev => prev.filter(l => l.id !== tempId));
    } else if (data) {
      setLocations(prev => prev.map(l => l.id === tempId ? { ...l, id: data[0].id } : l));
    }
  };

  const handleDeleteLocation = async (id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id));
    await supabase.from('locations').delete().eq('id', id);
  };

  const handleAddCategory = async (newCat: Omit<CategoryDef, 'id'>) => {
    const tempId = crypto.randomUUID();
    setCategories(prev => [...prev, { ...newCat, id: tempId }]);
    const { data, error } = await supabase.from('categories').insert([newCat]).select();
    if (error) {
      setCategories(prev => prev.filter(c => c.id !== tempId));
    } else if (data) {
      setCategories(prev => prev.map(c => c.id === tempId ? { ...c, id: data[0].id } : c));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    await supabase.from('categories').delete().eq('id', id);
  };

  const handleClearData = async () => {
    if (confirm("¿Estás seguro de que quieres borrar TODO el historial de conteo de la base de datos?")) {
      setInventory([]);
      await supabase.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
  };

  const handleImportData = (data: any) => {
    alert("La función de importar copia de seguridad está desactivada en modo Nube.");
  };

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <RefreshCw className="animate-spin mb-4" size={32} />
          <p>Sincronizando con la nube...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'products':
        return (
          <div className="max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <ProductManager 
              products={products} 
              categories={categories}
              onAddProduct={handleAddProduct} 
              onDeleteProduct={handleDeleteProduct}
              onNavigateToSettings={() => setCurrentView('settings')}
            />
          </div>
        );
      case 'entry':
        return (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <EntryForm 
              onAddItem={handleAddItem} 
              products={products}
              locations={locations}
              onNavigateToProducts={() => setCurrentView('products')}
              onNavigateToSettings={() => setCurrentView('settings')}
            />
          </div>
        );
      case 'results':
        return (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <ResultsDashboard data={inventory} onDeleteItem={handleDeleteInventoryItem} />
          </div>
        );
      case 'settings':
        return (
           <div className="max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-300">
             <Settings 
               inventory={inventory}
               products={products}
               locations={locations}
               categories={categories}
               onAddLocation={handleAddLocation}
               onDeleteLocation={handleDeleteLocation}
               onAddCategory={handleAddCategory}
               onDeleteCategory={handleDeleteCategory}
               onClearData={handleClearData}
               onImportData={handleImportData}
             />
           </div>
        );
      case 'home':
      default:
        return (
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setCurrentView('products')}
              className="group relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all duration-300 text-center"
            >
              <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-indigo-600">
                <Tags size={28} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">Productos</h2>
              <p className="text-slate-500 text-xs">Asigna productos a tus categorías.</p>
            </button>
            <button 
              onClick={() => setCurrentView('entry')}
              className="group relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all duration-300 text-center"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-blue-600">
                <ClipboardPen size={28} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">Inventario</h2>
              <p className="text-slate-500 text-xs">Registra stock rápidamente.</p>
            </button>
            <button 
              onClick={() => setCurrentView('results')}
              className="group relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all duration-300 text-center"
            >
              <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-purple-600">
                <BarChart3 size={28} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">Resultados</h2>
              <p className="text-slate-500 text-xs">Tabla resumen y exportación.</p>
            </button>
            <button 
              onClick={() => setCurrentView('settings')}
              className="group relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-slate-500 hover:shadow-md transition-all duration-300 text-center"
            >
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-slate-600">
                <SettingsIcon size={28} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">Ajustes</h2>
              <p className="text-slate-500 text-xs">Zonas, categorías y datos.</p>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header currentView={currentView} onNavigateHome={() => {
        setCurrentView('home');
        if (isSupabaseConfigured) fetchData();
      }} />
      <main className="p-4 md:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
