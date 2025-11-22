
import React, { useState, useRef } from 'react';
import { LocationDef, CategoryDef, ProductDef, InventoryItem } from '../types';
import { MapPin, Plus, Trash2, AlertTriangle, Settings as SettingsIcon, Tags, Save, Upload, FileJson } from 'lucide-react';

interface SettingsProps {
  locations: LocationDef[];
  categories: CategoryDef[];
  products: ProductDef[];
  inventory: InventoryItem[];
  onAddLocation: (loc: Omit<LocationDef, 'id'>) => void;
  onDeleteLocation: (id: string) => void;
  onAddCategory: (cat: Omit<CategoryDef, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  onClearData: () => void;
  onImportData: (data: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  locations, 
  categories, 
  products,
  inventory,
  onAddLocation, 
  onDeleteLocation, 
  onAddCategory,
  onDeleteCategory,
  onClearData,
  onImportData
}) => {
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const locInputRef = useRef<HTMLInputElement>(null);
  const catInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    
    if (locations.some(l => l.name.toLowerCase() === newLocation.trim().toLowerCase())) {
      alert('Esta ubicación ya existe.');
      return;
    }

    onAddLocation({ name: newLocation.trim() });
    setNewLocation('');
    locInputRef.current?.focus();
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    if (categories.some(c => c.name.toLowerCase() === newCategory.trim().toLowerCase())) {
      alert('Esta categoría ya existe.');
      return;
    }

    onAddCategory({ name: newCategory.trim() });
    setNewCategory('');
    catInputRef.current?.focus();
  };

  const handleExportBackup = () => {
    const backupData = {
      version: 1,
      timestamp: Date.now(),
      locations,
      categories,
      products,
      inventory
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `copia_seguridad_inventario_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('ADVERTENCIA: Al importar una copia de seguridad, se sobrescribirán los datos actuales. ¿Deseas continuar?')) {
          onImportData(json);
        }
      } catch (error) {
        alert('Error al leer el archivo. Asegúrate de que es un archivo .json válido.');
      }
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300 pb-20">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-slate-200 rounded-lg text-slate-700">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ajustes del Centro</h2>
          <p className="text-slate-500">Define las categorías, ubicaciones y gestiona los datos.</p>
        </div>
      </div>

      {/* Backup Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
        <div className="p-6 border-b border-emerald-100 bg-emerald-50/50">
          <h3 className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
            <FileJson size={20} />
            Copia de Seguridad (Backup)
          </h3>
          <p className="text-sm text-emerald-600/80">
            Guarda tus datos para no perderlos o para transferirlos a otro dispositivo.
          </p>
        </div>
        <div className="p-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExportBackup}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-sm"
          >
            <Save size={18} />
            Exportar Copia de Seguridad
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
          
          <button
            onClick={handleImportClick}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-3 px-4 rounded-xl transition-all shadow-sm"
          >
            <Upload size={18} />
            Restaurar / Importar Copia
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Category Management Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-200 bg-indigo-50">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Tags size={20} className="text-indigo-600" />
              Definir Categorías
            </h3>
            <p className="text-sm text-slate-500">Crea los tipos de productos (Ej. Bebidas, Limpieza).</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleAddCategory} className="flex gap-3 mb-6">
              <input
                ref={catInputRef}
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                placeholder="Ej. Lácteos, Panadería..."
              />
              <button
                type="submit"
                disabled={!newCategory.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2"
              >
                <Plus size={18} />
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-center text-slate-400 py-4 italic">No hay categorías definidas.</p>
              ) : (
                categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-indigo-200 transition-all">
                    <span className="font-medium text-slate-700">{cat.name}</span>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Location Management Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-200 bg-blue-50">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Definir Ubicaciones
            </h3>
            <p className="text-sm text-slate-500">Crea las zonas de tu tienda (Ej. Pasillo 1).</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleAddLocation} className="flex gap-3 mb-6">
              <input
                ref={locInputRef}
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                placeholder="Ej. Estante A, Almacén..."
              />
              <button
                type="submit"
                disabled={!newLocation.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2"
              >
                <Plus size={18} />
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {locations.length === 0 ? (
                <p className="text-center text-slate-400 py-4 italic">No hay ubicaciones definidas.</p>
              ) : (
                locations.map(loc => (
                  <div key={loc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-blue-200 transition-all">
                    <span className="font-medium text-slate-700">{loc.name}</span>
                    <button
                      onClick={() => onDeleteLocation(loc.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar ubicación"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
        <div className="p-6 border-b border-red-100 bg-red-50/50">
          <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
            <AlertTriangle size={20} />
            Zona de Peligro
          </h3>
        </div>
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-slate-700 font-medium">Reiniciar Inventario</p>
            <p className="text-sm text-slate-500">Esto borrará los conteos, pero mantendrá productos, categorías y ubicaciones.</p>
          </div>
          
          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Borrar Conteos
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
              <span className="text-sm text-red-600 font-medium mr-2">¿Estás seguro?</span>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button 
                onClick={onClearData}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sí, Borrar
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Settings;
