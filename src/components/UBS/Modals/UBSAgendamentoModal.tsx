import React from "react";
import { Modal } from "./UBSModalBase";
import { Calendar, User, Stethoscope, Clock, MessageSquare, Briefcase } from "lucide-react";

export const UBSAgendamentoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedConsulta: any;
  agendamentoData: any;
  setAgendamentoData: (data: any) => void;
  funcionarios: any[];
  onSubmit: (e: React.FormEvent) => void;
}> = ({
  isOpen,
  onClose,
  selectedConsulta,
  agendamentoData,
  setAgendamentoData,
  funcionarios,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Agendamento"
      size="md"
    >
      <div className="space-y-8">
        {/* Info Header */}
        {selectedConsulta && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-teal-50/50 p-6 rounded-[24px] border border-teal-100">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Paciente
                </p>
                <p className="text-sm font-bold text-slate-900">{selectedConsulta.paciente?.nome}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Stethoscope className="h-3 w-3" /> Especialidade
                </p>
                <p className="text-sm font-bold text-slate-900">{selectedConsulta.especialidade || "Geral"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Solicitado em
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {selectedConsulta.createdAt ? new Date(selectedConsulta.createdAt).toLocaleDateString('pt-BR') : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3" /> Queixa
                </p>
                <p className="text-sm font-medium text-slate-600 italic line-clamp-1">"{selectedConsulta.motivo}"</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Data e Hora */}
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-teal-500" /> Data e Hora <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={agendamentoData.dataAgendada}
                onChange={(e) =>
                  setAgendamentoData({
                    ...agendamentoData,
                    dataAgendada: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                required
              />
            </div>

            {/* Funcionário/Médico */}
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-teal-500" /> Responsável <span className="text-rose-500">*</span>
              </label>
              <select
                value={agendamentoData.funcionarioId}
                onChange={(e) =>
                  setAgendamentoData({
                    ...agendamentoData,
                    funcionarioId: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm appearance-none"
                required
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
              <MessageSquare className="h-3.5 w-3.5 text-teal-500" /> Observações do Agendamento
            </label>
            <textarea
              value={agendamentoData.observacoes}
              onChange={(e) =>
                setAgendamentoData({
                  ...agendamentoData,
                  observacoes: e.target.value,
                })
              }
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm min-h-[100px] resize-none"
              placeholder="Informações adicionais para o paciente ou médico..."
            />
          </div>

          {/* Actions */}
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
              className="w-full sm:w-auto px-12 py-4 bg-teal-600 text-white rounded-[18px] text-xs font-black uppercase tracking-widest hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all active:scale-95 shadow-lg shadow-teal-900/10"
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
