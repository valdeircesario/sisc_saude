import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
  Send,
  Pill,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../../services/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { UBSHeader } from "../../components/UBS/UBSHeader";
import { UBSTabs } from "../../components/UBS/UBSTabs";
import { FuncionarioCard, PacienteCard, MedicamentoCard, CampanhaCard, ConsultaCard } from "../../components/UBS/UBSCards";
import { UBSFuncionarioModal } from "../../components/UBS/Modals/UBSFuncionarioModal";
import { UBSCampanhaModal } from "../../components/UBS/Modals/UBSCampanhaModal";
import { UBSEditCampanhaModal } from "../../components/UBS/Modals/UBSEditCampanhaModal";
import { UBSInscricoesCampanhaModal } from "../../components/UBS/Modals/UBSInscricoesCampanhaModal";
import { UBSMedicamentoModal } from "../../components/UBS/Modals/UBSMedicamentoModal";
import { UBSAgendamentoModal } from "../../components/UBS/Modals/UBSAgendamentoModal";
import { UBSEditarPacienteModal } from "../../components/UBS/Modals/UBSEditarPacienteModal";
import { UBSCancelamentoConsultaModal } from "../../components/UBS/Modals/UBSCancelamentoConsultaModal";
import { UBSHistoricoPacienteModal } from "../../components/UBS/Modals/UBSHistoricoPacienteModal";
import { UBSAgendarConsultaPacienteModal } from "../../components/UBS/Modals/UBSAgendarConsultaPacienteModal";
import { UBSAgendamentoCampanhaModal } from "../../components/UBS/Modals/UBSAgendamentoCampanhaModal";
import { UBSSolicitarInternacaoModal } from "../../components/UBS/Modals/UBSSolicitarInternacaoModal";
import { Modal } from "../../components/UBS/Modals/UBSModalBase";

const UBSDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("funcionarios");
  const [showFuncModal, setShowFuncModal] = useState(false);
  const [showCampanhaModal, setShowCampanhaModal] = useState(false);
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);
  const [showCancelamentoModal, setShowCancelamentoModal] = useState(false);
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [showInscricoesModal, setShowInscricoesModal] = useState(false);
  const [showAgendamentoCampanhaModal, setShowAgendamentoCampanhaModal] =
    useState(false);
  const [showConsultaPacienteModal, setShowConsultaPacienteModal] =
    useState(false);
  const [showEditCampanhaModal, setShowEditCampanhaModal] = useState(false);
  const [showInternacaoModal, setShowInternacaoModal] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingCampanha, setEditingCampanha] = useState<any>(null);
  const [editingMed, setEditingMed] = useState<any>(null);
  const [medData, setMedData] = useState({
    nome: "",
    descricao: "",
    lote: "",
    quantidade: "",
    dataValidade: "",
    vencido: false,
  });
  const [selectedConsulta, setSelectedConsulta] = useState<any>(null);
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);
  const [selectedCampanha, setSelectedCampanha] = useState<any>(null);
  const [inscricoesPorCampanha, setInscricoesPorCampanha] = useState<{
    [key: string]: any[];
  }>({});
  const [selectedInscricao, setSelectedInscricao] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [consultaSearchTerm, setConsultaSearchTerm] = useState("");
  const [consultaStatusFilter, setConsultaStatusFilter] = useState("todas");

  const [funcData, setFuncData] = useState({
    nome: "",
    funcao: "",
    crm: "",
    cpf: "",
    telefone: "",
    email: "",
    senha: "",
  });

  const [campanhaData, setCampanhaData] = useState({
    titulo: "",
    descricao: "",
    tipo: "",
    dataIni: "",
    dataFim: "",
  });

  const [agendamentoData, setAgendamentoData] = useState({
    dataAgendada: "",
    funcionarioId: "",
    observacoes: "",
  });

  const [cancelamentoData, setCancelamentoData] = useState({
    observacoes: "",
  });

  const [pacienteEditData, setPacienteEditData] = useState({
    endereco: "",
    telefone: "",
  });

  const [consultaPacienteData, setConsultaPacienteData] = useState({
    especialidade: "",
    motivo: "",
    dataAgendada: "",
    funcionarioId: "",
    observacoes: "",
  });

  const [agendamentoCampanhaData, setAgendamentoCampanhaData] = useState({
    dataAgendada: "",
    horaAgendada: "",
    localAtendimento: "",
    observacoes: "",
  });

  const [editCampanhaData, setEditCampanhaData] = useState({
    titulo: "",
    descricao: "",
    tipo: "",
    dataIni: "",
    dataFim: "",
  });

  const [internacaoData, setInternacaoData] = useState({
    hospitalId: "",
    funcionarioId: "",
    tipo: "",
    motivo: "",
    detalhes: "",
    laudoMedico: "",
    prioridade: "media",
  });

  // Queries
  const { data: funcionarios, isLoading: loadingFuncionarios } = useQuery(
    "ubs-funcionarios",
    () => api.get("/ubs/funcionarios").then((res) => res.data),
    {
      enabled:
        activeTab === "funcionarios" ||
        showAgendamentoModal ||
        showCancelamentoModal ||
        showConsultaPacienteModal ||
        showInternacaoModal,
    },
  );

  const { data: pacientes, isLoading: loadingPacientes } = useQuery(
    ["ubs-pacientes", searchTerm],
    () => api.get(`/ubs/pacientes?busca=${searchTerm}`).then((res) => res.data),
    { enabled: activeTab === "pacientes" },
  );

  const { data: historicoPaciente } = useQuery(
    ["paciente-historico-ubs", selectedPaciente?.id],
    () =>
      api
        .get(`/ubs/pacientes/${selectedPaciente.id}/historico`)
        .then((res) => res.data),
    { enabled: !!selectedPaciente && showHistoricoModal },
  );

  const { data: consultasPaciente } = useQuery(
    ["paciente-consultas-ubs", selectedPaciente?.id],
    () =>
      api
        .get(`/ubs/pacientes/${selectedPaciente.id}/consultas`)
        .then((res) => res.data),
    { enabled: !!selectedPaciente && showHistoricoModal },
  );

  const { data: inscricoesCampanha } = useQuery(
    ["campanha-inscricoes", selectedCampanha?.id],
    () =>
      api
        .get(`/ubs/campanhas/${selectedCampanha.id}/inscricoes`)
        .then((res) => res.data),
    { enabled: !!selectedCampanha && showInscricoesModal },
  );

  const { data: campanhas, isLoading: loadingCampanhas } = useQuery(
    "ubs-campanhas",
    () => api.get("/ubs/campanhas").then((res) => res.data),
    {
      enabled: activeTab === "campanhas",
      onSuccess: (data) => {
        data.forEach((campanha: any) => {
          if (campanha._count.inscricoes > 0) {
            api
              .get(`/ubs/campanhas/${campanha.id}/inscricoes`)
              .then((res) => {
                setInscricoesPorCampanha((prev) => ({
                  ...prev,
                  [campanha.id]: res.data,
                }));
              })
              .catch((err) =>
                console.error("Erro ao carregar inscrições:", err),
              );
          }
        });
      },
    },
  );

  const { data: consultas, isLoading: loadingConsultas } = useQuery(
    "ubs-consultas",
    () => api.get("/ubs/consultas").then((res) => res.data),
    { enabled: activeTab === "consultas" },
  );

  const filteredConsultas = (consultas || []).filter((consulta: any) => {
    const matchesStatus =
      consultaStatusFilter === "todas" || consulta.status === consultaStatusFilter;

    const pacienteNome = consulta?.paciente?.nome?.toLowerCase() || "";
    const matchesSearch = pacienteNome.includes(
      consultaSearchTerm.toLowerCase(),
    );

    return matchesStatus && matchesSearch;
  });

  // Query para buscar hospitais
  const {
    data: hospitaisList,
    isLoading: loadingHospitais,
    isError: hospitaisError,
  } = useQuery(
    "hospitais",
    () => api.get("/ubs/hospitais").then((res) => res.data),
    {
      enabled: showInternacaoModal,
      onError: (error) => {
        console.error("Erro ao carregar hospitais:", error);
        toast.error("Erro ao carregar lista de hospitais");
      },
    },
  );

  const { data: medicamentos, isLoading: loadingMedicamentos } = useQuery(
    ["ubs-medicamentos", searchTerm],
    () =>
      api
        .get("/ubs/medicamentos", { params: { busca: searchTerm } })
        .then((res) => res.data),
    { enabled: activeTab === "medicamentos" },
  );

  // Mutations
  const createFuncMutation = useMutation(
    (data: any) => api.post("/ubs/funcionarios", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-funcionarios");
        toast.success("Funcionário cadastrado com sucesso!");
        setShowFuncModal(false);
        resetFuncForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao cadastrar funcionário",
        );
      },
    },
  );

  const updateFuncMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/ubs/funcionarios/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-funcionarios");
        toast.success("Funcionário atualizado com sucesso!");
        setShowFuncModal(false);
        resetFuncForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao atualizar funcionário",
        );
      },
    },
  );

  const deleteFuncMutation = useMutation(
    (id: string) => api.delete(`/ubs/funcionarios/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-funcionarios");
        toast.success("Funcionário deletado com sucesso!");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao deletar funcionário",
        );
      },
    },
  );

  const createCampanhaMutation = useMutation(
    (data: any) => api.post("/ubs/campanhas", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-campanhas");
        toast.success("Campanha criada com sucesso!");
        setShowCampanhaModal(false);
        resetCampanhaForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Erro ao criar campanha");
      },
    },
  );

  const updateCampanhaMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/ubs/campanhas/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-campanhas");
        toast.success("Campanha atualizada com sucesso!");
        setShowEditCampanhaModal(false);
        resetEditCampanhaForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao atualizar campanha",
        );
      },
    },
  );

  const deleteCampanhaMutation = useMutation(
    (id: string) => api.delete(`/ubs/campanhas/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-campanhas");
        toast.success("Campanha excluída com sucesso!");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao excluir campanha",
        );
      },
    },
  );

  const agendarConsultaMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/ubs/consultas/${id}/agendar`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-consultas");
        toast.success("Consulta agendada com sucesso!");
        setShowAgendamentoModal(false);
        setSelectedConsulta(null);
        resetAgendamentoForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao agendar consulta",
        );
      },
    },
  );
  const cancelamentoConsultaMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/ubs/consultas/${id}/cancelamento`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-consultas");
        toast.success("Consulta cancelada com sucesso!");
        setShowCancelamentoModal(false);
        setSelectedConsulta(null);
        resetCancelamentoForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Erro ao canc consulta");
      },
    },
  );

  const editPacienteMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/ubs/pacientes/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["ubs-pacientes", searchTerm]);
        toast.success("Paciente atualizado com sucesso!");
        setShowPacienteModal(false);
        setSelectedPaciente(null);
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao atualizar paciente",
        );
      },
    },
  );

  const agendarConsultaPacienteMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.post(`/ubs/pacientes/${id}/agendar-consulta`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          "paciente-consultas-ubs",
          selectedPaciente?.id,
        ]);
        toast.success("Consulta agendada com sucesso!");
        setShowConsultaPacienteModal(false);
        resetConsultaPacienteForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao agendar consulta",
        );
      },
    },
  );

  const agendarAtendimentoCampanhaMutation = useMutation(
    ({
      campanhaId,
      inscricaoId,
      data,
    }: {
      campanhaId: string;
      inscricaoId: string;
      data: any;
    }) =>
      api.put(
        `/ubs/campanhas/${campanhaId}/inscricoes/${inscricaoId}/agendar`,
        data,
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          "campanha-inscricoes",
          selectedCampanha?.id,
        ]);
        toast.success("Atendimento agendado com sucesso!");
        setShowAgendamentoCampanhaModal(false);
        setSelectedInscricao(null);
        resetAgendamentoCampanhaForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao agendar atendimento",
        );
      },
    },
  );

  const solicitarInternacaoMutation = useMutation(
    (data: any) => api.post("/ubs/solicitar-internacao", data),
    {
      onSuccess: () => {
        toast.success("Solicitação de internação enviada com sucesso!");
        setShowInternacaoModal(false);
        resetInternacaoForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao solicitar internação",
        );
      },
    },
  );

  const createMedMutation = useMutation(
    (data: any) => api.post("/medicamentos", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["ubs-medicamentos"]);
        toast.success("Medicamento cadastrado com sucesso!");
        setShowMedModal(false);
        resetMedForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao cadastrar medicamento",
        );
      },
    },
  );

  const updateMedMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/medicamentos/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["ubs-medicamentos"]);
        toast.success("Medicamento atualizado com sucesso!");
        setShowMedModal(false);
        resetMedForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao atualizar medicamento",
        );
      },
    },
  );

  // Reset functions
  const resetFuncForm = () => {
    setFuncData({
      nome: "",
      funcao: "",
      crm: "",
      cpf: "",
      telefone: "",
      email: "",
      senha: "",
    });
    setEditingItem(null);
  };

  const resetCampanhaForm = () => {
    setCampanhaData({
      titulo: "",
      descricao: "",
      tipo: "",
      dataIni: "",
      dataFim: "",
    });
  };

  const resetEditCampanhaForm = () => {
    setEditCampanhaData({
      titulo: "",
      descricao: "",
      tipo: "",
      dataIni: "",
      dataFim: "",
    });
    setEditingCampanha(null);
  };

  const resetAgendamentoForm = () => {
    setAgendamentoData({
      dataAgendada: "",
      funcionarioId: "",
      observacoes: "",
    });
  };

  const resetCancelamentoForm = () => {
    setCancelamentoData({
      observacoes: "",
    });
  };

  const resetConsultaPacienteForm = () => {
    setConsultaPacienteData({
      especialidade: "",
      motivo: "",
      dataAgendada: "",
      funcionarioId: "",
      observacoes: "",
    });
  };

  const resetAgendamentoCampanhaForm = () => {
    setAgendamentoCampanhaData({
      dataAgendada: "",
      horaAgendada: "",
      localAtendimento: "",
      observacoes: "",
    });
  };

  const resetInternacaoForm = () => {
    setInternacaoData({
      hospitalId: "",
      funcionarioId: "",
      tipo: "",
      motivo: "",
      detalhes: "",
      laudoMedico: "",
      prioridade: "media",
    });
  };

  const resetMedForm = () => {
    setMedData({
      nome: "",
      descricao: "",
      lote: "",
      quantidade: "",
      dataValidade: "",
      vencido: false,
    });
    setEditingMed(null);
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
        data: editCampanhaData,
      });
    }
  };

  const handleAgendamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedConsulta) {
      agendarConsultaMutation.mutate({
        id: selectedConsulta.id,
        data: agendamentoData,
      });
    }
  };
  const handleCancelamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedConsulta) {
      cancelamentoConsultaMutation.mutate({
        id: selectedConsulta.id,
        data: cancelamentoData,
      });
    }
  };

  const handlePacienteEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      editPacienteMutation.mutate({
        id: selectedPaciente.id,
        data: pacienteEditData,
      });
    }
  };

  const handleConsultaPacienteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      agendarConsultaPacienteMutation.mutate({
        id: selectedPaciente.id,
        data: consultaPacienteData,
      });
    }
  };

  const handleAgendamentoCampanhaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCampanha && selectedInscricao) {
      agendarAtendimentoCampanhaMutation.mutate({
        campanhaId: selectedCampanha.id,
        inscricaoId: selectedInscricao.id,
        data: agendamentoCampanhaData,
      });
    }
  };

  const handleInternacaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      solicitarInternacaoMutation.mutate({
        pacienteId: selectedPaciente.id,
        ...internacaoData,
      });
    }
  };

  const handleMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requestData = {
      nome: medData.nome,
      descricao: medData.descricao,
      lote: medData.lote,
      quantidade: Number(medData.quantidade),
      dataValidade: medData.dataValidade,
      vencido: medData.vencido,
    };

    if (editingMed) {
      updateMedMutation.mutate({ id: editingMed.id, data: requestData });
    } else {
      createMedMutation.mutate(requestData);
    }
  };

  const handleEditMed = (medicamento: any) => {
    setEditingMed(medicamento);
    setMedData({
      nome: medicamento.nome || "",
      descricao: medicamento.descricao || "",
      lote: medicamento.lote || "",
      quantidade: String(medicamento.quantidade ?? ""),
      dataValidade: medicamento.dataValidade
        ? medicamento.dataValidade.split("T")[0]
        : "",
      vencido: medicamento.vencido || false,
    });
    setShowMedModal(true);
  };

  const handleEditFunc = (func: any) => {
    setEditingItem(func);
    setFuncData({
      nome: func.nome,
      funcao: func.funcao,
      crm: func.crm || "",
      cpf: func.cpf,
      telefone: func.telefone,
      email: func.email,
      senha: "",
    });
    setShowFuncModal(true);
  };

  const handleEditCampanha = (camp: any) => {
    setEditingCampanha(camp);
    setEditCampanhaData({
      titulo: camp.titulo,
      descricao: camp.descricao,
      tipo: camp.tipo,
      dataIni: camp.dataIni.split("T")[0],
      dataFim: camp.dataFim ? camp.dataFim.split("T")[0] : "",
    });
    setShowEditCampanhaModal(true);
  };

  const handleDeleteFunc = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este funcionário?")) {
      deleteFuncMutation.mutate(id);
    }
  };

  const handleDeleteCampanha = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta campanha?")) {
      deleteCampanhaMutation.mutate(id);
    }
  };

  const openAgendamentoModal = (consulta: any) => {
    setSelectedConsulta(consulta);
    setShowAgendamentoModal(true);
  };

  const openCancelamentoModal = (consulta: any) => {
    setSelectedConsulta(consulta);
    setShowCancelamentoModal(true);
  };

  const openPacienteModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setPacienteEditData({
      endereco: paciente.endereco,
      telefone: paciente.telefone,
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
    queryClient.prefetchQuery("hospitais", () =>
      api.get("/ubs/hospitais").then((res) => res.data),
    );
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#F0F4F8", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <UBSHeader userNome={user?.nome} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '20px' }}>

        
          {/* Navigation Tabs */}
          <UBSTabs activeTab={activeTab} onTabChange={setActiveTab} />
        

        {/* Funcionários Tab */}
        {activeTab === "funcionarios" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Funcionários</h2>
              <button
                onClick={() => setShowFuncModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" /> Novo Funcionário
              </button>
            </div>
            {loadingFuncionarios ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando funcionários...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
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
        {activeTab === "pacientes" && (
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
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando pacientes...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
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
        {activeTab === "campanhas" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Campanhas</h2>
              <button
                onClick={() => setShowCampanhaModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" /> Nova Campanha
              </button>
            </div>
            {loadingCampanhas ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando campanhas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        {activeTab === "consultas" && (
          <div>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900">Consultas</h2>
                <div className="text-sm text-gray-500">
                  {filteredConsultas.length} consulta(s) encontrada(s)
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={consultaSearchTerm}
                    onChange={(e) => setConsultaSearchTerm(e.target.value)}
                    placeholder="Buscar por nome do paciente"
                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={consultaStatusFilter}
                    onChange={(e) => setConsultaStatusFilter(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="todas">Todas</option>
                    <option value="solicitada">Solicitada</option>
                    <option value="agendada">Agendada</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            </div>

            {loadingConsultas ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando consultas...</p>
              </div>
            ) : filteredConsultas.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
                Nenhuma consulta encontrada para os filtros selecionados.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredConsultas.map((consulta: any) => (
                  <ConsultaCard
                    key={consulta.id}
                    consulta={consulta}
                    onAgendar={openAgendamentoModal}
                    onCancelamento={openCancelamentoModal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal de Funcionário */}
        <UBSFuncionarioModal
          isOpen={showFuncModal}
          onClose={() => setShowFuncModal(false)}
          editingItem={editingItem}
          funcData={funcData}
          setFuncData={setFuncData}
          onSubmit={handleFuncSubmit}
        />

        {/* Modal de Campanha */}
        <UBSCampanhaModal
          isOpen={showCampanhaModal}
          onClose={() => setShowCampanhaModal(false)}
          campanhaData={campanhaData}
          setCampanhaData={setCampanhaData}
          onSubmit={handleCampanhaSubmit}
        />

        {/* Modal de Editar Campanha */}
        <UBSEditCampanhaModal
          isOpen={showEditCampanhaModal}
          onClose={() => setShowEditCampanhaModal(false)}
          editCampanhaData={editCampanhaData}
          setEditCampanhaData={setEditCampanhaData}
          onSubmit={handleEditCampanhaSubmit}
        />

        {/* Modal de Medicamento */}
        <UBSMedicamentoModal
          isOpen={showMedModal}
          onClose={() => setShowMedModal(false)}
          editingMed={editingMed}
          medData={medData}
          setMedData={setMedData}
          onSubmit={handleMedSubmit}
        />

        {/* Modal de Agendamento de Consulta */}
        <UBSAgendamentoModal
          isOpen={showAgendamentoModal}
          onClose={() => setShowAgendamentoModal(false)}
          selectedConsulta={selectedConsulta}
          agendamentoData={agendamentoData}
          setAgendamentoData={setAgendamentoData}
          funcionarios={funcionarios || []}
          onSubmit={handleAgendamentoSubmit}
        />

        {/* Modal de Editar Paciente */}
        <UBSEditarPacienteModal
          isOpen={showPacienteModal}
          onClose={() => setShowPacienteModal(false)}
          selectedPaciente={selectedPaciente}
          pacienteEditData={pacienteEditData}
          setPacienteEditData={setPacienteEditData}
          onSubmit={handlePacienteEditSubmit}
        />

        {/* Modal de Cancelamento de Consulta */}
        <UBSCancelamentoConsultaModal
          isOpen={showCancelamentoModal}
          onClose={() => setShowCancelamentoModal(false)}
          selectedConsulta={selectedConsulta}
          cancelamentoData={cancelamentoData}
          setCancelamentoData={setCancelamentoData}
          onSubmit={handleCancelamentoSubmit}
        />

        {/* Modal de Histórico do Paciente */}
        <UBSHistoricoPacienteModal
          isOpen={showHistoricoModal}
          onClose={() => setShowHistoricoModal(false)}
          selectedPaciente={selectedPaciente}
          historicoPaciente={historicoPaciente || []}
          consultasPaciente={consultasPaciente || []}
        />

        {/* Modal de Agendar Consulta para Paciente - CORRIGIDO */}
        <UBSAgendarConsultaPacienteModal
          isOpen={showConsultaPacienteModal}
          onClose={() => setShowConsultaPacienteModal(false)}
          selectedPaciente={selectedPaciente}
          consultaPacienteData={consultaPacienteData}
          setConsultaPacienteData={setConsultaPacienteData}
          funcionarios={funcionarios || []}
          onSubmit={handleConsultaPacienteSubmit}
        />

        {/* Modal de Inscrições da Campanha */}
        <Modal
          isOpen={showInscricoesModal}
          onClose={() => setShowInscricoesModal(false)}
          title={`Inscrições - ${selectedCampanha?.titulo}`}
          size="xl"
        >
          {inscricoesCampanha && inscricoesCampanha.length > 0 ? (
            <div className="space-y-4">
              {inscricoesCampanha.map((inscricao: any) => (
                <div key={inscricao.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">
                      {inscricao.nome}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inscricao.status === "agendado"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {inscricao.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>
                      <span className="font-medium">CPF:</span> {inscricao.cpf}{" "}
                      | <span className="font-medium">Telefone:</span>{" "}
                      {inscricao.telefone}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {inscricao.email}
                    </p>
                    {inscricao.idade && (
                      <p>
                        <span className="font-medium">Idade:</span>{" "}
                        {inscricao.idade}
                      </p>
                    )}
                    {inscricao.condicoesSaude && (
                      <p>
                        <span className="font-medium">Condições de Saúde:</span>{" "}
                        {inscricao.condicoesSaude}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Prioridade:</span>{" "}
                      {inscricao.prioridade} |{" "}
                      <span className="font-medium">Pontuação:</span>{" "}
                      {inscricao.pontuacao}
                    </p>
                    {inscricao.dataAgendada && (
                      <p>
                        <span className="font-medium">Agendado para:</span>{" "}
                        {format(
                          new Date(inscricao.dataAgendada),
                          "dd/MM/yyyy",
                          { locale: ptBR },
                        )}
                        {inscricao.horaAgendada &&
                          ` às ${inscricao.horaAgendada}`}
                      </p>
                    )}
                    {inscricao.localAtendimento && (
                      <p>
                        <span className="font-medium">Local:</span>{" "}
                        {inscricao.localAtendimento}
                      </p>
                    )}
                    {inscricao.observacoes && (
                      <p>
                        <span className="font-medium">Observações:</span>{" "}
                        {inscricao.observacoes}
                      </p>
                    )}
                  </div>
                  {inscricao.status === "inscrito" && (
                    <button
                      onClick={() => openAgendamentoCampanhaModal(inscricao)}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Calendar className="w-4 h-4 mr-2" /> Agendar
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhuma inscrição encontrada.
            </p>
          )}
        </Modal>

        {/* Modal de Agendamento de Campanha */}
        <Modal
          isOpen={showAgendamentoCampanhaModal}
          onClose={() => setShowAgendamentoCampanhaModal(false)}
          title="Agendar Atendimento"
          size="lg"
        >
          {selectedInscricao && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Detalhes</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Inscrito:</span>{" "}
                  {selectedInscricao.nome}
                </p>
                <p>
                  <span className="font-medium">Campanha:</span>{" "}
                  {selectedCampanha?.titulo}
                </p>
              </div>
            </div>
          )}
          <form
            onSubmit={handleAgendamentoCampanhaSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input
                type="date"
                value={agendamentoCampanhaData.dataAgendada}
                onChange={(e) =>
                  setAgendamentoCampanhaData({
                    ...agendamentoCampanhaData,
                    dataAgendada: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora *
              </label>
              <input
                type="time"
                value={agendamentoCampanhaData.horaAgendada}
                onChange={(e) =>
                  setAgendamentoCampanhaData({
                    ...agendamentoCampanhaData,
                    horaAgendada: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local de Atendimento *
              </label>
              <input
                type="text"
                value={agendamentoCampanhaData.localAtendimento}
                onChange={(e) =>
                  setAgendamentoCampanhaData({
                    ...agendamentoCampanhaData,
                    localAtendimento: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Sala 1, Auditório, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={agendamentoCampanhaData.observacoes}
                onChange={(e) =>
                  setAgendamentoCampanhaData({
                    ...agendamentoCampanhaData,
                    observacoes: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Observações sobre o atendimento"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAgendamentoCampanhaModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Agendar
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Solicitação de Internação - CORRIGIDO */}
        <Modal
          isOpen={showInternacaoModal}
          onClose={() => setShowInternacaoModal(false)}
          title="Solicitar Internação"
          size="xl"
        >
          {selectedPaciente && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">
                Dados do Paciente
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Nome:</span>{" "}
                  {selectedPaciente.nome}
                </p>
                <p>
                  <span className="font-medium">CPF:</span>{" "}
                  {selectedPaciente.cpf}
                </p>
                <p>
                  <span className="font-medium">CNS:</span>{" "}
                  {selectedPaciente.cns}
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleInternacaoSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select
                  value={internacaoData.hospitalId}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      hospitalId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione um hospital</option>
                  {loadingHospitais ? (
                    <option disabled>Carregando hospitais...</option>
                  ) : hospitaisError ? (
                    <option disabled>Erro ao carregar hospitais</option>
                  ) : hospitaisList?.length === 0 ? (
                    <option disabled>Nenhum hospital cadastrado</option>
                  ) : (
                    hospitaisList?.map((hospital: any) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.nome}
                      </option>
                    ))
                  )}
                </select>
                {loadingHospitais && (
                  <p className="text-xs text-gray-500 mt-1">
                    Carregando lista de hospitais...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funcionário Responsável *
                </label>
                <select
                  value={internacaoData.funcionarioId}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      funcionarioId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione um funcionário</option>
                  {funcionarios?.map((func: any) => (
                    <option key={func.id} value={func.id}>
                      {func.nome} - {func.funcao}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  value={internacaoData.tipo}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      tipo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva o motivo da internação"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Descreva detalhes clínicos relevantes"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Laudo médico completo justificando a internação"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowInternacaoModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={solicitarInternacaoMutation.isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center disabled:opacity-50"
              >
                {solicitarInternacaoMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Solicitar Internação
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* Medicamentos Tab */}
        {activeTab === "medicamentos" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Medicamentos</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
  <button
    onClick={() => {
      resetMedForm();
      setShowMedModal(true);
    }}
    className="
      inline-flex items-center justify-center
      bg-gradient-to-r from-green-950 to-emerald-700
      hover:from-green-700 hover:to-emerald-700
      text-white font-medium
      px-6 py-2.5
      rounded-xl
      shadow-sm hover:shadow-md
      transition-all duration-200
      active:scale-[0.98]
      whitespace-nowrap
    "
  >
    <Plus className="w-4 h-4 mr-2" />
    Novo Medicamento
  </button>

  <div className="relative w-full max-w-md">
    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
      <Search className="w-5 h-5 text-gray-400" />
    </div>

    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Buscar medicamentos..."
      className="
        w-full
        pl-12 pr-4 py-3
        rounded-xl
        border border-gray-200
        bg-white/90
        text-gray-700
        placeholder:text-gray-400
        shadow-sm
        transition-all duration-200
        focus:outline-none
        focus:ring-2 focus:ring-blue-500/30
        focus:border-blue-500
        hover:border-gray-300
      "
    />
  </div>
</div>
            </div>
            {loadingMedicamentos ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando medicamentos...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {medicamentos
                  ?.filter(
                    (med: any) =>
                      med.nome
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      med.descricao
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                  )
                  .map((med: any) => (
                    <MedicamentoCard
                      key={med.id}
                      medicamento={med}
                      onEdit={handleEditMed}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UBSDashboard;
