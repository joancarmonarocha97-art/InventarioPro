import React, { useMemo } from 'react';
import { InventoryItem } from '../types';
import { Download, Table as TableIcon, Trash2 } from 'lucide-react';

interface ResultsDashboardProps {
  data: InventoryItem[];
  onDeleteItem?: (id: string) => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ data, onDeleteItem }) => {

  // Ordenamos por categoría y luego por nombre de producto
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const catCompare = a.category.localeCompare(b.category);
      if (catCompare !== 0) return catCompare;
      return a.productName.localeCompare(b.productName);
    });
  }, [data]);

  const handleExportExcel = () => {
    const headers = ['ID', 'Categoría', 'Producto', 'Ubicación', 'Cantidad', 'Fecha'];
    const rows = sortedData.map(item => [
      item.id,
      `"${item.category.replace(/"/g, '""')}"`,
      `"${item.productName.replace(/"/g, '""')}"`, 
      `"${item.location.replace(/"/g, '""')}"`,
      item.quantity,
      new Date(item.timestamp).toLocaleString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `inventario_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = (id: string, name: string) => {
    if (onDeleteItem && confirm(`¿Seguro que quieres eliminar el registro de "${name}"?`)) {
      onDeleteItem(id);
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <TableIcon className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Sin registros</h3>
        <p className="text-slate-500 mt-1">Añade productos para ver los resultados aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <TableIcon size={20} className="text-indigo-600" />
              Detalle de Inventario
            </h3>
            <p className="text-sm text-slate-500">{data.length} registros totales.</p>
          </div>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-700">Categoría</th>
                <th className="px-6 py-3 font-semibold text-slate-700">Producto</th>
                <th className="px-6 py-3 font-semibold text-slate-700">Ubicación</th>
                <th className="px-6 py-3 font-semibold text-slate-700 text-right">Cant.</th>
                <th className="px-6 py-3 font-semibold text-slate-700 text-right">Hora</th>
                <th className="px-6 py-3 font-semibold text-slate-700 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-3"><span className="text-indigo-600 font-bold text-xs uppercase">{item.category}</span></td>
                  <td className="px-6 py-3 font-medium text-slate-800">{item.productName}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-xs">{item.location}</span>
                  </td>
                  <td className="px-6 py-3 text-right font-mono font-bold text-slate-700">{item.quantity}</td>
                  <td className="px-6 py-3 text-right text-slate-400 text-xs">
                    {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => confirmDelete(item.id, item.productName)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                      title="Eliminar registro"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
