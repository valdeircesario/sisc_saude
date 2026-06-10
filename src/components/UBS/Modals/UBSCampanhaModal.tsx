import React from "react";
import { Modal } from "./UBSModalBase";

export const UBSCampanhaModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  campanhaData: any;
  setCampanhaData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({ isOpen, onClose, campanhaData, setCampanhaData, onSubmit }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Campanha"
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={campanhaData.titulo}
            onChange={(e) =>
              setCampanhaData({ ...campanhaData, titulo: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição *
          </label>
          <textarea
            value={campanhaData.descricao}
            onChange={(e) =>
              setCampanhaData({ ...campanhaData, descricao: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo *
          </label>
          <input
            type="text"
            value={campanhaData.tipo}
            onChange={(e) =>
              setCampanhaData({ ...campanhaData, tipo: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Início *
            </label>
            <input
              type="date"
              value={campanhaData.dataIni}
              onChange={(e) =>
                setCampanhaData({ ...campanhaData, dataIni: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Fim (opcional)
            </label>
            <input
              type="date"
              value={campanhaData.dataFim}
              onChange={(e) =>
                setCampanhaData({ ...campanhaData, dataFim: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
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
            Criar
          </button>
        </div>
      </form>
    </Modal>
  );
};
