import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Users, 
  Heart, 
  Shield, 
  FileText, 
  LogOut,
  Plus,
  Search,
  Save,
  Send,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FuncionarioDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('pacientes');
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [showVacinaModal, setShowVacinaModal] = useState(false);
  const [showExameModal, setShowExameModal] = useState(false);
  const [showInternacaoModal, setShowInternacaoModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [historicoData, setHistoricoData] = useState({
    laudo: '',
    doenca: '',
    diagnostico: '',
    medicacao: '',
    observacoes: '',
    dataConsulta: new Date().toISOString().split('T')[0]
  });

  const [vacinaData, setVacinaData] = useState({
    nome: '',
    lote: '',
    dataApl: new Date().toISOString().split('T')[0],
    proximaDose: ''
  });

  const [exameData, setExameData] = useState({
    laboratorioId: '',
    tipoExame: '',
    observacoes: ''
  });

  const [internacaoData, setInternacaoData] = useState({
    hospitalId: '',
    tipo: '',
    motivo: '',
    detalhes: '',
    laudoMedico: '',
    prioridade: 'medio',
    observacoes: ''
  });

  // Queries
  const { data: pacientes, isLoading: loadingPacientes } = useQuery(
    ['funcionario-pacientes', searchTerm],
    () => api.get(`/funcionario/pacientes?busca=${searchTerm}`).then(res => res.data),
    { enabled: activeTab === 'pacientes' }
  );

  const { data: historicoPaciente } = useQuery(
    ['paciente-historico', selectedPaciente?.id],
    () => api.get(`/funcionario/pacientes/${selectedPaciente.id}/historico`).then(res => res.data),
    { enabled: !!selectedPaciente && activeTab === 'historico' }
  );

  const { data: laboratorios } = useQuery(
    'funcionario-laboratorios',
    () => api.get('/funcionario/laboratorios').then(res => res.data),
    { enabled: showExameModal }
  );

  const { data: hospitais } = useQuery(
    'funcionario-hospitais',
    () => api.get('/funcionario/hospitais').then(res => res.data),
    { enabled: showInternacaoModal }
  );

  const { data: minhasSolicitacoes } = useQuery(
    'minhas-solicitacoes-internacao',
    () => api.get('/funcionario/minhas-solicitacoes-internacao').then(res => res.data),
    { enabled: activeTab === 'solicitacoes' }
  );

  // Mutations
  const createHistoricoMutation = useMutation(
    (data: any) => api.post('/funcionario/historico-medico', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['paciente-historico', selectedPaciente?.id]);
        toast.success('Histórico médico registrado com sucesso!');
        setShowHistoricoModal(false);
        resetHistoricoForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao registrar histórico médico');
      }
    }
  );

  const createVacinaMutation = useMutation(
    (data: any) => api.post('/funcionario/vacinas', data),
    {
      onSuccess: () => {
        toast.success('Vacina registrada com sucesso!');
        setShowVacinaModal(false);
        resetVacinaForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao registrar vacina');
      }
    }
  );

  const solicitarExameMutation = useMutation(
    (data: any) => api.post('/funcionario/solicitar-exame', data),
    {
      onSuccess: () => {
        toast.success('Solicitação de exame enviada com sucesso!');
        setShowExameModal(false);
        resetExameForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao solicitar exame');
      }
    }
  );

  const solicitarInternacaoMutation = useMutation(
    (data: any) => api.post('/funcionario/solicitacoes-internacao', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('minhas-solicitacoes-internacao');
        toast.success('Solicitação de internação enviada com sucesso!');
        setShowInternacaoModal(false);
        resetInternacaoForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao solicitar internação');
      }
    }
  );

  const resetHistoricoForm = () => {
    setHistoricoData({
      laudo: '',
      doenca: '',
      diagnostico: '',
      medicacao: '',
      observacoes: '',
      dataConsulta: new Date().toISOString().split('T')[0]
    });
  };

  const resetVacinaForm = () => {
    setVacinaData({
      nome: '',
      lote: '',
      dataApl: new Date().toISOString().split('T')[0],
      proximaDose: ''
    });
  };

  const resetExameForm = () => {
    setExameData({
      laboratorioId: '',
      tipoExame: '',
      observacoes: ''
    });
  };

  const resetInternacaoForm = () => {
    setInternacaoData({
      hospitalId: '',
      tipo: '',
      motivo: '',
      detalhes: '',
      laudoMedico: '',
      prioridade: 'medio',
      observacoes: ''
    });
  };

  const handleHistoricoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      createHistoricoMutation.mutate({
        pacienteId: selectedPaciente.id,
        ...historicoData
      });
    }
  };

  const handleVacinaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      createVacinaMutation.mutate({
        pacienteId: selectedPaciente.id,
        ...vacinaData
      });
    }
  };

  const handleExameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      solicitarExameMutation.mutate({
        pacienteId: selectedPaciente.id,
        ...exameData
      });
    }
  };

  const handleInternacaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      solicitarInternacaoMutation.mutate({
        pacienteId: selectedPaciente.id,
        ...internacaoData
      });
    }
  };

  const openHistoricoModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowHistoricoModal(true);
  };

  const openVacinaModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowVacinaModal(true);
  };

  const openExameModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowExameModal(true);
  };

  const openInternacaoModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowInternacaoModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'text-yellow-600 bg-yellow-100';
      case 'avaliando': return 'text-blue-600 bg-blue-100';
      case 'agendado': return 'text-purple-600 bg-purple-100';
      case 'realizado': return 'text-green-600 bg-green-100';
      case 'cancelado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'gravissimo': return 'text-red-800 bg-red-200';
      case 'urgente': return 'text-red-600 bg-red-100';
      case 'grave': return 'text-orange-600 bg-orange-100';
      case 'medio': return 'text-yellow-600 bg-yellow-100';
      case 'leve': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const navigation = [
    { name: 'Pacientes', key: 'pacientes', icon: Users },
    { name: 'Histórico Médico', key: 'historico', icon: Heart },
    { name: 'Minhas Solicitações', key: 'solicitacoes', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Stethoscope className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel Médico</h1>
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
                            ? 'bg-green-600 text-white'
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
            {/* Pacientes Tab */}
            {activeTab === 'pacientes' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Buscar por nome, CPF ou CNS..."
                      />
                    </div>
                  </div>
                </div>

                {loadingPacientes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pacientes?.map((paciente: any) => (
                      <div key={paciente.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{paciente.nome}</h3>
                          <p className="text-sm text-gray-600">CPF: {paciente.cpf}</p>
                          <p className="text-sm text-gray-600">CNS: {paciente.cns}</p>
                          <p className="text-sm text-gray-600">Telefone: {paciente.telefone}</p>
                          <p className="text-sm text-gray-600">
                            Nascimento: {format(new Date(paciente.nascimento), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openHistoricoModal(paciente)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            <Heart className="h-4 w-4" />
                            <span>Histórico</span>
                          </button>
                          
                          <button
                            onClick={() => openVacinaModal(paciente)}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            <Shield className="h-4 w-4" />
                            <span>Vacina</span>
                          </button>
                          
                          <button
                            onClick={() => openExameModal(paciente)}
                            className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                          >
                            <FileText className="h-4 w-4" />
                            <span>Exame</span>
                          </button>

                          <button
                            onClick={() => openInternacaoModal(paciente)}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          >
                            <Building2 className="h-4 w-4" />
                            <span>Internação</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedPaciente(paciente);
                              setActiveTab('historico');
                            }}
                            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            <FileText className="h-4 w-4" />
                            <span>Ver Histórico</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Histórico Tab */}
            {activeTab === 'historico' && selectedPaciente && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Histórico Médico</h2>
                    <p className="text-gray-600">Paciente: {selectedPaciente.nome}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('pacientes')}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Voltar
                  </button>
                </div>

                {historicoPaciente && historicoPaciente.length > 0 ? (
                  <div className="space-y-4">
                    {historicoPaciente.map((item: any) => (
                      <div key={item.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{item.diagnostico}</h3>
                            <p className="text-sm text-gray-600">
                              {format(new Date(item.dataConsulta), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{item.funcionario.nome}</p>
                            <p className="text-sm text-gray-600">{item.funcionario.funcao}</p>
                            {item.funcionario.crm && (
                              <p className="text-sm text-gray-600">CRM: {item.funcionario.crm}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Laudo:</p>
                            <p className="text-gray-600">{item.laudo}</p>
                          </div>
                          {item.doenca && (
                            <div>
                              <p className="font-medium text-gray-700">Doença:</p>
                              <p className="text-gray-600">{item.doenca}</p>
                            </div>
                          )}
                          {item.medicacao && (
                            <div>
                              <p className="font-medium text-gray-700">Medicação:</p>
                              <p className="text-gray-600">{item.medicacao}</p>
                            </div>
                          )}
                          {item.observacoes && (
                            <div>
                              <p className="font-medium text-gray-700">Observações:</p>
                              <p className="text-gray-600">{item.observacoes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum histórico médico encontrado para este paciente.</p>
                  </div>
                )}
              </div>
            )}

            {/* Minhas Solicitações Tab */}
            {activeTab === 'solicitacoes' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Minhas Solicitações de Internação</h2>
                </div>

                {minhasSolicitacoes && minhasSolicitacoes.length > 0 ? (
                  <div className="space-y-4">
                    {minhasSolicitacoes.map((solicitacao: any) => (
                      <div key={solicitacao.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{solicitacao.paciente.nome}</h3>
                            <p className="text-sm text-gray-600">Hospital: {solicitacao.hospital.nome}</p>
                            <p className="text-sm text-gray-600">
                              Solicitado em: {format(new Date(solicitacao.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(solicitacao.status)}`}>
                              {solicitacao.status}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPrioridadeColor(solicitacao.prioridade)}`}>
                              {solicitacao.prioridade}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Tipo:</p>
                            <p className="text-gray-600">{solicitacao.tipo}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Motivo:</p>
                            <p className="text-gray-600">{solicitacao.motivo}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="font-medium text-gray-700">Detalhes:</p>
                            <p className="text-gray-600">{solicitacao.detalhes}</p>
                          </div>
                          {solicitacao.observacoes && (
                            <div className="md:col-span-2">
                              <p className="font-medium text-gray-700">Observações:</p>
                              <p className="text-gray-600">{solicitacao.observacoes}</p>
                            </div>
                          )}
                          {solicitacao.dataAgendada && (
                            <div>
                              <p className="font-medium text-gray-700">Data Agendada:</p>
                              <p className="text-gray-600">
                                {format(new Date(solicitacao.dataAgendada), 'dd/MM/yyyy', { locale: ptBR })}
                                {solicitacao.horaAgendada && ` às ${solicitacao.horaAgendada}`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma solicitação de internação encontrada.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Histórico Médico */}
      {showHistoricoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Registrar Histórico Médico</h3>
              <button
                onClick={() => setShowHistoricoModal(false)}
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

            <form onSubmit={handleHistoricoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Consulta
                </label>
                <input
                  type="date"
                  value={historicoData.dataConsulta}
                  onChange={(e) => setHistoricoData({ ...historicoData, dataConsulta: e.target.value })}
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
                  onChange={(e) => setHistoricoData({ ...historicoData, laudo: e.target.value })}
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
                  onChange={(e) => setHistoricoData({ ...historicoData, diagnostico: e.target.value })}
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
                  onChange={(e) => setHistoricoData({ ...historicoData, doenca: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicação
                </label>
                <textarea
                  value={historicoData.medicacao}
                  onChange={(e) => setHistoricoData({ ...historicoData, medicacao: e.target.value })}
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
                  onChange={(e) => setHistoricoData({ ...historicoData, observacoes: e.target.value })}
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
                  disabled={createHistoricoMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{createHistoricoMutation.isLoading ? 'Salvando...' : 'Salvar'}</span>
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
                  onChange={(e) => setVacinaData({ ...vacinaData, nome: e.target.value })}
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
                  onChange={(e) => setVacinaData({ ...vacinaData, lote: e.target.value })}
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
                  onChange={(e) => setVacinaData({ ...vacinaData, dataApl: e.target.value })}
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
                  onChange={(e) => setVacinaData({ ...vacinaData, proximaDose: e.target.value })}
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
                  disabled={createVacinaMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{createVacinaMutation.isLoading ? 'Salvando...' : 'Salvar'}</span>
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
                  onChange={(e) => setExameData({ ...exameData, laboratorioId: e.target.value })}
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
                  onChange={(e) => setExameData({ ...exameData, tipoExame: e.target.value })}
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
                  onChange={(e) => setExameData({ ...exameData, observacoes: e.target.value })}
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
                  disabled={solicitarExameMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{solicitarExameMutation.isLoading ? 'Enviando...' : 'Solicitar'}</span>
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
              <h3 className="text-xl font-bold text-gray-900">Solicitar Internação</h3>
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
                <select
                  value={internacaoData.hospitalId}
                  onChange={(e) => setInternacaoData({ ...internacaoData, hospitalId: e.target.value })}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Internação *
                </label>
                <select
                  value={internacaoData.tipo}
                  onChange={(e) => setInternacaoData({ ...internacaoData, tipo: e.target.value })}
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
                  onChange={(e) => setInternacaoData({ ...internacaoData, prioridade: e.target.value })}
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
                  onChange={(e) => setInternacaoData({ ...internacaoData, motivo: e.target.value })}
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
                  onChange={(e) => setInternacaoData({ ...internacaoData, detalhes: e.target.value })}
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
                  onChange={(e) => setInternacaoData({ ...internacaoData, laudoMedico: e.target.value })}
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
                  onChange={(e) => setInternacaoData({ ...internacaoData, observacoes: e.target.value })}
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
                  disabled={solicitarInternacaoMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{solicitarInternacaoMutation.isLoading ? 'Enviando...' : 'Solicitar Internação'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuncionarioDashboard;

