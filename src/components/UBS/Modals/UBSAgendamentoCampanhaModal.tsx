import React from "react";
import { Modal } from "./UBSModalBase";

export const UBSAgendamentoCampanhaModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedInscricao: any;
  selectedCampanha: any;
  agendamentoCampanhaData: any;
  setAgendamentoCampanhaData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({
  isOpen,
  onClose,
  selectedInscricao,
  selectedCampanha,
  agendamentoCampanhaData,
  setAgendamentoCampanhaData,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Atendimento"
      size="lg"
    >
      {selectedInscricao && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Detalhes</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Inscrito:</span>{" "}
              {selectedInscricao.nome}
            </p>
            <p>
              <span className="font-medium">Campanha:</span>{" "}
              {selectedCampanha?.titulo}
            </p>
          </div>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data *
          </label>
          <input
            type="date"
            value={agendamentoCampanhaData.dataAgendada}
            onChange={(e) =>
              setAgendamentoCampanhaData({
                ...agendamentoCampanhaData,
                dataAgendada: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hora *
          </label>
          <input
            type="time"
            value={agendamentoCampanhaData.horaAgendada}
            onChange={(e) =>
              setAgendamentoCampanhaData({
                ...agendamentoCampanhaData,
                horaAgendada: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Local de Atendimento *
          </label>
          <input
            type="text"
            value={agendamentoCampanhaData.localAtendimento}
            onChange={(e) =>
              setAgendamentoCampanhaData({
                ...agendamentoCampanhaData,
                localAtendimento: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Sala 1, Auditório, etc."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            value={agendamentoCampanhaData.observacoes}
            onChange={(e) =>
              setAgendamentoCampanhaData({
                ...agendamentoCampanhaData,
                observacoes: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Observações sobre o atendimento"
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
