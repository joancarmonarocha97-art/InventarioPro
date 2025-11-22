
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { InventoryItem, ProductDef, LocationDef } from '../types';
import { Plus, MapPin, Box, Hash, Tags, ArrowRight, Search, ChevronDown, Check } from 'lucide-react';

interface EntryFormProps {
  onAddItem: (item: Omit<InventoryItem, 'id' | 'timestamp'>) => void;
  products: ProductDef[];
  locations: LocationDef[];
  onNavigateToProducts: () => void;
  onNavigateToSettings: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ onAddItem, products, locations, onNavigateToProducts, onNavigateToSettings }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // State for custom searchable dropdown
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Get unique categories from defined products
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).sort();
  }, [products]);

  // Filter products based on selected category AND search term
  const filteredProducts = useMemo(() => {
    let items = products.filter(p => p.category === selectedCategory);
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(lowerTerm));
    }
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, selectedCategory, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When category changes, reset product selection
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedProductId('');
    setSearchTerm('');
  };

  const handleProductSelect = (product: ProductDef) => {
    setSelectedProductId(product.id);
    setSearchTerm(product.name);
    setIsSearchOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !selectedProductId || !selectedLocation || !quantity.trim()) {
      setMessage({ text: "Por favor completa todos los campos.", type: 'error' });
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setMessage({ text: "La cantidad debe ser un número válido.", type: 'error' });
      return;
    }

    const productDef = products.find(p => p.id === selectedProductId);
    if (!productDef) return;

    onAddItem({
      productName: productDef.name,
      category: productDef.category,
      location: selectedLocation,
      quantity: qty
    });

    // Reset fields for rapid entry
    // Keep Location (usually user stays in same aisle) and Category
    setSelectedProductId(''); 
    setSearchTerm('');
    setQuantity('');
    
    setMessage({ text: "Producto añadido correctamente.", type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  // Validation: Check if Products Exist
  if (products.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
          <Box size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No hay productos definidos</h3>
        <p className="text-slate-500 mb-6">
          Primero debes crear la lista de productos y categorías.
        </p>
        <button
          onClick={onNavigateToProducts}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
        >
          Ir a Crear Productos <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // Validation: Check if Locations Exist
  if (locations.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
          <MapPin size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No hay ubicaciones definidas</h3>
        <p className="text-slate-500 mb-6">
          Define las ubicaciones (pasillos, estantes) de tu centro en Ajustes.
        </p>
        <button
          onClick={onNavigateToSettings}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
        >
          Ir a Ajustes <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Nuevo Registro</h2>
          <p className="text-sm text-slate-500">Selecciona ubicación, producto y cantidad.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Location Selection (Moved to top as usually user sets location once then scans multiple items) */}
           <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <MapPin size={16} className="text-blue-500" />
              1. Selecciona Ubicación
            </label>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Seleccionar Ubicación --</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Tags size={16} className="text-blue-500" />
              2. Selecciona Categoría
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Seleccionar Categoría --</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Searchable Product Selection */}
          <div className="space-y-2" ref={searchContainerRef}>
            <label className={`flex items-center gap-2 text-sm font-medium ${!selectedCategory ? 'text-slate-400' : 'text-slate-700'}`}>
              <Box size={16} className={!selectedCategory ? 'text-slate-300' : 'text-blue-500'} />
              3. Buscar Producto
            </label>
            
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedProductId(''); // Clear selection if user types
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  disabled={!selectedCategory}
                  placeholder={!selectedCategory ? "Selecciona una categoría primero" : "Escribe para buscar..."}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
                <Search className={`absolute left-3 top-3.5 ${!selectedCategory ? 'text-slate-400' : 'text-slate-400'}`} size={18} />
              </div>

              {/* Dropdown List */}
              {isSearchOpen && selectedCategory && (
                <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-3 text-sm text-slate-400 text-center">
                      No se encontraron productos.
                    </div>
                  ) : (
                    <ul className="py-1">
                      {filteredProducts.map((p) => (
                        <li
                          key={p.id}
                          onClick={() => handleProductSelect(p)}
                          className="px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors flex items-center justify-between group"
                        >
                          <span>{p.name}</span>
                          {selectedProductId === p.id && <Check size={16} className="text-blue-400" />}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Hash size={16} className="text-blue-500" />
              4. Cantidad
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              placeholder="0"
            />
          </div>

          {/* Message Feedback */}
          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedProductId || !selectedLocation || !quantity}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <Plus size={20} />
            Añadir al Inventario
          </button>

        </form>
      </div>
    </div>
  );
};

export default EntryForm;
