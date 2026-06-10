import React from "react";
import { Modal } from "./UBSModalBase";

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
      title="Agendar Consulta"
      size="lg"
    >
      {selectedPaciente && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Paciente</h4>
          <p className="text-sm text-gray-600">{selectedPaciente.nome}</p>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especialidade *
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Cardiologia, Clínica Geral, etc."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo *
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descreva o motivo da consulta"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data e Hora *
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Funcionário *
          </label>
          <select
            value={consultaPacienteData.funcionarioId}
            onChange={(e) =>
              setConsultaPacienteData({
                ...consultaPacienteData,
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
            value={consultaPacienteData.observacoes}
            onChange={(e) =>
              setConsultaPacienteData({
                ...consultaPacienteData,
                observacoes: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Observações adicionais sobre a consulta"
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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Agendar Consulta
          </button>
        </div>
      </form>
    </Modal>
  );
};
