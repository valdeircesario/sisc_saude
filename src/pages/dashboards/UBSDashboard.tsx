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
import { UBSFuncionariosTab } from "../../components/UBS/UBSFuncionariosTab";
import { UBSPacientesTab } from "../../components/UBS/UBSPacientesTab";
import { UBSCampanhasTab } from "../../components/UBS/UBSCampanhasTab";
import { UBSConsultasTab } from "../../components/UBS/UBSConsultasTab";
import { UBSMedicamentosTab } from "../../components/UBS/UBSMedicamentosTab";
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
          <UBSFuncionariosTab
            funcionarios={funcionarios || []}
            loadingFuncionarios={loadingFuncionarios}
            setShowFuncModal={setShowFuncModal}
            handleEditFunc={handleEditFunc}
            handleDeleteFunc={handleDeleteFunc}
          />
        )}

        {/* Pacientes Tab */}
        {activeTab === "pacientes" && (
          <UBSPacientesTab
            pacientes={pacientes || []}
            loadingPacientes={loadingPacientes}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            openPacienteModal={openPacienteModal}
            openHistoricoModal={openHistoricoModal}
            openConsultaPacienteModal={openConsultaPacienteModal}
            openInternacaoModal={openInternacaoModal}
          />
        )}

        {/* Campanhas Tab */}
        {activeTab === "campanhas" && (
          <UBSCampanhasTab
            campanhas={campanhas || []}
            loadingCampanhas={loadingCampanhas}
            inscricoesPorCampanha={inscricoesPorCampanha}
            setShowCampanhaModal={setShowCampanhaModal}
            handleEditCampanha={handleEditCampanha}
            handleDeleteCampanha={handleDeleteCampanha}
            openInscricoesModal={openInscricoesModal}
          />
        )}

        {/* Consultas Tab */}
        {activeTab === "consultas" && (
          <UBSConsultasTab
            filteredConsultas={filteredConsultas}
            loadingConsultas={loadingConsultas}
            consultaSearchTerm={consultaSearchTerm}
            setConsultaSearchTerm={setConsultaSearchTerm}
            consultaStatusFilter={consultaStatusFilter}
            setConsultaStatusFilter={setConsultaStatusFilter}
            openAgendamentoModal={openAgendamentoModal}
            openCancelamentoModal={openCancelamentoModal}
          />
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
        <UBSInscricoesCampanhaModal
          isOpen={showInscricoesModal}
          onClose={() => setShowInscricoesModal(false)}
          selectedCampanha={selectedCampanha}
          inscricoesCampanha={inscricoesCampanha || []}
          openAgendamentoCampanhaModal={openAgendamentoCampanhaModal}
        />

        {/* Modal de Agendamento de Campanha */}
        <UBSAgendamentoCampanhaModal
          isOpen={showAgendamentoCampanhaModal}
          onClose={() => setShowAgendamentoCampanhaModal(false)}
          selectedInscricao={selectedInscricao}
          selectedCampanha={selectedCampanha}
          agendamentoCampanhaData={agendamentoCampanhaData}
          setAgendamentoCampanhaData={setAgendamentoCampanhaData}
          onSubmit={handleAgendamentoCampanhaSubmit}
        />



        {/* Modal de Solicitação de Internação - CORRIGIDO */}
        <UBSSolicitarInternacaoModal
          isOpen={showInternacaoModal}
          onClose={() => setShowInternacaoModal(false)}
          selectedPaciente={selectedPaciente}
          internacaoData={internacaoData}
          setInternacaoData={setInternacaoData}
          hospitaisList={hospitaisList || []}
          loadingHospitais={loadingHospitais}
          hospitaisError={hospitaisError}
          funcionarios={funcionarios || []}
          solicitarInternacaoMutation={solicitarInternacaoMutation}
          onSubmit={handleInternacaoSubmit}
        />

        {/* Medicamentos Tab */}
        {activeTab === "medicamentos" && (
          <UBSMedicamentosTab
            medicamentos={medicamentos || []}
            loadingMedicamentos={loadingMedicamentos}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            resetMedForm={resetMedForm}
            setShowMedModal={setShowMedModal}
            handleEditMed={handleEditMed}
          />
        )}
      </div>
    </div>
  );
};

export default UBSDashboard;
