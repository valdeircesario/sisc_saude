import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Megaphone, 
  Calendar, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const UBSDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('funcionarios');
  const [showFuncModal, setShowFuncModal] = useState(false);
  const [showCampanhaModal, setShowCampanhaModal] = useState(false);
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [showInscricoesModal, setShowInscricoesModal] = useState(false);
  const [showAgendamentoCampanhaModal, setShowAgendamentoCampanhaModal] = useState(false);
  const [showConsultaPacienteModal, setShowConsultaPacienteModal] = useState(false);
  const [showEditCampanhaModal, setShowEditCampanhaModal] = useState(false);
  const [showInternacaoModal, setShowInternacaoModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingCampanha, setEditingCampanha] = useState<any>(null);
  const [selectedConsulta, setSelectedConsulta] = useState<any>(null);
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);
  const [selectedCampanha, setSelectedCampanha] = useState<any>(null);
  const [inscricoesPorCampanha, setInscricoesPorCampanha] = useState<{[key: string]: any[]}>({});
  const [selectedInscricao, setSelectedInscricao] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [funcData, setFuncData] = useState({
    nome: '',
    funcao: '',
    crm: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: ''
  });

  const [campanhaData, setCampanhaData] = useState({
    titulo: '',
    descricao: '',
    tipo: '',
    dataIni: '',
    dataFim: ''
  });

  const [agendamentoData, setAgendamentoData] = useState({
    dataAgendada: '',
    funcionarioId: '',
    observacoes: ''
  });

  const [pacienteEditData, setPacienteEditData] = useState({
    endereco: '',
    telefone: ''
  });

  const [consultaPacienteData, setConsultaPacienteData] = useState({
    especialidade: '',
    motivo: '',
    dataAgendada: '',
    funcionarioId: '',
    observacoes: ''
  });

  const [agendamentoCampanhaData, setAgendamentoCampanhaData] = useState({
    dataAgendada: '',
    observacoes: ''
  });

  const [internacaoData, setInternacaoData] = useState({
    hospitalId: '',
    funcionarioId: '',
    tipo: '',
    motivo: '',
    detalhes: '',
    laudoMedico: '',
    prioridade: 'media'
  });

  // Queries
  const { data: funcionarios, isLoading: loadingFuncionarios } = useQuery(
    'ubs-funcionarios',
    () => api.get('/ubs/funcionarios').then(res => res.data),
    { enabled: activeTab === 'funcionarios' }
  );

  const { data: pacientes, isLoading: loadingPacientes } = useQuery(
    ['ubs-pacientes', searchTerm],
    () => api.get(`/ubs/pacientes?busca=${searchTerm}`).then(res => res.data),
    { enabled: activeTab === 'pacientes' }
  );

  const { data: historicoPaciente } = useQuery(
    ['paciente-historico-ubs', selectedPaciente?.id],
    () => api.get(`/ubs/pacientes/${selectedPaciente.id}/historico`).then(res => res.data),
    { enabled: !!selectedPaciente && showHistoricoModal }
  );

  const { data: consultasPaciente } = useQuery(
    ['paciente-consultas-ubs', selectedPaciente?.id],
    () => api.get(`/ubs/pacientes/${selectedPaciente.id}/consultas`).then(res => res.data),
    { enabled: !!selectedPaciente && showHistoricoModal }
  );

  const { data: inscricoesCampanha } = useQuery(
    ['campanha-inscricoes', selectedCampanha?.id],
    () => api.get(`/ubs/campanhas/${selectedCampanha.id}/inscricoes`).then(res => res.data),
    { enabled: !!selectedCampanha && showInscricoesModal }
  );

  const { data: campanhas, isLoading: loadingCampanhas } = useQuery(
    'ubs-campanhas',
    () => api.get('/ubs/campanhas').then(res => res.data),
    { 
      enabled: activeTab === 'campanhas',
      onSuccess: (data) => {
        // Carregar inscrições para cada campanha para calcular estatísticas
        data.forEach((campanha: any) => {
          if (campanha._count.inscricoes > 0) {
            api.get(`/ubs/campanhas/${campanha.id}/inscricoes`)
              .then(res => {
                setInscricoesPorCampanha(prev => ({
                  ...prev,
                  [campanha.id]: res.data
                }));
              })
              .catch(err => console.error('Erro ao carregar inscrições:', err));
          }
        });
      }
    }
  );

  const { data: consultas, isLoading: loadingConsultas } = useQuery(
    'ubs-consultas',
    () => api.get('/ubs/consultas').then(res => res.data),
    { enabled: activeTab === 'consultas' }
  );

  const { data: hospitais } = useQuery(
    'hospitais-disponiveis',
    () => api.get('/admin/hospitais').then(res => res.data),
    { enabled: showInternacaoModal }
  );

  // Mutations
  const createFuncMutation = useMutation(
    (data: any) => api.post('/ubs/funcionarios', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ubs-funcionarios');
        toast.success('Funcionário cadastrado com sucesso!');
        setShowFuncModal(false);
        resetFuncForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao cadastrar funcionário');
      }
    }
  );

  const updateFuncMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => api.put(`/ubs/funcionarios/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ubs-funcionarios');
        toast.success('Funcionário atualizado com sucesso!');
        setShowFuncModal(false);
        resetFuncForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar funcionário');
      }
    }
  );

  const deleteFuncMutation = useMutation(
    (id: string) => api.delete(`/ubs/funcionarios/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ubs-funcionarios');
        toast.success('Funcionário deletado com sucesso!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao deletar funcionário');
      }
    }
  );

  const createCampanhaMutation = useMutation(
    (data: any) => api.post('/ubs/campanhas', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ubs-campanhas');
        toast.success('Campanha criada com sucesso!');
        setShowCampanhaModal(false);
        resetCampanhaForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao criar campanha');
      }
    }
  );

  const agendarConsultaMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => api.put(`/ubs/consultas/${id}/agendar`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ubs-consultas');
        toast.success('Consulta agendada com sucesso!');
        setShowAgendamentoModal(false);
        setSelectedConsulta(null);
        resetAgendamentoForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao agendar consulta');
      }
    }
  );

  const editPacienteMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => api.put(`/ubs/pacientes/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ubs-pacientes', searchTerm]);
        toast.success('Paciente atualizado com sucesso!');
        setShowPacienteModal(false);
        setSelectedPaciente(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar paciente');
      }
    }
  );

  const agendarConsultaPacienteMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => api.post(`/ubs/pacientes/${id}/agendar-consulta`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['paciente-consultas-ubs', selectedPaciente?.id]);
        toast.success('Consulta agendada com sucesso!');
        setShowConsultaPacienteModal(false);
        resetConsultaPacienteForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao agendar consulta');
      }
    }
  );

  const agendarAtendimentoCampanhaMutation = useMutation(
    ({ campanhaId, inscricaoId, data }: { campanhaId: string; inscricaoId: string; data: any }) => 
      api.put(`/ubs/campanhas/${campanhaId}/inscricoes/${inscricaoId}/agendar`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['campanha-inscricoes', selectedCampanha?.id]);
        toast.success('Atendimento agendado com sucesso!');
        setShowAgendamentoCampanhaModal(false);
        setSelectedInscricao(null);
        resetAgendamentoCampanhaForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao agendar atendimento');
      }
    }
  );

  const solicitarInternacaoMutation = useMutation(
    (data: any) => api.post('/ubs/solicitar-internacao', data),
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

  const resetFuncForm = () => {
    setFuncData({
      nome: '',
      funcao: '',
      crm: '',
      cpf: '',
      telefone: '',
      email: '',
      senha: ''
    });
    setEditingItem(null);
  };

  const resetCampanhaForm = () => {
    setCampanhaData({
      titulo: '',
      descricao: '',
      tipo: '',
      dataIni: '',
      dataFim: ''
    });
  };

  const resetAgendamentoForm = () => {
    setAgendamentoData({
      dataAgendada: '',
      funcionarioId: '',
      observacoes: ''
    });
  };

  const resetConsultaPacienteForm = () => {
    setConsultaPacienteData({
      especialidade: '',
      motivo: '',
      dataAgendada: '',
      funcionarioId: '',
      observacoes: ''
    });
  };

  const resetAgendamentoCampanhaForm = () => {
    setAgendamentoCampanhaData({
      dataAgendada: '',
      observacoes: ''
    });
  };

  const resetInternacaoForm = () => {
    setInternacaoData({
      hospitalId: '',
      funcionarioId: '',
      tipo: '',
      motivo: '',
      detalhes: '',
      laudoMedico: '',
      prioridade: 'media'
    });
  };

  const handleFuncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      updateFuncMutation.mutate({ id: editingItem.id, data: funcData });
    } else {
      createFuncMutation.mutate(funcData);
    }
  };

  const handleCampanhaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCampanhaMutation.mutate(campanhaData);
  };

  const handleAgendamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedConsulta) {
      agendarConsultaMutation.mutate({ 
        id: selectedConsulta.id, 
        data: agendamentoData 
      });
    }
  };

  const handlePacienteEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      editPacienteMutation.mutate({
        id: selectedPaciente.id,
        data: pacienteEditData
      });
    }
  };

  const handleConsultaPacienteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      agendarConsultaPacienteMutation.mutate({
        id: selectedPaciente.id,
        data: consultaPacienteData
      });
    }
  };

  const handleAgendamentoCampanhaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCampanha && selectedInscricao) {
      agendarAtendimentoCampanhaMutation.mutate({
        campanhaId: selectedCampanha.id,
        inscricaoId: selectedInscricao.id,
        data: agendamentoCampanhaData
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

  const handleEditFunc = (func: any) => {
    setEditingItem(func);
    setFuncData({
      nome: func.nome,
      funcao: func.funcao,
      crm: func.crm || '',
      cpf: func.cpf,
      telefone: func.telefone,
      email: func.email,
      senha: ''
    });
    setShowFuncModal(true);
  };

  const handleEditCampanha = (camp: any) => {
    setEditingCampanha(camp);
    setEditCampanhaData({
      titulo: camp.titulo,
      descricao: camp.descricao,
      tipo: camp.tipo,
      dataIni: camp.dataIni,
      dataFim: camp.dataFim
    });
    setShowEditCampanhaModal(true);
  };

  const [editCampanhaData, setEditCampanhaData] = useState({
    titulo: '',
    descricao: '',
    tipo: '',
    dataIni: '',
    dataFim: ''
  });

  const updateCampanhaMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => api.put(`/ubs/campanhas/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ubs-campanhas');
        toast.success('Campanha atualizada com sucesso!');
        setShowEditCampanhaModal(false);
        resetEditCampanhaForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar campanha');
      }
    }
  );

  const resetEditCampanhaForm = () => {
    setEditCampanhaData({
      titulo: '',
      descricao: '',
      tipo: '',
      dataIni: '',
      dataFim: ''
    });
    setEditingCampanha(null);
  };

  const handleEditCampanhaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCampanha) {
      updateCampanhaMutation.mutate({
        id: editingCampanha.id,
        data: editCampanhaData
      });
    }
  };

  const handleDeleteFunc = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este funcionário?')) {
      deleteFuncMutation.mutate(id);
    }
  };

  const handldeleteCampanha = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta campanha?')) {
      deleteCampanhaMutation.mutate(id);
    }
  }

  const deleteCampanhaMutation = useMutation( 
    (id: string) => api.delete(`/ubs/campanhas/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ubs-campanhas');
        toast.success('Campanha excluída com sucesso!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao excluir campanha');
      }
    }
  );

  const openAgendamentoModal = (consulta: any) => {
    setSelectedConsulta(consulta);
    setShowAgendamentoModal(true);
  };

  const openPacienteModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setPacienteEditData({
      endereco: paciente.endereco,
      telefone: paciente.telefone
    });
    setShowPacienteModal(true);
  };

  const openHistoricoModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowHistoricoModal(true);
  };

  const openInscricoesModal = (campanha: any) => {
    setSelectedCampanha(campanha);
    setShowInscricoesModal(true);
  };

  const openAgendamentoCampanhaModal = (inscricao: any) => {
    setSelectedInscricao(inscricao);
    setShowAgendamentoCampanhaModal(true);
  };

  const openInternacaoModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowInternacaoModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">UBS Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Olá, {user?.nome}</span>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'funcionarios', label: 'Funcionários', icon: Users },
              { key: 'pacientes', label: 'Pacientes', icon: Heart },
              { key: 'campanhas', label: 'Campanhas', icon: Megaphone },
              { key: 'consultas', label: 'Consultas', icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'pacientes' && (
          <div>
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Buscar pacientes..."
                  />
                </div>
              </div>
            </div>

            {loadingPacientes ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pacientes?.map((paciente: any) => (
                  <div key={paciente.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{paciente.nome}</h3>
                        <p className="text-sm text-gray-600">CPF: {paciente.cpf}</p>
                        <p className="text-sm text-gray-600">CNS: {paciente.cns}</p>
                        <p className="text-sm text-gray-600">Telefone: {paciente.telefone}</p>
                        <p className="text-sm text-gray-600">
                          Nascimento: {format(new Date(paciente.nascimento), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openPacienteModal(paciente)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-blue-800 bg-blue-100 hover:bg-blue-200"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </button>
                        
                        <button
                          onClick={() => openHistoricoModal(paciente)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-green-800 bg-green-100 hover:bg-green-200"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          Histórico
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedPaciente(paciente);
                            setShowConsultaPacienteModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-purple-800 bg-purple-100 hover:bg-purple-200"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Consulta
                        </button>

                        <button
                          onClick={() => openInternacaoModal(paciente)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-red-800 bg-red-100 hover:bg-red-200"
                        >
                          <Building2 className="h-3 w-3 mr-1" />
                          Internação
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal de Solicitação de Internação */}
        {showInternacaoModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Solicitar Internação</h3>
              <p className="text-gray-600 mb-4">Paciente: {selectedPaciente?.nome}</p>
              
              <form onSubmit={handleInternacaoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                    <select
                      value={internacaoData.hospitalId}
                      onChange={(e) => setInternacaoData({...internacaoData, hospitalId: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Selecione um hospital</option>
                      {hospitais?.map((hospital: any) => (
                        <option key={hospital.id} value={hospital.id}>{hospital.nome}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Funcionário Responsável</label>
                    <select
                      value={internacaoData.funcionarioId}
                      onChange={(e) => setInternacaoData({...internacaoData, funcionarioId: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Selecione um funcionário</option>
                      {funcionarios?.map((func: any) => (
                        <option key={func.id} value={func.id}>{func.nome} - {func.funcao}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={internacaoData.tipo}
                      onChange={(e) => setInternacaoData({...internacaoData, tipo: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="internacao">Internação</option>
                      <option value="cirurgia">Cirurgia</option>
                      <option value="procedimento">Procedimento</option>
                      <option value="emergencia">Emergência</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <select
                      value={internacaoData.prioridade}
                      onChange={(e) => setInternacaoData({...internacaoData, prioridade: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                  <input
                    type="text"
                    value={internacaoData.motivo}
                    onChange={(e) => setInternacaoData({...internacaoData, motivo: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes</label>
                  <textarea
                    value={internacaoData.detalhes}
                    onChange={(e) => setInternacaoData({...internacaoData, detalhes: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Laudo Médico</label>
                  <textarea
                    value={internacaoData.laudoMedico}
                    onChange={(e) => setInternacaoData({...internacaoData, laudoMedico: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowInternacaoModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Solicitar Internação
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Outros modais e conteúdo das outras abas podem ser mantidos aqui */}
        {/* ... resto do código do UBSDashboard original ... */}
      </div>
    </div>
  );
};

export default UBSDashboard;

