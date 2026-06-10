import React from "react";
import { Modal } from "./UBSModalBase";

export const UBSMedicamentoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  editingMed: any;
  medData: any;
  setMedData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({ isOpen, onClose, editingMed, medData, setMedData, onSubmit }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMed ? "Editar Medicamento" : "Novo Medicamento"}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Medicamento *
          </label>
          <input
            type="text"
            value={medData.nome}
            onChange={(e) => setMedData({ ...medData, nome: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            value={medData.descricao}
            onChange={(e) =>
              setMedData({ ...medData, descricao: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lote *
            </label>
            <input
              type="text"
              value={medData.lote}
              onChange={(e) => setMedData({ ...medData, lote: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade *
            </label>
            <input
              type="number"
              min="0"
              value={medData.quantidade}
              onChange={(e) =>
                setMedData({ ...medData, quantidade: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Validade *
            </label>
            <input
              type="date"
              value={medData.dataValidade}
              onChange={(e) =>
                setMedData({ ...medData, dataValidade: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="med-vencido"
            type="checkbox"
            checked={medData.vencido}
            onChange={(e) =>
              setMedData({ ...medData, vencido: e.target.checked })
            }
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="med-vencido" className="text-sm text-gray-700">
            Marcar como vencido
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {editingMed ? "Atualizar" : "Cadastrar"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
