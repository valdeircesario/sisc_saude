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

// Componente Modal Base
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}> = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

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
        <Modal
          isOpen={showFuncModal}
          onClose={() => setShowFuncModal(false)}
          title={editingItem ? "Editar Funcionário" : "Novo Funcionário"}
          size="lg"
        >
          <form onSubmit={handleFuncSubmit} className="flex flex-col gap-4">
            {/* Seção: Dados pessoais */}
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              Dados pessoais
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={funcData.nome}
                  onChange={(e) =>
                    setFuncData({ ...funcData, nome: e.target.value })
                  }
                  placeholder="Ex.: João Silva"
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={funcData.cpf}
                  onChange={(e) =>
                    setFuncData({ ...funcData, cpf: e.target.value })
                  }
                  placeholder="000.000.000-00"
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={funcData.telefone}
                  onChange={(e) =>
                    setFuncData({ ...funcData, telefone: e.target.value })
                  }
                  placeholder="(00) 00000-0000"
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={funcData.email}
                  onChange={(e) =>
                    setFuncData({ ...funcData, email: e.target.value })
                  }
                  placeholder="nome@exemplo.com"
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Seção: Dados profissionais */}
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              Dados profissionais
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-gray-600">
                Função <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {["Médico", "Enfermeiro", "Farmacêutico"].map((opcao) => (
                  <button
                    key={opcao}
                    type="button"
                    onClick={() => setFuncData({ ...funcData, funcao: opcao })}
                    className={`px-4 py-1.5 rounded-full text-xs border transition-colors ${
                      funcData.funcao === opcao
                        ? "bg-green-100 border-green-600 text-green-800 font-medium"
                        : "bg-white border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-700 hover:bg-green-50"
                    }`}
                  >
                    {opcao}
                  </button>
                ))}
              </div>
              <input type="hidden" value={funcData.funcao} required />
            </div>

            <div className="flex flex-col gap-1.5 w-1/2">
              <label className="text-xs font-medium text-gray-600">
                CRM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={funcData.crm}
                onChange={(e) =>
                  setFuncData({ ...funcData, crm: e.target.value })
                }
                placeholder="Ex.: CRM/SP 123456"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <hr className="border-gray-100" />

            {/* Seção: Acesso ao sistema */}
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              Acesso ao sistema
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Senha{" "}
                {editingItem ? (
                  <span className="text-gray-400 font-normal">
                    (deixe em branco para manter a atual)
                  </span>
                ) : (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <input
                type="password"
                value={funcData.senha}
                onChange={(e) =>
                  setFuncData({ ...funcData, senha: e.target.value })
                }
                placeholder="Mínimo 8 caracteres"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required={!editingItem}
              />
              <span className="text-xs text-gray-400">
                Use letras, números e símbolos para uma senha forte.
              </span>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowFuncModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors"
              >
                {editingItem ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Campanha */}
        <Modal
          isOpen={showCampanhaModal}
          onClose={() => setShowCampanhaModal(false)}
          title="Nova Campanha"
          size="lg"
        >
          <form onSubmit={handleCampanhaSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={campanhaData.titulo}
                onChange={(e) =>
                  setCampanhaData({ ...campanhaData, titulo: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                value={campanhaData.descricao}
                onChange={(e) =>
                  setCampanhaData({
                    ...campanhaData,
                    descricao: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <input
                type="text"
                value={campanhaData.tipo}
                onChange={(e) =>
                  setCampanhaData({ ...campanhaData, tipo: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Início *
                </label>
                <input
                  type="date"
                  value={campanhaData.dataIni}
                  onChange={(e) =>
                    setCampanhaData({
                      ...campanhaData,
                      dataIni: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Fim (opcional)
                </label>
                <input
                  type="date"
                  value={campanhaData.dataFim}
                  onChange={(e) =>
                    setCampanhaData({
                      ...campanhaData,
                      dataFim: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCampanhaModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
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
          size="lg"
        >
          <form onSubmit={handleEditCampanhaSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={editCampanhaData.titulo}
                onChange={(e) =>
                  setEditCampanhaData({
                    ...editCampanhaData,
                    titulo: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                value={editCampanhaData.descricao}
                onChange={(e) =>
                  setEditCampanhaData({
                    ...editCampanhaData,
                    descricao: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <input
                type="text"
                value={editCampanhaData.tipo}
                onChange={(e) =>
                  setEditCampanhaData({
                    ...editCampanhaData,
                    tipo: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Início *
                </label>
                <input
                  type="date"
                  value={editCampanhaData.dataIni}
                  onChange={(e) =>
                    setEditCampanhaData({
                      ...editCampanhaData,
                      dataIni: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Fim (opcional)
                </label>
                <input
                  type="date"
                  value={editCampanhaData.dataFim}
                  onChange={(e) =>
                    setEditCampanhaData({
                      ...editCampanhaData,
                      dataFim: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditCampanhaModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Atualizar
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Medicamento */}
        <Modal
          isOpen={showMedModal}
          onClose={() => setShowMedModal(false)}
          title={editingMed ? "Editar Medicamento" : "Novo Medicamento"}
          size="lg"
        >
          <form onSubmit={handleMedSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Medicamento *
              </label>
              <input
                type="text"
                value={medData.nome}
                onChange={(e) =>
                  setMedData({ ...medData, nome: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={medData.descricao}
                onChange={(e) =>
                  setMedData({ ...medData, descricao: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lote *
                </label>
                <input
                  type="text"
                  value={medData.lote}
                  onChange={(e) =>
                    setMedData({ ...medData, lote: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade *
                </label>
                <input
                  type="number"
                  min="0"
                  value={medData.quantidade}
                  onChange={(e) =>
                    setMedData({ ...medData, quantidade: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Validade *
                </label>
                <input
                  type="date"
                  value={medData.dataValidade}
                  onChange={(e) =>
                    setMedData({ ...medData, dataValidade: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="med-vencido"
                type="checkbox"
                checked={medData.vencido}
                onChange={(e) =>
                  setMedData({ ...medData, vencido: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="med-vencido" className="text-sm text-gray-700">
                Marcar como vencido
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowMedModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {editingMed ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Agendamento de Consulta */}
        <Modal
          isOpen={showAgendamentoModal}
          onClose={() => setShowAgendamentoModal(false)}
          title="Agendar Consulta"
          size="lg"
        >
          {selectedConsulta && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">
                Detalhes da Consulta
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Paciente:</span>{" "}
                  {selectedConsulta.paciente.nome}
                </p>
                <p>
                  <span className="font-medium">Especialidade:</span>{" "}
                  {selectedConsulta.especialidade}
                </p>
                <p>
                  <span className="font-medium">Motivo:</span>{" "}
                  {selectedConsulta.motivo}
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleAgendamentoSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data e Hora *
              </label>
              <input
                type="datetime-local"
                value={agendamentoData.dataAgendada}
                onChange={(e) =>
                  setAgendamentoData({
                    ...agendamentoData,
                    dataAgendada: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funcionário *
              </label>
              <select
                value={agendamentoData.funcionarioId}
                onChange={(e) =>
                  setAgendamentoData({
                    ...agendamentoData,
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={agendamentoData.observacoes}
                onChange={(e) =>
                  setAgendamentoData({
                    ...agendamentoData,
                    observacoes: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAgendamentoModal(false)}
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

        {/* Modal de Editar Paciente */}
        <Modal
          isOpen={showPacienteModal}
          onClose={() => setShowPacienteModal(false)}
          title="Editar Paciente"
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
              </div>
            </div>
          )}
          <form onSubmit={handlePacienteEditSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço *
              </label>
              <input
                type="text"
                value={pacienteEditData.endereco}
                onChange={(e) =>
                  setPacienteEditData({
                    ...pacienteEditData,
                    endereco: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone *
              </label>
              <input
                type="text"
                value={pacienteEditData.telefone}
                onChange={(e) =>
                  setPacienteEditData({
                    ...pacienteEditData,
                    telefone: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPacienteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Atualizar
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Cancelamento de Consulta */}
        <Modal
          isOpen={showCancelamentoModal}
          onClose={() => setShowCancelamentoModal(false)}
          title="Cancelar Consulta"
          size="lg"
        >
          {selectedConsulta && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">
                Detalhes da Consulta
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Paciente:</span>{" "}
                  {selectedConsulta.paciente.nome}
                </p>
                <p>
                  <span className="font-medium">Especialidade:</span>{" "}
                  {selectedConsulta.especialidade}
                </p>
                <p>
                  <span className="font-medium">Motivo:</span>{" "}
                  {selectedConsulta.motivo}
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleCancelamentoSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo do Cancelamento
              </label>
              <textarea
                value={cancelamentoData.observacoes}
                onChange={(e) =>
                  setCancelamentoData({
                    ...cancelamentoData,
                    observacoes: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Digite o motivo do cancelamento..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCancelamentoModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancelar Consulta
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal de Histórico do Paciente */}
        <Modal
          isOpen={showHistoricoModal}
          onClose={() => setShowHistoricoModal(false)}
          title={`Histórico Médico - ${selectedPaciente?.nome}`}
          size="xl"
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Histórico Médico
              </h4>
              {historicoPaciente && historicoPaciente.length > 0 ? (
                <div className="space-y-4">
                  {historicoPaciente.map((item: any) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-medium text-gray-900">
                          {item.diagnostico}
                        </h5>
                        <span className="text-sm text-gray-500">
                          {format(new Date(item.dataConsulta), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Médico:</span>{" "}
                          {item.funcionario.nome} ({item.funcionario.funcao})
                        </p>
                        <p>
                          <span className="font-medium">UBS:</span>{" "}
                          {item.funcionario.ubs.nome}
                        </p>
                        <p>
                          <span className="font-medium">Laudo:</span>{" "}
                          {item.laudo}
                        </p>
                        {item.doenca && (
                          <p>
                            <span className="font-medium">Doença:</span>{" "}
                            {item.doenca}
                          </p>
                        )}
                        {item.medicacao && (
                          <p>
                            <span className="font-medium">Medicação:</span>{" "}
                            {item.medicacao}
                          </p>
                        )}
                        {item.observacoes && (
                          <p>
                            <span className="font-medium">Observações:</span>{" "}
                            {item.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum histórico médico encontrado.
                </p>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Consultas
              </h4>
              {consultasPaciente && consultasPaciente.length > 0 ? (
                <div className="space-y-4">
                  {consultasPaciente.map((consulta: any) => (
                    <div
                      key={consulta.id}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-medium text-gray-900">
                          {consulta.especialidade}
                        </h5>
                        <span className="text-sm text-gray-500">
                          {format(new Date(consulta.createdAt), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Motivo:</span>{" "}
                          {consulta.motivo}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>{" "}
                          {consulta.status}
                        </p>
                        {consulta.dataAgendada && (
                          <p>
                            <span className="font-medium">Data Agendada:</span>{" "}
                            {format(
                              new Date(consulta.dataAgendada),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR },
                            )}
                          </p>
                        )}
                        {consulta.funcionario && (
                          <p>
                            <span className="font-medium">Médico:</span>{" "}
                            {consulta.funcionario.nome}
                          </p>
                        )}
                        {consulta.observacoes && (
                          <p>
                            <span className="font-medium">Observações:</span>{" "}
                            {consulta.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma consulta encontrada.
                </p>
              )}
            </div>
          </div>
        </Modal>

        {/* Modal de Agendar Consulta para Paciente - CORRIGIDO */}
        <Modal
          isOpen={showConsultaPacienteModal}
          onClose={() => setShowConsultaPacienteModal(false)}
          title="Agendar Consulta"
          size="lg"
        >
          {selectedPaciente && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Paciente</h4>
              <p className="text-sm text-gray-600">{selectedPaciente.nome}</p>
            </div>
          )}
          <form onSubmit={handleConsultaPacienteSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidade *
              </label>
              <input
                type="text"
                value={consultaPacienteData.especialidade}
                onChange={(e) =>
                  setConsultaPacienteData({
                    ...consultaPacienteData,
                    especialidade: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Cardiologia, Clínica Geral, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo *
              </label>
              <input
                type="text"
                value={consultaPacienteData.motivo}
                onChange={(e) =>
                  setConsultaPacienteData({
                    ...consultaPacienteData,
                    motivo: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva o motivo da consulta"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data e Hora *
              </label>
              <input
                type="datetime-local"
                value={consultaPacienteData.dataAgendada}
                onChange={(e) =>
                  setConsultaPacienteData({
                    ...consultaPacienteData,
                    dataAgendada: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funcionário *
              </label>
              <select
                value={consultaPacienteData.funcionarioId}
                onChange={(e) =>
                  setConsultaPacienteData({
                    ...consultaPacienteData,
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={consultaPacienteData.observacoes}
                onChange={(e) =>
                  setConsultaPacienteData({
                    ...consultaPacienteData,
                    observacoes: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Observações adicionais sobre a consulta"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowConsultaPacienteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Agendar Consulta
              </button>
            </div>
          </form>
        </Modal>

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
