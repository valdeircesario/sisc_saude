
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2, CheckCircle, MapPin, Phone, Stethoscope, X, XCircle } from "lucide-react";

interface PacienteDetalhesModalProps {
  showDetalhesModal: boolean;
  setShowDetalhesModal: (show: boolean) => void;
  selectedItem: any;
  StatusBadge: React.FC<{ status: string }>;
  confirmarConsultaMutation: any;
  setMotivoCancelamento: (motivo: string) => void;
  setShowCancelarModal: (show: boolean) => void;
}

export const PacienteDetalhesModal: React.FC<PacienteDetalhesModalProps> = ({
  showDetalhesModal,
  setShowDetalhesModal,
  selectedItem,
  StatusBadge,
  confirmarConsultaMutation,
  setMotivoCancelamento,
  setShowCancelarModal,
}) => {
  if (!showDetalhesModal || !selectedItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50">
              {selectedItem.especialidade ? <Stethoscope className="h-5 w-5 text-teal-600" /> : <Building2 className="h-5 w-5 text-teal-600" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{selectedItem.especialidade || selectedItem.titulo || "Detalhes"}</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedItem.ubs?.nome || selectedItem.hospital?.nome || "—"}</p>
            </div>
          </div>
          <button onClick={() => setShowDetalhesModal(false)} className="rounded-lg p-1.5 hover:bg-slate-100 text-gray-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-6"><StatusBadge status={selectedItem.status} /></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {selectedItem.dataAgendada && (
            <div className="rounded-xl bg-slate-50 border border-gray-100 p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Data Agendada</p>
              <p className="text-sm font-semibold text-gray-900">{format(new Date(selectedItem.dataAgendada), "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>
          )}
          {selectedItem.ubs && (
            <div className="rounded-xl bg-slate-50 border border-gray-100 p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Unidade de Saúde</p>
              <p className="text-sm font-semibold text-gray-900">{selectedItem.ubs.nome}</p>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedItem.ubs.endereco}</p>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedItem.ubs.telefone}</p>
            </div>
          )}
          {selectedItem.especialidade && (
            <div className="rounded-xl bg-slate-50 border border-gray-100 p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Especialidade</p>
              <p className="text-sm font-semibold text-gray-900">{selectedItem.especialidade}</p>
            </div>
          )}
          {selectedItem.motivo && (
            <div className="rounded-xl bg-slate-50 border border-gray-100 p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Motivo</p>
              <p className="text-sm font-semibold text-gray-900">{selectedItem.motivo}</p>
            </div>
          )}
          {selectedItem.funcionario && (
            <div className="rounded-xl bg-slate-50 border border-gray-100 p-4 sm:col-span-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Profissional de Saúde</p>
              <p className="text-sm font-semibold text-gray-900">{selectedItem.funcionario.nome}</p>
              <p className="text-xs text-gray-600 mt-1">{selectedItem.funcionario.funcao}</p>
              {selectedItem.funcionario.crm && <p className="text-xs text-gray-600">CRM: {selectedItem.funcionario.crm}</p>}
            </div>
          )}
          {selectedItem.observacoes && (
            <div className="rounded-xl bg-slate-50 border border-gray-100 p-4 sm:col-span-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Observações</p>
              <p className="text-sm text-gray-700 leading-relaxed">{selectedItem.observacoes}</p>
            </div>
          )}
        </div>

        {selectedItem.status === "agendada" && (
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                confirmarConsultaMutation.mutate(selectedItem.id);
                setShowDetalhesModal(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4" /> Confirmar Consulta
            </button>
            <button
              onClick={() => {
                setMotivoCancelamento("");
                setShowDetalhesModal(false);
                setShowCancelarModal(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
            >
              <X className="h-4 w-4" /> Cancelar Consulta
            </button>
          </div>
        )}

        {selectedItem.status !== "agendada" && (
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button onClick={() => setShowDetalhesModal(false)} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-200 transition-colors">Fechar</button>
          </div>
        )}
      </div>
    </div>
  );
};
