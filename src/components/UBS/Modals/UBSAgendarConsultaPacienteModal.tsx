import React from "react";
import { Modal } from "./UBSModalBase";
import { User, Stethoscope, ClipboardList, Clock, Briefcase, MessageSquare, Plus } from "lucide-react";

export const UBSAgendarConsultaPacienteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedPaciente: any;
  consultaPacienteData: any;
  setConsultaPacienteData: (data: any) => void;
  funcionarios: any[];
  onSubmit: (e: React.FormEvent) => void;
}> = ({
  isOpen,
  onClose,
  selectedPaciente,
  consultaPacienteData,
  setConsultaPacienteData,
  funcionarios,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendamento Direto"
      size="md"
    >
      <div className="space-y-8">
        {/* Patient Clinical Info */}
        {selectedPaciente && (
          <div className="flex items-center gap-4 p-5 bg-sky-50/50 border border-sky-100 rounded-[24px]">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-sky-200 shadow-sm flex-shrink-0">
              <User className="h-6 w-6 text-sky-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest leading-none">Paciente</p>
              <h4 className="text-base font-black text-slate-900 mt-1 truncate">
                {selectedPaciente.nome}
              </h4>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Especialidade */}
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5 text-sky-500" /> Especialidade <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={consultaPacienteData.especialidade}
                onChange={(e) =>
                  setConsultaPacienteData({
                    ...consultaPacienteData,
                    especialidade: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                placeholder="Ex: Pediatria, Ortopedia..."
                required
              />
            </div>

            {/* Motivo */}
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <ClipboardList className="h-3.5 w-3.5 text-sky-500" /> Motivo Principal <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={consultaPacienteData.motivo}
                onChange={(e) =>
                  setConsultaPacienteData({
                    ...consultaPacienteData,
                    motivo: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                placeholder="Queixa principal ou procedimento"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Data e Hora */}
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-sky-500" /> Data e Hora <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={consultaPacienteData.dataAgendada}
                onChange={(e) =>
                  setConsultaPacienteData({
                    ...consultaPacienteData,
                    dataAgendada: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                required
              />
            </div>

            {/* Funcionário */}
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-sky-500" /> Profissional Responsável <span className="text-rose-500">*</span>
              </label>
              <select
                value={consultaPacienteData.funcionarioId}
                onChange={(e) =>
                  setConsultaPacienteData({
                    ...consultaPacienteData,
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
              <MessageSquare className="h-3.5 w-3.5 text-sky-500" /> Observações Clínicas
            </label>
            <textarea
              value={consultaPacienteData.observacoes}
              onChange={(e) =>
                setConsultaPacienteData({
                  ...consultaPacienteData,
                  observacoes: e.target.value,
                })
              }
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm min-h-[100px] resize-none"
              placeholder="Informações adicionais relevantes para o atendimento..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-6 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-12 py-4 bg-teal-600 text-white rounded-[18px] text-xs font-black uppercase tracking-widest hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all active:scale-95 shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> Efetivar Agendamento
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
