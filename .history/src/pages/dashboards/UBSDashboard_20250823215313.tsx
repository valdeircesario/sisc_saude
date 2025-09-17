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
  X,
  Save,
  Send
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente Modal Base
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Componente Card de Funcionário
const FuncionarioCard: React.FC<{ 
  funcionario: any; 
  onEdit: (func: any) => void; 
  onDelete: (id: string) => void; 
}> = ({ funcionario, onEdit, onDelete }) => (
  <div className="border border-gray-300 rounded p-4 shadow">
    <h3 className="text-lg font-bold mb-2">{funcionario.nome}</h3>
    <p className="text-sm text-gray-600 mb-2">
      <strong>Função:</strong> {funcionario.funcao}
    </p>
    {funcionario.crm && (
      <p className="text-sm text-gray-600 mb-2">
        <strong>CRM:</strong> {funcionario.crm}
      </p>
    )}
    <p className="text-sm text-gray-600 mb-2">
      <strong>CPF:</strong> {funcionario.cpf}
    </p>
    <p className="text-sm text-gray-600 mb-2">
      <strong>Telefone:</strong> {funcionario.telefone}
    </p>
    <p className="text-sm text-gray-600 mb-4">
      <strong>Email:</strong> {funcionario.email}
    </p>
    <div className="flex space-x-2">
      <button 
        onClick={() => onEdit(funcionario)}
        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <Edit className="w-4 h-4 mr-1" /> Editar
      </button>
      <button 
        onClick={() => onDelete(funcionario.id)}
        className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
      >
        <Trash2 className="w-4 h-4 mr-1" /> Excluir
      </button>
    </div>
  </div>
);

// Componente Card de Paciente
const PacienteCard: React.FC<{ 
  paciente: any; 
  onEdit: (paciente: any) => void; 
  onHistorico: (paciente: any) => void;
  onConsulta: (paciente: any) => void;
  onInternacao: (paciente: any) => void;
}> = ({ paciente, onEdit, onHistorico, onConsulta, onInternacao }) => (
  <div className="border border-gray-300 rounded p-4 shadow">
    <h3 className="text-lg font-bold mb-2">{paciente.nome}</h3>
    <p className="text-sm text-gray-600 mb-2">
      <strong>CPF:</strong> {paciente.cpf} | <strong>CNS:</strong> {paciente.cns}
    </p>
    <p className="text-sm text-gray-600 mb-2">
      <strong>Telefone:</strong> {paciente.telefone}
    </p>
    <p className="text-sm text-gray-600 mb-2">
      <strong>Endereço:</strong> {paciente.endereco}
    </p>
    <p className="text-sm text-gray-600 mb-4">
      <strong>Nascimento:</strong> {format(new Date(paciente.nascimento), 'dd/MM/yyyy', { locale: ptBR })}
    </p>
    <div className="flex flex-wrap gap-2">
      <button 
        onClick={() => onEdit(paciente)}
        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
      >
        <Edit className="w-4 h-4 mr-1" /> Editar
      </button>
      <button 
        onClick={() => onHistorico(paciente)}
        className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
      >
        <Heart className="w-4 h-4 mr-1" /> Histórico
      </button>
      <button 
        onClick={() => onConsulta(paciente)}
        className="flex items-center px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
      >
        <Calendar className="w-4 h-4 mr-1" /> Consulta
      </button>
      <button 
        onClick={() => onInternacao(paciente)}
        className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
      >
        <Building2 className="w-4 h-4 mr-1" /> Internação
      </button>
    </div>
  </div>
);

// Componente Card de Campanha
const CampanhaCard: React.FC<{ 
  campanha: any; 
  inscricoes: any[];
  onEdit: (campanha: any) => void; 
  onDelete: (id: string) => void;
  onInscricoes: (campanha: any) => void;
}> = ({ campanha, inscricoes, onEdit, onDelete, onInscricoes }) => {
  const agendados = inscricoes?.filter(i => i.status === 'agendado').length || 0;
  const pendentes = inscricoes?.filter(i => i.status === 'inscrito').length || 0;

  return (
    <div className="border border-gray-300 rounded p-4 shadow">
      <h3 className="text-lg font-bold mb-2">{campanha.titulo}</h3>
      <p className="text-sm text-gray-600 mb-2">
        <strong>Tipo:</strong> {campanha.tipo}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        <strong>Início:</strong> {format(new Date(campanha.dataIni), 'dd/MM/yyyy', { locale: ptBR })}
        {campanha.dataFim && (
          <> | <strong>Fim:</strong> {format(new Date(campanha.dataFim), 'dd/MM/yyyy', { locale: ptBR })}</>
        )}
      </p>
      <p className="mb-2">{campanha.descricao}</p>
      <div className="mb-4">
        <div className="flex justify-between text-sm">
          <span>Total: {campanha._count.inscricoes}</span>
          <span>Agendados: {agendados}</span>
          <span>Pendentes: {pendentes}</span>
        </div>
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={() => onEdit(campanha)}
          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Edit className="w-4 h-4 mr-1" /> Editar
        </button>
        <button 
          onClick={() => onInscricoes(campanha)}
          className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Users className="w-4 h-4 mr-1" /> Inscrições
        </button>
        <button 
          onClick={() => onDelete(campanha.id)}
          className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4 mr-1" /> Excluir
        </button>
      </div>
    </div>
  );
};

// Componente Card de Consulta
const ConsultaCard: React.FC<{ 
  consulta: any; 
  onAgendar: (consulta: any) => void; 
}> = ({ consulta, onAgendar }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solicitada': return 'text-yellow-600 bg-yellow-100';
      case 'agendada': return 'text-blue-600 bg-blue-100';
      case 'realizada': return 'text-green-600 bg-green-100';
      case 'cancelada': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="border border-gray-300 rounded p-4 shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold">{consulta.paciente.nome}</h3>
        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(consulta.status)}`}>
          {consulta.status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        <strong>Especialidade:</strong> {consulta.especialidade}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        <strong>Motivo:</strong> {consulta.motivo}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        <strong>Solicitada em:</strong> {format(new Date(consulta.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
      </p>
      {consulta.dataAgendada && (
        <p className="text-sm text-gray-600 mb-2">
          <strong>Agendada para:</strong> {format(new Date(consulta.dataAgendada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
        </p>
      )}
      {consulta.funcionario && (
        <p className="text-sm text-gray-600 mb-2">
          <strong>Médico:</strong> {consulta.funcionario.nome}
        </p>
      )}
      {consulta.observacoes && (
        <p className="mb-2"><strong>Observações:</strong> {consulta.observacoes}</p>
      )}
      {consulta.status === 'solicitada' && (
        <div className="flex space-x-2">
          <button 
            onClick={() => onAgendar(consulta)}
            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Calendar className="w-4 h-4 mr-1" /> Agendar
          </button>
        </div>
      )}
    </div>
  );
};

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
    horaAgendada: '',
    localAtendimento: '',
    observacoes: ''
  });

  const [editCampanhaData, setEditCampanhaData] = useState({
    titulo: '',
    descricao: '',
    tipo: '',
    dataIni: '',
    dataFim: ''
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

  // Reset functions
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
      horaAgendada: '',
      localAtendimento: '',
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

  // Handlers
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
      dataIni: camp.dataIni.split('T')[0],
      dataFim: camp.dataFim ? camp.dataFim.split('T')[0] : ''
    });
    setShowEditCampanhaModal(true);
  };

  const handleDeleteFunc = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este funcionário?')) {
      deleteFuncMutation.mutate(id);
    }
  };

  const handleDeleteCampanha = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta campanha?')) {
      deleteCampanhaMutation.mutate(id);
    }
  };

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

        {/* Funcionários Tab */}
        {activeTab === 'funcionarios' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Funcionários</h2>
              <button 
                onClick={() => setShowFuncModal(true)} 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Novo Funcionário
              </button>
            </div>
            {loadingFuncionarios ? (
              <p>Carregando funcionários...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {funcionarios?.map((funcionario: any) => (
                  <FuncionarioCard
                    key={funcionario.id}
                    funcionario={funcionario}
                    onEdit={handleEditFunc}
                    onDelete={handleDeleteFunc}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pacientes Tab */}
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
              <p>Carregando pacientes...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pacientes?.map((paciente: any) => (
                  <PacienteCard
                    key={paciente.id}
                    paciente={paciente}
                    onEdit={openPacienteModal}
                    onHistorico={openHistoricoModal}
                    onConsulta={openConsultaPacienteModal}
                    onInternacao={openInternacaoModal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Campanhas Tab */}
        {activeTab === 'campanhas' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Campanhas</h2>
              <button 
                onClick={() => setShowCampanhaModal(true)} 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Nova Campanha
              </button>
            </div>
            {loadingCampanhas ? (
              <p>Carregando campanhas...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campanhas?.map((campanha: any) => (
                  <CampanhaCard
                    key={campanha.id}
                    campanha={campanha}
                    inscricoes={inscricoesPorCampanha[campanha.id] || []}
                    onEdit={handleEditCampanha}
                    onDelete={handleDeleteCampanha}
                    onInscricoes={openInscricoesModal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Consultas Tab */}
        {activeTab === 'consultas' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Consultas</h2>
            </div>
            {loadingConsultas ? (
              <p>Carregando consultas...</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {consultas?.map((consulta: any) => (
                  <ConsultaCard
                    key={consulta.id}
                    consulta={consulta}
                    onAgendar={openAgendamentoModal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal de Funcionário */}
        <Modal 
          isOpen={showFuncModal} 
          onClose={() => setShowFuncModal(false)} 
          title={editingItem ? 'Editar Funcionário' : 'Novo Funcionário'}
        >
          <form onSubmit={handleFuncSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-bold">Nome</label>
                <input 
                  type="text" 
                  value={funcData.nome}
                  onChange={(e) => setFuncData({...funcData, nome: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">Função</label>
                <input 
                  type="text" 
                  value={funcData.funcao}
                  onChange={(e) => setFuncData({...funcData, funcao: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-bold">CRM (opcional)</label>
                <input 
                  type="text" 
                  value={funcData.crm}
                  onChange={(e) => setFuncData({...funcData, crm: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">CPF</label>
                <input 
                  type="text" 
                  value={funcData.cpf}
                  onChange={(e) => setFuncData({...funcData, cpf: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-bold">Telefone</label>
                <input 
                  type="text" 
                  value={funcData.telefone}
                  onChange={(e) => setFuncData({...funcData, telefone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">Email</label>
                <input 
                  type="email" 
                  value={funcData.email}
                  onChange={(e) => setFuncData({...funcData, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-bold">Senha {editingItem && '(deixe em branco para manter a atual)'}</label>
              <input 
                type="password" 
                value={funcData.senha}
                onChange={(e) => setFuncData({...funcData, senha: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required={!editingItem}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowFuncModal(false)} 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {editingItem ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Campanha */}
        <Modal 
          isOpen={showCampanhaModal} 
          onClose={() => setShowCampanhaModal(false)} 
          title="Nova Campanha"
        >
          <form onSubmit={handleCampanhaSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-bold">Título</label>
              <input 
                type="text" 
                value={campanhaData.titulo}
                onChange={(e) => setCampanhaData({...campanhaData, titulo: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Descrição</label>
              <textarea 
                value={campanhaData.descricao}
                onChange={(e) => setCampanhaData({...campanhaData, descricao: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Tipo</label>
              <input 
                type="text" 
                value={campanhaData.tipo}
                onChange={(e) => setCampanhaData({...campanhaData, tipo: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-bold">Data de Início</label>
                <input 
                  type="date" 
                  value={campanhaData.dataIni}
                  onChange={(e) => setCampanhaData({...campanhaData, dataIni: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">Data de Fim (opcional)</label>
                <input 
                  type="date" 
                  value={campanhaData.dataFim}
                  onChange={(e) => setCampanhaData({...campanhaData, dataFim: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowCampanhaModal(false)} 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Criar
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Editar Campanha */}
        <Modal 
          isOpen={showEditCampanhaModal} 
          onClose={() => setShowEditCampanhaModal(false)} 
          title="Editar Campanha"
        >
          <form onSubmit={handleEditCampanhaSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-bold">Título</label>
              <input 
                type="text" 
                value={editCampanhaData.titulo}
                onChange={(e) => setEditCampanhaData({...editCampanhaData, titulo: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Descrição</label>
              <textarea 
                value={editCampanhaData.descricao}
                onChange={(e) => setEditCampanhaData({...editCampanhaData, descricao: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Tipo</label>
              <input 
                type="text" 
                value={editCampanhaData.tipo}
                onChange={(e) => setEditCampanhaData({...editCampanhaData, tipo: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-bold">Data de Início</label>
                <input 
                  type="date" 
                  value={editCampanhaData.dataIni}
                  onChange={(e) => setEditCampanhaData({...editCampanhaData, dataIni: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">Data de Fim (opcional)</label>
                <input 
                  type="date" 
                  value={editCampanhaData.dataFim}
                  onChange={(e) => setEditCampanhaData({...editCampanhaData, dataFim: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowEditCampanhaModal(false)} 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Atualizar
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Agendamento de Consulta */}
        <Modal 
          isOpen={showAgendamentoModal} 
          onClose={() => setShowAgendamentoModal(false)} 
          title="Agendar Consulta"
        >
          {selectedConsulta && (
            <div className="mb-4">
              <p><strong>Paciente:</strong> {selectedConsulta.paciente.nome}</p>
              <p><strong>Especialidade:</strong> {selectedConsulta.especialidade}</p>
              <p><strong>Motivo:</strong> {selectedConsulta.motivo}</p>
            </div>
          )}
          <form onSubmit={handleAgendamentoSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-bold">Data e Hora</label>
              <input 
                type="datetime-local" 
                value={agendamentoData.dataAgendada}
                onChange={(e) => setAgendamentoData({...agendamentoData, dataAgendada: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Funcionário</label>
              <select 
                value={agendamentoData.funcionarioId}
                onChange={(e) => setAgendamentoData({...agendamentoData, funcionarioId: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Selecione um funcionário</option>
                {funcionarios?.map((func: any) => (
                  <option key={func.id} value={func.id}>{func.nome} - {func.funcao}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-bold">Observações</label>
              <textarea 
                value={agendamentoData.observacoes}
                onChange={(e) => setAgendamentoData({...agendamentoData, observacoes: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowAgendamentoModal(false)} 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Agendar
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Editar Paciente */}
        <Modal 
          isOpen={showPacienteModal} 
          onClose={() => setShowPacienteModal(false)} 
          title="Editar Paciente"
        >
          {selectedPaciente && (
            <div className="mb-4">
              <p><strong>Nome:</strong> {selectedPaciente.nome}</p>
              <p><strong>CPF:</strong> {selectedPaciente.cpf}</p>
            </div>
          )}
          <form onSubmit={handlePacienteEditSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-bold">Endereço</label>
              <input 
                type="text" 
                value={pacienteEditData.endereco}
                onChange={(e) => setPacienteEditData({...pacienteEditData, endereco: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Telefone</label>
              <input 
                type="text" 
                value={pacienteEditData.telefone}
                onChange={(e) => setPacienteEditData({...pacienteEditData, telefone: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowPacienteModal(false)} 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Atualizar
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Histórico do Paciente */}
        <Modal 
          isOpen={showHistoricoModal} 
          onClose={() => setShowHistoricoModal(false)} 
          title={`Histórico Médico - ${selectedPaciente?.nome}`}
        >
          <div className="space-y-4">
            <h4 className="font-bold text-lg">Histórico Médico</h4>
            {historicoPaciente && historicoPaciente.length > 0 ? (
              <div className="space-y-4">
                {historicoPaciente.map((item: any) => (
                  <div key={item.id} className="border border-gray-300 rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold">{item.diagnostico}</h4>
                      <span className="text-sm text-gray-600">
                        {format(new Date(item.dataConsulta), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Médico:</strong> {item.funcionario.nome} ({item.funcionario.funcao})
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>UBS:</strong> {item.funcionario.ubs.nome}
                    </p>
                    <p className="mb-2"><strong>Laudo:</strong> {item.laudo}</p>
                    {item.doenca && <p className="mb-2"><strong>Doença:</strong> {item.doenca}</p>}
                    {item.medicacao && <p className="mb-2"><strong>Medicação:</strong> {item.medicacao}</p>}
                    {item.observacoes && <p className="mb-2"><strong>Observações:</strong> {item.observacoes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhum histórico médico encontrado.</p>
            )}

            <h4 className="font-bold text-lg mt-6">Consultas</h4>
            {consultasPaciente && consultasPaciente.length > 0 ? (
              <div className="space-y-4">
                {consultasPaciente.map((consulta: any) => (
                  <div key={consulta.id} className="border border-gray-300 rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold">{consulta.especialidade}</h4>
                      <span className="text-sm text-gray-600">
                        {format(new Date(consulta.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="mb-2"><strong>Motivo:</strong> {consulta.motivo}</p>
                    <p className="mb-2"><strong>Status:</strong> {consulta.status}</p>
                    {consulta.dataAgendada && (
                      <p className="mb-2">
                        <strong>Data Agendada:</strong> {format(new Date(consulta.dataAgendada), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    )}
                    {consulta.funcionario && (
                      <p className="mb-2"><strong>Médico:</strong> {consulta.funcionario.nome}</p>
                    )}
                    {consulta.observacoes && <p className="mb-2"><strong>Observações:</strong> {consulta.observacoes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhuma consulta encontrada.</p>
            )}
          </div>
        </Modal>

        {/* Modal de Agendar Consulta para Paciente */}
        <Modal 
          isOpen={showConsultaPacienteModal} 
          onClose={() => setShowConsultaPacienteModal(false)} 
          title="Agendar Consulta"
        >
          {selectedPaciente && (
            <div className="mb-4">
              <p><strong>Paciente:</strong> {selectedPaciente.nome}</p>
            </div>
          )}
          <form onSubmit={handleConsultaPacienteSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-bold">Especialidade</label>
              <input 
                type="text" 
                value={consultaPacienteData.especialidade}
                onChange={(e) => setConsultaPacienteData({...consultaPacienteData, especialidade: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Motivo</label>
              <input 
                type="text" 
                value={consultaPacienteData.motivo}
                onChange={(e) => setConsultaPacienteData({...consultaPacienteData, motivo: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Data e Hora</label>
              <input 
                type="datetime-local" 
                value={consultaPacienteData.dataAgendada}
                onChange={(e) => setConsultaPacienteData({...consultaPacienteData, dataAgendada: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Funcionário</label>
              <select 
                value={consultaPacienteData.funcionarioId}
                onChange={(e) => setConsultaPacienteData({...consultaPacienteData, funcionarioId: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Selecione um funcionário</option>
                {funcionarios?.map((func: any) => (
                  <option key={func.id} value={func.id}>{func.nome} - {func.funcao}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-bold">Observações</label>
              <textarea 
                value={consultaPacienteData.observacoes}
                onChange={(e) => setConsultaPacienteData({...consultaPacienteData, observacoes: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowConsultaPacienteModal(false)} 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Agendar
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Inscrições da Campanha */}
        <Modal 
          isOpen={showInscricoesModal} 
          onClose={() => setShowInscricoesModal(false)} 
          title={`Inscrições - ${selectedCampanha?.titulo}`}
        >
          {inscricoesCampanha && inscricoesCampanha.length > 0 ? (
            <div className="space-y-4">
              {inscricoesCampanha.map((inscricao: any) => (
                <div key={inscricao.id} className="border border-gray-300 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{inscricao.nome}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      inscricao.status === 'agendado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inscricao.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>CPF:</strong> {inscricao.cpf} | <strong>Telefone:</strong> {inscricao.telefone}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Email:</strong> {inscricao.email}
                  </p>
                  {inscricao.idade && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Idade:</strong> {inscricao.idade}
                    </p>
                  )}
                  {inscricao.condicoesSaude && (
                    <p className="mb-2"><strong>Condições de Saúde:</strong> {inscricao.condicoesSaude}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Prioridade:</strong> {inscricao.prioridade} | <strong>Pontuação:</strong> {inscricao.pontuacao}
                  </p>
                  {inscricao.dataAgendada && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Agendado para:</strong> {format(new Date(inscricao.dataAgendada), "dd/MM/yyyy", { locale: ptBR })}
                      {inscricao.horaAgendada && ` às ${inscricao.horaAgendada}`}
                    </p>
                  )}
                  {inscricao.localAtendimento && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Local:</strong> {inscricao.localAtendimento}
                    </p>
                  )}
                  {inscricao.observacoes && (
                    <p className="mb-2"><strong>Observações:</strong> {inscricao.observacoes}</p>
                  )}
                  {inscricao.status === 'inscrito' && (
                    <button 
                      onClick={() => openAgendamentoCampanhaModal(inscricao)}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Calendar className="w-4 h-4 mr-1" /> Agendar
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhuma inscrição encontrada.</p>
          )}
        </Modal>

        {/* Modal de Agendamento de Campanha */}
        <Modal 
          isOpen={showAgendamentoCampanhaModal} 
          onClose={() => setShowAgendamentoCampanhaModal(false)} 
          title="Agendar Atendimento"
        >
          {selectedInscricao && (
            <div className="mb-4">
              <p><strong>Inscrito:</strong> {selectedInscricao.nome}</p>
              <p><strong>Campanha:</strong> {selectedCampanha?.titulo}</p>
            </div>
          )}
          <form onSubmit={handleAgendamentoCampanhaSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-bold">Data</label>
              <input 
                type="date" 
                value={agendamentoCampanhaData.dataAgendada}
                onChange={(e) => setAgendamentoCampanhaData({...agendamentoCampanhaData, dataAgendada: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Hora</label>
              <input 
                type="time" 
                value={agendamentoCampanhaData.horaAgendada}
                onChange={(e) => setAgendamentoCampanhaData({...agendamentoCampanhaData, horaAgendada: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Local de Atendimento</label>
              <input 
                type="text" 
                value={agendamentoCampanhaData.localAtendimento}
                onChange={(e) => setAgendamentoCampanhaData({...agendamentoCampanhaData, localAtendimento: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Observações</label>
              <textarea 
                value={agendamentoCampanhaData.observacoes}
                onChange={(e) => setAgendamentoCampanhaData({...agendamentoCampanhaData, observacoes: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowAgendamentoCampanhaModal(false)} 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Agendar
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Solicitação de Internação */}
        <Modal 
          isOpen={showInternacaoModal} 
          onClose={() => setShowInternacaoModal(false)} 
          title="Solicitar Internação"
        >
          {selectedPaciente && (
            <div className="mb-4">
              <p><strong>Paciente:</strong> {selectedPaciente.nome}</p>
              <p><strong>CPF:</strong> {selectedPaciente.cpf}</p>
            </div>
          )}
          <form onSubmit={handleInternacaoSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-bold">Hospital</label>
                <select 
                  value={internacaoData.hospitalId}
                  onChange={(e) => setInternacaoData({...internacaoData, hospitalId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Selecione um hospital</option>
                  {hospitais?.map((hospitais: any) => (
                    <option key={hospitais.id} value={hospitais.id}>{hospital.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-bold">Funcionário Responsável</label>
                <select 
                  value={internacaoData.funcionarioId}
                  onChange={(e) => setInternacaoData({...internacaoData, funcionarioId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
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
                <label className="block mb-1 font-bold">Tipo</label>
                <select 
                  value={internacaoData.tipo}
                  onChange={(e) => setInternacaoData({...internacaoData, tipo: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
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
                <label className="block mb-1 font-bold">Prioridade</label>
                <select 
                  value={internacaoData.prioridade}
                  onChange={(e) => setInternacaoData({...internacaoData, prioridade: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-bold">Motivo</label>
              <input 
                type="text" 
                value={internacaoData.motivo}
                onChange={(e) => setInternacaoData({...internacaoData, motivo: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Detalhes</label>
              <textarea 
                value={internacaoData.detalhes}
                onChange={(e) => setInternacaoData({...internacaoData, detalhes: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Laudo Médico</label>
              <textarea 
                value={internacaoData.laudoMedico}
                onChange={(e) => setInternacaoData({...internacaoData, laudoMedico: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowInternacaoModal(false)} 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Solicitar Internação
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default UBSDashboard;

