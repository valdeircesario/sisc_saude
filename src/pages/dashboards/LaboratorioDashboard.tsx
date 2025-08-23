import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FlaskConical, 
  FileText, 
  Calendar, 
  Upload, 
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const LaboratorioDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('solicitacoes');
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);
  const [showResultadoModal, setShowResultadoModal] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<any>(null);
  const [selectedExame, setSelectedExame] = useState<any>(null);

  const [agendamentoData, setAgendamentoData] = useState({
    dataAgendada: ''
  });

  const [resultadoData, setResultadoData] = useState({
    resultado: '',
    arquivo: null as File | null
  });

  // Queries
  const { data: solicitacoes, isLoading: loadingSolicitacoes } = useQuery(
    'laboratorio-solicitacoes',
    () => api.get('/laboratorio/solicitacoes').then(res => res.data),
    { enabled: activeTab === 'solicitacoes' }
  );

  const { data: exames, isLoading: loadingExames } = useQuery(
    'laboratorio-exames',
    () => api.get('/laboratorio/exames').then(res => res.data),
    { enabled: activeTab === 'exames' }
  );

  // Mutations
  const agendarExameMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => api.put(`/laboratorio/solicitacoes/${id}/agendar`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('laboratorio-solicitacoes');
        queryClient.invalidateQueries('laboratorio-exames');
        toast.success('Exame agendado com sucesso!');
        setShowAgendamentoModal(false);
        setSelectedSolicitacao(null);
        resetAgendamentoForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao agendar exame');
      }
    }
  );

  const registrarResultadoMutation = useMutation(
    ({ id, formData }: { id: string; formData: FormData }) => 
      api.put(`/laboratorio/exames/${id}/resultado`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('laboratorio-exames');
        toast.success('Resultado registrado com sucesso!');
        setShowResultadoModal(false);
        setSelectedExame(null);
        resetResultadoForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao registrar resultado');
      }
    }
  );

  const resetAgendamentoForm = () => {
    setAgendamentoData({
      dataAgendada: ''
    });
  };

  const resetResultadoForm = () => {
    setResultadoData({
      resultado: '',
      arquivo: null
    });
  };

  const handleAgendamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSolicitacao) {
      agendarExameMutation.mutate({ 
        id: selectedSolicitacao.id, 
        data: agendamentoData 
      });
    }
  };

  const handleResultadoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExame) {
      const formData = new FormData();
      formData.append('resultado', resultadoData.resultado);
      if (resultadoData.arquivo) {
        formData.append('arquivo', resultadoData.arquivo);
      }
      
      registrarResultadoMutation.mutate({ 
        id: selectedExame.id, 
        formData 
      });
    }
  };

  const openAgendamentoModal = (solicitacao: any) => {
    setSelectedSolicitacao(solicitacao);
    setShowAgendamentoModal(true);
  };

  const openResultadoModal = (exame: any) => {
    setSelectedExame(exame);
    setShowResultadoModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800';
      case 'realizado':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'realizado':
        return <CheckCircle className="h-4 w-4" />;
      case 'agendado':
        return <Clock className="h-4 w-4" />;
      case 'pendente':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const navigation = [
    { name: 'Solicitações', key: 'solicitacoes', icon: FileText },
    { name: 'Exames', key: 'exames', icon: FlaskConical },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <FlaskConical className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel Laboratório</h1>
                <p className="text-sm text-gray-600">Bem-vindo, {user?.nome}</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-2xl shadow-lg p-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => setActiveTab(item.key)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                          activeTab === item.key
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Solicitações Tab */}
            {activeTab === 'solicitacoes' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Solicitações de Exame</h2>

                {loadingSolicitacoes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {solicitacoes?.map((solicitacao: any) => (
                      <div key={solicitacao.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{solicitacao.tipoExame}</h3>
                            <p className="text-sm text-gray-600">{solicitacao.paciente.nome}</p>
                            <p className="text-sm text-gray-500">CPF: {solicitacao.paciente.cpf}</p>
                            <p className="text-sm text-gray-500">Telefone: {solicitacao.paciente.telefone}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(solicitacao.status)}`}>
                              {getStatusIcon(solicitacao.status)}
                              <span className="ml-1 capitalize">{solicitacao.status}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Solicitado por</label>
                            <p className="text-gray-900">{solicitacao.funcionario.nome}</p>
                            <p className="text-sm text-gray-600">{solicitacao.funcionario.funcao}</p>
                            <p className="text-sm text-gray-600">{solicitacao.funcionario.ubs.nome}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Solicitação</label>
                            <p className="text-gray-900">
                              {format(new Date(solicitacao.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        
                        {solicitacao.observacoes && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                            <p className="text-gray-900">{solicitacao.observacoes}</p>
                          </div>
                        )}
                        
                        {solicitacao.status === 'pendente' && (
                          <div className="mt-4">
                            <button
                              onClick={() => openAgendamentoModal(solicitacao)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              Agendar Exame
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Exames Tab */}
            {activeTab === 'exames' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Exames</h2>

                {loadingExames ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exames?.map((exame: any) => (
                      <div key={exame.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{exame.tipo}</h3>
                            <p className="text-sm text-gray-600">{exame.paciente.nome}</p>
                            <p className="text-sm text-gray-500">CPF: {exame.paciente.cpf}</p>
                            <p className="text-sm text-gray-500">Telefone: {exame.paciente.telefone}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exame.status)}`}>
                              {getStatusIcon(exame.status)}
                              <span className="ml-1 capitalize">{exame.status}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {exame.dataAgendada && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Data Agendada</label>
                              <p className="text-gray-900">
                                {format(new Date(exame.dataAgendada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                          )}
                          
                          {exame.dataRealizado && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Data Realizada</label>
                              <p className="text-gray-900">
                                {format(new Date(exame.dataRealizado), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {exame.resultado && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Resultado</label>
                            <p className="text-gray-900">{exame.resultado}</p>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          {exame.status === 'agendado' && (
                            <button
                              onClick={() => openResultadoModal(exame)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Registrar Resultado
                            </button>
                          )}
                          
                          {exame.arquivoPdf && (
                            <a
                              href={`http://localhost:3001/api/exames/download/${exame.arquivoPdf}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              <span>Baixar Laudo</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Agendamento */}
      {showAgendamentoModal && selectedSolicitacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agendar Exame</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Paciente: <span className="font-medium">{selectedSolicitacao.paciente.nome}</span></p>
              <p className="text-sm text-gray-600">Exame: <span className="font-medium">{selectedSolicitacao.tipoExame}</span></p>
            </div>
            
            <form onSubmit={handleAgendamentoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora do Exame</label>
                <input
                  type="datetime-local"
                  value={agendamentoData.dataAgendada}
                  onChange={(e) => setAgendamentoData({ ...agendamentoData, dataAgendada: e.target.value })}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Resultado</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Paciente: <span className="font-medium">{selectedExame.paciente.nome}</span></p>
              <p className="text-sm text-gray-600">Exame: <span className="font-medium">{selectedExame.tipo}</span></p>
            </div>
            
            <form onSubmit={handleResultadoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resultado</label>
                <textarea
                  value={resultadoData.resultado}
                  onChange={(e) => setResultadoData({ ...resultadoData, resultado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Descreva o resultado do exame..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo PDF (opcional)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResultadoData({ ...resultadoData, arquivo: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Apenas arquivos PDF são aceitos</p>
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
    </div>
  );
};

export default LaboratorioDashboard;