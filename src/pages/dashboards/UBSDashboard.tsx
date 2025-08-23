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
  const handldeleteCampanha = (id: string) =>{
    if (window.confirm('Tem certeza que deseja deletar esta campanha?')) {
      deleteCampanhaMutation.mutate(id);
    }
  }

  //VER ESSE TRATAMENTO DE MENSAGEM
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
  

  const openConsultaPacienteModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowConsultaPacienteModal(true);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-blue-100 text-blue-800';
      case 'realizada':
        return 'bg-green-100 text-green-800';
      case 'solicitada':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmada':
        return 'bg-purple-100 text-purple-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    { name: 'Funcionários', key: 'funcionarios', icon: Users },
    { name: 'Pacientes', key: 'pacientes', icon: Heart },
    { name: 'Campanhas', key: 'campanhas', icon: Megaphone },
    { name: 'Consultas', key: 'consultas', icon: Calendar },
  ];
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel UBS</h1>
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
                            ? 'bg-blue-600 text-white'
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
            {/* Funcionários Tab */}
            {activeTab === 'funcionarios' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Funcionários</h2>
                  <button
                    onClick={() => setShowFuncModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Adicionar Funcionário</span>
                  </button>
                </div>

                {loadingFuncionarios ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Função
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            CRM
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contato
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {funcionarios?.map((func: any) => (
                          <tr key={func.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{func.nome}</div>
                              <div className="text-sm text-gray-500">{func.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {func.funcao}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {func.crm || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {func.telefone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditFunc(func)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFunc(func.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Pacientes Tab */}
            {activeTab === 'pacientes' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Pacientes Cadastrados</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Buscar por nome, CPF, CNS ou email..."
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
                      <div key={paciente.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{paciente.nome}</h3>
                          <p className="text-sm text-gray-600">CPF: {paciente.cpf}</p>
                          <p className="text-sm text-gray-600">CNS: {paciente.cns}</p>
                          <p className="text-sm text-gray-600">Telefone: {paciente.telefone}</p>
                          <p className="text-sm text-gray-600">Email: {paciente.email}</p>
                          <p className="text-sm text-gray-600">
                            Nascimento: {format(new Date(paciente.nascimento), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openPacienteModal(paciente)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Editar</span>
                          </button>
                          
                          <button
                            onClick={() => openHistoricoModal(paciente)}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            <Heart className="h-4 w-4" />
                            <span>Histórico</span>
                          </button>
                          
                          <button
                            onClick={() => openConsultaPacienteModal(paciente)}
                            className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                          >
                            <Calendar className="h-4 w-4" />
                            <span>Agendar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Campanhas Tab */}
            {activeTab === 'campanhas' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Campanhas</h2>
                  <button
                    onClick={() => setShowCampanhaModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nova Campanha</span>
                  </button>
                </div>

                {loadingCampanhas ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {campanhas?.map((campanha: any) => (
                      <div key={campanha.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {campanha.tipo}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            campanha.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {campanha.ativa ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {campanha.titulo}
                        </h3>
                        <p className="text-gray-600 mb-3">{campanha.descricao}</p>
                        <div className="text-sm text-gray-500">
                          <p>Início: {format(new Date(campanha.dataIni), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          {campanha.dataFim && (
                            <p>Fim: {format(new Date(campanha.dataFim), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{campanha._count?.inscricoes || 0}</span> inscrições
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openInscricoesModal(campanha)}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
                            >
                              Ver Inscrições
                            </button>
                            
            <button
                onClick={() => handleEditCampanha(campanha)}
        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center"
      >
        <Edit className="h-4 w-4 mr-1" />
        Editar
      </button>
      {/* Botão Excluir */}
      <button
        onClick={() => handldeleteCampanha(campanha.id)}
        className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Excluir
      </button>
                            
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Consultas Tab */}
            {activeTab === 'consultas' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Solicitações de Consulta</h2>

                {loadingConsultas ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultas?.map((consulta: any) => (
                      <div key={consulta.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{consulta.especialidade}</h3>
                            <p className="text-sm text-gray-600">{consulta.paciente.nome}</p>
                            <p className="text-sm text-gray-500">{consulta.paciente.telefone}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(consulta.status)}`}>
                              {getStatusIcon(consulta.status)}
                              <span className="ml-1 capitalize">{consulta.status}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                          <p className="text-gray-900">{consulta.motivo}</p>
                        </div>
                        
                        {consulta.dataAgendada && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Agendada</label>
                            <p className="text-gray-900">
                              {format(new Date(consulta.dataAgendada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                        )}
                        
                        {consulta.status === 'solicitada' && (
                          <div className="mt-4">
                            <button
                              onClick={() => openAgendamentoModal(consulta)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Agendar Consulta
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Funcionário */}
      {showFuncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? 'Editar' : 'Adicionar'} Funcionário
            </h3>
            
            <form onSubmit={handleFuncSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={funcData.nome}
                    onChange={(e) => setFuncData({ ...funcData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                  <select
                    value={funcData.funcao}
                    onChange={(e) => setFuncData({ ...funcData, funcao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione uma função</option>
                    <option value="Médico Clínico Geral">Médico Clínico Geral</option>
                    <option value="Enfermeiro">Enfermeiro</option>
                    <option value="Técnico em Enfermagem">Técnico em Enfermagem</option>
                    <option value="Pediatra">Pediatra</option>
                    <option value="Ginecologista">Ginecologista</option>
                    <option value="Cardiologista">Cardiologista</option>
                    <option value="Dentista">Dentista</option>
                    <option value="Otoprdista">Ortopedista</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CRM (opcional)</label>
                  <input
                    type="text"
                    value={funcData.crm}
                    onChange={(e) => setFuncData({ ...funcData, crm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CRM/SP 123456"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={funcData.cpf}
                    onChange={(e) => setFuncData({ ...funcData, cpf: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={funcData.telefone}
                    onChange={(e) => setFuncData({ ...funcData, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={funcData.email}
                    onChange={(e) => setFuncData({ ...funcData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha {editingItem && '(deixe em branco para manter a atual)'}
                </label>
                <input
                  type="password"
                  value={funcData.senha}
                  onChange={(e) => setFuncData({ ...funcData, senha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editingItem}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingItem ? 'Atualizar' : 'Cadastrar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFuncModal(false);
                    resetFuncForm();
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

      {/* Modal Campanha */}
      {showCampanhaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Campanha</h3>
            
            <form onSubmit={handleCampanhaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={campanhaData.titulo}
                  onChange={(e) => setCampanhaData({ ...campanhaData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={campanhaData.tipo}
                  onChange={(e) => setCampanhaData({ ...campanhaData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um tipo</option>
                  <option value="vacinacao">Vacinação</option>
                  <option value="consulta">Consulta</option>
                  <option value="exame">Exame</option>
                  <option value="geral">Geral</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={campanhaData.descricao}
                  onChange={(e) => setCampanhaData({ ...campanhaData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                <input
                  type="date"
                  value={campanhaData.dataIni}
                  onChange={(e) => setCampanhaData({ ...campanhaData, dataIni: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim (opcional)</label>
                <input
                  type="date"
                  value={campanhaData.dataFim}
                  onChange={(e) => setCampanhaData({ ...campanhaData, dataFim: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Criar Campanha
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCampanhaModal(false);
                    resetCampanhaForm();
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

      {/* Modal Editar Campanha */}
      {showEditCampanhaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Editar Campanha
            </h3>
            
            <form onSubmit={handleEditCampanhaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={editCampanhaData.titulo}
                  onChange={(e) => setEditCampanhaData({ ...editCampanhaData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={editCampanhaData.descricao}
                  onChange={(e) => setEditCampanhaData({ ...editCampanhaData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={editCampanhaData.tipo}
                  onChange={(e) => setEditCampanhaData({ ...editCampanhaData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um tipo</option>
                  <option value="vacinacao">Vacinação</option>
                  <option value="consulta">Consulta</option>
                  <option value="exame">Exame</option>
                  <option value="geral">Geral</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                <input
                  type="date"
                  value={editCampanhaData.dataIni}
                  onChange={(e) => setEditCampanhaData({ ...editCampanhaData, dataIni: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim (opcional)</label>
                <input
                  type="date"
                  value={editCampanhaData.dataFim}
                  onChange={(e) => setEditCampanhaData({ ...editCampanhaData, dataFim: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditCampanhaModal(false);
                    resetEditCampanhaForm();
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

      {/* Modal Agendamento */}
      {showAgendamentoModal && selectedConsulta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agendar Consulta</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Paciente: <span className="font-medium">{selectedConsulta.paciente.nome}</span></p>
              <p className="text-sm text-gray-600">Especialidade: <span className="font-medium">{selectedConsulta.especialidade}</span></p>
            </div>
            
            <form onSubmit={handleAgendamentoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
                <input
                  type="datetime-local"
                  value={agendamentoData.dataAgendada}
                  onChange={(e) => setAgendamentoData({ ...agendamentoData, dataAgendada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
                <select
                  value={agendamentoData.funcionarioId}
                  onChange={(e) => setAgendamentoData({ ...agendamentoData, funcionarioId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um profissional</option>
                  {funcionarios?.map((func: any) => (
                    <option key={func.id} value={func.id}>
                      {func.nome} - {func.funcao}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={agendamentoData.observacoes}
                  onChange={(e) => setAgendamentoData({ ...agendamentoData, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Observações sobre o agendamento..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agendar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAgendamentoModal(false);
                    setSelectedConsulta(null);
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

      {/* Modal Editar Paciente */}
      {showPacienteModal && selectedPaciente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Editar Paciente - {selectedPaciente.nome}
            </h3>
            
            <form onSubmit={handlePacienteEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  value={pacienteEditData.endereco}
                  onChange={(e) => setPacienteEditData({ ...pacienteEditData, endereco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={pacienteEditData.telefone}
                  onChange={(e) => setPacienteEditData({ ...pacienteEditData, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPacienteModal(false);
                    setSelectedPaciente(null);
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

      {/* Modal Histórico do Paciente */}
      {showHistoricoModal && selectedPaciente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Histórico Médico - {selectedPaciente.nome}
              </h3>
              <button
                onClick={() => {
                  setShowHistoricoModal(false);
                  setSelectedPaciente(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Histórico Médico */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Histórico Médico</h4>
                {historicoPaciente && historicoPaciente.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {historicoPaciente.map((item: any) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">{item.diagnostico}</h5>
                          <span className="text-xs text-gray-500">
                            {format(new Date(item.dataConsulta), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.laudo}</p>
                        <div className="text-xs text-gray-500">
                          <p>Médico: {item.funcionario.nome}</p>
                          <p>UBS: {item.funcionario.ubs.nome}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum histórico médico encontrado</p>
                )}
              </div>
              
              {/* Consultas */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Consultas</h4>
                {consultasPaciente && consultasPaciente.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {consultasPaciente.map((consulta: any) => (
                      <div key={consulta.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">{consulta.especialidade}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consulta.status)}`}>
                            {consulta.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{consulta.motivo}</p>
                        {consulta.dataAgendada && (
                          <p className="text-xs text-gray-500">
                            Data: {format(new Date(consulta.dataAgendada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        )}
                        {consulta.funcionario && (
                          <p className="text-xs text-gray-500">
                            Profissional: {consulta.funcionario.nome}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhuma consulta encontrada</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agendar Consulta para Paciente */}
      {showConsultaPacienteModal && selectedPaciente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Agendar Consulta - {selectedPaciente.nome}
            </h3>
            
            <form onSubmit={handleConsultaPacienteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                <select
                  value={consultaPacienteData.especialidade}
                  onChange={(e) => setConsultaPacienteData({ ...consultaPacienteData, especialidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma especialidade</option>
                  <option value="Clínico Geral">Clínico Geral</option>
                  <option value="Pediatria">Pediatria</option>
                  <option value="Ginecologia">Ginecologia</option>
                  <option value="Cardiologia">Cardiologia</option>
                  <option value="Dermatologia">Dermatologia</option>
                  <option value="Oftalmologia">Oftalmologia</option>
                  <option value="Ortopedia">Ortopedia</option>
                  <option value="Psicologia">Psicologia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <textarea
                  value={consultaPacienteData.motivo}
                  onChange={(e) => setConsultaPacienteData({ ...consultaPacienteData, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
                <input
                  type="datetime-local"
                  value={consultaPacienteData.dataAgendada}
                  onChange={(e) => setConsultaPacienteData({ ...consultaPacienteData, dataAgendada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
                <select
                  value={consultaPacienteData.funcionarioId}
                  onChange={(e) => setConsultaPacienteData({ ...consultaPacienteData, funcionarioId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um profissional</option>
                  {funcionarios?.map((func: any) => (
                    <option key={func.id} value={func.id}>
                      {func.nome} - {func.funcao}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={consultaPacienteData.observacoes}
                  onChange={(e) => setConsultaPacienteData({ ...consultaPacienteData, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agendar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConsultaPacienteModal(false);
                    setSelectedPaciente(null);
                    resetConsultaPacienteForm();
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

      {/* Modal Inscrições da Campanha */}
{showInscricoesModal && selectedCampanha && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Inscrições - {selectedCampanha.titulo}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Total: {inscricoesCampanha?.length || 0} inscrições
          </p>
        </div>
        {inscricoesCampanha && inscricoesCampanha.length > 0 && (
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>{inscricoesCampanha.filter((i: any) => i.gravidade === 'critico').length} Críticos</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>{inscricoesCampanha.filter((i: any) => i.gravidade === 'grave').length} Graves</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>{inscricoesCampanha.filter((i: any) => i.gravidade === 'medio').length} Médios</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>{inscricoesCampanha.filter((i: any) => i.gravidade === 'leve').length} Leves</span>
            </div>
            <div className="font-semibold">
              Total: {inscricoesCampanha.length}
            </div>
          </div>
        )}
        <button
          onClick={() => {
            setShowInscricoesModal(false);
            setSelectedCampanha(null);
          }}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          ✕
        </button>
      </div>
      
      {inscricoesCampanha && inscricoesCampanha.length > 0 ? (
        <div className="space-y-4">
          {inscricoesCampanha
            .sort((a, b) => {
              // Ordenar por prioridade (crítico primeiro)
              const prioridadeA = a.classificacaoRisco?.priority || 5;
              const prioridadeB = b.classificacaoRisco?.priority || 5;
              return prioridadeA - prioridadeB;
            })
            .map((inscricao: any) => (
            <div 
      key={inscricao.id} 
      className={`relative overflow-hidden border-l-8 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 bg-white backdrop-blur-sm ${
        inscricao.classificacaoRisco?.level === 'critico' 
          ? 'border-red-500 bg-gradient-to-br from-red-50 via-white to-red-50' 
          : inscricao.classificacaoRisco?.level === 'grave'
          ? 'border-orange-500 bg-gradient-to-br from-orange-50 via-white to-orange-50'
          : inscricao.classificacaoRisco?.level === 'medio'
          ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 via-white to-yellow-50'
          : inscricao.classificacaoRisco?.level === 'leve'
          ? 'border-green-500 bg-gradient-to-br from-green-50 via-white to-green-50'
          : 'border-gray-300 bg-gradient-to-br from-gray-50 via-white to-gray-50'
      }`}
    >
      {/* Efeito de brilho sutil para casos críticos */}
      {inscricao.classificacaoRisco?.level === 'critico' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 animate-pulse" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10 animate-ping" />
        </>
      )}

      {/* Pattern de fundo decorativo */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            {/* Nome e Badge de Gravidade Melhorados */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h4 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                  {inscricao.nome}
                </h4>
                
                {/* Badge de Classificação Redesenhado */}
                {inscricao.classificacaoRisco && (
                  <div className={`relative flex items-center px-5 py-2.5 rounded-full text-sm font-extrabold shadow-lg transform transition-all duration-200 hover:scale-110 ${
                    inscricao.classificacaoRisco.level === 'critico'
                      ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-red-300'
                      : inscricao.classificacaoRisco.level === 'grave'
                      ? 'bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 text-white shadow-orange-300'
                      : inscricao.classificacaoRisco.level === 'medio'
                      ? 'bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 text-white shadow-yellow-300'
                      : 'bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white shadow-green-300'
                  }`}>
                    
                    {/* Ring animado para críticos */}
                    {inscricao.classificacaoRisco.level === 'critico' && (
                      <div className="absolute inset-0 rounded-full ring-4 ring-red-400 animate-pulse opacity-75" />
                    )}
                    
                    <div className="relative flex items-center space-x-3">
                      <span className="text-xl filter drop-shadow-sm">
                        {inscricao.classificacaoRisco.level === 'critico' && '🚨'}
                        {inscricao.classificacaoRisco.level === 'grave' && '⚠️'}
                        {inscricao.classificacaoRisco.level === 'medio' && 'ℹ️'}
                        {inscricao.classificacaoRisco.level === 'leve' && '✅'}
                      </span>
                      <span className="uppercase tracking-widest font-black text-sm">
                        {inscricao.classificacaoRisco.level}
                      </span>
                      <div className="bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <span className="text-xs font-bold tracking-wider">#{inscricao.classificacaoRisco.priority}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Redesenhado */}
              <div className="flex flex-col items-end space-y-3">
                <span className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold shadow-lg transform transition-all duration-200 hover:scale-105 ${getStatusColor(inscricao.status)} border-2 border-white/20`}>
                  <span className="mr-2 text-lg filter drop-shadow-sm">{getStatusIcon(inscricao.status)}</span>
                  <span className="capitalize tracking-wide font-extrabold">{inscricao.status}</span>
                </span>
                
                {/* Indicador URGENTE Melhorado */}
                {inscricao.classificacaoRisco?.level === 'critico' && (
                  <div className="relative">
                    <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white px-4 py-2 rounded-full text-xs font-black shadow-xl border-2 border-white/20">
                      <div className="flex items-center space-x-2">
                        <span className="animate-pulse text-sm">🔴</span>
                        <span className="tracking-widest">URGENTE</span>
                        <span className="animate-pulse text-sm">🔴</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25" />
                    <div className="absolute inset-0 bg-red-400 rounded-full animate-pulse opacity-20" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Grid de Informações com Cards Premium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              
              {/* Card Dados Pessoais */}
              <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 p-5 rounded-xl border-2 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm" />
                  <h5 className="text-sm font-black text-blue-800 uppercase tracking-widest">Dados Pessoais</h5>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-700 font-bold uppercase tracking-wide">Idade:</span>
                    <div className={`px-3 py-2 rounded-full text-sm font-bold shadow-md ${
                      parseInt(inscricao.idade) > 80 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-200' 
                        : parseInt(inscricao.idade) >= 50 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-200' 
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-200'
                    }`}>
                      {inscricao.idade} anos
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-700 font-bold uppercase tracking-wide">CPF:</span>
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-200 shadow-sm">
                      <span className="text-sm font-mono font-medium text-gray-800">{inscricao.cpf}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card Contato */}
              <div className="bg-gradient-to-br from-purple-100 via-purple-50 to-pink-100 p-5 rounded-xl border-2 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-sm" />
                  <h5 className="text-sm font-black text-purple-800 uppercase tracking-widest">Contato</h5>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-purple-700 font-bold uppercase tracking-wide block mb-2">Telefone:</span>
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-200 shadow-sm">
                      <span className="text-sm font-medium text-gray-800 flex items-center">
                        <span className="mr-2 text-purple-600">📱</span>
                        {inscricao.telefone}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-purple-700 font-bold uppercase tracking-wide block mb-2">Email:</span>
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-200 shadow-sm">
                      <span className="text-xs font-medium text-gray-800 flex items-center truncate">
                        <span className="mr-2 text-purple-600">📧</span>
                        {inscricao.email}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card Informações Médicas */}
              <div className="bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 p-5 rounded-xl border-2 border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-sm" />
                  <h5 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Info. Médicas</h5>
                </div>
                
                <div className="space-y-4">
                  {inscricao.condicoesSaude && (
                    <div>
                      <span className="text-xs text-emerald-700 font-bold uppercase tracking-wide block mb-2">Condição:</span>
                      <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold shadow-md ${
                        ['diabetes', 'hipertensao', 'imunossuprimido', 'multiplas'].includes(inscricao.condicoesSaude)
                          ? inscricao.classificacaoRisco?.level === 'critico' 
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-200'
                            : 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-red-200'
                          : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-blue-200'
                      }`}>
                        <span className="mr-2 text-base filter drop-shadow-sm">
                          {inscricao.condicoesSaude === 'diabetes' && '🩺'}
                          {inscricao.condicoesSaude === 'hipertensao' && '💓'}
                          {inscricao.condicoesSaude === 'imunossuprimido' && '🛡️'}
                          {inscricao.condicoesSaude === 'multiplas' && '⚕️'}
                        </span>
                        <span className="capitalize tracking-wide">
                          {inscricao.condicoesSaude}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {inscricao.endereco && (
                    <div>
                      <span className="text-xs text-emerald-700 font-bold uppercase tracking-wide block mb-2">Endereço:</span>
                      <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-emerald-200 shadow-sm">
                        <p className="text-xs text-gray-700 leading-relaxed flex items-start">
                          <span className="mr-2 text-emerald-600 text-sm mt-0.5">📍</span>
                          {inscricao.endereco}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Classificação de Risco Premium */}
            {inscricao.classificacaoRisco && (
              <div className={`relative p-6 rounded-2xl shadow-inner border-2 backdrop-blur-sm mb-6 ${
                inscricao.classificacaoRisco.level === 'critico'
                  ? 'bg-gradient-to-r from-red-100 via-red-50 to-red-100 border-red-300/50'
                  : inscricao.classificacaoRisco.level === 'grave'
                  ? 'bg-gradient-to-r from-orange-100 via-orange-50 to-orange-100 border-orange-300/50'
                  : inscricao.classificacaoRisco.level === 'medio'
                  ? 'bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 border-yellow-300/50'
                  : 'bg-gradient-to-r from-green-100 via-green-50 to-green-100 border-green-300/50'
              }`}>
                
                {/* Decoração de fundo */}
                <div className="absolute inset-0 opacity-10">
                  <div className="w-full h-full rounded-2xl" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '20px 20px'
                  }} />
                </div>
                
                <div className="relative flex items-center space-x-6">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-4 border-white/50 ${
                    inscricao.classificacaoRisco.level === 'critico' ? 'bg-gradient-to-br from-red-500 to-red-700' :
                    inscricao.classificacaoRisco.level === 'grave' ? 'bg-gradient-to-br from-orange-500 to-orange-700' :
                    inscricao.classificacaoRisco.level === 'medio' ? 'bg-gradient-to-br from-yellow-500 to-yellow-700' :
                    'bg-gradient-to-br from-green-500 to-green-700'
                  }`}>
                    <span className="text-white text-2xl font-bold filter drop-shadow-lg">
                      {inscricao.classificacaoRisco.level === 'critico' && '🚨'}
                      {inscricao.classificacaoRisco.level === 'grave' && '⚠️'}
                      {inscricao.classificacaoRisco.level === 'medio' && 'ℹ️'}
                      {inscricao.classificacaoRisco.level === 'leve' && '✅'}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="text-base font-black text-gray-700 uppercase tracking-widest">
                        Avaliação de Risco:
                      </span>
                      <span className={`text-xl font-black uppercase tracking-wider px-4 py-1 rounded-full ${
                        inscricao.classificacaoRisco.level === 'critico' ? 'text-red-700 bg-red-200/80' :
                        inscricao.classificacaoRisco.level === 'grave' ? 'text-orange-700 bg-orange-200/80' :
                        inscricao.classificacaoRisco.level === 'medio' ? 'text-yellow-700 bg-yellow-200/80' :
                        'text-green-700 bg-green-200/80'
                      }`}>
                        {inscricao.classificacaoRisco.level}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed font-medium ${
                      inscricao.classificacaoRisco.level === 'critico' ? 'text-red-800' :
                      inscricao.classificacaoRisco.level === 'grave' ? 'text-orange-800' :
                      inscricao.classificacaoRisco.level === 'medio' ? 'text-yellow-800' :
                      'text-green-800'
                    }`}>
                      {inscricao.classificacaoRisco.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Agendada Premium */}
        {inscricao.dataAgendada && (
          <div className="mb-6 p-5 bg-gradient-to-r from-blue-100 via-blue-50 to-indigo-100 border-2 border-blue-200/50 rounded-xl shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl filter drop-shadow-sm">📅</span>
              </div>
              <div>
                <span className="text-sm font-black text-blue-700 uppercase tracking-wider block">Agendado para:</span>
                <span className="text-lg font-bold text-blue-900">
                  {format(new Date(inscricao.dataAgendada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Observações Premium */}
        {inscricao.observacoes && (
          <div className="mb-6 p-5 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl border-l-4 border-gray-400 shadow-lg backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white text-lg filter drop-shadow-sm">💬</span>
              </div>
              <div className="flex-1">
                <span className="text-sm font-black text-gray-600 uppercase tracking-wider block mb-2">Observações:</span>
                <p className="text-sm text-gray-800 leading-relaxed font-medium">{inscricao.observacoes}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer Premium */}
        <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200/50">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            <span className="font-medium">Inscrito em:</span>
            <span className="font-bold text-gray-700">
              {format(new Date(inscricao.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
          
          {inscricao.status === 'inscrito' && (
            <button
              onClick={() => openAgendamentoCampanhaModal(inscricao)}
              className={`relative px-6 py-3 text-white rounded-xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-white/20 ${
                inscricao.classificacaoRisco?.level === 'critico'
                  ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900'
                  : inscricao.classificacaoRisco?.level === 'grave'
                  ? 'bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 hover:from-orange-700 hover:via-orange-800 hover:to-orange-900'
                  : inscricao.classificacaoRisco?.level === 'medio'
                  ? 'bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 hover:from-yellow-700 hover:via-yellow-800 hover:to-yellow-900'
                  : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900'
              } ${inscricao.classificacaoRisco?.level === 'critico' ? 'animate-pulse' : ''}`}
            >
              {inscricao.classificacaoRisco?.level === 'critico' && (
                <div className="absolute inset-0 bg-red-400 rounded-xl animate-ping opacity-25" />
              )}
              
              <div className="relative flex items-center space-x-2">
                {inscricao.classificacaoRisco?.level === 'critico' && (
                  <span className="text-lg filter drop-shadow-sm">🚨</span>
                )}
                <span className="tracking-wide">Agendar Atendimento</span>
                {inscricao.classificacaoRisco?.level === 'critico' && (
                  <span className="text-xs font-black uppercase bg-black/20 px-2 py-1 rounded-full">(URGENTE)</span>
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
          ))}

          
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 text-8xl mb-6">📋</div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">Nenhuma inscrição encontrada</h4>
          <p className="text-gray-500">
            Esta campanha ainda não possui inscrições cadastradas.
          </p>
        </div>
      )}
    </div>
  </div>
)}

      {/* Modal Agendar Atendimento da Campanha */}
{showAgendamentoCampanhaModal && selectedInscricao && (
  <div 
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
    onClick={(e) => {
      // Fecha o modal se clicar no backdrop
      if (e.target === e.currentTarget) {
        setShowAgendamentoCampanhaModal(false);
        setSelectedInscricao(null);
        resetAgendamentoCampanhaForm();
      }
    }}
  >
    {/* Efeitos decorativos de fundo - CORES MAIS LEVES */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-indigo-100/30" />
    <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/20 rounded-full blur-xl animate-pulse" />
    <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200/20 rounded-full blur-xl animate-pulse delay-1000" />

    <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden transform transition-all duration-500 animate-in slide-in-from-bottom-4 scale-in-95 border border-gray-100 flex flex-col">
      
      {/* Borda decorativa superior - COR MAIS LEVE */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300 rounded-full shadow-sm" />
      
      {/* Header Premium - CORES MAIS LEVES */}
      <div className="relative overflow-hidden flex-shrink-0">
        {/* Background gradiente mais suave */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400" />
        <div className="absolute inset-0 opacity-15">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.8'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>
        
        <div className="relative flex items-center justify-between p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
              <span className="text-2xl filter drop-shadow-sm">📅</span>
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-wide">
                Agendar Atendimento
              </h3>
              <p className="text-blue-50 text-sm font-medium opacity-90">
                Defina data e horário para o paciente
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setShowAgendamentoCampanhaModal(false);
              setSelectedInscricao(null);
              resetAgendamentoCampanhaForm();
            }}
            className="p-3 hover:bg-white/15 rounded-full transition-all duration-200 transform hover:scale-105 backdrop-blur-sm border border-white/15"
            aria-label="Fechar modal"
          >
            <svg className="w-6 h-6 text-white filter drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Conteúdo do Modal com scroll */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
        {/* Informações do Inscrito - CORES MAIS LEVES */}
        <div className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-25 via-indigo-25 to-purple-25 rounded-2xl" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/30 rounded-full -translate-y-5 translate-x-5" />
          
          <div className="relative p-6 border border-blue-100/60 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full shadow-sm" />
              <h4 className="text-base font-bold text-gray-700 uppercase tracking-wide">Dados do Paciente</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 bg-white/90 backdrop-blur-sm rounded-xl border border-blue-50 shadow-sm">
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Nome:</span>
                <span className="text-sm font-semibold text-gray-700">{selectedInscricao.nome}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/90 backdrop-blur-sm rounded-xl border border-blue-50 shadow-sm">
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">CPF:</span>
                <span className="text-sm font-mono font-semibold text-gray-700">{selectedInscricao.cpf}</span>
              </div>
              
              {/* Classificação de risco - CORES MAIS LEVES */}
              {selectedInscricao.classificacaoRisco && (
                <div className="flex items-center justify-between p-3 bg-white/90 backdrop-blur-sm rounded-xl border border-blue-50 shadow-sm">
                  <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Prioridade:</span>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    selectedInscricao.classificacaoRisco.level === 'critico'
                      ? 'bg-gradient-to-r from-red-300 to-red-400 text-red-800 shadow-red-100'
                      : selectedInscricao.classificacaoRisco.level === 'grave'
                      ? 'bg-gradient-to-r from-orange-300 to-orange-400 text-orange-800 shadow-orange-100'
                      : selectedInscricao.classificacaoRisco.level === 'medio'
                      ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-800 shadow-yellow-100'
                      : 'bg-gradient-to-r from-green-300 to-green-400 text-green-800 shadow-green-100'
                  }`}>
                    {selectedInscricao.classificacaoRisco.level}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Formulário Premium */}
        <form onSubmit={handleAgendamentoCampanhaSubmit} className="space-y-6">
          {/* Campo Data e Hora - CORES MAIS LEVES */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-base font-bold text-gray-700 uppercase tracking-wide">
              <span className="w-2 h-2 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full" />
              <span>Data e Hora do Atendimento</span>
              <span className="text-red-400 ml-1 text-lg">*</span>
            </label>
            
            <div className="relative">
              <input
                type="datetime-local"
                id="datetime-input"
                value={agendamentoCampanhaData.dataAgendada}
                onChange={(e) => setAgendamentoCampanhaData({ 
                  ...agendamentoCampanhaData, 
                  dataAgendada: e.target.value 
                })}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-5 py-4 pr-12 border-2 border-gray-150 rounded-xl focus:ring-4 focus:ring-blue-200/40 focus:border-blue-300 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium text-gray-700 text-base"
                required
                aria-describedby="data-help"
              />
              
              <button
                type="button"
                onClick={() => document.getElementById('datetime-input').showPicker()}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-500 transition-colors duration-200 p-1 rounded-md hover:bg-blue-25"
                aria-label="Abrir calendário"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            <div className="bg-blue-25 border border-blue-100 rounded-lg p-3">
              <p id="data-help" className="text-sm text-blue-600 font-medium flex items-center">
                <span className="w-4 h-4 bg-blue-300 rounded-full mr-2 flex items-center justify-center">
                  <span className="text-white text-xs">ℹ️</span>
                </span>
                Selecione a data e horário para o atendimento do paciente. Clique no ícone do calendário para abrir o seletor.
              </p>
            </div>
          </div>
          
          {/* Campo Observações - CORES MAIS LEVES */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-base font-bold text-gray-700 uppercase tracking-wide">
              <span className="w-2 h-2 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full" />
              <span>Observações</span>
            </label>
            
            <div className="relative">
              <textarea
                value={agendamentoCampanhaData.observacoes}
                onChange={(e) => setAgendamentoCampanhaData({ 
                  ...agendamentoCampanhaData, 
                  observacoes: e.target.value 
                })}
                className="w-full px-5 py-4 border-2 border-gray-150 rounded-xl focus:ring-4 focus:ring-purple-200/40 focus:border-purple-300 transition-all duration-300 resize-none bg-white shadow-sm hover:shadow-md font-medium text-gray-700"
                rows={4}
                placeholder="Digite observações relevantes sobre o agendamento..."
                maxLength={500}
                aria-describedby="obs-help"
              />
              
              <div className="absolute right-4 top-4 text-purple-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="bg-purple-25 border border-purple-100 rounded-lg p-2 flex-1 mr-3">
                <p id="obs-help" className="text-sm text-purple-600 font-medium flex items-center">
                  <span className="w-4 h-4 bg-purple-300 rounded-full mr-2 flex items-center justify-center">
                    <span className="text-white text-xs">💬</span>
                  </span>
                  Informações adicionais (opcional)
                </p>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                (agendamentoCampanhaData.observacoes?.length || 0) > 400 
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}>
                {agendamentoCampanhaData.observacoes?.length || 0}/500
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer com Botões - VALIDAÇÃO IMPLEMENTADA */}
      <div className="relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-25 via-gray-50 to-gray-25" />
        
        <div className="relative flex gap-4 p-8 rounded-b-3xl">
          <button
            type="button"
            onClick={() => {
              setShowAgendamentoCampanhaModal(false);
              setSelectedInscricao(null);
              resetAgendamentoCampanhaForm();
            }}
            className="flex-1 px-6 py-4 text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-25 hover:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-102 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>❌</span>
              <span>Cancelar</span>
            </div>
          </button>
          
          {/* BOTÃO COM VALIDAÇÃO - SÓ ATIVO SE DATA PREENCHIDA */}
          <button
            type="submit"
            form="agendamento-form"
            onClick={handleAgendamentoCampanhaSubmit}
            disabled={!agendamentoCampanhaData.dataAgendada}
            className={`flex-1 px-6 py-4 text-white rounded-xl focus:ring-4 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform relative overflow-hidden ${
              !agendamentoCampanhaData.dataAgendada
                ? 'bg-gray-300 cursor-not-allowed opacity-60'
                : selectedInscricao.classificacaoRisco?.level === 'critico'
                ? 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:from-red-500 hover:via-red-600 hover:to-red-700 focus:ring-red-300 hover:scale-102'
                : selectedInscricao.classificacaoRisco?.level === 'grave'
                ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 hover:from-orange-500 hover:via-orange-600 hover:to-orange-700 focus:ring-orange-300 hover:scale-102'
                : 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 focus:ring-blue-300 hover:scale-102'
            }`}
          >
            {/* Efeito de pulso para casos críticos - MAIS LEVE */}
            {selectedInscricao.classificacaoRisco?.level === 'critico' && agendamentoCampanhaData.dataAgendada && (
              <div className="absolute inset-0 bg-red-200 animate-pulse opacity-30" />
            )}
            
            <div className="relative flex items-center justify-center space-x-2">
              {!agendamentoCampanhaData.dataAgendada ? (
                <>
                  <span>⏳</span>
                  <span>Preencha a Data</span>
                </>
              ) : selectedInscricao.classificacaoRisco?.level === 'critico' ? (
                <>
                  <span className="text-lg filter drop-shadow-sm animate-pulse">🚨</span>
                  <span>Agendar URGENTE</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>Confirmar Agendamento</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default UBSDashboard;

function setEditCampanhaData(arg0: { titulo: any; descricao: any; tipo: any; dataIni: any; dataFim: any; }) {
  throw new Error('Function not implemented.');
}
