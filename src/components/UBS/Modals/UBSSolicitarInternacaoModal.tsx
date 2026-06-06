import React from "react";
import { Send } from "lucide-react";
import { Modal } from "./UBSModalBase";

export const UBSSolicitarInternacaoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedPaciente: any;
  internacaoData: any;
  setInternacaoData: (data: any) => void;
  hospitaisList: any[];
  loadingHospitais: boolean;
  hospitaisError: any;
  funcionarios: any[];
  solicitarInternacaoMutation: any;
  onSubmit: (e: React.FormEvent) => void;
}> = ({
  isOpen,
  onClose,
  selectedPaciente,
  internacaoData,
  setInternacaoData,
  hospitaisList,
  loadingHospitais,
  hospitaisError,
  funcionarios,
  solicitarInternacaoMutation,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitar Internação"
      size="xl"
    >
      {selectedPaciente && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">
            Dados do Paciente
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Nome:</span>{" "}
              {selectedPaciente.nome}
            </p>
            <p>
              <span className="font-medium">CPF:</span>{" "}
              {selectedPaciente.cpf}
            </p>
            <p>
              <span className="font-medium">CNS:</span>{" "}
              {selectedPaciente.cns}
            </p>
          </div>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <select
              value={internacaoData.hospitalId}
              onChange={(e) =>
                setInternacaoData({
                  ...internacaoData,
                  hospitalId: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecione um hospital</option>
              {loadingHospitais ? (
                <option disabled>Carregando hospitais...</option>
              ) : hospitaisError ? (
                <option disabled>Erro ao carregar hospitais</option>
              ) : hospitaisList?.length === 0 ? (
                <option disabled>Nenhum hospital cadastrado</option>
              ) : (
                hospitaisList?.map((hospital: any) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.nome}
                  </option>
                ))
              )}
            </select>
            {loadingHospitais && (
              <p className="text-xs text-gray-500 mt-1">
                Carregando lista de hospitais...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funcionário Responsável *
            </label>
            <select
              value={internacaoData.funcionarioId}
              onChange={(e) =>
                setInternacaoData({
                  ...internacaoData,
                  funcionarioId: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecione um funcionário</option>
              {funcionarios?.map((func: any) => (
                <option key={func.id} value={func.id}>
                  {func.nome} - {func.funcao}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo *
            </label>
            <select
              value={internacaoData.tipo}
              onChange={(e) =>
                setInternacaoData({
                  ...internacaoData,
                  tipo: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="internacao">Internação</option>
              <option value="cirurgia">Cirurgia</option>
              <option value="procedimento">Procedimento</option>
              <option value="emergencia">Emergência</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade *
            </label>
            <select
              value={internacaoData.prioridade}
              onChange={(e) =>
                setInternacaoData({
                  ...internacaoData,
                  prioridade: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo *
          </label>
          <input
            type="text"
            value={internacaoData.motivo}
            onChange={(e) =>
              setInternacaoData({
                ...internacaoData,
                motivo: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descreva o motivo da internação"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detalhes *
          </label>
          <textarea
            value={internacaoData.detalhes}
            onChange={(e) =>
              setInternacaoData({
                ...internacaoData,
                detalhes: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Descreva detalhes clínicos relevantes"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Laudo Médico *
          </label>
          <textarea
            value={internacaoData.laudoMedico}
            onChange={(e) =>
              setInternacaoData({
                ...internacaoData,
                laudoMedico: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Laudo médico completo justificando a internação"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={solicitarInternacaoMutation.isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center disabled:opacity-50"
          >
            {solicitarInternacaoMutation.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Solicitar Internação
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
