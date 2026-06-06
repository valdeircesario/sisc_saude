import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Trash2, Heart, Calendar, Building2, Users, X } from "lucide-react";

// Componente Card de Funcionário
export const FuncionarioCard: React.FC<{
  funcionario: any;
  onEdit: (func: any) => void;
  onDelete: (id: string) => void;
}> = ({ funcionario, onEdit, onDelete }) => (
  <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white">
    {/* Avatar */}
    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-semibold text-xs">
      {funcionario.nome
        .split(" ")
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()}
    </div>

    {/* Corpo */}
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      {/* Linha 1 — informações */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
          {funcionario.nome}
        </span>
        <span className="w-px h-3.5 bg-gray-200 hidden sm:block" />
        <span className="text-xs text-gray-500 whitespace-nowrap">
          Função{" "}
          <span className="text-gray-800 font-medium">
            {funcionario.funcao}
          </span>
        </span>
        {funcionario.crm && (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            CRM{" "}
            <span className="text-gray-800 font-medium">{funcionario.crm}</span>
          </span>
        )}
        <span className="text-xs text-gray-500 whitespace-nowrap">
          CPF{" "}
          <span className="text-gray-800 font-medium">{funcionario.cpf}</span>
        </span>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          Tel{" "}
          <span className="text-gray-800 font-medium">
            {funcionario.telefone}
          </span>
        </span>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          E-mail{" "}
          <span className="text-gray-800 font-medium">{funcionario.email}</span>
        </span>
      </div>

      {/* Linha 2 — ações */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(funcionario)}
          className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium"
        >
          <Edit className="h-3 w-3" /> Editar
        </button>
        <button
          onClick={() => onDelete(funcionario.id)}
          className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-xs font-medium"
        >
          <Trash2 className="h-3 w-3" /> Excluir
        </button>
      </div>
    </div>
  </div>
);

// Componente Card de Paciente
export const PacienteCard: React.FC<{
  paciente: any;
  onEdit: (paciente: any) => void;
  onHistorico: (paciente: any) => void;
  onConsulta: (paciente: any) => void;
  onInternacao: (paciente: any) => void;
}> = ({ paciente, onEdit, onHistorico, onConsulta, onInternacao }) => (
  <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white">
    {/* Avatar */}
    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-semibold text-xs">
      {paciente.nome
        .split(" ")
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()}
    </div>

    {/* Corpo */}
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      {/* Linha 1 — informações */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
          {paciente.nome}
        </span>
        <span className="w-px h-3.5 bg-gray-200 hidden sm:block" />
        <span className="text-xs text-gray-500 whitespace-nowrap">
          CPF <span className="text-gray-800 font-medium">{paciente.cpf}</span>
        </span>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          CNS <span className="text-gray-800 font-medium">{paciente.cns}</span>
        </span>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          Tel{" "}
          <span className="text-gray-800 font-medium">{paciente.telefone}</span>
        </span>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          Nasc.{" "}
          <span className="text-gray-800 font-medium">
            {format(new Date(paciente.nascimento), "dd/MM/yyyy", {
              locale: ptBR,
            })}
          </span>
        </span>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          End.{" "}
          <span className="text-gray-800 font-medium">{paciente.endereco}</span>
        </span>
      </div>

      {/* Linha 2 — ações */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(paciente)}
          className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium whitespace-nowrap"
        >
          <Edit className="h-3 w-3" /> Editar
        </button>
        <button
          onClick={() => onHistorico(paciente)}
          className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-xs font-medium whitespace-nowrap"
        >
          <Heart className="h-3 w-3" /> Histórico
        </button>
        <button
          onClick={() => onConsulta(paciente)}
          className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors text-xs font-medium whitespace-nowrap"
        >
          <Calendar className="h-3 w-3" /> Consulta
        </button>
        <button
          onClick={() => onInternacao(paciente)}
          className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-xs font-medium whitespace-nowrap"
        >
          <Building2 className="h-3 w-3" /> Internação
        </button>
      </div>
    </div>
  </div>
);

// Componente Card de Medicamento
export const MedicamentoCard: React.FC<{
  medicamento: any;
  onEdit: (medicamento: any) => void;
}> = ({ medicamento, onEdit }) => (
  <div className="flex flex-col gap-3 px-4 py-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-gray-900">
          {medicamento.nome}
        </h3>
        <p className="text-sm text-gray-500">
          {medicamento.descricao || "Sem descrição"}
        </p>
      </div>
      <button
        onClick={() => onEdit(medicamento)}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700 transition-colors"
      >
        <Edit className="w-4 h-4" /> Editar
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
      <div>
        <span className="font-medium text-gray-900">Lote:</span>{" "}
        {medicamento.lote}
      </div>
      <div>
        <span className="font-medium text-gray-900">Quantidade:</span>{" "}
        {medicamento.quantidade === 0 ? (
          <span className="text-red-600 font-semibold">Sem estoque</span>
        ) : (
          medicamento.quantidade
        )}
      </div>
      <div>
        <span className="font-medium text-gray-900">Validade:</span>{" "}
        {medicamento.dataValidade
          ? format(new Date(medicamento.dataValidade), "dd/MM/yyyy", {
              locale: ptBR,
            })
          : "Não informado"}
      </div>
      <div className="sm:col-span-3">
        <span className="font-medium text-gray-900">Status:</span>{" "}
        {medicamento.quantidade === 0 ? (
          <span className="text-red-600 font-semibold">Sem estoque</span>
        ) : medicamento.vencido ? (
          <span className="text-red-600">Vencido</span>
        ) : (
          <span className="text-green-600">Válido</span>
        )}
      </div>
    </div>
  </div>
);

// Componente Card de Campanha
export const CampanhaCard: React.FC<{
  campanha: any;
  inscricoes: any[];
  onEdit: (campanha: any) => void;
  onDelete: (id: string) => void;
  onInscricoes: (campanha: any) => void;
}> = ({ campanha, inscricoes, onEdit, onDelete, onInscricoes }) => {
  const agendados =
    inscricoes?.filter((i) => i.status === "agendado").length || 0;
  const pendentes =
    inscricoes?.filter((i) => i.status === "inscrito").length || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {campanha.titulo}
      </h3>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>
          <span className="font-medium">Tipo:</span> {campanha.tipo}
        </p>
        <p>
          <span className="font-medium">Início:</span>{" "}
          {format(new Date(campanha.dataIni), "dd/MM/yyyy", { locale: ptBR })}
          {campanha.dataFim && (
            <>
              {" "}
              | <span className="font-medium">Fim:</span>{" "}
              {format(new Date(campanha.dataFim), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </>
          )}
        </p>
        <p className="text-gray-700">{campanha.descricao}</p>
      </div>
      <div className="bg-gray-50 rounded-md p-3 mb-4">
        <div className="flex justify-between text-sm">
          <span>
            <span className="font-medium">Total:</span>{" "}
            {campanha._count.inscricoes}
          </span>
          <span>
            <span className="font-medium">Agendados:</span> {agendados}
          </span>
          <span>
            <span className="font-medium">Pendentes:</span> {pendentes}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onEdit(campanha)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          <Edit className="w-4 h-4 mr-1" /> Editar
        </button>
        <button
          onClick={() => onInscricoes(campanha)}
          className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
        >
          <Users className="w-4 h-4 mr-1" /> Inscrições
        </button>
        <button
          onClick={() => onDelete(campanha.id)}
          className="flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-1" /> Excluir
        </button>
      </div>
    </div>
  );
};

// Componente Card de Consulta
export const ConsultaCard: React.FC<{
  consulta: any;
  onAgendar: (consulta: any) => void;
  onCancelamento: (consulta: any) => void;
}> = ({ consulta, onAgendar, onCancelamento }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "solicitada":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
      case "agendada":
        return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
      case "realizada":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
      case "cancelada":
        return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
      default:
        return "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {consulta.paciente.nome}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consulta.status)}`}
        >
          {consulta.status}
        </span>
      </div>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>
          <span className="font-medium">Especialidade:</span>{" "}
          {consulta.especialidade}
        </p>
        <p>
          <span className="font-medium">Motivo:</span> {consulta.motivo}
        </p>
        <p>
          <span className="font-medium">Solicitada em:</span>{" "}
          {format(new Date(consulta.createdAt), "dd/MM/yyyy HH:mm", {
            locale: ptBR,
          })}
        </p>
        {consulta.dataAgendada && (
          <p>
            <span className="font-medium">Agendada para:</span>{" "}
            {format(new Date(consulta.dataAgendada), "dd/MM/yyyy HH:mm", {
              locale: ptBR,
            })}
          </p>
        )}
        {consulta.funcionario && (
          <p>
            <span className="font-medium">Médico:</span>{" "}
            {consulta.funcionario.nome}
          </p>
        )}
        {consulta.observacoes && (
          <p>
            <span className="font-medium">Observações:</span>{" "}
            {consulta.observacoes}
          </p>
        )}
      </div>

      {consulta.status === "solicitada" && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onAgendar(consulta)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 hover:-translate-y-0.5 transition-all shadow-sm shadow-teal-100"
          >
            <Calendar className="h-3.5 w-3.5" />
            Agendar
          </button>
          <button
            onClick={() => onCancelamento(consulta)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-600 hover:text-white hover:-translate-y-0.5 transition-all"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};
