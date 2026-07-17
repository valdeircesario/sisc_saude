import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Search
} from "lucide-react";
import LoadingSpinner from "../LoadingSpinner";

interface FuncionarioCampanhasTabProps {
  agendamentos: any[];
  loading: boolean;
  onRealizar: (id: string, observacoes: string) => Promise<void>;
  onCancelar: (id: string, justificativa: string) => Promise<void>;
}

export const FuncionarioCampanhasTab: React.FC<FuncionarioCampanhasTabProps> = ({
  agendamentos,
  loading,
  onRealizar,
  onCancelar,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<"realizar" | "cancelar" | null>(null);
  const [obs, setObs] = useState("");

  const filteredAgendamentos = (agendamentos || []).filter((a) => {
    const term = searchTerm.toLowerCase();
    const nome = a.inscricao?.nome?.toLowerCase() || "";
    const titulo = a.campanha?.titulo?.toLowerCase() || "";
    const cpf = a.inscricao?.cpf || "";

    return (
      nome.includes(term) ||
      titulo.includes(term) ||
      cpf.includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
      case "confirmada":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" /> {status === 'confirmada' ? 'Confirmado' : 'Agendado'}
          </span>
        );
      case "realizada":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Realizada
          </span>
        );
      case "cancelada":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" /> Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const handleAction = async () => {
    if (!editingId || !editType) return;
    if (!obs.trim()) return;

    if (editType === "realizar") {
      await onRealizar(editingId, obs);
    } else {
      await onCancelar(editingId, obs);
    }

    setEditingId(null);
    setEditType(null);
    setObs("");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Agendamentos de Campanhas</h2>
          <p className="text-sm text-gray-500">Gerencie os atendimentos das campanhas de saúde</p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou campanha..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredAgendamentos.length > 0 ? (
            filteredAgendamentos.map((agendamento) => (
              <li key={agendamento.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-blue-600 truncate">
                          {agendamento.inscricao?.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          CPF: {agendamento.inscricao?.cpf}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(agendamento.status)}
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(agendamento.dataAgendada), "dd/MM/yyyy")}
                        <Clock className="w-3 h-3 ml-2 mr-1" />
                        {agendamento.horaAgendada}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:flex sm:justify-between items-start">
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-semibold flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1 text-blue-500" />
                        Campanha: {agendamento.campanha?.titulo}
                      </p>
                      <p className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        Local: {agendamento.localAtendimento}
                      </p>
                      {agendamento.observacoes && (
                        <p className="flex items-start mt-2 p-2 bg-gray-50 rounded border border-gray-100 italic">
                          <FileText className="w-4 h-4 mr-1 mt-0.5 text-gray-400" />
                          <span>Obs: {agendamento.observacoes}</span>
                        </p>
                      )}
                      {agendamento.justificativa && (
                        <p className="flex items-start mt-2 p-2 bg-red-50 rounded border border-red-100 italic text-red-600">
                          <XCircle className="w-4 h-4 mr-1 mt-0.5 text-red-400" />
                          <span>Justificativa: {agendamento.justificativa}</span>
                        </p>
                      )}
                    </div>

                    <div className="mt-4 sm:mt-0 flex gap-2">
                      {(agendamento.status === "agendado" || agendamento.status === "confirmada") && (
                        <button
                          onClick={() => {
                            setEditingId(agendamento.id);
                            setEditType(null);
                            setObs("");
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        >
                          Alterar Status
                        </button>
                      )}
                    </div>
                  </div>

                  {editingId === agendamento.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Novo status
                      </label>
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setEditType("realizar")}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
                            editType === "realizar"
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          Realizada
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditType("cancelar")}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
                            editType === "cancelar"
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          Cancelada
                        </button>
                      </div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observações <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        rows={3}
                        value={obs}
                        onChange={(e) => setObs(e.target.value)}
                        placeholder={
                          editType === "cancelar"
                            ? "Informe a justificativa do cancelamento..."
                            : editType === "realizar"
                              ? "Informe as observações do atendimento..."
                              : "Selecione o status e preencha as observações..."
                        }
                        required
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditType(null);
                            setObs("");
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600"
                        >
                          Voltar
                        </button>
                        <button
                          onClick={handleAction}
                          disabled={!editType || !obs.trim()}
                          className={`px-3 py-1.5 text-xs font-medium text-white rounded-md disabled:opacity-50 ${
                            editType === "realizar"
                              ? "bg-green-600 hover:bg-green-700"
                              : editType === "cancelar"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-gray-400"
                          }`}
                        >
                          Confirmar Alteração
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-gray-500">
              Nenhum agendamento encontrado.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
