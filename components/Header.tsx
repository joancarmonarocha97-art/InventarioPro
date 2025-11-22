import React from 'react';
import { Package, ArrowLeft } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigateHome }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-600">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-800">Inventario Pro</h1>
        </div>
        
        {currentView !== 'home' && (
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={18} />
            Volver al Menú
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
