import React from "react";
import { Modal } from "./UBSModalBase";

export const UBSEditarPacienteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedPaciente: any;
  pacienteEditData: any;
  setPacienteEditData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({
  isOpen,
  onClose,
  selectedPaciente,
  pacienteEditData,
  setPacienteEditData,
  onSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Paciente">
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
          </div>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Endereço *
          </label>
          <input
            type="text"
            value={pacienteEditData.endereco}
            onChange={(e) =>
              setPacienteEditData({
                ...pacienteEditData,
                endereco: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone *
          </label>
          <input
            type="text"
            value={pacienteEditData.telefone}
            onChange={(e) =>
              setPacienteEditData({
                ...pacienteEditData,
                telefone: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Atualizar
          </button>
        </div>
      </form>
    </Modal>
  );
};
