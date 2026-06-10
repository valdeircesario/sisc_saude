import React from "react";
import { Modal } from "./UBSModalBase";

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
      title="Agendar Consulta"
      size="lg"
    >
      {selectedConsulta && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">
            Detalhes da Consulta
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Paciente:</span>{" "}
              {selectedConsulta.paciente.nome}
            </p>
            <p>
              <span className="font-medium">Especialidade:</span>{" "}
              {selectedConsulta.especialidade}
            </p>
            <p>
              <span className="font-medium">Motivo:</span>{" "}
              {selectedConsulta.motivo}
            </p>
          </div>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data e Hora *
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Funcionário *
          </label>
          <select
            value={agendamentoData.funcionarioId}
            onChange={(e) =>
              setAgendamentoData({
                ...agendamentoData,
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            value={agendamentoData.observacoes}
            onChange={(e) =>
              setAgendamentoData({
                ...agendamentoData,
                observacoes: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Agendar
          </button>
        </div>
      </form>
    </Modal>
  );
};
