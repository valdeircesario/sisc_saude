import React from "react";
import { Modal } from "./UBSModalBase";
import { Calendar, Stethoscope, Clock, MessageSquare, Briefcase, Edit } from "lucide-react";

export const UBSEditarConsultaModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedConsulta: any;
  editData: any;
  setEditData: (data: any) => void;
  funcionarios: any[];
  onSubmit: (e: React.FormEvent) => void;
}> = ({
  isOpen,
  onClose,
  selectedConsulta,
  editData,
  setEditData,
  funcionarios,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Agendamento"
      size="md"
    >
      <div className="space-y-8">
        {/* Info Header */}
        {selectedConsulta && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/50 p-6 rounded-[24px] border border-amber-100">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                  Paciente
                </p>
                <p className="text-sm font-bold text-slate-900">{selectedConsulta.paciente?.nome}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Especialidade */}
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5 text-amber-500" /> Especialidade
              </label>
              <input
                type="text"
                value={editData.especialidade}
                onChange={(e) => setEditData({ ...editData, especialidade: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-sm"
              />
            </div>
            
            {/* Data e Hora */}
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> Data e Hora
              </label>
              <input
                type="datetime-local"
                value={editData.dataAgendada}
                onChange={(e) => setEditData({ ...editData, dataAgendada: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-sm"
                required
              />
            </div>

            {/* Funcionário/Médico */}
            <div className="space-y-3 sm:col-span-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-amber-500" /> Profissional Responsável
              </label>
              <select
                value={editData.funcionarioId}
                onChange={(e) => setEditData({ ...editData, funcionarioId: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-sm appearance-none"
              >
                <option value="">Selecione o profissional</option>
                {funcionarios?.map((func: any) => (
                  <option key={func.id} value={func.id}>
                    {func.nome} ({func.funcao})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-amber-500" /> Observações
            </label>
            <textarea
              value={editData.observacoes}
              onChange={(e) => setEditData({ ...editData, observacoes: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-sm min-h-[100px] resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-12 py-4 bg-amber-600 text-white rounded-[18px] text-xs font-black uppercase tracking-widest hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-100 transition-all active:scale-95 shadow-lg shadow-amber-900/10 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
