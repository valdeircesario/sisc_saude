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
  Send
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

  const [cirurgiaData, setCirurgiaData] = useState({
    HospitalId: '',
    tipoCirurgia: '',
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
    { enabled: showExameModal }
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

  const solicitarMutation = useMutation(
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

  const navigation = [
    { name: 'Pacientes', key: 'pacientes', icon: Users },
    { name: 'Histórico Médico', key: 'historico', icon: Heart },
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
                              <p className="text-sm text-gray-600">{item.funcionario.crm}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {item.doenca && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Doença</label>
                              <p className="text-gray-900">{item.doenca}</p>
                            </div>
                          )}
                          
                          {item.medicacao && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Medicação</label>
                              <p className="text-gray-900">{item.medicacao}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Laudo</label>
                          <p className="text-gray-900">{item.laudo}</p>
                        </div>
                        
                        {item.observacoes && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                            <p className="text-gray-900">{item.observacoes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhum histórico médico encontrado</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Histórico Médico */}
      {showHistoricoModal && selectedPaciente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Registrar Histórico Médico - {selectedPaciente.nome}
            </h3>
            
            <form onSubmit={handleHistoricoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data da Consulta</label>
                <input
                  type="date"
                  value={historicoData.dataConsulta}
                  onChange={(e) => setHistoricoData({ ...historicoData, dataConsulta: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                <input
                  type="text"
                  value={historicoData.diagnostico}
                  onChange={(e) => setHistoricoData({ ...historicoData, diagnostico: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doença (opcional)</label>
                <input
                  type="text"
                  value={historicoData.doenca}
                  onChange={(e) => setHistoricoData({ ...historicoData, doenca: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicação (opcional)</label>
                <input
                  type="text"
                  value={historicoData.medicacao}
                  onChange={(e) => setHistoricoData({ ...historicoData, medicacao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Laudo</label>
                <textarea
                  value={historicoData.laudo}
                  onChange={(e) => setHistoricoData({ ...historicoData, laudo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
                <textarea
                  value={historicoData.observacoes}
                  onChange={(e) => setHistoricoData({ ...historicoData, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowHistoricoModal(false);
                    resetHistoricoForm();
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

      {/* Modal Vacina */}
      {showVacinaModal && selectedPaciente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Registrar Vacina - {selectedPaciente.nome}
            </h3>
            
            <form onSubmit={handleVacinaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Vacina</label>
                <select
                  value={vacinaData.nome}
                  onChange={(e) => setVacinaData({ ...vacinaData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma vacina</option>
                  <option value="COVID-19">COVID-19</option>
                  <option value="Influenza">Influenza</option>
                  <option value="Hepatite B">Hepatite B</option>
                  <option value="Tétano">Tétano</option>
                  <option value="Febre Amarela">Febre Amarela</option>
                  <option value="HPV">HPV</option>
                  <option value="Pneumocócica">Pneumocócica</option>
                  <option value="Meningocócica">Meningocócica</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lote</label>
                <input
                  type="text"
                  value={vacinaData.lote}
                  onChange={(e) => setVacinaData({ ...vacinaData, lote: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Aplicação</label>
                <input
                  type="date"
                  value={vacinaData.dataApl}
                  onChange={(e) => setVacinaData({ ...vacinaData, dataApl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Dose (opcional)</label>
                <input
                  type="date"
                  value={vacinaData.proximaDose}
                  onChange={(e) => setVacinaData({ ...vacinaData, proximaDose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Registrar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowVacinaModal(false);
                    resetVacinaForm();
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

      {/* Modal Exame */}
      {showExameModal && selectedPaciente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Solicitar Exame - {selectedPaciente.nome}
            </h3>
            
            <form onSubmit={handleExameSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Laboratório</label>
                <select
                  value={exameData.laboratorioId}
                  onChange={(e) => setExameData({ ...exameData, laboratorioId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um laboratório</option>
                  {laboratorios?.map((lab: any) => (
                    <option key={lab.id} value={lab.id}>{lab.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Exame</label>
                <select
                  value={exameData.tipoExame}
                  onChange={(e) => setExameData({ ...exameData, tipoExame: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um tipo de exame</option>
                  <option value="Hemograma Completo">Hemograma Completo</option>
                  <option value="Glicemia">Glicemia</option>
                  <option value="Colesterol">Colesterol</option>
                  <option value="Urina">Urina</option>
                  <option value="Raio-X">Raio-X</option>
                  <option value="Ultrassom">Ultrassom</option>
                  <option value="Eletrocardiograma">Eletrocardiograma</option>
                  <option value="Mamografia">Mamografia</option>
                  <option value="Papanicolau">Papanicolau</option>
                  <option value="Outros">Outros</option>

                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={exameData.observacoes}
                  onChange={(e) => setExameData({ ...exameData, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Observações sobre o exame solicitado..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Solicitar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExameModal(false);
                    resetExameForm();
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

export default FuncionarioDashboard;