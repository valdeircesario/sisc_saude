import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Calendar,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart,
  FileText,
  Stethoscope,
  Pill,
  TestTube,
  Menu,
  X,
  Eye,
  Check,
  XCircle,
  UserPlus,
  ClipboardList,
  Activity,
  Home,
  Filter,
  MapPin,
  Syringe,
  ClipboardCheck,
  FlaskConical
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipagem básica para uma solicitação de internação
interface SolicitacaoInternacao {
  id: string;
  status: 'pendente' | 'avaliando' | 'agendado' | 'realizado' | 'cancelado';
  prioridade: 'gravissimo' | 'urgente' | 'grave' | 'medio' | 'leve';
  paciente: { id: string; nome: string; cpf: string; cns: string };
  ubs: { nome: string };
  funcionario: { nome: string; funcao: string };
  tipo: string;
  motivo: string;
  detalhes: string;
  laudoMedico: string;
  observacoes?: string;
  createdAt: string;
  dataAgendada?: string;
  horaAgendada?: string;
  local?: string;
}

interface MedicacaoAdministrada {
  id: string;
  nomeMedicacao: string;
  dosagem?: string;
  viaAdministracao?: string;
  dataHoraAdministracao: string;
  observacoes?: string;
  administradorNomeOuCrm?: string;
}

interface SolicitacaoExameInternacao {
  id: string;
  tipoExame: string;
  dataSolicitacao: string;
  status: string;
  observacoes?: string;
  laboratorio?: { nome: string };
  dataResultado?: string;
  resultado?: string;
  arquivoPdf?: string;
}

interface AltaHospitalar {
  id: string;
  dataAlta: string;
  tipoAlta: string;
  condicaoAlta: string;
  diagnosticoFinal: string;
  orientacoesAlta: string;
  medicacoesPrescritas?: string;
  retornoAgendado?: string;
  observacoes?: string;
  medicoResponsavel: string;
}

// Tipagem para internações
interface Internacao {
  id: string;
  paciente: {
    id: string;
    nome: string;
    cpf: string;
    cns: string;
    telefone?: string;
    email?: string;
    nascimento?: string;
    endereco?: string;
  };
  motivoInternacao: string;
  dataEntrada: string;
  dataSaida?: string;
  quarto: string;
  leito: string;
  medicoResponsavelNome: string;
  diagnosticoInicial?: string;
  diagnosticoFinal?: string;
  observacoes?: string;
  status: string;
  solicitacaoInternacao?: {
    motivo: string;
    tipo: string;
    prioridade: string;
  };
  medicacoesAdministradas?: MedicacaoAdministrada[];
  solicitacoesExameInternacao?: SolicitacaoExameInternacao[];
  altaHospitalar?: AltaHospitalar;
}

// Tipagem para medicação (para o formulário)
interface MedicacaoForm {
  pacienteId?: string;
  internacaoId?: string;
  nomeMedicacao: string;
  dosagem?: string;
  viaAdministracao?: string;
  dataHoraAdministracao: string;
  observacoes?: string;
  administradorNomeOuCrm?: string;
}

// Tipagem para solicitação de exame (para o formulário)
interface ExameForm {
  tipoExame: string;
  observacoes?: string;
  laboratorioId: string;
}

// Tipagem para alta (para o formulário)
interface AltaForm {
  medicoResponsavel: string;
  dataAlta: string;
  tipoAlta: string;
  condicaoAlta: string;
  diagnosticoFinal: string;
  orientacoesAlta: string;
  medicacoesPrescritas?: string;
  retornoAgendado?: string;
  observacoes?: string;
}

interface Laboratorio {
  id: string;
  nome: string;
}

interface Funcionario {
  id: string;
  nome: string;
  funcao: string;
}

const HOSPDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('solicitacoes');
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SolicitacaoInternacao | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [prioridadeFilter, setPrioridadeFilter] = useState('');

  // Estados para internações
  const [searchInternacoes, setSearchInternacoes] = useState('');
  const [showDetalhesInternacao, setShowDetalhesInternacao] = useState(false);
  const [selectedInternacao, setSelectedInternacao] = useState<Internacao | null>(null);

  // Estados para modais de funcionalidades da internação
  const [showMedicacaoModal, setShowMedicacaoModal] = useState(false);
  const [showObservacaoModal, setShowObservacaoModal] = useState(false); // Restaurado
  const [showExameModal, setShowExameModal] = useState(false);
  const [showAltaModal, setShowAltaModal] = useState(false);

  const [agendamentoData, setAgendamentoData] = useState({
    dataAgendada: '',
    horaAgendada: '',
    local: '',
    recomendacoes: '',
    observacoes: ''
  });

  const [statusData, setStatusData] = useState({
    status: '',
    observacoes: ''
  });

  // Estados para medicação
  const [medicacaoData, setMedicacaoData] = useState<MedicacaoForm>({
    nomeMedicacao: '',
    dosagem: '',
    viaAdministracao: '',
    dataHoraAdministracao: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
    observacoes: '',
    administradorNomeOuCrm: ''
  });

  // Estados para observação (restaurado)
  const [observacaoData, setObservacaoData] = useState('');

  // Estados para exame
  const [exameData, setExameData] = useState<ExameForm>({
    tipoExame: '',
    observacoes: '',
    laboratorioId: ''
  });

  // Estados para alta
  const [altaData, setAltaData] = useState<AltaForm>({
    medicoResponsavel: '',
    dataAlta: format(new Date(), 'yyyy-MM-dd'),
    tipoAlta: '',
    condicaoAlta: '',
    diagnosticoFinal: '',
    orientacoesAlta: '',
    medicacoesPrescritas: '',
    retornoAgendado: ''
  });

  // Estados para dados auxiliares
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  // Funções de reset de formulário
  const resetAgendamentoForm = useCallback(() => {
    setAgendamentoData({
      dataAgendada: '',
      horaAgendada: '',
      local: '',
      recomendacoes: '',
      observacoes: ''
    });
  }, []);

  const resetStatusForm = useCallback(() => {
    setStatusData({
      status: '',
      observacoes: ''
    });
  }, []);

  const resetMedicacaoForm = useCallback(() => {
    setMedicacaoData({
      nomeMedicacao: '',
      dosagem: '',
      viaAdministracao: '',
      dataHoraAdministracao: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
      observacoes: '',
      administradorNomeOuCrm: ''
    });
  }, []);

  const resetObservacaoForm = useCallback(() => { // Restaurado
    setObservacaoData('');
  }, []);

  const resetExameForm = useCallback(() => {
    setExameData({
      tipoExame: '',
      observacoes: '',
      laboratorioId: ''
    });
  }, []);

  const resetAltaForm = useCallback(() => {
    setAltaData({
      medicoResponsavel: '',
      dataAlta: format(new Date(), 'yyyy-MM-dd'),
      tipoAlta: '',
      condicaoAlta: '',
      diagnosticoFinal: '',
      orientacoesAlta: '',
      medicacoesPrescritas: '',
      retornoAgendado: ''
    });
  }, []);

  // Queries
  const { data: pacientes, isLoading: loadingPacientes } = useQuery(
    ['hospital-pacientes', searchTerm],
    () => api.get(`/hospital/pacientes?busca=${searchTerm}`).then(res => res.data),
    { enabled: activeTab === 'pacientes' }
  );

  const { data: solicitacoes, isLoading: loadingSolicitacoes } = useQuery<SolicitacaoInternacao[]>(
    ['hospital-solicitacoes-internacao', statusFilter, prioridadeFilter],
    async () => {
      let url = '/hospital/solicitacoes-internacao';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (prioridadeFilter) params.append('prioridade', prioridadeFilter);
      if (params.toString()) url += `?${params.toString()}`;
      const response = await api.get(url);
      return response.data;
    },
    { enabled: activeTab === 'solicitacoes' }
  );

  const { data: solicitacoesExames, isLoading: loadingSolicitacoesExames } = useQuery(
    'hospital-solicitacoes-exames',
    () => api.get('/hospital/solicitacoes-exames').then(res => res.data),
    { enabled: activeTab === 'exames' }
  );

  const { data: medicacoes, isLoading: loadingMedicacoes } = useQuery(
    'hospital-medicacoes',
    () => api.get('/hospital/medicacoes').then(res => res.data),
    { enabled: activeTab === 'medicacoes' }
  );

  const { data: agendamentos, isLoading: loadingAgendamentos } = useQuery(
    'hospital-agendamentos',
    () => api.get('/hospital/agendamentos').then(res => res.data),
    { enabled: activeTab === 'agendamentos' }
  );

  // Query para internações com busca
  const { data: internacoes, isLoading: loadingInternacoes } = useQuery<Internacao[]>(
    ['hospital-internacoes', searchInternacoes],
    () => api.get(`/hospital/internacoes?busca=${searchInternacoes}`).then(res => res.data),
    { enabled: activeTab === 'internacoes' }
  );

  // Query para detalhes da internação (incluindo medicações, exames e alta)
  const { data: detalhesInternacao, isLoading: loadingDetalhes } = useQuery<Internacao>(
    ['internacao-detalhes', selectedInternacao?.id],
    async () => {
      const response = await api.get(`/hospital/internacoes/${selectedInternacao?.id}`);
      return response.data;
    },
    { enabled: !!selectedInternacao?.id && showDetalhesInternacao }
  );

  // Query para laboratórios (para o modal de solicitação de exame)
  const { data: labsData } = useQuery<Laboratorio[]>(
    'laboratorios',
    () => api.get('/hospital/laboratorios').then(res => res.data),
    { enabled: showExameModal }
  );

  useEffect(() => {
    if (labsData) {
      setLaboratorios(labsData);
    }
  }, [labsData]);

  // Função genérica para lidar com sucesso de mutações
  const handleMutationSuccess = useCallback((message: string, resetForm?: () => void) => {
    queryClient.invalidateQueries('hospital-solicitacoes-internacao');
    queryClient.invalidateQueries('hospital-internacoes');
    queryClient.invalidateQueries(['internacao-detalhes', selectedInternacao?.id]);
    // queryClient.invalidateQueries(['internacao-medicacoes', selectedInternacao?.id]); // Removido, pois os dados de medicação são incluídos em 'internacao-detalhes'
    // queryClient.invalidateQueries(['internacao-solicitacoes-exame', selectedInternacao?.id]); // Removido, pois os dados de exame são incluídos em 'internacao-detalhes'
    toast.success(message);
    setSelectedItem(null);
    if (resetForm) resetForm();
  }, [queryClient, selectedInternacao?.id]);

  // Função genérica para lidar com erro de mutações
  const handleMutationError = useCallback((error: any, defaultMessage: string) => {
    toast.error(error.response?.data?.message || defaultMessage);
  }, []);

  // Mutations existentes
  const atualizarStatusMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => api.put(`/hospital/solicitacoes-internacao/${id}/status`, data),
    {
      onSuccess: () => handleMutationSuccess('Status atualizado com sucesso!', resetStatusForm),
      onError: (error) => handleMutationError(error, 'Erro ao atualizar status')
    }
  );

  const aceitarSolicitacaoMutation = useMutation(
    ({ id, observacoes }: { id: string; observacoes?: string }) =>
      api.put(`/hospital/solicitacoes-internacao/${id}/aceitar`, { observacoes }),
    {
      onSuccess: () => handleMutationSuccess('Solicitação aceita com sucesso!'),
      onError: (error) => handleMutationError(error, 'Erro ao aceitar solicitação')
    }
  );

  const rejeitarSolicitacaoMutation = useMutation(
    ({ id, observacoes }: { id: string; observacoes: string }) =>
      api.put(`/hospital/solicitacoes-internacao/${id}/rejeitar`, { observacoes }),
    {
      onSuccess: () => handleMutationSuccess('Solicitação rejeitada!'),
      onError: (error) => handleMutationError(error, 'Erro ao rejeitar solicitação')
    }
  );

  const agendarInternacaoMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => api.put(`/hospital/solicitacoes-internacao/${id}/agendar`, data),
    {
      onSuccess: () => handleMutationSuccess('Internação agendada com sucesso!', resetAgendamentoForm),
      onError: (error) => handleMutationError(error, 'Erro ao agendar internação')
    }
  );

  // ===== ESTADOS RELACIONADOS À INTERNAÇÃO =====
  const [showInternacaoModal, setShowInternacaoModal] = useState(false);
  const [internacaoData, setInternacaoData] = useState({
    dataEntrada: '',
    motivoInternacao: '',
    diagnosticoInicial: '',
    medicoResponsavelNome: '',
    quarto: '',
    leito: '',
    observacoes: ''
  });

  // ===== MUTATION PARA CRIAR INTERNAÇÃO =====
  const criarInternacaoMutation = useMutation(
    async (data: any) => {
      const response = await api.post('/hospital/internacoes', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        handleMutationSuccess('Internação criada com sucesso!', resetInternacaoForm);
        setShowInternacaoModal(false);
      },
      onError: (error: any) => {
        let errorMessage = 'Erro ao criar internação';
        if (error.response?.status === 400) {
          errorMessage = error.response.data?.message || 'Dados inválidos fornecidos';
        } else if (error.response?.status === 404) {
          errorMessage = 'Solicitação de internação não encontrada';
        } else if (error.response?.status === 401) {
          errorMessage = 'Não autorizado. Faça login novamente';
        } else if (error.response?.status === 500) {
          errorMessage = `Erro interno do servidor: ${error.response.data?.message || 'Verifique os logs do servidor'}`;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        toast.error(errorMessage);
      }
    }
  );

  // Novas mutations para funcionalidades das internações
  const adicionarMedicacaoMutation = useMutation(
    async (data: MedicacaoForm) => {
      if (!selectedInternacao?.id) throw new Error('Internação não selecionada.');
      const response = await api.post(`/hospital/internacoes/${selectedInternacao.id}/medicacao`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        handleMutationSuccess('Medicação administrada com sucesso!', resetMedicacaoForm);
        setShowMedicacaoModal(false);
      },
      onError: (error) => handleMutationError(error, 'Erro ao administrar medicação')
    }
  );

  const adicionarObservacaoInternacaoMutation = useMutation(
    async ({ id, observacoes }: { id: string; observacoes: string }) => {
      const response = await api.put(`/hospital/internacoes/${id}/observacao`, { observacoes });
      return response.data;
    },
    {
      onSuccess: () => {
        handleMutationSuccess('Observação adicionada com sucesso!', resetObservacaoForm);
        setShowObservacaoModal(false);
      },
      onError: (error) => handleMutationError(error, 'Erro ao adicionar observação')
    }
  );

  const solicitarExameInternacaoMutation = useMutation(
    async (data: ExameForm) => {
      if (!selectedInternacao?.id) throw new Error('Internação não selecionada.');
      const response = await api.post(`/hospital/internacoes/${selectedInternacao.id}/solicitar-exame`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        handleMutationSuccess('Exame solicitado com sucesso!', resetExameForm);
        setShowExameModal(false);
      },
      onError: (error) => handleMutationError(error, 'Erro ao solicitar exame')
    }
  );

  const darAltaMutation = useMutation(
    async (data: AltaForm) => {
      if (!selectedInternacao?.id) throw new Error('Internação não selecionada.');
      const response = await api.post(`/hospital/internacoes/${selectedInternacao.id}/alta`, {
        ...data,
        pacienteId: selectedInternacao.paciente.id,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        handleMutationSuccess('Alta realizada com sucesso!', resetAltaForm);
        setShowAltaModal(false);
        setShowDetalhesInternacao(false);
      },
      onError: (error) => handleMutationError(error, 'Erro ao dar alta')
    }
  );

  // ===== FUNÇÃO PARA RESETAR O FORMULÁRIO DE INTERNAÇÃO =====
  const resetInternacaoForm = useCallback(() => {
    setInternacaoData({
      dataEntrada: '',
      motivoInternacao: '',
      diagnosticoInicial: '',
      medicoResponsavelNome: '',
      quarto: '',
      leito: '',
      observacoes: ''
    });
  }, []);

  // Função genérica para abrir modais
  const openModal = useCallback((modalSetter: React.Dispatch<React.SetStateAction<boolean>>, item: SolicitacaoInternacao) => {
    setSelectedItem(item);
    modalSetter(true);
  }, []);

  const openInternacaoModal = useCallback((solicitacao: SolicitacaoInternacao) => {
    if (!solicitacao || !solicitacao.paciente || !solicitacao.id || !user) {
      toast.error('Dados insuficientes para iniciar internação.');
      return;
    }
    setSelectedItem(solicitacao);
    setInternacaoData(prevData => ({
      ...prevData,
      dataEntrada: format(new Date(), 'yyyy-MM-dd'),
      motivoInternacao: solicitacao.motivo || '',
      diagnosticoInicial: solicitacao.laudoMedico || ''
    }));
    setShowInternacaoModal(true);
  }, [user]);

  // Função para abrir detalhes da internação
  const openDetalhesInternacao = useCallback((internacao: Internacao) => {
    setSelectedInternacao(internacao);
    setShowDetalhesInternacao(true);
  }, []);

  // ===== FUNÇÃO PARA SUBMETER O FORMULÁRIO DE INTERNAÇÃO =====
  const handleInternacaoSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !user) {
      toast.error('Erro: Solicitação ou usuário não definidos.');
      return;
    }

    const hospitalId = user?.hospitalId || user?.id;
    if (!hospitalId) {
      toast.error('ID do hospital não encontrado. Faça login novamente.');
      return;
    }

    const camposObrigatorios = [
      { campo: 'dataEntrada', nome: 'Data de Entrada' },
      { campo: 'motivoInternacao', nome: 'Motivo da Internação' },
      { campo: 'diagnosticoInicial', nome: 'Diagnóstico Inicial' },
      { campo: 'medicoResponsavelNome', nome: 'Médico Responsável' },
      { campo: 'quarto', nome: 'Quarto' },
      { campo: 'leito', nome: 'Leito' }
    ];

    for (const { campo, nome } of camposObrigatorios) {
      if (!internacaoData[campo as keyof typeof internacaoData] || String(internacaoData[campo as keyof typeof internacaoData]).trim() === '') {
        toast.error(`Campo obrigatório não preenchido: ${nome}`);
        return;
      }
    }

    const dataEntrada = new Date(internacaoData.dataEntrada);
    if (isNaN(dataEntrada.getTime())) {
      toast.error('Data de entrada inválida');
      return;
    }

    const dataParaEnvio = {
      solicitacaoInternacaoId: selectedItem.id,
      pacienteId: selectedItem.paciente.id,
      hospitalId: hospitalId,
      dataEntrada: dataEntrada.toISOString(),
      motivoInternacao: internacaoData.motivoInternacao.trim(),
      diagnosticoInicial: internacaoData.diagnosticoInicial.trim(),
      medicoResponsavelNome: internacaoData.medicoResponsavelNome.trim(),
      quarto: internacaoData.quarto.trim(),
      leito: internacaoData.leito.trim(),
      observacoes: internacaoData.observacoes?.trim() || null
    };

    criarInternacaoMutation.mutate(dataParaEnvio);
  }, [selectedItem, user, internacaoData, criarInternacaoMutation]);

  // Handlers para as novas funcionalidades
  const handleMedicacaoSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternacao || !user) return;

    const camposObrigatorios = [
      { campo: 'nomeMedicacao', nome: 'Nome da Medicação' },
      { campo: 'dataHoraAdministracao', nome: 'Data e Hora da Administração' },
      { campo: 'administradorNomeOuCrm', nome: 'Administrador' }

    ];

    for (const { campo, nome } of camposObrigatorios) {
      if (!medicacaoData[campo as keyof typeof medicacaoData] || String(medicacaoData[campo as keyof typeof medicacaoData]).trim() === '') {
        toast.error(`Campo obrigatório não preenchido: ${nome}`);
        return;
      }
    }

    const dataParaEnvio: MedicacaoForm = {
      pacienteId: selectedInternacao.paciente.id,
      internacaoId: selectedInternacao.id,
      nomeMedicacao: medicacaoData.nomeMedicacao.trim(),
      dosagem: medicacaoData.dosagem?.trim() || null,
      viaAdministracao: medicacaoData.viaAdministracao?.trim() || null,
      dataHoraAdministracao: new Date(medicacaoData.dataHoraAdministracao).toISOString(),
      administradorNomeOuCrm: medicacaoData.administradorNomeOuCrm.trim(),
      observacoes: medicacaoData.observacoes?.trim() || null
    };

    adicionarMedicacaoMutation.mutate(dataParaEnvio);
  }, [selectedInternacao, medicacaoData, adicionarMedicacaoMutation, user]);

  const handleObservacaoInternacaoSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternacao || !observacaoData.trim()) {
      toast.error('A observação não pode estar vazia.');
      return;
    }

    adicionarObservacaoInternacaoMutation.mutate({
      id: selectedInternacao.id,
      observacoes: observacaoData.trim()
    });
  }, [selectedInternacao, observacaoData, adicionarObservacaoInternacaoMutation]);

  const handleExameSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternacao || !user) return;

    const camposObrigatorios = [
      { campo: 'tipoExame', nome: 'Tipo de Exame' },
      { campo: 'laboratorioId', nome: 'Laboratório' }
    ];

    for (const { campo, nome } of camposObrigatorios) {
      if (!exameData[campo as keyof typeof exameData] || String(exameData[campo as keyof typeof exameData]).trim() === '') {
        toast.error(`Campo obrigatório não preenchido: ${nome}`);
        return;
      }
    }

    const dataParaEnvio: ExameForm = {
      pacienteId: selectedInternacao.paciente.id,
      internacaoId: selectedInternacao.id,
      laboratorioId: exameData.laboratorioId,
      tipoExame: exameData.tipoExame.trim(),
      observacoes: exameData.observacoes?.trim() || null
    };

    solicitarExameInternacaoMutation.mutate(dataParaEnvio);
  }, [selectedInternacao, exameData, solicitarExameInternacaoMutation, user]);

  const handleAltaSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternacao || !user) return;

    const camposObrigatorios = [
      { campo: 'medicoResponsavel', nome: 'Médico Responsável pela Alta' },
      { campo: 'dataAlta', nome: 'Data da Alta' },
      { campo: 'tipoAlta', nome: 'Tipo de Alta' },
      { campo: 'condicaoAlta', nome: 'Condição de Alta' },
      { campo: 'diagnosticoFinal', nome: 'Diagnóstico Final' },
      { campo: 'orientacoesAlta', nome: 'Orientações de Alta' }
    ];

    for (const { campo, nome } of camposObrigatorios) {
      if (!altaData[campo as keyof typeof altaData] || String(altaData[campo as keyof typeof altaData]).trim() === '') {
        toast.error(`Campo obrigatório não preenchido: ${nome}`);
        return;
      }
    }

    const dataParaEnvio: AltaForm = {
      medicoResponsavel: altaData.medicoResponsavel.trim(),
      dataAlta: new Date(altaData.dataAlta).toISOString(),
      tipoAlta: altaData.tipoAlta.trim(),
      condicaoAlta: altaData.condicaoAlta.trim(),
      diagnosticoFinal: altaData.diagnosticoFinal.trim(),
      orientacoesAlta: altaData.orientacoesAlta.trim(),
      medicacoesPrescritas: altaData.medicacoesPrescritas?.trim() || null,
      retornoAgendado: altaData.retornoAgendado ? new Date(altaData.retornoAgendado).toISOString() : null,
      observacoes: altaData.observacoes?.trim() || null
    };

    darAltaMutation.mutate(dataParaEnvio);
  }, [selectedInternacao, altaData, darAltaMutation, user]);

  const handleAceitarSolicitacao = useCallback((solicitacao: SolicitacaoInternacao) => {
    const observacoes = prompt('Observações (opcional):');
    aceitarSolicitacaoMutation.mutate({
      id: solicitacao.id,
      observacoes: observacoes || undefined
    });
  }, [aceitarSolicitacaoMutation]);

  const handleRejeitarSolicitacao = useCallback((solicitacao: SolicitacaoInternacao) => {
    const observacoes = prompt('Motivo da rejeição (obrigatório):');
    if (observacoes && observacoes.trim()) {
      rejeitarSolicitacaoMutation.mutate({
        id: solicitacao.id,
        observacoes
      });
    } else {
      toast.error('Motivo da rejeição é obrigatório');
    }
  }, [rejeitarSolicitacaoMutation]);

  const handleAgendamentoSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (!agendamentoData.dataAgendada || !agendamentoData.horaAgendada) {
      toast.error('Data e hora são obrigatórias para o agendamento.');
      return;
    }

    agendarInternacaoMutation.mutate({
      id: selectedItem.id,
      data: {
        dataAgendada: agendamentoData.dataAgendada,
        horaAgendada: agendamentoData.horaAgendada,
        local: agendamentoData.local,
        recomendacoes: agendamentoData.recomendacoes,
        observacoes: agendamentoData.observacoes,
        status: 'agendado'
      }
    });
  }, [selectedItem, agendamentoData, agendarInternacaoMutation]);

  const handleStatusSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (!statusData.status) {
      toast.error('Selecione um novo status.');
      return;
    }

    atualizarStatusMutation.mutate({
      id: selectedItem.id,
      data: {
        status: statusData.status,
        observacoes: statusData.observacoes
      }
    });
    setShowStatusModal(false);
  }, [selectedItem, statusData, atualizarStatusMutation]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pendente': return 'text-yellow-600 bg-yellow-100';
      case 'avaliando': return 'text-blue-600 bg-blue-100';
      case 'agendado': return 'text-purple-600 bg-purple-100';
      case 'realizado': return 'text-green-600 bg-green-100';
      case 'cancelado': return 'text-red-600 bg-red-100';
      case 'ativa': return 'text-emerald-600 bg-emerald-100';
      case 'alta': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getPrioridadeColor = useCallback((prioridade: string) => {
    switch (prioridade) {
      case 'gravissimo': return 'text-red-800 bg-red-200';
      case 'urgente': return 'text-red-600 bg-red-100';
      case 'grave': return 'text-orange-600 bg-orange-100';
      case 'medio': return 'text-yellow-600 bg-yellow-100';
      case 'leve': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <motion.div
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white shadow-xl flex flex-col border-r border-gray-200"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          {isSidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Hospital</h1>
                <p className="text-xs text-gray-500">Sistema de Gestão</p>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="focus:outline-none hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-2">
            {[
              { id: 'solicitacoes', icon: FileText, label: 'Solicitações', color: 'text-blue-600' },
              { id: 'internacoes', icon: Building2, label: 'Internações', color: 'text-emerald-600' },
              { id: 'agendamentos', icon: Calendar, label: 'Agendamentos', color: 'text-purple-600' },
              { id: 'exames', icon: TestTube, label: 'Exames', color: 'text-orange-600' },
              { id: 'medicacoes', icon: Pill, label: 'Medicações', color: 'text-pink-600' },
              { id: 'pacientes', icon: Users, label: 'Pacientes', color: 'text-indigo-600' }
            ].map(({ id, icon: Icon, label, color }) => (
              <li key={id}>
                <button
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center p-3 rounded-xl hover:bg-gray-50 w-full text-left transition-all duration-200 group ${
                    activeTab === id ? 'bg-red-50 text-red-700 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${activeTab === id ? 'text-red-600' : color} group-hover:scale-110 transition-transform`} />
                  {isSidebarOpen && <span className="font-medium">{label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center p-3 rounded-xl hover:bg-red-50 w-full focus:outline-none transition-colors group"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-600 group-hover:scale-110 transition-transform" />
            {isSidebarOpen && <span className="font-medium">Sair</span>}
          </button>
          {isSidebarOpen && user && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500">Logado como:</p>
              <p className="font-semibold text-gray-900 truncate">{user.nome}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-8">
          {/* Solicitações de Internação */}
          {activeTab === 'solicitacoes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Solicitações de Internação</h2>
                  <p className="text-gray-600 mt-1">Gerencie as solicitações recebidas das UBS</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm"
                  >
                    <option value="">Todos os status</option>
                    <option value="pendente">Pendente</option>
                    <option value="avaliando">Avaliando</option>
                    <option value="agendado">Agendado</option>
                    <option value="realizado">Realizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                  <select
                    value={prioridadeFilter}
                    onChange={(e) => setPrioridadeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm"
                  >
                    <option value="">Todas as prioridades</option>
                    <option value="gravissimo">Gravíssimo</option>
                    <option value="urgente">Urgente</option>
                    <option value="grave">Grave</option>
                    <option value="medio">Médio</option>
                    <option value="leve">Leve</option>
                  </select>
                </div>
              </div>

              {loadingSolicitacoes ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Carregando solicitações...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence>
                    {solicitacoes?.map((solicitacao) => (
                      <motion.div
                        key={solicitacao.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold text-gray-900">{solicitacao.paciente.nome}</h3>
                            <p className="text-sm text-gray-600">CPF: {solicitacao.paciente.cpf} | CNS: {solicitacao.paciente.cns}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>Solicitado em: {format(new Date(solicitacao.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(solicitacao.status)}`}>
                              {solicitacao.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPrioridadeColor(solicitacao.prioridade)}`}>
                              {solicitacao.prioridade}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                          <div className="space-y-3">
                            <div>
                              <p className="font-semibold text-gray-700 flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                                UBS:
                              </p>
                              <p className="text-gray-600 ml-6">{solicitacao.ubs.nome}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 flex items-center">
                                <Stethoscope className="w-4 h-4 mr-2 text-green-500" />
                                Médico Solicitante:
                              </p>
                              <p className="text-gray-600 ml-6">{solicitacao.funcionario.nome} ({solicitacao.funcionario.funcao})</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700">Tipo:</p>
                              <p className="text-gray-600">{solicitacao.tipo}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="font-semibold text-gray-700">Motivo:</p>
                              <p className="text-gray-600">{solicitacao.motivo}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700">Detalhes:</p>
                              <p className="text-gray-600">{solicitacao.detalhes}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700">Laudo Médico:</p>
                              <p className="text-gray-600">{solicitacao.laudoMedico}</p>
                            </div>
                          </div>
                          {(solicitacao.observacoes || solicitacao.dataAgendada) && (
                            <div className="md:col-span-2 space-y-3">
                              {solicitacao.observacoes && (
                                <div>
                                  <p className="font-semibold text-gray-700">Observações:</p>
                                  <p className="text-gray-600">{solicitacao.observacoes}</p>
                                </div>
                              )}
                              {solicitacao.dataAgendada && (
                                <div>
                                  <p className="font-semibold text-gray-700">Agendamento:</p>
                                  <p className="text-gray-600">
                                    {format(new Date(solicitacao.dataAgendada), 'dd/MM/yyyy', { locale: ptBR })}
                                    {solicitacao.horaAgendada && ` às ${solicitacao.horaAgendada}`}
                                    {solicitacao.local && ` em ${solicitacao.local}`}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end space-x-3 mt-4">
                          {solicitacao.status === 'pendente' && (
                            <>
                              <button
                                onClick={() => handleAceitarSolicitacao(solicitacao)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center"
                              >
                                <Check className="w-4 h-4 mr-2" /> Aceitar
                              </button>
                              <button
                                onClick={() => handleRejeitarSolicitacao(solicitacao)}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center"
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Rejeitar
                              </button>
                            </>
                          )}
                          {solicitacao.status === 'avaliando' && (
                            <>
                              <button
                                onClick={() => openModal(setShowAgendamentoModal, solicitacao)}
                                className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center"
                              >
                                <Calendar className="w-4 h-4 mr-2" /> Agendar Internação
                              </button>
                              <button
                                onClick={() => handleRejeitarSolicitacao(solicitacao)}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center"
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Rejeitar
                              </button>
                            </>
                          )}
                          {solicitacao.status === 'agendado' && (
                            <button
                              onClick={() => openInternacaoModal(solicitacao)}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center"
                            >
                              <Home className="w-4 h-4 mr-2" /> Iniciar Internação
                            </button>
                          )}
                          {/* Botões de Status e Detalhes restaurados */}
                          <button
                            onClick={() => openModal(setShowStatusModal, solicitacao)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-2" /> Atualizar Status
                          </button>
                          <button
                            onClick={() => openModal(setShowDetalhesModal, solicitacao)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-2" /> Ver Detalhes
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {solicitacoes?.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                      Nenhuma solicitação de internação encontrada.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Internações Ativas */}
          {activeTab === 'internacoes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Internações</h2>
                  <p className="text-gray-600 mt-1">Gerencie os pacientes internados e com alta</p>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nome do paciente..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm"
                    value={searchInternacoes}
                    onChange={(e) => setSearchInternacoes(e.target.value)}
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {loadingInternacoes ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Carregando internações...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence>
                    {internacoes?.map((internacao) => (
                      <motion.div
                        key={internacao.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold text-gray-900">{internacao.paciente.nome}</h3>
                            <p className="text-sm text-gray-600">CPF: {internacao.paciente.cpf} | CNS: {internacao.paciente.cns}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>Entrada: {format(new Date(internacao.dataEntrada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                              {internacao.dataSaida && (
                                <span className="ml-4">Saída: {format(new Date(internacao.dataSaida), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(internacao.status)}`}>
                              {internacao.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                          <div className="space-y-3">
                            <div>
                              <p className="font-semibold text-gray-700">Motivo da Internação:</p>
                              <p className="text-gray-600">{internacao.motivoInternacao}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700">Médico Responsável:</p>
                              <p className="text-gray-600">{internacao.medicoResponsavelNome}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="font-semibold text-gray-700">Quarto/Leito:</p>
                              <p className="text-gray-600">{internacao.quarto} / {internacao.leito}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700">Diagnóstico Inicial:</p>
                              <p className="text-gray-600">{internacao.diagnosticoInicial}</p>
                            </div>
                          </div>
                          {internacao.status === 'alta' && internacao.altaHospitalar && (
                            <div className="md:col-span-2 space-y-3 bg-green-50 p-4 rounded-lg border border-green-200">
                              <p className="font-semibold text-green-800 flex items-center"><ClipboardCheck className="w-4 h-4 mr-2" /> Alta Registrada:</p>
                              <p className="text-green-700 ml-6">Tipo: {internacao.altaHospitalar.tipoAlta} | Condição: {internacao.altaHospitalar.condicaoAlta}</p>
                              <p className="text-green-700 ml-6">Diagnóstico Final: {internacao.altaHospitalar.diagnosticoFinal}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end space-x-3 mt-4">
                          <button
                            onClick={() => openDetalhesInternacao(internacao)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-2" /> Gerenciar Internação
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {internacoes?.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                      Nenhuma internação encontrada.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Agendamentos */}
          {activeTab === 'agendamentos' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-gray-900">Agendamentos Hospitalares</h2>
              <p className="text-gray-600 mt-1">Visualize e gerencie todos os agendamentos</p>
              {loadingAgendamentos ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Carregando agendamentos...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {agendamentos?.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      Nenhum agendamento encontrado.
                    </div>
                  ) : (
                    agendamentos?.map((agendamento: any) => (
                      <div key={agendamento.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900">Paciente: {agendamento.paciente.nome}</h3>
                        <p className="text-gray-600">Tipo: {agendamento.tipo}</p>
                        <p className="text-gray-600">Data: {format(new Date(agendamento.dataAgendamento), 'dd/MM/yyyy', { locale: ptBR })} às {agendamento.horaAgendamento}</p>
                        <p className="text-gray-600">Status: {agendamento.status}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Exames */}
          {activeTab === 'exames' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-gray-900">Exames Hospitalares</h2>
              <p className="text-gray-600 mt-1">Gerencie os exames solicitados e realizados</p>
              {loadingSolicitacoesExames ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Carregando exames...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {solicitacoesExames?.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      Nenhum exame encontrado.
                    </div>
                  ) : (
                    solicitacoesExames?.map((exame: any) => (
                      <div key={exame.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900">Paciente: {exame.paciente.nome}</h3>
                        <p className="text-gray-600">Tipo: {exame.tipoExame}</p>
                        <p className="text-gray-600">Status: {exame.status}</p>
                        <p className="text-gray-600">Solicitado em: {format(new Date(exame.dataSolicitacao), 'dd/MM/yyyy', { locale: ptBR })}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Medicações */}
          {activeTab === 'medicacoes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-gray-900">Medicações Administradas</h2>
              <p className="text-gray-600 mt-1">Visualize o histórico de medicações administradas</p>
              {loadingMedicacoes ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Carregando medicações...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {medicacoes?.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      Nenhuma medicação encontrada.
                    </div>
                  ) : (
                    medicacoes?.map((medicacao: any) => (
                      <div key={medicacao.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900">Paciente: {medicacao.paciente.nome}</h3>
                        <p className="text-gray-600">Medicação: {medicacao.nomeMedicacao} ({medicacao.dosagem})</p>
                        <p className="text-gray-600">Administrado em: {format(new Date(medicacao.dataHoraAdministracao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                        <p className="text-gray-600">Por: {medicacao.administrador.nome}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Pacientes */}
          {activeTab === 'pacientes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Pacientes</h2>
                  <p className="text-gray-600 mt-1">Visualize e gerencie os pacientes cadastrados</p>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nome, CPF ou CNS..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {loadingPacientes ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Carregando pacientes...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {pacientes?.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      Nenhum paciente encontrado.
                    </div>
                  ) : (
                    pacientes?.map((paciente: any) => (
                      <div key={paciente.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900">{paciente.nome}</h3>
                        <p className="text-gray-600">CPF: {paciente.cpf} | CNS: {paciente.cns}</p>
                        <p className="text-gray-600">Email: {paciente.email}</p>
                        <p className="text-gray-600">Telefone: {paciente.telefone}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal de Agendamento */}
      <AnimatePresence>
        {showAgendamentoModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAgendamentoModal(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Agendar Internação para {selectedItem.paciente.nome}</h3>
              <form onSubmit={handleAgendamentoSubmit} className="space-y-4">
                <div>
                  <label htmlFor="dataAgendada" className="block text-sm font-medium text-gray-700">Data Agendada</label>
                  <input
                    type="date"
                    id="dataAgendada"
                    value={agendamentoData.dataAgendada}
                    onChange={(e) => setAgendamentoData({ ...agendamentoData, dataAgendada: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="horaAgendada" className="block text-sm font-medium text-gray-700">Hora Agendada</label>
                  <input
                    type="time"
                    id="horaAgendada"
                    value={agendamentoData.horaAgendada}
                    onChange={(e) => setAgendamentoData({ ...agendamentoData, horaAgendada: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="local" className="block text-sm font-medium text-gray-700">Local</label>
                  <input
                    type="text"
                    id="local"
                    value={agendamentoData.local}
                    onChange={(e) => setAgendamentoData({ ...agendamentoData, local: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                    placeholder="Ex: Quarto 101"
                  />
                </div>
                <div>
                  <label htmlFor="recomendacoes" className="block text-sm font-medium text-gray-700">Recomendações</label>
                  <textarea
                    id="recomendacoes"
                    value={agendamentoData.recomendacoes}
                    onChange={(e) => setAgendamentoData({ ...agendamentoData, recomendacoes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                    placeholder="Instruções pré-internação..."
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Observações</label>
                  <textarea
                    id="observacoes"
                    value={agendamentoData.observacoes}
                    onChange={(e) => setAgendamentoData({ ...agendamentoData, observacoes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                    placeholder="Observações adicionais..."
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAgendamentoModal(false)}
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    Agendar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes da Solicitação */}
      <AnimatePresence>
        {showDetalhesModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetalhesModal(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Detalhes da Solicitação de Internação</h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>Paciente:</strong> {selectedItem.paciente.nome} (CPF: {selectedItem.paciente.cpf})</p>
                <p><strong>UBS Solicitante:</strong> {selectedItem.ubs.nome}</p>
                <p><strong>Médico Solicitante:</strong> {selectedItem.funcionario.nome} ({selectedItem.funcionario.funcao})</p>
                <p><strong>Tipo:</strong> {selectedItem.tipo}</p>
                <p><strong>Motivo:</strong> {selectedItem.motivo}</p>
                <p><strong>Detalhes:</strong> {selectedItem.detalhes}</p>
                <p><strong>Laudo Médico:</strong> {selectedItem.laudoMedico}</p>
                <p><strong>Prioridade:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPrioridadeColor(selectedItem.prioridade)}`}>{selectedItem.prioridade}</span></p>
                <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedItem.status)}`}>{selectedItem.status}</span></p>
                {selectedItem.observacoes && <p><strong>Observações:</strong> {selectedItem.observacoes}</p>}
                {selectedItem.dataAgendada && (
                  <p><strong>Agendamento:</strong> {format(new Date(selectedItem.dataAgendada), 'dd/MM/yyyy', { locale: ptBR })}{selectedItem.horaAgendada && ` às ${selectedItem.horaAgendada}`}{selectedItem.local && ` em ${selectedItem.local}`}</p>
                )}
                <p><strong>Solicitado em:</strong> {format(new Date(selectedItem.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowDetalhesModal(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Atualizar Status da Solicitação */}
      <AnimatePresence>
        {showStatusModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Atualizar Status da Solicitação</h3>
              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Novo Status</label>
                  <select
                    id="status"
                    value={statusData.status}
                    onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Selecione um status</option>
                    <option value="pendente">Pendente</option>
                    <option value="avaliando">Avaliando</option>
                    <option value="agendado">Agendado</option>
                    <option value="realizado">Realizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="observacoesStatus" className="block text-sm font-medium text-gray-700">Observações</label>
                  <textarea
                    id="observacoesStatus"
                    value={statusData.observacoes}
                    onChange={(e) => setStatusData({ ...statusData, observacoes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                    placeholder="Observações sobre a mudança de status..."
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors"
                  >
                    Atualizar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Iniciar Internação */}
      <AnimatePresence>
        {showInternacaoModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowInternacaoModal(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Iniciar Internação para {selectedItem.paciente.nome}</h3>
              <form onSubmit={handleInternacaoSubmit} className="space-y-4">
                <div>
                  <label htmlFor="dataEntrada" className="block text-sm font-medium text-gray-700">Data de Entrada</label>
                  <input
                    type="date"
                    id="dataEntrada"
                    value={internacaoData.dataEntrada}
                    onChange={(e) => setInternacaoData({ ...internacaoData, dataEntrada: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="motivoInternacao" className="block text-sm font-medium text-gray-700">Motivo da Internação</label>
                  <input
                    type="text"
                    id="motivoInternacao"
                    value={internacaoData.motivoInternacao}
                    onChange={(e) => setInternacaoData({ ...internacaoData, motivoInternacao: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                    placeholder="Ex: Pneumonia grave"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="diagnosticoInicial" className="block text-sm font-medium text-gray-700">Diagnóstico Inicial</label>
                  <textarea
                    id="diagnosticoInicial"
                    value={internacaoData.diagnosticoInicial}
                    onChange={(e) => setInternacaoData({ ...internacaoData, diagnosticoInicial: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                    placeholder="Ex: Infecção pulmonar bacteriana"
                    required
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="medicoResponsavelNome" className="block text-sm font-medium text-gray-700">Médico Responsável</label>
                  <input
                    type="text"
                    id="medicoResponsavelNome"
                    value={internacaoData.medicoResponsavelNome}
                    onChange={(e) => setInternacaoData({ ...internacaoData, medicoResponsavelNome: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                    placeholder="Ex: Dr. João Silva"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quarto" className="block text-sm font-medium text-gray-700">Quarto</label>
                    <input
                      type="text"
                      id="quarto"
                      value={internacaoData.quarto}
                      onChange={(e) => setInternacaoData({ ...internacaoData, quarto: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                      placeholder="Ex: 203"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="leito" className="block text-sm font-medium text-gray-700">Leito</label>
                    <input
                      type="text"
                      id="leito"
                      value={internacaoData.leito}
                      onChange={(e) => setInternacaoData({ ...internacaoData, leito: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                      placeholder="Ex: A"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="observacoesInternacao" className="block text-sm font-medium text-gray-700">Observações</label>
                  <textarea
                    id="observacoesInternacao"
                    value={internacaoData.observacoes}
                    onChange={(e) => setInternacaoData({ ...internacaoData, observacoes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-red-500 focus:border-red-500"
                    placeholder="Observações adicionais sobre a internação..."
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowInternacaoModal(false)}
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    Iniciar Internação
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Gerenciar Internação (Detalhes da Internação) */}
      <AnimatePresence>
        {showDetalhesInternacao && selectedInternacao && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetalhesInternacao(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gerenciar Internação: {detalhesInternacao?.paciente.nome}</h3>
              {loadingDetalhes ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent"></div>
                  <p className="mt-3 text-gray-600">Carregando detalhes da internação...</p>
                </div>
              ) : detalhesInternacao ? (
                <div className="space-y-6">
                  {/* Informações Gerais da Internação */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">Informações da Internação</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <p><strong>Paciente:</strong> {detalhesInternacao.paciente.nome} (CPF: {detalhesInternacao.paciente.cpf})</p>
                      <p><strong>Entrada:</strong> {format(new Date(detalhesInternacao.dataEntrada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                      {detalhesInternacao.dataSaida && <p><strong>Saída:</strong> {format(new Date(detalhesInternacao.dataSaida), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>}
                      <p><strong>Motivo:</strong> {detalhesInternacao.motivoInternacao}</p>
                      <p><strong>Diagnóstico Inicial:</strong> {detalhesInternacao.diagnosticoInicial}</p>
                      {detalhesInternacao.diagnosticoFinal && <p><strong>Diagnóstico Final:</strong> {detalhesInternacao.diagnosticoFinal}</p>}
                      <p><strong>Médico Responsável:</strong> {detalhesInternacao.medicoResponsavelNome}</p>
                      <p><strong>Quarto/Leito:</strong> {detalhesInternacao.quarto} / {detalhesInternacao.leito}</p>
                      <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(detalhesInternacao.status)}`}>{detalhesInternacao.status}</span></p>
                      {detalhesInternacao.observacoes && <p className="md:col-span-2"><strong>Observações:</strong> {detalhesInternacao.observacoes}</p>}
                    </div>
                  </div>

                  {/* Ações da Internação */}
                  {detalhesInternacao.status === 'ativa' && (
                    <div className="flex flex-wrap gap-3 justify-center bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <button
                        onClick={() => setShowMedicacaoModal(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center"
                      >
                        <Pill className="w-4 h-4 mr-2" /> Registrar Medicação
                      </button>
                      <button
                        onClick={() => setShowExameModal(true)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center"
                      >
                        <FlaskConical className="w-4 h-4 mr-2" /> Solicitar Exame
                      </button>
                      <button
                        onClick={() => setShowObservacaoModal(true)} // Botão de observação restaurado
                        className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" /> Adicionar Observação
                      </button>
                      <button
                        onClick={() => setShowAltaModal(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center"
                      >
                        <ClipboardCheck className="w-4 h-4 mr-2" /> Dar Alta
                      </button>
                    </div>
                  )}

                  {/* Histórico de Medicações */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h4 className="text-xl font-semibold text-gray-800 mb-3 flex items-center"><Pill className="w-5 h-5 mr-2 text-blue-500" /> Medicações Administradas</h4>
                    {detalhesInternacao.medicacoesAdministradas && detalhesInternacao.medicacoesAdministradas.length > 0 ? (
                      <ul className="space-y-3">
                        {detalhesInternacao.medicacoesAdministradas.map((med) => (
                          <li key={med.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <p><strong>Medicação:</strong> {med.nomeMedicacao} {med.dosagem ? `(${med.dosagem})` : ''}</p>
                            <p><strong>Via:</strong> {med.viaAdministracao || 'Não informada'}</p>
                            <p><strong>Data/Hora:</strong> {format(new Date(med.dataHoraAdministracao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                            <p><strong>Administrador:</strong> {med.administradorNomeOuCrm || 'N/A'}</p>
                            {med.observacoes && <p><strong>Obs:</strong> {med.observacoes}</p>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">Nenhuma medicação registrada para esta internação.</p>
                    )}
                  </div>

                  {/* Histórico de Solicitações de Exames */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h4 className="text-xl font-semibold text-gray-800 mb-3 flex items-center"><FlaskConical className="w-5 h-5 mr-2 text-purple-500" /> Solicitações de Exames</h4>
                    {detalhesInternacao.solicitacoesExameInternacao && detalhesInternacao.solicitacoesExameInternacao.length > 0 ? (
                      <ul className="space-y-3">
                        {detalhesInternacao.solicitacoesExameInternacao.map((exame) => (
                          <li key={exame.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <p><strong>Tipo de Exame:</strong> {exame.tipoExame}</p>
                            <p><strong>Laboratório:</strong> {exame.laboratorio?.nome || 'N/A'}</p>
                            <p><strong>Data Solicitação:</strong> {format(new Date(exame.dataSolicitacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(exame.status)}`}>{exame.status}</span></p>
                            {exame.dataResultado && <p><strong>Data Resultado:</strong> {format(new Date(exame.dataResultado), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>}
                            {exame.resultado && <p><strong>Resultado:</strong> {exame.resultado}</p>}
                            {exame.arquivoPdf && <p><strong>PDF:</strong> <a href={exame.arquivoPdf} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ver PDF</a></p>}
                            {exame.observacoes && <p><strong>Obs:</strong> {exame.observacoes}</p>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">Nenhuma solicitação de exame registrada para esta internação.</p>
                    )}
                  </div>

                  {/* Detalhes da Alta (se houver) */}
                  {detalhesInternacao.altaHospitalar && (
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <h4 className="text-xl font-semibold text-gray-800 mb-3 flex items-center"><ClipboardCheck className="w-5 h-5 mr-2 text-green-500" /> Detalhes da Alta</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                        <p><strong>Data da Alta:</strong> {format(new Date(detalhesInternacao.altaHospitalar.dataAlta), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                        <p><strong>Médico Responsável:</strong> {detalhesInternacao.altaHospitalar.medicoResponsavel}</p>
                        <p><strong>Tipo de Alta:</strong> {detalhesInternacao.altaHospitalar.tipoAlta}</p>
                        <p><strong>Condição de Alta:</strong> {detalhesInternacao.altaHospitalar.condicaoAlta}</p>
                        <p className="md:col-span-2"><strong>Diagnóstico Final:</strong> {detalhesInternacao.altaHospitalar.diagnosticoFinal}</p>
                        <p className="md:col-span-2"><strong>Orientações:</strong> {detalhesInternacao.altaHospitalar.orientacoesAlta}</p>
                        {detalhesInternacao.altaHospitalar.medicacoesPrescritas && <p className="md:col-span-2"><strong>Medicações Prescritas:</strong> {detalhesInternacao.altaHospitalar.medicacoesPrescritas}</p>}
                        {detalhesInternacao.altaHospitalar.retornoAgendado && <p><strong>Retorno Agendado:</strong> {format(new Date(detalhesInternacao.altaHospitalar.retornoAgendado), 'dd/MM/yyyy', { locale: ptBR })}</p>}
                        {detalhesInternacao.altaHospitalar.observacoes && <p className="md:col-span-2"><strong>Observações da Alta:</strong> {detalhesInternacao.altaHospitalar.observacoes}</p>}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">Não foi possível carregar os detalhes da internação.</p>
              )}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowDetalhesInternacao(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Registrar Medicação */}
      <AnimatePresence>
        {showMedicacaoModal && selectedInternacao && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowMedicacaoModal(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Registrar Medicação para {selectedInternacao.paciente.nome}</h3>
              <form onSubmit={handleMedicacaoSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nomeMedicacao" className="block text-sm font-medium text-gray-700">Nome da Medicação</label>
                  <input
                    type="text"
                    id="nomeMedicacao"
                    value={medicacaoData.nomeMedicacao}
                    onChange={(e) => setMedicacaoData({ ...medicacaoData, nomeMedicacao: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Dipirona"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="dosagem" className="block text-sm font-medium text-gray-700">Dosagem</label>
                  <input
                    type="text"
                    id="dosagem"
                    value={medicacaoData.dosagem}
                    onChange={(e) => setMedicacaoData({ ...medicacaoData, dosagem: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: 500mg"
                  />
                </div>
                <div>
                  <label htmlFor="viaAdministracao" className="block text-sm font-medium text-gray-700">Via de Administração</label>
                  <input
                    type="text"
                    id="viaAdministracao"
                    value={medicacaoData.viaAdministracao}
                    onChange={(e) => setMedicacaoData({ ...medicacaoData, viaAdministracao: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Oral, Intravenosa"
                  />
                </div>
                <div>
                  <label htmlFor="dataHoraAdministracao" className="block text-sm font-medium text-gray-700">Data e Hora da Administração</label>
                  <input
                    type="datetime-local"
                    id="dataHoraAdministracao"
                    value={medicacaoData.dataHoraAdministracao}
                    onChange={(e) => setMedicacaoData({ ...medicacaoData, dataHoraAdministracao: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="administradorNomeOuCrm" className="block text-sm font-medium text-gray-700">Nome ou CRM do Responsável</label>
                  <input
                    type="text"
                    id="administradorNomeOuCrm"
                    value={medicacaoData.administradorNomeOuCrm}
                    onChange={(e) => setMedicacaoData({ ...medicacaoData, administradorNomeOuCrm: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Dr. João Silva ou CRM 12345"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="observacoesMedicacao" className="block text-sm font-medium text-gray-700">Observações</label>
                  <textarea
                    id="observacoesMedicacao"
                    value={medicacaoData.observacoes}
                    onChange={(e) => setMedicacaoData({ ...medicacaoData, observacoes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observações adicionais sobre a medicação..."
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowMedicacaoModal(false)}
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Registrar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Adicionar Observação (restaurado) */}
      <AnimatePresence>
        {showObservacaoModal && selectedInternacao && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowObservacaoModal(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Adicionar Observação para {selectedInternacao.paciente.nome}</h3>
              <form onSubmit={handleObservacaoInternacaoSubmit} className="space-y-4">
                <div>
                  <label htmlFor="observacaoInternacao" className="block text-sm font-medium text-gray-700">Observação</label>
                  <textarea
                    id="observacaoInternacao"
                    value={observacaoData}
                    onChange={(e) => setObservacaoData(e.target.value)}
                    rows={5}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Adicione uma nova observação sobre a internação..."
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowObservacaoModal(false)}
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
                  >
                    Adicionar Observação
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Solicitar Exame */}
      <AnimatePresence>
        {showExameModal && selectedInternacao && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowExameModal(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full" // Reduzido o tamanho do modal
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Solicitar Exame para {selectedInternacao.paciente.nome}</h3>
              <form onSubmit={handleExameSubmit} className="space-y-4">
                <div>
                  <label htmlFor="tipoExame" className="block text-sm font-medium text-gray-700">Tipo de Exame</label>
                  <input
                    type="text"
                    id="tipoExame"
                    value={exameData.tipoExame}
                    onChange={(e) => setExameData({ ...exameData, tipoExame: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ex: Hemograma completo"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="laboratorioId" className="block text-sm font-medium text-gray-700">Laboratório</label>
                  <select
                    id="laboratorioId"
                    value={exameData.laboratorioId}
                    onChange={(e) => setExameData({ ...exameData, laboratorioId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    <option value="">Selecione um laboratório</option>
                    {laboratorios.map(lab => (
                      <option key={lab.id} value={lab.id}>{lab.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="observacoesExame" className="block text-sm font-medium text-gray-700">Observações</label>
                  <textarea
                    id="observacoesExame"
                    value={exameData.observacoes}
                    onChange={(e) => setExameData({ ...exameData, observacoes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Observações adicionais sobre o exame..."
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowExameModal(false)}
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    Solicitar Exame
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Dar Alta */}
      <AnimatePresence>
        {showAltaModal && selectedInternacao && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAltaModal(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" // Reduzido o tamanho do modal e adicionado scroll
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Dar Alta para {selectedInternacao.paciente.nome}</h3>
              <form onSubmit={handleAltaSubmit} className="space-y-4">
                <div>
                  <label htmlFor="medicoResponsavelAlta" className="block text-sm font-medium text-gray-700">Médico Responsável pela Alta</label>
                  <input
                    type="text"
                    id="medicoResponsavelAlta"
                    value={altaData.medicoResponsavel}
                    onChange={(e) => setAltaData({ ...altaData, medicoResponsavel: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-green-500 focus:border-green-500"
                    placeholder="Ex: Dr. Maria Souza"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="dataAlta" className="block text-sm font-medium text-gray-700">Data da Alta</label>
                  <input
                    type="date"
                    id="dataAlta"
                    value={altaData.dataAlta}
                    onChange={(e) => setAltaData({ ...altaData, dataAlta: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="tipoAlta" className="block text-sm font-medium text-gray-700">Tipo de Alta</label>
                  <select
                    id="tipoAlta"
                    value={altaData.tipoAlta}
                    onChange={(e) => setAltaData({ ...altaData, tipoAlta: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="medica">Médica</option>
                    <option value="a_pedido">A Pedido</option>
                    <option value="transferencia">Transferência</option>
                    <option value="obito">Óbito</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="condicaoAlta" className="block text-sm font-medium text-gray-700">Condição de Alta</label>
                  <select
                    id="condicaoAlta"
                    value={altaData.condicaoAlta}
                    onChange={(e) => setAltaData({ ...altaData, condicaoAlta: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Selecione a condição</option>
                    <option value="curado">Curado</option>
                    <option value="melhorado">Melhorado</option>
                    <option value="inalterado">Inalterado</option>
                    <option value="agravado">Agravado</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="diagnosticoFinal" className="block text-sm font-medium text-gray-700">Diagnóstico Final</label>
                  <textarea
                    id="diagnosticoFinal"
                    value={altaData.diagnosticoFinal}
                    onChange={(e) => setAltaData({ ...altaData, diagnosticoFinal: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-green-500 focus:border-green-500"
                    placeholder="Diagnóstico final do paciente..."
                    required
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="orientacoesAlta" className="block text-sm font-medium text-gray-700">Orientações de Alta</label>
                  <textarea
                    id="orientacoesAlta"
                    value={altaData.orientacoesAlta}
                    onChange={(e) => setAltaData({ ...altaData, orientacoesAlta: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-green-500 focus:border-green-500"
                    placeholder="Instruções para o paciente pós-alta..."
                    required
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="medicacoesPrescritas" className="block text-sm font-medium text-gray-700">Medicações Prescritas (para casa)</label>
                  <textarea
                    id="medicacoesPrescritas"
                    value={altaData.medicacoesPrescritas}
                    onChange={(e) => setAltaData({ ...altaData, medicacoesPrescritas: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-green-500 focus:border-green-500"
                    placeholder="Ex: Paracetamol 500mg, 8/8h por 3 dias"
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="retornoAgendado" className="block text-sm font-medium text-gray-700">Retorno Agendado</label>
                  <input
                    type="date"
                    id="retornoAgendado"
                    value={altaData.retornoAgendado}
                    onChange={(e) => setAltaData({ ...altaData, retornoAgendado: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="observacoesAlta" className="block text-sm font-medium text-gray-700">Observações da Alta</label>
                  <textarea
                    id="observacoesAlta"
                    value={altaData.observacoes}
                    onChange={(e) => setAltaData({ ...altaData, observacoes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-green-500 focus:border-green-500"
                    placeholder="Observações adicionais sobre a alta..."
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAltaModal(false)}
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    Confirmar Alta
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HOSPDashboard;

