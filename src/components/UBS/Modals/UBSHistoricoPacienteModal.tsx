import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Modal } from "./UBSModalBase";
import { 
  Heart, 
  Calendar, 
  User, 
  Stethoscope, 
  FileText, 
  Activity, 
  ClipboardList,
  Clock,
  MapPin,
  Pill,
  Briefcase
} from "lucide-react";

export const UBSHistoricoPacienteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedPaciente: any;
  historicoPaciente: any[];
  consultasPaciente: any[];
}> = ({
  isOpen,
  onClose,
  selectedPaciente,
  historicoPaciente,
  consultasPaciente,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Prontuário Digital do Paciente"
      size="xl"
    >
      <div className="space-y-10">
        {/* Patient Clinical Header */}
        {selectedPaciente && (
          <div className="flex flex-col md:flex-row gap-6 p-6 bg-slate-50 border border-slate-100 rounded-[24px]">
            <div className="w-20 h-20 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-100 flex-shrink-0">
              <User className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</p>
                <p className="text-base font-black text-slate-900">{selectedPaciente.nome}</p>
                <p className="text-xs font-bold text-teal-600">CPF: {selectedPaciente.cpf}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documentação</p>
                <p className="text-xs font-bold text-slate-700">CNS: {selectedPaciente.cns || "—"}</p>
                <p className="text-xs font-bold text-slate-700">
                  Nascimento: {selectedPaciente.nascimento ? format(new Date(selectedPaciente.nascimento), "dd/MM/yyyy") : "—"}
                </p>
              </div>
              <div className="space-y-1 lg:col-span-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização e Contato</p>
                <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5 truncate">
                  <MapPin className="h-3 w-3 text-slate-400" /> {selectedPaciente.endereco || "Não informado"}
                </p>
                <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-slate-400" /> {selectedPaciente.telefone || "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Section: Medical History */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
                <Heart className="h-4.5 w-4.5 text-teal-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                Evoluções Clínicas
              </h4>
            </div>

            {historicoPaciente && historicoPaciente.length > 0 ? (
              <div className="space-y-4">
                {historicoPaciente.map((item: any) => (
                  <div key={item.id} className="relative pl-6 pb-6 border-l-2 border-teal-100 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-teal-500 shadow-sm" />
                    
                    <div className="bg-white border border-slate-100 rounded-[20px] p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h5 className="text-sm font-black text-slate-900 leading-tight">
                            {item.diagnostico}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                              <Calendar className="h-3 w-3" /> {format(new Date(item.dataConsulta), "dd/MM/yy", { locale: ptBR })}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="flex items-center gap-1 text-[10px] font-bold text-teal-600 uppercase">
                              <Briefcase className="h-3 w-3" /> {item.funcionario?.nome}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                            <FileText className="h-3 w-3" /> Laudo / Evolução
                          </p>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium italic">"{item.laudo}"</p>
                        </div>

                        {item.medicacao && (
                          <div className="flex items-center gap-2 text-[11px] font-bold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-100 w-fit">
                            <Pill className="h-3.5 w-3.5" /> Conduta: {item.medicacao}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200 flex flex-col items-center">
                <Heart className="h-10 w-10 text-slate-200 mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center px-6">Sem registros clínicos anteriores</p>
              </div>
            )}
          </div>

          {/* Section: Consultations */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center border border-sky-100">
                <ClipboardList className="h-4.5 w-4.5 text-sky-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                Agenda de Consultas
              </h4>
            </div>

            {consultasPaciente && consultasPaciente.length > 0 ? (
              <div className="space-y-4">
                {consultasPaciente.map((consulta: any) => (
                  <div key={consulta.id} className="bg-white border border-slate-100 rounded-[20px] p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h5 className="text-sm font-black text-slate-900 leading-tight">
                          {consulta.especialidade || "Atendimento Geral"}
                        </h5>
                        <p className="text-[10px] font-bold text-sky-600 uppercase tracking-tight mt-0.5">
                          Status: {consulta.status}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-lg">
                        <Clock className="h-3 w-3" /> {format(new Date(consulta.createdAt), "dd/MM/yy")}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100">
                        <p className="text-[10px] font-black text-sky-400 uppercase mb-1">Motivo da Solicitação</p>
                        <p className="text-xs text-slate-700 font-medium">"{consulta.motivo}"</p>
                      </div>

                      {consulta.dataAgendada && (
                        <div className="flex items-center gap-2 text-[11px] font-black text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                          <Calendar className="h-3.5 w-3.5" />
                          AGENDADO: {format(new Date(consulta.dataAgendada), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200 flex flex-col items-center">
                <ClipboardList className="h-10 w-10 text-slate-200 mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center px-6">Nenhuma solicitação ativa</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
