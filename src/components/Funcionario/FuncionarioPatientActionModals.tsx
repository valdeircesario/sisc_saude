import React from "react";
import { X, Save, Send } from "lucide-react";

interface PatientActionModalsProps {
  selectedPaciente: any;
  showHistoricoModal: boolean;
  setShowHistoricoModal: (show: boolean) => void;
  handleHistoricoSubmit: (e: React.FormEvent) => void;
  historicoData: any;
  setHistoricoData: (val: any) => void;
  isRegistrandoHistorico: boolean;

  showVacinaModal: boolean;
  setShowVacinaModal: (show: boolean) => void;
  handleVacinaSubmit: (e: React.FormEvent) => void;
  vacinaData: any;
  setVacinaData: (val: any) => void;
  isRegistrandoVacina: boolean;

  showExameModal: boolean;
  setShowExameModal: (show: boolean) => void;
  handleExameSubmit: (e: React.FormEvent) => void;
  exameData: any;
  setExameData: (val: any) => void;
  isSolicitandoExame: boolean;
  laboratorios: any[];

  showInternacaoModal: boolean;
  setShowInternacaoModal: (show: boolean) => void;
  handleInternacaoSubmit: (e: React.FormEvent) => void;
  internacaoData: any;
  setInternacaoData: (val: any) => void;
  isSolicitandoInternacao: boolean;
  hospitais: any[];
  loadingHospitais: boolean;
  hospitaisError: boolean;
}

const FuncionarioPatientActionModals: React.FC<PatientActionModalsProps> = ({
  selectedPaciente,
  showHistoricoModal,
  setShowHistoricoModal,
  handleHistoricoSubmit,
  historicoData,
  setHistoricoData,
  isRegistrandoHistorico,

  showVacinaModal,
  setShowVacinaModal,
  handleVacinaSubmit,
  vacinaData,
  setVacinaData,
  isRegistrandoVacina,

  showExameModal,
  setShowExameModal,
  handleExameSubmit,
  exameData,
  setExameData,
  isSolicitandoExame,
  laboratorios,

  showInternacaoModal,
  setShowInternacaoModal,
  handleInternacaoSubmit,
  internacaoData,
  setInternacaoData,
  isSolicitandoInternacao,
  hospitais,
  loadingHospitais,
  hospitaisError,
}) => {
  return (
    <>
      {/* Modal de Histórico Médico */}
      {showHistoricoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Registrar Histórico Médico
              </h3>
              <button
                onClick={() => setShowHistoricoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {selectedPaciente && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">
                  {selectedPaciente.nome}
                </p>
                <p className="text-sm text-gray-600">
                  CPF: {selectedPaciente.cpf}
                </p>
              </div>
            )}

            <form onSubmit={handleHistoricoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Consulta
                </label>
                <input
                  type="date"
                  value={historicoData.dataConsulta}
                  onChange={(e) =>
                    setHistoricoData({
                      ...historicoData,
                      dataConsulta: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Laudo *
                </label>
                <textarea
                  value={historicoData.laudo}
                  onChange={(e) =>
                    setHistoricoData({
                      ...historicoData,
                      laudo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico *
                </label>
                <input
                  type="text"
                  value={historicoData.diagnostico}
                  onChange={(e) =>
                    setHistoricoData({
                      ...historicoData,
                      diagnostico: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doença
                </label>
                <input
                  type="text"
                  value={historicoData.doenca}
                  onChange={(e) =>
                    setHistoricoData({
                      ...historicoData,
                      doenca: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicação
                </label>
                <textarea
                  value={historicoData.medicacao}
                  onChange={(e) =>
                    setHistoricoData({
                      ...historicoData,
                      medicacao: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={historicoData.observacoes}
                  onChange={(e) =>
                    setHistoricoData({
                      ...historicoData,
                      observacoes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowHistoricoModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRegistrandoHistorico}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isRegistrandoHistorico ? "Salvando..." : "Salvar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Vacina */}
      {showVacinaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Registrar Vacina</h3>
              <button
                onClick={() => setShowVacinaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {selectedPaciente && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{selectedPaciente.nome}</p>
                <p className="text-sm text-gray-600">CPF: {selectedPaciente.cpf}</p>
              </div>
            )}

            <form onSubmit={handleVacinaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Vacina *
                </label>
                <input
                  type="text"
                  value={vacinaData.nome}
                  onChange={(e) =>
                    setVacinaData({ ...vacinaData, nome: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lote *
                </label>
                <input
                  type="text"
                  value={vacinaData.lote}
                  onChange={(e) =>
                    setVacinaData({ ...vacinaData, lote: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Aplicação *
                </label>
                <input
                  type="date"
                  value={vacinaData.dataApl}
                  onChange={(e) =>
                    setVacinaData({ ...vacinaData, dataApl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Próxima Dose
                </label>
                <input
                  type="date"
                  value={vacinaData.proximaDose}
                  onChange={(e) =>
                    setVacinaData({ ...vacinaData, proximaDose: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVacinaModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRegistrandoVacina}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isRegistrandoVacina ? "Salvando..." : "Salvar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exame */}
      {showExameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Solicitar Exame</h3>
              <button
                onClick={() => setShowExameModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {selectedPaciente && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{selectedPaciente.nome}</p>
                <p className="text-sm text-gray-600">CPF: {selectedPaciente.cpf}</p>
              </div>
            )}

            <form onSubmit={handleExameSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Laboratório *
                </label>
                <select
                  value={exameData.laboratorioId}
                  onChange={(e) =>
                    setExameData({ ...exameData, laboratorioId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um laboratório</option>
                  {laboratorios?.map((lab: any) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Exame *
                </label>
                <input
                  type="text"
                  value={exameData.tipoExame}
                  onChange={(e) =>
                    setExameData({ ...exameData, tipoExame: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Hemograma completo, Glicemia, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={exameData.observacoes}
                  onChange={(e) =>
                    setExameData({ ...exameData, observacoes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Informações adicionais sobre o exame..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExameModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSolicitandoExame}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSolicitandoExame ? "Enviando..." : "Solicitar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Internação */}
      {showInternacaoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Solicitar Internação
              </h3>
              <button
                onClick={() => setShowInternacaoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {selectedPaciente && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{selectedPaciente.nome}</p>
                <p className="text-sm text-gray-600">CPF: {selectedPaciente.cpf}</p>
              </div>
            )}

            <form onSubmit={handleInternacaoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital *
                </label>
                {loadingHospitais ? (
                  <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-600">
                    Carregando hospitais...
                  </div>
                ) : hospitaisError ? (
                  <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-700">
                    Erro ao carregar hospitais. Atualize a página e tente
                    novamente.
                  </div>
                ) : (
                  <select
                    value={internacaoData.hospitalId}
                    onChange={(e) =>
                      setInternacaoData({
                        ...internacaoData,
                        hospitalId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um hospital</option>
                    {hospitais?.map((hospital: any) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Internação *
                </label>
                <select
                  value={internacaoData.tipo}
                  onChange={(e) =>
                    setInternacaoData({ ...internacaoData, tipo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="internacao">Internação</option>
                  <option value="cirurgia">Cirurgia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="leve">Leve</option>
                  <option value="medio">Médio</option>
                  <option value="grave">Grave</option>
                  <option value="urgente">Urgente</option>
                  <option value="gravissimo">Gravíssimo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Dor abdominal intensa, Fratura exposta, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descreva detalhadamente o quadro clínico e a necessidade de internação..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  placeholder="Laudo médico detalhado justificando a necessidade de internação..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={internacaoData.observacoes}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      observacoes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                  placeholder="Informações adicionais relevantes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInternacaoModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSolicitandoInternacao}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>
                    {isSolicitandoInternacao
                      ? "Enviando..."
                      : "Solicitar Internação"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FuncionarioPatientActionModals;
