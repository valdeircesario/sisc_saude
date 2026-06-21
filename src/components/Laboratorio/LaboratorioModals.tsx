import React from "react";
import { Upload } from "lucide-react";

interface LaboratorioModalsProps {
  showAgendamentoModal: boolean;
  setShowAgendamentoModal: (show: boolean) => void;
  selectedSolicitacao: any;
  setSelectedSolicitacao: (val: any) => void;
  agendamentoData: any;
  setAgendamentoData: (val: any) => void;
  handleAgendamentoSubmit: (e: React.FormEvent) => void;
  resetAgendamentoForm: () => void;

  showResultadoModal: boolean;
  setShowResultadoModal: (show: boolean) => void;
  selectedExame: any;
  setSelectedExame: (val: any) => void;
  resultadoData: any;
  setResultadoData: (val: any) => void;
  handleResultadoSubmit: (e: React.FormEvent) => void;
  resetResultadoForm: () => void;
}

export const LaboratorioModals: React.FC<LaboratorioModalsProps> = ({
  showAgendamentoModal,
  setShowAgendamentoModal,
  selectedSolicitacao,
  setSelectedSolicitacao,
  agendamentoData,
  setAgendamentoData,
  handleAgendamentoSubmit,
  resetAgendamentoForm,
  showResultadoModal,
  setShowResultadoModal,
  selectedExame,
  setSelectedExame,
  resultadoData,
  setResultadoData,
  handleResultadoSubmit,
  resetResultadoForm,
}) => {
  return (
    <>
      {/* Modal Agendamento */}
      {showAgendamentoModal && selectedSolicitacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Agendar Exame
            </h3>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Paciente:{" "}
                <span className="font-medium">
                  {selectedSolicitacao.paciente.nome}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Exame:{" "}
                <span className="font-medium">
                  {selectedSolicitacao.tipoExame}
                </span>
              </p>
            </div>

            <form onSubmit={handleAgendamentoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data e Hora do Exame
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Agendar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAgendamentoModal(false);
                    setSelectedSolicitacao(null);
                    resetAgendamentoForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Resultado */}
      {showResultadoModal && selectedExame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedExame.status === 'realizado' ? (selectedExame.arquivoPdf ? 'Atualizar Laudo' : 'Importar PDF') : 'Registrar Resultado'}
            </h3>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Paciente:{" "}
                <span className="font-medium">{selectedExame.paciente.nome}</span>
              </p>
              <p className="text-sm text-gray-600">
                Exame: <span className="font-medium">{selectedExame.tipo}</span>
              </p>
            </div>

            <form onSubmit={handleResultadoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resultado
                </label>
                <textarea
                  value={resultadoData.resultado}
                  onChange={(e) =>
                    setResultadoData({
                      ...resultadoData,
                      resultado: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Descreva o resultado do exame..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arquivo PDF (opcional)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setResultadoData({
                      ...resultadoData,
                      arquivo: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Apenas arquivos PDF são aceitos
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Registrar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResultadoModal(false);
                    setSelectedExame(null);
                    resetResultadoForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
