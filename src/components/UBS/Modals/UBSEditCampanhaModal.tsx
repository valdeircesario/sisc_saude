import React from "react";
import { Modal } from "./UBSModalBase";
import { Megaphone, FileText, Tag, Calendar, Save } from "lucide-react";

export const UBSEditCampanhaModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  editCampanhaData: any;
  setEditCampanhaData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({ isOpen, onClose, editCampanhaData, setEditCampanhaData, onSubmit }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajustar Campanha"
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-6">
          {/* Título */}
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Megaphone className="h-3.5 w-3.5 text-amber-500" /> Título da Campanha <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={editCampanhaData.titulo}
              onChange={(e) =>
                setEditCampanhaData({
                  ...editCampanhaData,
                  titulo: e.target.value,
                })
              }
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-amber-500" /> Detalhes da Ação <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={editCampanhaData.descricao}
              onChange={(e) =>
                setEditCampanhaData({
                  ...editCampanhaData,
                  descricao: e.target.value,
                })
              }
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm min-h-[120px] resize-none"
              rows={4}
              required
            />
          </div>

          {/* Tipo */}
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-amber-500" /> Categoria / Tipo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={editCampanhaData.tipo}
              onChange={(e) =>
                setEditCampanhaData({
                  ...editCampanhaData,
                  tipo: e.target.value,
                })
              }
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
              required
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-amber-500" /> Data de Início <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={editCampanhaData.dataIni}
                onChange={(e) =>
                  setEditCampanhaData({
                    ...editCampanhaData,
                    dataIni: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-amber-500" /> Previsão de Término
              </label>
              <input
                type="date"
                value={editCampanhaData.dataFim}
                onChange={(e) =>
                  setEditCampanhaData({
                    ...editCampanhaData,
                    dataFim: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
              />
            </div>
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
            className="w-full sm:w-auto px-12 py-4 bg-teal-600 text-white rounded-[18px] text-xs font-black uppercase tracking-widest hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all active:scale-95 shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" /> Salvar Alterações
          </button>
        </div>
      </form>
    </Modal>
  );
};
