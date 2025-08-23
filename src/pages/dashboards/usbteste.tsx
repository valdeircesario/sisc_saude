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
  Heart,
  Activity,
  TrendingUp,
  Filter,
  Download,
  Eye,
  X
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

  const [editCampanhaData, setEditCampanhaData] = useState({
    titulo: '',
    descricao: '',
    tipo: '',
    dataIni: '',
    dataFim: ''
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

  const handleEditCampanhaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCampanha) {
      updateCampanhaMutation.mutate({
        id: editingCampanha.id,
        data: editCampanhaData
      });
    }
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

  const openConsultaPacienteModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowConsultaPacienteModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300';
      case 'realizada':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300';
      case 'solicitada':
        return 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300';
      case 'confirmada':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300';
      case 'cancelada':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300';
      case 'inscrito':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'realizada':
        return <CheckCircle className="h-4 w-4" />;
      case 'agendada':
        return <Clock className="h-4 w-4" />;
      case 'solicitada':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const navigation = [
    { name: 'Funcionários', key: 'funcionarios', icon: Users, color: 'from-blue-500 to-blue-600' },
    { name: 'Pacientes', key: 'pacientes', icon: Heart, color: 'from-rose-500 to-rose-600' },
    { name: 'Campanhas', key: 'campanhas', icon: Megaphone, color: 'from-purple-500 to-purple-600' },
    { name: 'Consultas', key: 'consultas', icon: Calendar, color: 'from-emerald-500 to-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  UBS Dashboard
                </h1>
                <p className="text-sm text-gray-600 font-medium">Sistema de Gestão da Unidade Básica de Saúde</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="hidden md:flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.nome?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.nome}</p>
                  <p className="text-xs text-gray-600">{user?.funcao}</p>
                </div>
              </div>
              
              <motion.button
                onClick={logout}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-gray-200/50">
            <nav className="flex space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <motion.button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex-1 justify-center ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                    }`}
                    whileHover={{ scale: isActive ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Funcionários Tab */}
          {activeTab === 'funcionarios' && (
            <div className="space-y-6">
              {/* Header with Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Gestão de Funcionários
                    </h2>
                    <p className="text-gray-600 mt-1">Gerencie a equipe da unidade de saúde</p>
                  </div>
                  <motion.button
                    onClick={() => setShowFuncModal(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="h-5 w-5" />
                    <span>Novo Funcionário</span>
                  </motion.button>
                </div>
              </div>

              {/* Funcionários Grid */}
              {loadingFuncionarios ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {funcionarios?.map((func: any, index: number) => (
                    <motion.div
                      key={func.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {func.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{func.nome}</h3>
                            <p className="text-blue-600 font-semibold text-sm">{func.funcao}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <motion.button
                            onClick={() => handleEditFunc(func)}
                            className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteFunc(func.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        {func.crm && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">CRM:</span>
                            <span className="font-medium text-gray-900">{func.crm}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Email:</span>
                          <span className="font-medium text-gray-900 truncate">{func.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Telefone:</span>
                          <span className="font-medium text-gray-900">{func.telefone}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pacientes Tab */}
          {activeTab === 'pacientes' && (
            <div className="space-y-6">
              {/* Header with Search */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                      Gestão de Pacientes
                    </h2>
                    <p className="text-gray-600 mt-1">Consulte e gerencie informações dos pacientes</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Buscar pacientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-lg w-80"
                    />
                  </div>
                </div>
              </div>

              {/* Pacientes Grid */}
              {loadingPacientes ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pacientes?.map((paciente: any, index: number) => (
                    <motion.div
                      key={paciente.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Heart className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{paciente.nome}</h3>
                            <p className="text-rose-600 font-semibold text-sm">
                              {format(new Date(paciente.nascimento || paciente.dataNascimento), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <motion.button
                            onClick={() => openPacienteModal(paciente)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => openHistoricoModal(paciente)}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => openConsultaPacienteModal(paciente)}
                            className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Calendar className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">CPF:</span>
                          <span className="font-medium text-gray-900">{paciente.cpf}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Telefone:</span>
                          <span className="font-medium text-gray-900">{paciente.telefone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Endereço:</span>
                          <span className="font-medium text-gray-900 truncate">{paciente.endereco}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Campanhas Tab */}
          {activeTab === 'campanhas' && (
            <div className="space-y-6">
              {/* Header with Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                      Campanhas de Saúde
                    </h2>
                    <p className="text-gray-600 mt-1">Gerencie campanhas e programas de prevenção</p>
                  </div>
                  <motion.button
                    onClick={() => setShowCampanhaModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="h-5 w-5" />
                    <span>Nova Campanha</span>
                  </motion.button>
                </div>
              </div>

              {/* Campanhas Grid */}
              {loadingCampanhas ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {campanhas?.map((campanha: any, index: number) => (
                    <motion.div
                      key={campanha.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Megaphone className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">{campanha.titulo}</h3>
                            <span className="inline-block bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold border border-purple-200">
                              {campanha.tipo}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <motion.button
                            onClick={() => handleEditCampanha(campanha)}
                            className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => openInscricoesModal(campanha)}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Users className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handldeleteCampanha(campanha.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{campanha.descricao}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                          <p className="text-xs text-blue-600 font-semibold">Início</p>
                          <p className="text-sm font-bold text-blue-800">
                            {format(new Date(campanha.dataIni), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-xl border border-red-200">
                          <p className="text-xs text-red-600 font-semibold">Fim</p>
                          <p className="text-sm font-bold text-red-800">
                            {format(new Date(campanha.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold text-gray-700">
                            {campanha._count?.inscricoes || 0} inscrições
                          </span>
                        </div>
                        {inscricoesPorCampanha[campanha.id] && (
                          <div className="text-xs text-gray-500">
                            {inscricoesPorCampanha[campanha.id].filter((i: any) => i.status === 'agendada').length} agendadas
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Consultas Tab */}
          {activeTab === 'consultas' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    Gestão de Consultas
                  </h2>
                  <p className="text-gray-600 mt-1">Acompanhe e gerencie as consultas médicas</p>
                </div>
              </div>

              {/* Consultas List */}
              {loadingConsultas ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {consultas?.map((consulta: any, index: number) => (
                    <motion.div
                      key={consulta.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{consulta.paciente.nome}</h3>
                            <p className="text-emerald-600 font-semibold">{consulta.especialidade}</p>
                            <p className="text-gray-600 text-sm">{consulta.motivo}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-semibold text-sm ${getStatusColor(consulta.status)}`}>
                            {getStatusIcon(consulta.status)}
                            <span className="capitalize">{consulta.status}</span>
                          </div>
                          
                          {consulta.status === 'solicitada' && (
                            <motion.button
                              onClick={() => openAgendamentoModal(consulta)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Clock className="h-4 w-4" />
                              <span>Agendar</span>
                            </motion.button>
                          )}
                          
                          {consulta.dataAgendada && (
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {format(new Date(consulta.dataAgendada), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                              <p className="text-xs text-gray-600">
                                {format(new Date(consulta.dataAgendada), 'HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {consulta.funcionario && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Profissional:</span>
                            <span className="text-sm font-semibold text-gray-900">{consulta.funcionario.nome}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>


      {/* Modal Funcionário */}
      {showFuncModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowFuncModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {editingItem ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h3>
              <motion.button
                onClick={() => setShowFuncModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6 text-gray-500" />
              </motion.button>
            </div>
            
            <form onSubmit={handleFuncSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={funcData.nome}
                    onChange={(e) => setFuncData({...funcData, nome: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Função</label>
                  <select
                    value={funcData.funcao}
                    onChange={(e) => setFuncData({...funcData, funcao: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Selecione a função</option>
                    <option value="Médico Clínico Geral">Médico Clínico Geral</option>
                    <option value="Enfermeiro">Enfermeiro</option>
                    <option value="Técnico em Enfermagem">Técnico em Enfermagem</option>
                    <option value="Pediatra">Pediatra</option>
                    <option value="Ginecologista">Ginecologista</option>
                    <option value="Cardiologista">Cardiologista</option>
                    <option value="Dentista">Dentista</option>
                    <option value="Ortopedista">Ortopedista</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CRM (opcional)</label>
                  <input
                    type="text"
                    value={funcData.crm}
                    onChange={(e) => setFuncData({...funcData, crm: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
                  <input
                    type="text"
                    value={funcData.cpf}
                    onChange={(e) => setFuncData({...funcData, cpf: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={funcData.telefone}
                    onChange={(e) => setFuncData({...funcData, telefone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={funcData.email}
                    onChange={(e) => setFuncData({...funcData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              {!editingItem && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
                  <input
                    type="password"
                    value={funcData.senha}
                    onChange={(e) => setFuncData({...funcData, senha: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              )}
              
              <div className="flex space-x-4 pt-6">
                <motion.button
                  type="button"
                  onClick={() => setShowFuncModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {editingItem ? 'Atualizar' : 'Cadastrar'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Campanha */}
      {showCampanhaModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowCampanhaModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Nova Campanha
              </h3>
              <motion.button
                onClick={() => setShowCampanhaModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6 text-gray-500" />
              </motion.button>
            </div>
            
            <form onSubmit={handleCampanhaSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título da Campanha</label>
                <input
                  type="text"
                  value={campanhaData.titulo}
                  onChange={(e) => setCampanhaData({...campanhaData, titulo: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={campanhaData.descricao}
                  onChange={(e) => setCampanhaData({...campanhaData, descricao: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Campanha</label>
                <select
                  value={campanhaData.tipo}
                  onChange={(e) => setCampanhaData({...campanhaData, tipo: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="vacinacao">Vacinação</option>
                  <option value="prevencao">Prevenção</option>
                  <option value="exames">Exames</option>
                  <option value="educacao">Educação em Saúde</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Início</label>
                  <input
                    type="date"
                    value={campanhaData.dataIni}
                    onChange={(e) => setCampanhaData({...campanhaData, dataIni: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Fim</label>
                  <input
                    type="date"
                    value={campanhaData.dataFim}
                    onChange={(e) => setCampanhaData({...campanhaData, dataFim: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 pt-6">
                <motion.button
                  type="button"
                  onClick={() => setShowCampanhaModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Criar Campanha
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Editar Campanha */}
      {showEditCampanhaModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowEditCampanhaModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Editar Campanha
              </h3>
              <motion.button
                onClick={() => setShowEditCampanhaModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6 text-gray-500" />
              </motion.button>
            </div>
            
            <form onSubmit={handleEditCampanhaSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título da Campanha</label>
                <input
                  type="text"
                  value={editCampanhaData.titulo}
                  onChange={(e) => setEditCampanhaData({...editCampanhaData, titulo: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={editCampanhaData.descricao}
                  onChange={(e) => setEditCampanhaData({...editCampanhaData, descricao: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Campanha</label>
                <select
                  value={editCampanhaData.tipo}
                  onChange={(e) => setEditCampanhaData({...editCampanhaData, tipo: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="vacinacao">Vacinação</option>
                  <option value="prevencao">Prevenção</option>
                  <option value="exames">Exames</option>
                  <option value="educacao">Educação em Saúde</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Início</label>
                  <input
                    type="date"
                    value={editCampanhaData.dataIni}
                    onChange={(e) => setEditCampanhaData({...editCampanhaData, dataIni: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Fim</label>
                  <input
                    type="date"
                    value={editCampanhaData.dataFim}
                    onChange={(e) => setEditCampanhaData({...editCampanhaData, dataFim: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 pt-6">
                <motion.button
                  type="button"
                  onClick={() => setShowEditCampanhaModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Atualizar Campanha
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Agendamento */}
      {showAgendamentoModal && selectedConsulta && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowAgendamentoModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Agendar Consulta
              </h3>
              <motion.button
                onClick={() => setShowAgendamentoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6 text-gray-500" />
              </motion.button>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl mb-6 border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-2">Detalhes da Consulta</h4>
              <p className="text-emerald-700"><strong>Paciente:</strong> {selectedConsulta.paciente.nome}</p>
              <p className="text-emerald-700"><strong>Especialidade:</strong> {selectedConsulta.especialidade}</p>
              <p className="text-emerald-700"><strong>Motivo:</strong> {selectedConsulta.motivo}</p>
            </div>
            
            <form onSubmit={handleAgendamentoSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data e Hora do Agendamento</label>
                <input
                  type="datetime-local"
                  value={agendamentoData.dataAgendada}
                  onChange={(e) => setAgendamentoData({...agendamentoData, dataAgendada: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profissional Responsável</label>
                <select
                  value={agendamentoData.funcionarioId}
                  onChange={(e) => setAgendamentoData({...agendamentoData, funcionarioId: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Selecione o profissional</option>
                  {funcionarios?.filter((f: any) => 
                    f.funcao.toLowerCase().includes('médico') || 
                    f.funcao.toLowerCase().includes('medico') ||
                    f.funcao.toLowerCase().includes('pediatra') ||
                    f.funcao.toLowerCase().includes('ginecologista') ||
                    f.funcao.toLowerCase().includes('cardiologista') ||
                    f.funcao.toLowerCase().includes('dentista') ||
                    f.funcao.toLowerCase().includes('ortopedista')
                  ).map((func: any) => (
                    <option key={func.id} value={func.id}>{func.nome} - {func.funcao}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observações</label>
                <textarea
                  value={agendamentoData.observacoes}
                  onChange={(e) => setAgendamentoData({...agendamentoData, observacoes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="flex space-x-4 pt-6">
                <motion.button
                  type="button"
                  onClick={() => setShowAgendamentoModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Confirmar Agendamento
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Editar Paciente */}
      {showPacienteModal && selectedPaciente && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowPacienteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Editar Paciente
              </h3>
              <motion.button
                onClick={() => setShowPacienteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6 text-gray-500" />
              </motion.button>
            </div>
            
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-xl mb-6 border border-rose-200">
              <h4 className="font-semibold text-rose-800 mb-2">Informações do Paciente</h4>
              <p className="text-rose-700"><strong>Nome:</strong> {selectedPaciente.nome}</p>
              <p className="text-rose-700"><strong>CPF:</strong> {selectedPaciente.cpf}</p>
              <p className="text-rose-700"><strong>Data de Nascimento:</strong> {format(new Date(selectedPaciente.nascimento || selectedPaciente.dataNascimento), 'dd/MM/yyyy', { locale: ptBR })}</p>
            </div>
            
            <form onSubmit={handlePacienteEditSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Endereço</label>
                <input
                  type="text"
                  value={pacienteEditData.endereco}
                  onChange={(e) => setPacienteEditData({...pacienteEditData, endereco: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                <input
                  type="text"
                  value={pacienteEditData.telefone}
                  onChange={(e) => setPacienteEditData({...pacienteEditData, telefone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div className="flex space-x-4 pt-6">
                <motion.button
                  type="button"
                  onClick={() => setShowPacienteModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Atualizar Paciente
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Histórico do Paciente */}
      {showHistoricoModal && selectedPaciente && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowHistoricoModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Histórico do Paciente
              </h3>
              <motion.button
                onClick={() => setShowHistoricoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6 text-gray-500" />
              </motion.button>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-6 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Informações do Paciente</h4>
              <p className="text-blue-700"><strong>Nome:</strong> {selectedPaciente.nome}</p>
              <p className="text-blue-700"><strong>CPF:</strong> {selectedPaciente.cpf}</p>
              <p className="text-blue-700"><strong>Data de Nascimento:</strong> {format(new Date(selectedPaciente.nascimento || selectedPaciente.dataNascimento), 'dd/MM/yyyy', { locale: ptBR })}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Histórico Médico */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Histórico Médico
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {historicoPaciente?.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900">{item.tipo}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(item.data), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{item.descricao}</p>
                      {item.profissional && (
                        <p className="text-xs text-gray-500 mt-1">
                          Profissional: {item.profissional}
                        </p>
                      )}
                    </div>
                  ))}
                  {(!historicoPaciente || historicoPaciente.length === 0) && (
                    <p className="text-gray-500 text-center py-8">Nenhum histórico médico encontrado</p>
                  )}
                </div>
              </div>
              
              {/* Consultas */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                  Consultas
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {consultasPaciente?.map((consulta: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900">{consulta.especialidade}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(consulta.status)}`}>
                          {consulta.status}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{consulta.motivo}</p>
                      {consulta.dataAgendada && (
                        <p className="text-xs text-gray-500">
                          Agendada para: {format(new Date(consulta.dataAgendada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      )}
                      {consulta.funcionario && (
                        <p className="text-xs text-gray-500">
                          Profissional: {consulta.funcionario.nome}
                        </p>
                      )}
                    </div>
                  ))}
                  {(!consultasPaciente || consultasPaciente.length === 0) && (
                    <p className="text-gray-500 text-center py-8">Nenhuma consulta encontrada</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Inscrições da Campanha */}
      {showInscricoesModal && selectedCampanha && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowInscricoesModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Inscrições da Campanha
              </h3>
              <motion.button
                onClick={() => setShowInscricoesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6 text-gray-500" />
              </motion.button>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl mb-6 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Detalhes da Campanha</h4>
              <p className="text-purple-700"><strong>Título:</strong> {selectedCampanha.titulo}</p>
              <p className="text-purple-700"><strong>Tipo:</strong> {selectedCampanha.tipo}</p>
              <p className="text-purple-700"><strong>Período:</strong> {format(new Date(selectedCampanha.dataIni), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(selectedCampanha.dataFim), 'dd/MM/yyyy', { locale: ptBR })}</p>
            </div>
            
            <div className="space-y-4">
              {inscricoesCampanha?.map((inscricao: any, index: number) => (
                <motion.div
                  key={inscricao.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {inscricao.paciente.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">{inscricao.paciente.nome}</h5>
                        <p className="text-sm text-gray-600">{inscricao.paciente.cpf}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(inscricao.status)}`}>
                        {inscricao.status}
                      </span>
                      
                      {inscricao.status === 'inscrito' && (
                        <motion.button
                          onClick={() => openAgendamentoCampanhaModal(inscricao)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Clock className="h-4 w-4" />
                          <span>Agendar</span>
                        </motion.button>
                      )}
                      
                      {inscricao.dataAgendada && (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {format(new Date(inscricao.dataAgendada), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                          <p className="text-xs text-gray-600">
                            {format(new Date(inscricao.dataAgendada), 'HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {inscricao.observacoes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Observações:</strong> {inscricao.observacoes}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {(!inscricoesCampanha || inscricoesCampanha.length === 0) && (
                <p className="text-gray-500 text-center py-8">Nenhuma inscrição encontrada para esta campanha</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Agendar Consulta para Paciente */}
      {showConsultaPacienteModal && selectedPaciente && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowConsultaPacienteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Agendar Consulta
              </h3>
              <motion.button
                onClick={() => setShowConsultaPacienteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6 text-gray-500" />
              </motion.button>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl mb-6 border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-2">Paciente</h4>
              <p className="text-emerald-700"><strong>Nome:</strong> {selectedPaciente.nome}</p>
              <p className="text-emerald-700"><strong>CPF:</strong> {selectedPaciente.cpf}</p>
            </div>
            
            <form onSubmit={handleConsultaPacienteSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Especialidade</label>
                <select
                  value={consultaPacienteData.especialidade}
                  onChange={(e) => setConsultaPacienteData({...consultaPacienteData, especialidade: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Selecione a especialidade</option>
                  <option value="Clínica Geral">Clínica Geral</option>
                  <option value="Pediatria">Pediatria</option>
                  <option value="Ginecologia">Ginecologia</option>
                  <option value="Cardiologia">Cardiologia</option>
                  <option value="Dermatologia">Dermatologia</option>
                  <option value="Ortopedia">Ortopedia</option>
                  <option value="Odontologia">Odontologia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo da Consulta</label>
                <textarea
                  value={consultaPacienteData.motivo}
                  onChange={(e) => setConsultaPacienteData({...consultaPacienteData, motivo: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data e Hora Preferida</label>
                <input
                  type="datetime-local"
                  value={consultaPacienteData.dataAgendada}
                  onChange={(e) => setConsultaPacienteData({...consultaPacienteData, dataAgendada: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profissional (opcional)</label>
                <select
                  value={consultaPacienteData.funcionarioId}
                  onChange={(e) => setConsultaPacienteData({...consultaPacienteData, funcionarioId: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Selecione o profissional (opcional)</option>
                  {funcionarios?.filter((f: any) => 
                    f.funcao.toLowerCase().includes('médico') || 
                    f.funcao.toLowerCase().includes('medico') ||
                    f.funcao.toLowerCase().includes('pediatra') ||
                    f.funcao.toLowerCase().includes('ginecologista') ||
                    f.funcao.toLowerCase().includes('cardiologista') ||
                    f.funcao.toLowerCase().includes('dentista') ||
                    f.funcao.toLowerCase().includes('ortopedista')
                  ).map((func: any) => (
                    <option key={func.id} value={func.id}>{func.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observações</label>
                <textarea
                  value={consultaPacienteData.observacoes}
                  onChange={(e) => setConsultaPacienteData({...consultaPacienteData, observacoes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="flex space-x-4 pt-6">
                <motion.button
                  type="button"
                  onClick={() => setShowConsultaPacienteModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Agendar Consulta
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Agendar Atendimento da Campanha */}
      {showAgendamentoCampanhaModal && selectedInscricao && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowAgendamentoCampanhaModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Agendar Atendimento
              </h3>
              <motion.button
                onClick={() => setShowAgendamentoCampanhaModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6 text-gray-500" />
              </motion.button>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl mb-6 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Detalhes da Inscrição</h4>
              <p className="text-purple-700"><strong>Paciente:</strong> {selectedInscricao.paciente.nome}</p>
              <p className="text-purple-700"><strong>CPF:</strong> {selectedInscricao.paciente.cpf}</p>
              <p className="text-purple-700"><strong>Campanha:</strong> {selectedCampanha?.titulo}</p>
            </div>
            
            <form onSubmit={handleAgendamentoCampanhaSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data e Hora do Atendimento</label>
                <input
                  type="datetime-local"
                  value={agendamentoCampanhaData.dataAgendada}
                  onChange={(e) => setAgendamentoCampanhaData({...agendamentoCampanhaData, dataAgendada: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observações</label>
                <textarea
                  value={agendamentoCampanhaData.observacoes}
                  onChange={(e) => setAgendamentoCampanhaData({...agendamentoCampanhaData, observacoes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="flex space-x-4 pt-6">
                <motion.button
                  type="button"
                  onClick={() => setShowAgendamentoCampanhaModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Confirmar Agendamento
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default UBSDashboard;

