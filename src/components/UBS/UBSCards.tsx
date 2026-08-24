import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Edit,
  Trash2,
  Heart,
  Calendar,
  Building2,
  Users,
  X,
  Mail,
  Phone,
  CreditCard,
  User,
  MapPin,
  Shield,
  Clock,
  Stethoscope,
  Info,
  CheckCircle,
  AlertCircle,
  Megaphone,
  Pill,
} from "lucide-react";

// Helper for status colors
const getStatusStyles = (status: string) => {
  if (!status) return "bg-slate-50 text-slate-700 border-slate-100";
  switch (status.toLowerCase()) {
    case "solicitada":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "agendada":
    case "agendado":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "confirmada":
    case "confirmado":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "realizada":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "cancelada":
      return "bg-rose-50 text-rose-700 border-rose-100";
    default:
      return "bg-slate-50 text-slate-700 border-slate-100";
  }
};

// Componente Card de Funcionário
export const FuncionarioCard: React.FC<{
  funcionario: any;
  onEdit: (func: any) => void;
  onDelete: (id: string) => void;
}> = ({ funcionario, onEdit, onDelete }) => {
  if (!funcionario) return null;

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Avatar & Role */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shadow-inner group-hover:bg-teal-600 transition-colors duration-300">
            <User className="h-7 w-7 text-teal-600 group-hover:text-white transition-colors" />
          </div>
          <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[10px] font-bold text-teal-700 uppercase tracking-tight border border-teal-100">
            {funcionario.funcao || "—"}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                {funcionario.nome || "Sem nome"}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5" />{" "}
                  {funcionario.cpf || "—"}
                </span>
                {funcionario.crm && (
                  <span className="flex items-center gap-1 text-teal-600">
                    <Shield className="h-3.5 w-3.5" /> CRM: {funcionario.crm}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(funcionario)}
                className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(funcionario.id)}
                className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
              </div>
              {funcionario.telefone || "Não informado"}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <span className="truncate">
                {funcionario.email || "Não informado"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Card de Paciente
export const PacienteCard: React.FC<{
  paciente: any;
  onEdit: (paciente: any) => void;
  onHistorico: (paciente: any) => void;
  onConsulta: (paciente: any) => void;
  onInternacao: (paciente: any) => void;
}> = ({ paciente, onEdit, onHistorico, onConsulta, onInternacao }) => {
  if (!paciente) return null;

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Identity */}
        <div className="flex items-center gap-4 lg:w-1/3">
          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-inner">
            <span className="text-lg font-bold text-blue-600">
              {paciente.nome ? paciente.nome[0].toUpperCase() : "?"}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate">
              {paciente.nome || "Sem nome"}
            </h3>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-0.5">
              CNS: {paciente.cns || "—"}
            </p>
          </div>
        </div>

        {/* Middle: Details */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Documentos
            </p>
            <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-gray-300" /> CPF:{" "}
              {paciente.cpf || "—"}
            </p>
            <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gray-300" />{" "}
              {paciente.nascimento
                ? format(new Date(paciente.nascimento), "dd/MM/yyyy")
                : "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Contato e Local
            </p>
            <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-gray-300" />{" "}
              {paciente.telefone || "—"}
            </p>
            <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 text-gray-300" />{" "}
              {paciente.endereco || "Não informado"}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-row lg:flex-col gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 justify-center">
          <div className="flex gap-2 w-full">
            <button
              onClick={() => onEdit(paciente)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 text-xs font-bold border border-transparent hover:border-blue-100 transition-all"
            >
              <Edit className="h-3.5 w-3.5" /> Editar
            </button>
            <button
              onClick={() => onHistorico(paciente)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 text-xs font-bold border border-transparent hover:border-emerald-100 transition-all"
            >
              <Heart className="h-3.5 w-3.5" /> Saúde
            </button>
          </div>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => onConsulta(paciente)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-600 text-xs font-bold border border-transparent hover:border-purple-100 transition-all"
            >
              <Stethoscope className="h-3.5 w-3.5" /> Consulta
            </button>
            <button
              onClick={() => onInternacao(paciente)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold border border-transparent hover:border-rose-100 transition-all"
            >
              <Building2 className="h-3.5 w-3.5" /> Hosp.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Card de Medicamento
export const MedicamentoCard: React.FC<{
  medicamento: any;
  onEdit: (medicamento: any) => void;
}> = ({ medicamento, onEdit }) => {
  if (!medicamento) return null;

  const quantidade = Number(medicamento.quantidade || 0);
  const isLowStock = quantidade > 0 && quantidade < 10;
  const isOutOfStock = quantidade === 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
            <Pill className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {medicamento.nome || "Sem nome"}
            </h3>
            <p className="text-xs text-gray-500 font-medium truncate max-w-[200px]">
              {medicamento.descricao || "Sem descrição"}
            </p>
          </div>
        </div>
        <button
          onClick={() => onEdit(medicamento)}
          className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Estoque Atual
          </p>
          <div className="flex items-center gap-2">
            <span
              className={`text-xl font-black ${isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-gray-900"}`}
            >
              {quantidade}
            </span>
            {isOutOfStock ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100">
                <AlertCircle className="h-3 w-3" /> ESGOTADO
              </span>
            ) : (
              isLowStock && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100">
                  <Info className="h-3 w-3" /> BAIXO
                </span>
              )
            )}
          </div>
        </div>

        <div className="space-y-1 text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Informações
          </p>
          <p className="text-xs font-bold text-gray-700">
            LOTE: {medicamento.lote || "—"}
          </p>
          <p
            className={`text-[11px] font-bold ${medicamento.vencido ? "text-rose-600" : "text-emerald-600"}`}
          >
            {medicamento.dataValidade
              ? `VAL: ${format(new Date(medicamento.dataValidade), "dd/MM/yyyy")}`
              : "VAL: N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente Card de Campanha
export const CampanhaCard: React.FC<{
  campanha: any;
  inscricoes: any[];
  onEdit: (campanha: any) => void;
  onDelete: (id: string) => void;
  onInscricoes: (campanha: any) => void;
}> = ({ campanha, inscricoes, onEdit, onDelete, onInscricoes }) => {
  if (!campanha) return null;

  const agendados = Array.isArray(inscricoes)
    ? inscricoes.filter((i: any) => i?.status === "agendado").length
    : 0;
  const pendentes = Array.isArray(inscricoes)
    ? inscricoes.filter((i: any) => i?.status === "inscrito").length
    : 0;
  const totalInscritos = campanha?._count?.inscricoes || 0;
  const percentual =
    totalInscritos > 0 ? Math.round((agendados / totalInscritos) * 100) : 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <Megaphone className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(campanha)}
            className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(campanha?.id)}
            className="p-2 bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
        {campanha?.titulo || "Sem título"}
      </h3>
      <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-4">
        {campanha?.descricao || "Sem descrição"}
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Progresso de Agendamento</span>
          <span className="text-teal-600">{percentual}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-1000"
            style={{ width: `${percentual}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Inscritos
            </p>
            <p className="text-sm font-black text-gray-900">{totalInscritos}</p>
          </div>
          <div className="bg-teal-50 rounded-xl p-2.5 text-center border border-teal-100">
            <p className="text-[10px] font-bold text-teal-400 uppercase">
              Agendados
            </p>
            <p className="text-sm font-black text-teal-700">{agendados}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 text-center border border-amber-100">
            <p className="text-[10px] font-bold text-amber-400 uppercase">
              Pendentes
            </p>
            <p className="text-sm font-black text-teal-700">{pendentes}</p>
          </div>
        </div>

        <button
          onClick={() => onInscricoes(campanha)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-100 transition-all active:scale-95 mt-2"
        >
          <Users className="h-4 w-4" /> Gerenciar Inscrições
        </button>
      </div>
    </div>
  );
};

// Componente Card de Consulta
export const ConsultaCard: React.FC<{
  consulta: any;
  onAgendar: (consulta: any) => void;
  onEdit: (consulta: any) => void;
  onCancelamento: (consulta: any) => void;
}> = ({ consulta, onAgendar, onEdit, onCancelamento }) => {
  if (!consulta) return null;
  const statusStyles = getStatusStyles(consulta.status);
  const canEditConsulta = [
    "agendada",
    "agendado",
    "confirmada",
    "confirmado",
  ].includes(String(consulta?.status || "").toLowerCase());

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shadow-inner">
            <Calendar className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-none">
              {consulta?.paciente?.nome || "Paciente desconhecido"}
            </h3>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusStyles}`}
            >
              {consulta?.status || "—"}
            </span>
          </div>
        </div>
        {canEditConsulta && (
          <button
            onClick={() => onEdit(consulta)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-600 hover:text-white transition-all shadow-sm"
            title="Editar consulta"
            type="button"
          >
            <Edit className="h-3.5 w-3.5" />
            Editar
          </button>
        )}
      </div>

      <div className="space-y-4 mb-6">
        {/* ... (restante do componente) ... */}

        <div className="flex gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Especialidade
            </p>
            <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-sky-500" />{" "}
              {consulta?.especialidade || "—"}
            </p>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Solicitação
            </p>
            <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-300" />{" "}
              {consulta?.createdAt
                ? format(new Date(consulta.createdAt), "dd/MM/yy")
                : "—"}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Motivo / Queixa
          </p>
          <p className="text-xs text-gray-600 font-medium leading-relaxed italic">
            "{consulta?.motivo || "Não informado"}"
          </p>
        </div>

        {consulta?.dataAgendada && (
          <div className="flex items-center gap-2 text-sm font-black text-sky-700 bg-sky-50 p-3 rounded-xl border border-sky-100">
            <CheckCircle className="h-5 w-5" />
            AGENDADO:{" "}
            {format(new Date(consulta.dataAgendada), "dd/MM/yyyy HH:mm")}
          </div>
        )}
      </div>

      {consulta?.status === "solicitada" && (
        <div className="flex gap-2 pt-4 border-t border-gray-50">
          <button
            onClick={() => onAgendar(consulta)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-100 transition-all"
          >
            <Calendar className="h-4 w-4" /> Confirmar
          </button>
          <button
            onClick={() => onCancelamento(consulta)}
            className="flex items-center justify-center p-3 border border-rose-100 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
            title="Cancelar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};
