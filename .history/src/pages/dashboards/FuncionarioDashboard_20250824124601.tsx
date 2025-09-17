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
  Building2
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
    prioridade: 'media'
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
    'hospitais-disponiveis',
    () => api.get('/routes/hospital').then(res => res.data),
    { enabled: showInternacaoModal }
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
  (data: any) => api.post('/funcionario/solicitacoes-internacao', data), // URL corrigida
  {
    onSuccess: () => {
      toast.success('Solicitação de internação enviada com sucesso!');
      setShowInternacaoModal(false);
      resetInternacaoForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao solicitar internação');
    }
  }
);

// 3. Corrigir o estado inicial do internacaoData
const [internacaoData, setInternacaoData] = useState({
  hospitalId: '',
  tipo: '',
  motivo: '',
  detalhes: '',
  laudoMedico: '',
  prioridade: 'medio' // Corrigido de 'media' para 'medio'
});

// 4. Corrigir a função resetInternacaoForm
const resetInternacaoForm = () => {
  setInternacaoData({
    hospitalId: '',
    tipo: '',
    motivo: '',
    detalhes: '',
    laudoMedico: '',
    prioridade: 'medio' // Corrigido de 'media' para 'medio'
  });
};

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
      prioridade: 'media'
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
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum histórico médico encontrado para este paciente.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Histórico Médico */}
      {showHistoricoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Registrar Histórico Médico</h3>
            <p className="text-gray-600 mb-4">Paciente: {selectedPaciente?.nome}</p>
            
            <form onSubmit={handleHistoricoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data da Consulta</label>
                  <input
                    type="date"
                    value={historicoData.dataConsulta}
                    onChange={(e) => setHistoricoData({...historicoData, dataConsulta: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                  <input
                    type="text"
                    value={historicoData.diagnostico}
                    onChange={(e) => setHistoricoData({...historicoData, diagnostico: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doença</label>
                  <input
                    type="text"
                    value={historicoData.doenca}
                    onChange={(e) => setHistoricoData({...historicoData, doenca: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicação</label>
                  <input
                    type="text"
                    value={historicoData.medicacao}
                    onChange={(e) => setHistoricoData({...historicoData, medicacao: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Laudo</label>
                <textarea
                  value={historicoData.laudo}
                  onChange={(e) => setHistoricoData({...historicoData, laudo: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={historicoData.observacoes}
                  onChange={(e) => setHistoricoData({...historicoData, observacoes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowHistoricoModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Vacina */}
      {showVacinaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Registrar Vacina</h3>
            <p className="text-gray-600 mb-4">Paciente: {selectedPaciente?.nome}</p>
            
            <form onSubmit={handleVacinaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Vacina</label>
                <input
                  type="text"
                  value={vacinaData.nome}
                  onChange={(e) => setVacinaData({...vacinaData, nome: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lote</label>
                <input
                  type="text"
                  value={vacinaData.lote}
                  onChange={(e) => setVacinaData({...vacinaData, lote: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Aplicação</label>
                <input
                  type="date"
                  value={vacinaData.dataApl}
                  onChange={(e) => setVacinaData({...vacinaData, dataApl: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Dose (opcional)</label>
                <input
                  type="date"
                  value={vacinaData.proximaDose}
                  onChange={(e) => setVacinaData({...vacinaData, proximaDose: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowVacinaModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Registrar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exame */}
      {showExameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Solicitar Exame</h3>
            <p className="text-gray-600 mb-4">Paciente: {selectedPaciente?.nome}</p>
            
            <form onSubmit={handleExameSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Laboratório</label>
                <select
                  value={exameData.laboratorioId}
                  onChange={(e) => setExameData({...exameData, laboratorioId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <input
                  type="text"
                  value={exameData.tipoExame}
                  onChange={(e) => setExameData({...exameData, tipoExame: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={exameData.observacoes}
                  onChange={(e) => setExameData({...exameData, observacoes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowExameModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Solicitar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Solicitação de Internação */}
      {showInternacaoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Solicitar Internação</h3>
            <p className="text-gray-600 mb-4">Paciente: {selectedPaciente?.nome}</p>
            
            <form onSubmit={handleInternacaoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                  <select
                    value={internacaoData.hospitalId}
                    onChange={(e) => setInternacaoData({...internacaoData, hospitalId: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um hospital</option>
                    {hospitais?.map((hospital: any) => (
                      <option key={hospital.id} value={hospital.id}>{hospital.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={internacaoData.tipo}
                    onChange={(e) => setInternacaoData({...internacaoData, tipo: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="internacao">Internação</option>
                    <option value="cirurgia">Cirurgia</option>
                    <option value="procedimento">Procedimento</option>
                    <option value="emergencia">Emergência</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <select
                  value={internacaoData.prioridade}
                  onChange={(e) => setInternacaoData({...internacaoData, prioridade: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <input
                  type="text"
                  value={internacaoData.motivo}
                  onChange={(e) => setInternacaoData({...internacaoData, motivo: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes</label>
                <textarea
                  value={internacaoData.detalhes}
                  onChange={(e) => setInternacaoData({...internacaoData, detalhes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Laudo Médico</label>
                <textarea
                  value={internacaoData.laudoMedico}
                  onChange={(e) => setInternacaoData({...internacaoData, laudoMedico: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInternacaoModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Solicitar Internação</span>
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

