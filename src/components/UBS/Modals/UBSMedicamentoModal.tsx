import React from "react";
import { Modal } from "./UBSModalBase";
import { Pill, FileText, Layers, Hash, Calendar, AlertCircle } from "lucide-react";

export const UBSMedicamentoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  editingMed: any;
  medData: any;
  setMedData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({ isOpen, onClose, editingMed, medData, setMedData, onSubmit }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMed ? "Ajustar Inventário" : "Entrada de Insumo"}
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Pill className="h-3.5 w-3.5 text-violet-500" /> Nome do Medicamento <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={medData.nome}
              onChange={(e) => setMedData({ ...medData, nome: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
              placeholder="Ex: Amoxicilina 500mg"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-violet-500" /> Descrição / Observações
            </label>
            <textarea
              value={medData.descricao}
              onChange={(e) =>
                setMedData({ ...medData, descricao: e.target.value })
              }
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm min-h-[100px] resize-none"
              placeholder="Informações sobre dosagem, via de administração ou restrições..."
              rows={3}
            />
          </div>
        </div>

        {/* Inventory Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-violet-500" /> Lote <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={medData.lote}
              onChange={(e) => setMedData({ ...medData, lote: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
              placeholder="000000"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Hash className="h-3.5 w-3.5 text-violet-500" /> Quantidade <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={medData.quantidade}
              onChange={(e) =>
                setMedData({ ...medData, quantidade: e.target.value })
              }
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-violet-500" /> Validade <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={medData.dataValidade}
              onChange={(e) =>
                setMedData({ ...medData, dataValidade: e.target.value })
              }
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
              required
            />
          </div>
        </div>

        {/* Status Section */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-[18px] border border-slate-100 group transition-all">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={medData.vencido}
              onChange={(e) =>
                setMedData({ ...medData, vencido: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Produto fora da validade</span>
            {medData.vencido && <AlertCircle className="h-3.5 w-3.5 text-rose-500 animate-pulse" />}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-6 border-t border-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Voltar
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-12 py-4 bg-teal-600 text-white rounded-[18px] text-xs font-black uppercase tracking-widest hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all active:scale-95 shadow-lg shadow-teal-900/10"
          >
            {editingMed ? "Salvar Alterações" : "Efetivar Entrada"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
