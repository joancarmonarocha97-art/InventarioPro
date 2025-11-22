
import React, { useState, useRef } from 'react';
import { ProductDef, CategoryDef } from '../types';
import { Plus, Tags, Package, Trash2, AlertCircle, ArrowRight, ChevronDown } from 'lucide-react';

interface ProductManagerProps {
  products: ProductDef[];
  categories: CategoryDef[];
  onAddProduct: (product: Omit<ProductDef, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
  onNavigateToSettings: () => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ 
  products, 
  categories, 
  onAddProduct, 
  onDeleteProduct,
  onNavigateToSettings 
}) => {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    
    if (!trimmedName || !selectedCategory) {
      setError("Selecciona una categoría e introduce un nombre.");
      return;
    }

    // Check for duplicates
    const exists = products.some(
      p => p.name.toLowerCase() === trimmedName.toLowerCase() && 
           p.category === selectedCategory
    );

    if (exists) {
      setError("Este producto ya existe en esta categoría.");
      return;
    }

    onAddProduct({ name: trimmedName, category: selectedCategory });
    setName('');
    nameInputRef.current?.focus();
  };

  // Validation: Check if Categories Exist
  if (categories.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 mt-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <Tags size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No hay categorías definidas</h3>
        <p className="text-slate-500 mb-6">
          Para crear productos, primero debes definir las categorías (ej: Bebidas, Limpieza) en Ajustes.
        </p>
        <button
          onClick={onNavigateToSettings}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
        >
          Ir a Ajustes <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Form Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-fit">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Package size={20} className="text-indigo-500" />
            Crear Nuevo Producto
          </h2>
          <p className="text-sm text-slate-500">Asocia productos a tus categorías.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Seleccionar Categoría --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!selectedCategory}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
              placeholder={selectedCategory ? "Ej. Coca Cola 33cl" : "Selecciona categoría primero"}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedCategory || !name.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus size={18} />
            Guardar Producto
          </button>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col max-h-[600px]">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Productos Definidos ({products.length})</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {products.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Package size={48} className="mx-auto mb-3 opacity-50" />
              <p>No hay productos creados aún.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {[...products].reverse().map((product) => (
                <li key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-indigo-200 transition-all">
                  <div>
                    <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                    <p className="font-medium text-slate-800 mt-1">{product.name}</p>
                  </div>
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar producto"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductManager;
