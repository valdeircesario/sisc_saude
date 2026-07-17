import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Users,
  Heart,
  Shield,
  FileText,
  Pill,
  Building2,
} from "lucide-react";

export const useFuncionarioDashboard = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("pacientes");
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [showBuscaHistoricoModal, setShowBuscaHistoricoModal] = useState(false);
  const [showVacinaModal, setShowVacinaModal] = useState(false);
  const [showExameModal, setShowExameModal] = useState(false);
  const [showInternacaoModal, setShowInternacaoModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [exameSearchTerm, setExameSearchTerm] = useState("");
  const [medSearchTerm, setMedSearchTerm] = useState("");
  const [solicitacoesFiltroPaciente, setSolicitacoesFiltroPaciente] =
    useState("");
  const [solicitacoesFiltroTipo, setSolicitacoesFiltroTipo] = useState("todos");
  const [editingMed, setEditingMed] = useState<any>(null);
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [selectedAdminPaciente, setSelectedAdminPaciente] = useState<any>(null);
  const [
    showAdministradorMedicamentoModal,
    setShowAdministradorMedicamentoModal,
  ] = useState(false);
  const [medData, setMedData] = useState({
    quantidade: "",
    dataValidade: "",
    observacoes: "",
  });
  const [administracaoData, setAdministracaoData] = useState({
    pacienteCns: "",
    quantidade: "",
    dataRetirada: new Date().toISOString().slice(0, 16),
    observacoes: "",
  });
  const [cnsBuscaTerm, setCnsBuscaTerm] = useState("");
  const [isBuscandoPacienteCns, setIsBuscandoPacienteCns] = useState(false);

  const buscarPacientePorCns = async () => {
    if (!cnsBuscaTerm.trim()) {
      toast.error("Informe o CNS ou CPF do paciente.");
      return;
    }
    setIsBuscandoPacienteCns(true);
    try {
      const res = await api.get("/funcionario/pacientes", {
        params: { busca: cnsBuscaTerm.trim() },
      });
      
      const paciente = res.data?.find((p: any) => 
        p.cns === cnsBuscaTerm.trim() || p.cpf === cnsBuscaTerm.trim()
      );

      if (paciente) {
        setSelectedAdminPaciente(paciente);
        setAdministracaoData(prev => ({ ...prev, pacienteCns: paciente.cns }));
        toast.success(`Paciente ${paciente.nome} localizado!`);
      } else {
        toast.error("Paciente não localizado com os dados informados.");
      }
    } catch (error) {
      toast.error("Erro ao buscar paciente.");
    } finally {
      setIsBuscandoPacienteCns(false);
    }
  };

  const [historicoData, setHistoricoData] = useState({
    laudo: "",
    doenca: "",
    diagnostico: "",
    medicacao: "",
    observacoes: "",
    dataConsulta: new Date().toISOString().split("T")[0],
  });
  const [cpfHistoricoBusca, setCpfHistoricoBusca] = useState("");
  const [historicoBuscaResultado, setHistoricoBuscaResultado] =
    useState<any>(null);
  const [registroHistoricoDetalhe, setRegistroHistoricoDetalhe] =
    useState<any>(null);

  // Estados para consulta de receita
  const [registroReceitaBusca, setRegistroReceitaBusca] = useState("");
  const [receitaEncontrada, setReceitaEncontrada] = useState<any>(null);
  const [carregandoReceita, setCarregandoReceita] = useState(false);

  // Estados para dispensação de receita
  const [showDispensacaoModal, setShowDispensacaoModal] = useState(false);
  const [showDetalhesDispensacaoModal, setShowDetalhesDispensacaoModal] =
    useState(false);
  const [dispensacaoData, setDispensacaoData] = useState({
    statusDispensacao: "completa",
    medicamentoFornecido: "",
    quantidadeDispensada: "",
    observacoesDispensacao: "",
  });
  const [medicamentosSelecionados, setMedicamentosSelecionados] = useState<
    Record<
      string,
      {
        selecionado: boolean;
        medicamentoFornecido: string;
        quantidadeDispensada: number;
        observacoes: string;
      }
    >
  >({});
  const [carregandoValidacaoDispensacao, setCarregandoValidacaoDispensacao] =
    useState(false);
  const [erroDispensacao, setErroDispensacao] = useState<any>(null);

  const [vacinaData, setVacinaData] = useState({
    nome: "",
    lote: "",
    dataApl: new Date().toISOString().split("T")[0],
    proximaDose: "",
  });

  const [exameData, setExameData] = useState({
    laboratorioId: "",
    tipoExame: "",
    observacoes: "",
  });

  const [internacaoData, setInternacaoData] = useState({
    hospitalId: "",
    tipo: "",
    motivo: "",
    detalhes: "",
    laudoMedico: "",
    prioridade: "medio",
    observacoes: "",
  });

  // Queries
  const { data: pacientes, isLoading: loadingPacientes } = useQuery(
    ["funcionario-pacientes", searchTerm],
    () =>
      api
        .get(`/funcionario/pacientes?busca=${searchTerm}`)
        .then((res) => res.data),
    { enabled: activeTab === "pacientes" },
  );

  const { data: historicoPaciente } = useQuery(
    ["paciente-historico", selectedPaciente?.id],
    () =>
      api
        .get(`/funcionario/pacientes/${selectedPaciente.id}/historico`)
        .then((res) => res.data),
    { enabled: !!selectedPaciente && activeTab === "historico" },
  );

  const { data: laboratorios } = useQuery(
    "funcionario-laboratorios",
    () => api.get("/funcionario/laboratorios").then((res) => res.data),
    { enabled: showExameModal },
  );

  const {
    data: hospitais,
    isLoading: loadingHospitais,
    isError: hospitaisError,
  } = useQuery(
    "funcionario-hospitais",
    () => api.get("/funcionario/hospitais").then((res) => res.data),
    { enabled: showInternacaoModal },
  );

  const { data: minhasSolicitacoes } = useQuery(
    "minhas-solicitacoes",
    () => api.get("/funcionario/minhas-solicitacoes").then((res) => res.data),
    { enabled: activeTab === "solicitacoes" },
  );

  const pacientesSolicitacoes = useMemo(() => {
    const map = new Map<string, string>();

    minhasSolicitacoes?.forEach((solicitacao: any) => {
      const pacienteId =
        solicitacao.paciente?.id || solicitacao.paciente?.nome || "";
      if (pacienteId && !map.has(pacienteId)) {
        map.set(
          pacienteId,
          solicitacao.paciente?.nome || "Paciente desconhecido",
        );
      }
    });

    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [minhasSolicitacoes]);

  const filteredSolicitacoes = useMemo(
    () =>
      minhasSolicitacoes?.filter((solicitacao: any) => {
        const pacienteNome = solicitacao.paciente?.nome || "";
        const query = solicitacoesFiltroPaciente.trim().toLowerCase();
        const matchesPaciente = query
          ? pacienteNome.toLowerCase().includes(query)
          : true;
        const matchesTipo =
          solicitacoesFiltroTipo === "todos" ||
          solicitacao.solicitacaoTipo === solicitacoesFiltroTipo;

        return matchesPaciente && matchesTipo;
      }) || [],
    [minhasSolicitacoes, solicitacoesFiltroPaciente, solicitacoesFiltroTipo],
  );

  const {
    data: consultas,
    refetch: refetchConsultas,
    isFetching: loadingConsultas,
  } = useQuery(
    "funcionario-consultas",
    () => api.get("/funcionario/consultas").then((res) => res.data),
    {
      enabled: activeTab === "consultas",
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  );

  const resetHistoricoForm = () => {
    setHistoricoData({
      laudo: "",
      doenca: "",
      diagnostico: "",
      medicacao: "",
      observacoes: "",
      dataConsulta: new Date().toISOString().split("T")[0],
    });
  };

  const resetVacinaForm = () => {
    setVacinaData({
      nome: "",
      lote: "",
      dataApl: new Date().toISOString().split("T")[0],
      proximaDose: "",
    });
  };

  const resetDispensacaoForm = () => {
    setDispensacaoData({
      statusDispensacao: "completa",
      medicamentoFornecido: "",
      quantidadeDispensada: "",
      observacoesDispensacao: "",
    });
    setMedicamentosSelecionados({});
    setErroDispensacao(null);
  };

  const resetExameForm = () => {
    setExameData({
      laboratorioId: "",
      tipoExame: "",
      observacoes: "",
    });
  };

  const resetInternacaoForm = () => {
    setInternacaoData({
      hospitalId: "",
      tipo: "",
      motivo: "",
      detalhes: "",
      laudoMedico: "",
      prioridade: "medio",
      observacoes: "",
    });
  };

  const resetMedForm = () => {
    setMedData({
      quantidade: "",
      dataValidade: "",
      observacoes: "",
    });
    setEditingMed(null);
  };

  const resetAdministracaoForm = () => {
    setAdministracaoData({
      pacienteCns: "",
      quantidade: "",
      dataRetirada: new Date().toISOString().slice(0, 16),
      observacoes: "",
    });
    setSelectedMed(null);
    setSelectedAdminPaciente(null);
    setShowAdministradorMedicamentoModal(false);
  };

  // Mutations
  const createHistoricoMutation = useMutation(
    (data: any) => api.post("/funcionario/historico-medico", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          "paciente-historico",
          selectedPaciente?.id,
        ]);
        toast.success("Histórico médico registrado com sucesso!");
        setShowHistoricoModal(false);
        resetHistoricoForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao registrar histórico médico",
        );
      },
    },
  );

  const buscarHistoricoPorCpfMutation = useMutation(
    (cpf: string) =>
      api
        .get("/funcionario/historico-paciente/cpf", { params: { cpf } })
        .then((res) => res.data),
    {
      onSuccess: (data) => {
        setHistoricoBuscaResultado(data);
        setSelectedPaciente(data.paciente);
        setRegistroHistoricoDetalhe(null);
        setCpfHistoricoBusca("");
        setShowBuscaHistoricoModal(false);
        toast.success("Histórico encontrado com sucesso!");
      },
      onError: (error: any) => {
        setHistoricoBuscaResultado(null);
        toast.error(
          error.response?.data?.message ||
            "Não foi possível buscar o histórico.",
        );
      },
    },
  );

  const buscarReceitaMutation = useMutation(
    (registro: string) =>
      api
        .get(`/funcionario/consultar-receita/${encodeURIComponent(registro)}`)
        .then((res) => res.data),
    {
      onSuccess: (data) => {
        setReceitaEncontrada(data);
        setRegistroReceitaBusca("");
        toast.success("Receita encontrada com sucesso!");
      },
      onError: (error: any) => {
        setReceitaEncontrada(null);
        toast.error(error.response?.data?.message || "Receita não encontrada");
      },
    },
  );

  const validarDispensacaoMutation = useMutation(
    (receitaId: string) =>
      api
        .get(`/funcionario/validar-dispensacao/${receitaId}`)
        .then((res) => res.data),
    {
      onSuccess: (data) => {
        setErroDispensacao(null);
        setShowDispensacaoModal(true);
      },
      onError: (error: any) => {
        setErroDispensacao(error.response?.data);
        toast.error(
          error.response?.data?.message ||
            "Erro ao validar dispensação da receita",
        );
      },
    },
  );

  const dispensarReceitaMutation = useMutation(
    (data: any) => api.post("/funcionario/dispensar-receita", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("funcionario-receitas");
        toast.success("Receita dispensada com sucesso!");
        setShowDispensacaoModal(false);
        resetDispensacaoForm();
        if (receitaEncontrada) {
          buscarReceitaMutation.mutate(
            receitaEncontrada.registroAssinatura || registroReceitaBusca,
          );
        }
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao dispensar receita",
        );
        setErroDispensacao(error.response?.data);
      },
    },
  );

  const dispensarMedicamentosMutation = useMutation(
    (data: any) => api.post("/funcionario/dispensar-medicamentos", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("funcionario-receitas");
        toast.success("Medicamentos dispensados com sucesso!");
        setShowDispensacaoModal(false);
        resetDispensacaoForm();
        setMedicamentosSelecionados({});
        if (receitaEncontrada) {
          buscarReceitaMutation.mutate(
            receitaEncontrada.registroAssinatura || registroReceitaBusca,
          );
        }
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao dispensar medicamentos",
        );
        setErroDispensacao(error.response?.data);
      },
    },
  );

  const createVacinaMutation = useMutation(
    (data: any) => api.post("/funcionario/vacinas", data),
    {
      onSuccess: () => {
        toast.success("Vacina registrada com sucesso!");
        setShowVacinaModal(false);
        resetVacinaForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao registrar vacina",
        );
      },
    },
  );

  const solicitarExameMutation = useMutation(
    (data: any) => api.post("/funcionario/solicitar-exame", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("minhas-solicitacoes");
        toast.success("Solicitação de exame enviada com sucesso!");
        setShowExameModal(false);
        resetExameForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Erro ao solicitar exame");
      },
    },
  );

  const solicitarInternacaoMutation = useMutation(
    (data: any) => api.post("/funcionario/solicitacoes-internacao", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("minhas-solicitacoes");
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

  const { data: medicamentosDaUbs, isLoading: loadingMedicamentos } = useQuery(
    ["funcionario-medicamentos", searchTerm],
    () =>
      api
        .get(
          `/funcionario/medicamentos?busca=${encodeURIComponent(searchTerm)}`,
        )
        .then((res) => res.data),
    {
      enabled:
        activeTab === "medicamentos" || showAdministradorMedicamentoModal,
    },
  );

  const filteredMedicamentos = medicamentosDaUbs?.filter((med: any) =>
    med.nome?.toLowerCase().includes(medSearchTerm.trim().toLowerCase()),
  );

  const updateMedicamentoMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/funcionario/medicamentos/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["funcionario-medicamentos"]);
        toast.success("Medicamento atualizado com sucesso!");
        resetMedForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao atualizar medicamento",
        );
      },
    },
  );

  const administrarMedicamentoMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.post(`/funcionario/medicamentos/${id}/administrar`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["funcionario-medicamentos"]);
        toast.success("Medicação ministrada com sucesso!");
        setSelectedMed(null);
        resetAdministracaoForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao ministrar medicação",
        );
      },
    },
  );

  const [modalHistorico, setModalHistorico] = useState<{
    aberto: boolean;
    consulta: any;
  }>({
    aberto: false,
    consulta: null,
  });
  const [selectedConsulta, setSelectedConsulta] = useState<any>(null);
  const [showConsultaDetailsModal, setShowConsultaDetailsModal] =
    useState(false);

  const [formHistorico, setFormHistorico] = useState({
    laudo: "",
    diagnostico: "",
    doenca: "",
    medicacao: "",
    observacoes: "",
    dataConsulta: format(new Date(), "yyyy-MM-dd"),
    incluirReceita: false,
    receita: {
      descricao: "",
      cid: "",
      medicamentos: [{ medicamento: "", dosagem: "", quantidade: "1", posologia: "", observacoes: "" }],
      observacoes: "",
    },
    incluirAtestado: false,
    atestado: {
      descricao: "",
      cid: "",
      diasRepouso: "",
      observacoes: "",
    }
  });

  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const toggleIncluirReceita = () => {
    setFormHistorico(prev => ({
      ...prev,
      incluirReceita: !prev.incluirReceita,
      receita: {
        ...prev.receita,
        cid: !prev.incluirReceita ? prev.doenca : prev.receita.cid
      }
    }));
  };

  const toggleIncluirAtestado = () => {
    setFormHistorico(prev => ({
      ...prev,
      incluirAtestado: !prev.incluirAtestado,
      atestado: {
        ...prev.atestado,
        cid: !prev.incluirAtestado ? prev.doenca : prev.atestado.cid
      }
    }));
  };

  const [modalEvolucaoRetorno, setModalEvolucaoRetorno] = useState<{
    aberto: boolean;
    consulta: any;
  }>({
    aberto: false,
    consulta: null,
  });

  const [formEvolucaoRetorno, setFormEvolucaoRetorno] = useState({
    laudo: "",
    diagnostico: "",
    doenca: "",
    medicacao: "",
    observacao: "",
    incluirReceita: false,
    receita: {
      descricao: "",
      cid: "",
      medicamentos: [{ medicamento: "", dosagem: "", quantidade: "1", posologia: "", observacoes: "" }],
      observacoes: "",
    },
    incluirAtestado: false,
    atestado: {
      descricao: "",
      cid: "",
      diasRepouso: "",
      observacoes: "",
    }
  });

  const toggleIncluirReceitaRetorno = () => {
    setFormEvolucaoRetorno(prev => ({
      ...prev,
      incluirReceita: !prev.incluirReceita,
      receita: {
        ...prev.receita,
        cid: !prev.incluirReceita ? prev.doenca : prev.receita.cid
      }
    }));
  };

  const toggleIncluirAtestadoRetorno = () => {
    setFormEvolucaoRetorno(prev => ({
      ...prev,
      incluirAtestado: !prev.incluirAtestado,
      atestado: {
        ...prev.atestado,
        cid: !prev.incluirAtestado ? prev.doenca : prev.atestado.cid
      }
    }));
  };

  const [formRetorno, setFormRetorno] = useState({
    dataRetorno: "",
    motivo: "",
    diagnostico: "",
    observacao: ""
  });

  const [modalRetorno, setModalRetorno] = useState<{ aberto: boolean; consulta: any }>({
    aberto: false,
    consulta: null,
  });

  const handleAgendarRetorno = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalRetorno.consulta?.id && !modalRetorno.consulta?.id.startsWith("ret-")) {
        // Criar novo retorno
        await api.post("/funcionario/agendar-retorno", {
          consultaId: modalRetorno.consulta?.id,
          pacienteId: modalRetorno.consulta?.paciente?.id,
          ...formRetorno,
        });
        toast.success("Retorno agendado com sucesso!");
      } else {
        // Editar retorno existente (ID começa com ret-)
        const idLimpo = modalRetorno.consulta.id.replace("ret-", "");
        await api.put(`/funcionario/retorno/${idLimpo}`, {
          ...formRetorno,
          dataRetorno: formRetorno.dataRetorno
        });
        toast.success("Retorno atualizado com sucesso!");
      }
      
      setModalRetorno({ aberto: false, consulta: null });
      setFormRetorno({ dataRetorno: "", motivo: "", diagnostico: "", observacao: "" });
      refetchConsultas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao processar retorno");
    }
  };

  const handleCancelarRetorno = async (retornoId: string) => {
    if (!retornoId) return;
    
    try {
      const idLimpo = retornoId.startsWith("ret-") ? retornoId.replace("ret-", "") : retornoId;
      
      await api.put(`/funcionario/retorno/${idLimpo}`, {
        status: "cancelado"
      });

      toast.success("O agendamento de retorno foi cancelado com sucesso.");
      setModalRetorno({ aberto: false, consulta: null });
      refetchConsultas();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Não foi possível cancelar o retorno. Tente novamente mais tarde."
      );
    }
  };

  const handleAbrirEditarRetorno = (consulta: any) => {
    if (!consulta) return;
    
    setModalRetorno({ aberto: true, consulta });
    setFormRetorno({
      dataRetorno: consulta.dataAgendada ? new Date(consulta.dataAgendada).toISOString().slice(0, 16) : "",
      motivo: consulta.motivo || "",
      diagnostico: consulta.diagnostico || "",
      observacao: consulta.observacao || ""
    });
  };

  // Handlers para medicamentos no modal de evolução
  const adicionarMedicamentoEvolucao = () => {
    setFormHistorico(prev => ({
      ...prev,
      receita: {
        ...prev.receita,
        medicamentos: [...prev.receita.medicamentos, { medicamento: "", dosagem: "", quantidade: "1", posologia: "", observacoes: "" }]
      }
    }));
  };

  const removerMedicamentoEvolucao = (index: number) => {
    setFormHistorico(prev => ({
      ...prev,
      receita: {
        ...prev.receita,
        medicamentos: prev.receita.medicamentos.filter((_, i) => i !== index)
      }
    }));
  };

  const atualizarMedicamentoEvolucao = (index: number, campo: string, valor: string) => {
    setFormHistorico(prev => {
      const novosMeds = [...prev.receita.medicamentos];
      novosMeds[index] = { ...novosMeds[index], [campo]: valor };
      return {
        ...prev,
        receita: { ...prev.receita, medicamentos: novosMeds }
      };
    });
  };

  // Handlers para medicamentos no modal de evolução de RETORNO
  const adicionarMedicamentoEvolucaoRetorno = () => {
    setFormEvolucaoRetorno(prev => ({
      ...prev,
      receita: {
        ...prev.receita,
        medicamentos: [...prev.receita.medicamentos, { medicamento: "", dosagem: "", quantidade: "1", posologia: "", observacoes: "" }]
      }
    }));
  };

  const removerMedicamentoEvolucaoRetorno = (index: number) => {
    setFormEvolucaoRetorno(prev => ({
      ...prev,
      receita: {
        ...prev.receita,
        medicamentos: prev.receita.medicamentos.filter((_, i) => i !== index)
      }
    }));
  };

  const atualizarMedicamentoEvolucaoRetorno = (index: number, campo: string, valor: string) => {
    setFormEvolucaoRetorno(prev => {
      const novosMeds = [...prev.receita.medicamentos];
      novosMeds[index] = { ...novosMeds[index], [campo]: valor };
      return {
        ...prev,
        receita: { ...prev.receita, medicamentos: novosMeds }
      };
    });
  };

  // Handlers
  const handleBuscarReceita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registroReceitaBusca.trim()) {
      toast.error("Informe o registro da assinatura da receita");
      return;
    }
    setCarregandoReceita(true);
    buscarReceitaMutation.mutate(registroReceitaBusca.trim());
    setCarregandoReceita(false);
  };

  const handleLimparReceita = () => {
    setReceitaEncontrada(null);
    setRegistroReceitaBusca("");
  };

  const handleValidarDispensacao = () => {
    if (!receitaEncontrada?.id) {
      toast.error("Receita não encontrada");
      return;
    }
    validarDispensacaoMutation.mutate(receitaEncontrada.id);
  };

  const handleDispensarMedicamentos = () => {
    if (!receitaEncontrada?.id) {
      toast.error("Receita não encontrada");
      return;
    }

    const medicamentosParaDispensar = Object.entries(medicamentosSelecionados)
      .filter(([_, data]) => data.selecionado)
      .map(([medicamentoId, data]) => {
        const medicamento = receitaEncontrada.itens.find(
          (item: any) => item.id === medicamentoId,
        );
        return {
          receitaMedicamentoId: medicamentoId,
          medicamentoFornecido:
            data.medicamentoFornecido || medicamento.medicamento,
          quantidadeDispensada:
            data.quantidadeDispensada || medicamento.quantidade,
          observacoes: data.observacoes,
        };
      });

    if (medicamentosParaDispensar.length === 0) {
      toast.error("Selecione pelo menos um medicamento para dispensar");
      return;
    }

    dispensarMedicamentosMutation.mutate({
      receitaId: receitaEncontrada.id,
      medicamentos: medicamentosParaDispensar,
    });
  };

  const handleMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMed) return;

    updateMedicamentoMutation.mutate({
      id: editingMed.id,
      data: {
        quantidade: Number(medData.quantidade),
        dataValidade: medData.dataValidade,
        observacoes: medData.observacoes,
      },
    });
  };

  const handleAdministrarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;

    administrarMedicamentoMutation.mutate({
      id: selectedMed.id,
      data: {
        pacienteCns: administracaoData.pacienteCns,
        quantidade: Number(administracaoData.quantidade),
        dataRetirada: administracaoData.dataRetirada,
        observacoes: administracaoData.observacoes,
      },
    });
  };

  const handleEditMed = (med: any) => {
    setEditingMed(med);
    setMedData({
      quantidade: String(med.quantidade ?? ""),
      dataValidade: med.dataValidade ? med.dataValidade.split("T")[0] : "",
      observacoes: med.observacoes || "",
    });
  };

  const openAdministrarMedicamentoModal = (paciente: any) => {
    setSelectedAdminPaciente(paciente);
    setShowAdministradorMedicamentoModal(true);
    setAdministracaoData({
      pacienteCns: paciente.cns || "",
      quantidade: "",
      dataRetirada: new Date().toISOString().slice(0, 16),
      observacoes: "",
    });
  };

  const openAdministrarMed = (med: any) => {
    setSelectedMed(med);
    setAdministracaoData((prev) => ({
      ...prev,
      pacienteCns: selectedAdminPaciente?.cns || prev.pacienteCns || "",
      quantidade: "",
      dataRetirada: new Date().toISOString().slice(0, 16),
      observacoes: "",
    }));
    setShowAdministradorMedicamentoModal(false);
  };

  const handleHistoricoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      createHistoricoMutation.mutate({
        pacienteId: selectedPaciente.id,
        ...historicoData,
      });
    }
  };

  const handleBuscarHistoricoPorCpf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfHistoricoBusca.trim()) {
      toast.error("Informe o CPF do paciente para buscar o histórico.");
      return;
    }
    buscarHistoricoPorCpfMutation.mutate(cpfHistoricoBusca.trim());
  };

  const abrirDetalheHistorico = (registro: any) => {
    setRegistroHistoricoDetalhe(registro);
  };

  const handleVacinaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      createVacinaMutation.mutate({
        pacienteId: selectedPaciente.id,
        ...vacinaData,
      });
    }
  };

  const handleExameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      solicitarExameMutation.mutate({
        pacienteId: selectedPaciente.id,
        ...exameData,
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

  const handleRegistrarHistorico = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingHistorico(true);
    try {
      await api.post("/funcionario/historico-medico", {
        pacienteId: modalHistorico.consulta?.paciente?.id,
        consultaId: modalHistorico.consulta?.id,
        ...formHistorico,
      });
      await queryClient.invalidateQueries("funcionario-consultas");
      await queryClient.invalidateQueries(["paciente-historico"]);
      await refetchConsultas();
      toast.success("Histórico médico registrado com sucesso!");
      setModalHistorico({ aberto: false, consulta: null });
      setFormHistorico({
        laudo: "",
        diagnostico: "",
        doenca: "",
        medicacao: "",
        observacoes: "",
        dataConsulta: format(new Date(), "yyyy-MM-dd"),
        incluirReceita: false,
        receita: {
          descricao: "",
          cid: "",
          medicamentos: [{ medicamento: "", dosagem: "", quantidade: "1", posologia: "", observacoes: "" }],
          observacoes: "",
        },
        incluirAtestado: false,
        atestado: {
          descricao: "",
          cid: "",
          diasRepouso: "",
          observacoes: "",
        }
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erro ao registrar histórico médico",
      );
    } finally {
      setLoadingHistorico(false);
    }
  };

  const handleRegistrarEvolucaoRetorno = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingHistorico(true);
    try {
      const idOriginal = modalEvolucaoRetorno.consulta?.originalRetornoId || modalEvolucaoRetorno.consulta?.id;
      const idLimpo = idOriginal?.startsWith("ret-") ? idOriginal.replace("ret-", "") : idOriginal;

      await api.post("/funcionario/registrar-evolucao-retorno", {
        retornoId: idLimpo,
        ...formEvolucaoRetorno,
      });
      await queryClient.invalidateQueries("funcionario-consultas");
      await refetchConsultas();
      toast.success("Atendimento de retorno finalizado com sucesso!");
      setModalEvolucaoRetorno({ aberto: false, consulta: null });
      setFormEvolucaoRetorno({
        laudo: "",
        diagnostico: "",
        doenca: "",
        medicacao: "",
        observacao: "",
        incluirReceita: false,
        receita: {
          descricao: "",
          cid: "",
          medicamentos: [{ medicamento: "", dosagem: "", quantidade: "1", posologia: "", observacoes: "" }],
          observacoes: "",
        },
        incluirAtestado: false,
        atestado: {
          descricao: "",
          cid: "",
          diasRepouso: "",
          observacoes: "",
        }
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erro ao registrar evolução do retorno",
      );
    } finally {
      setLoadingHistorico(false);
    }
  };

  const atualizarConsultas = async () => {
    await queryClient.invalidateQueries(["funcionario-consultas"]);
    await refetchConsultas();
  };

  const handleTabChange = (key: string) => {
    if (key === "historico") {
      setActiveTab("historico");
      setShowBuscaHistoricoModal(true);
      setHistoricoBuscaResultado(null);
      setRegistroHistoricoDetalhe(null);
      return;
    }
    if (key === "consultas") {
      setActiveTab("consultas");
      atualizarConsultas();
      return;
    }
    setActiveTab(key);
  };

  // Helpers de Formatação e Estilo
  const formatConsultaDate = (value?: string | Date | null) => {
    if (!value) return "Não informado";
    return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const getConsultaDisease = (consulta: any) =>
    consulta?.historicoMedico?.doenca?.trim() || "Sem doença registrada";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente": return "text-yellow-600 bg-yellow-100";
      case "avaliando": return "text-blue-600 bg-blue-100";
      case "agendado":
      case "agendada": return "text-purple-600 bg-purple-100";
      case "realizado": return "text-green-600 bg-green-100";
      case "cancelado": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "gravissimo": return "text-red-800 bg-red-200";
      case "urgente": return "text-red-600 bg-red-100";
      case "grave": return "text-orange-600 bg-orange-100";
      case "medio": return "text-yellow-600 bg-yellow-100";
      case "leve": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const funcao = user?.funcao?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() || "";
  const isMedico = ["medico", "médico"].includes(funcao);
  const isEnfermagemOuFarmacia = ["enfermeiro", "farmaceutico", "farmacêutico"].includes(funcao);
  const isEnfermeiro = ["enfermeiro"].includes(funcao);

  const { data: agendamentosCampanha, isLoading: loadingAgendamentosCampanha, refetch: refetchAgendamentosCampanha } = useQuery(
    "funcionario-agendamentos-campanha",
    async () => {
      const res = await api.get("/ubs/agendamentos-campanha");
      const data = res.data;
      return Array.isArray(data) ? data : [];
    },
    { enabled: isEnfermeiro && activeTab === "Agenda_Campanha" },
  );

  const handleRealizarAgendamentoCampanha = async (id: string, observacoes: string) => {
    if (!observacoes.trim()) {
      toast.error("Informe as observações do atendimento.");
      return;
    }
    try {
      await api.put(`/ubs/agendamentos-campanha/${id}/realizar`, { observacoes: observacoes.trim() });
      toast.success("Atendimento registrado com sucesso!");
      refetchAgendamentosCampanha();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao registrar atendimento");
    }
  };

  const handleCancelarAgendamentoCampanha = async (id: string, justificativa: string) => {
    if (!justificativa.trim()) {
      toast.error("Informe a justificativa do cancelamento.");
      return;
    }
    try {
      await api.put(`/ubs/agendamentos-campanha/${id}/cancelar`, { justificativa: justificativa.trim() });
      toast.success("Agendamento cancelado com sucesso!");
      refetchAgendamentosCampanha();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao cancelar agendamento");
    }
  };

  const { data: examesRealizados, isLoading: loadingExames } = useQuery(
    "funcionario-exames",
    () => api.get("/funcionario/exames").then((res) => res.data),
    { enabled: isMedico && activeTab === "exames" },
  );

  const filteredExames = useMemo(() => {
    const query = exameSearchTerm.trim().toLowerCase();
    return (examesRealizados || []).filter((item: any) => {
      const pacienteNome = item.paciente?.nome || "";
      const laboratorioNome = item.laboratorio?.nome || "";
      const tipoExame = item.tipo || "";
      return (
        pacienteNome.toLowerCase().includes(query) ||
        laboratorioNome.toLowerCase().includes(query) ||
        tipoExame.toLowerCase().includes(query)
      );
    });
  }, [examesRealizados, exameSearchTerm]);

  const allNavigation = [
    { name: "Pacientes", key: "pacientes", icon: Users },
    { name: "Minhas Consultas", key: "consultas", icon: Heart },
    { name: "Minhas Solicitações", key: "solicitacoes", icon: Building2 },
    { name: "Medicamentos", key: "medicamentos", icon: Pill },
    { name: "Exames", key: "exames", icon: FileText },
    { name: "Histórico Médico", key: "historico", icon: Shield },
    { name: "Receita/Atestado", key: "receitas", icon: FileText },
    { name: "Consultar Receita", key: "consultar_receita", icon: FileText },
    { name: "Campanhas", key: "Agenda_Campanha", icon: Heart },
    
  ];

  const navigation = allNavigation.filter((item) => {
    const f = user?.funcao?.toLowerCase().trim() || "";
    if (["consultas", "historico", "solicitacoes", "exames", "receitas"].includes(item.key)) {
      return ["medico", "médico"].includes(f);
    }
    if (["medicamentos", "consultar_receita"].includes(item.key)) {
      return ["enfermeiro", "farmaceutico", "farmacêutico"].includes(f);
    }
    if (item.key === "Agenda_Campanha") {
      return ["enfermeiro"].includes(f);
    }
    return true;
  });

  return {
    user,
    logout,
    activeTab,
    setActiveTab,
    navigation,
    handleTabChange,
    isMedico,
    isEnfermagemOuFarmacia,
    
    // Pacientes
    pacientes,
    loadingPacientes,
    searchTerm,
    setSearchTerm,
    selectedPaciente,
    setSelectedPaciente,
    
    // Medicamentos
    loadingMedicamentos,
    medicamentosDaUbs,
    handleEditMed,
    openAdministrarMed,
    showAdministradorMedicamentoModal,
    selectedAdminPaciente,
    resetAdministracaoForm,
    medSearchTerm,
    setMedSearchTerm,
    filteredMedicamentos,
    editingMed,
    resetMedForm,
    medData,
    setMedData,
    handleMedSubmit,
    isUpdatingMed: updateMedicamentoMutation.isLoading,
    selectedMed,
    administracaoData,
    setAdministracaoData,
    handleAdministrarSubmit,
    isAdministrandoMed: administrarMedicamentoMutation.isLoading,
    cnsBuscaTerm,
    setCnsBuscaTerm,
    isBuscandoPacienteCns,
    buscarPacientePorCns,
    
    // Histórico
    historicoBuscaResultado,
    setShowBuscaHistoricoModal,
    abrirDetalheHistorico,
    historicoPaciente,
    showBuscaHistoricoModal,
    handleBuscarHistoricoPorCpf,
    cpfHistoricoBusca,
    setCpfHistoricoBusca,
    isBuscandoHistorico: buscarHistoricoPorCpfMutation.isLoading,
    registroHistoricoDetalhe,
    setRegistroHistoricoDetalhe,
    
    // Solicitações
    solicitacoesFiltroPaciente,
    setSolicitacoesFiltroPaciente,
    solicitacoesFiltroTipo,
    setSolicitacoesFiltroTipo,
    pacientesSolicitacoes,
    filteredSolicitacoes,
    getStatusColor,
    getPrioridadeColor,
    
    // Consultar Receita
    receitaEncontrada,
    handleBuscarReceita,
    registroReceitaBusca,
    setRegistroReceitaBusca,
    buscarReceitaLoading: buscarReceitaMutation.isLoading,
    carregandoReceita,
    handleLimparReceita,
    handleValidarDispensacao,
    
    // Dispensação
    showDispensacaoModal,
    setShowDispensacaoModal,
    erroDispensacao,
    medicamentosSelecionados,
    setMedicamentosSelecionados,
    handleDispensarMedicamentos,
    isDispensandoMedicamentos: dispensarMedicamentosMutation.isLoading,
    showDetalhesDispensacaoModal,
    setShowDetalhesDispensacaoModal,
    
    // Consultas
    loadingConsultas,
    consultas,
    formatConsultaDate,
    getConsultaDisease,
    setShowConsultaDetailsModal,
    showConsultaDetailsModal,
    setModalHistorico,
    modalHistorico,
    handleRegistrarHistorico,
    formHistorico,
    setFormHistorico,
    toggleIncluirReceita,
    toggleIncluirAtestado,
    modalEvolucaoRetorno,
    setModalEvolucaoRetorno,
    formEvolucaoRetorno,
    setFormEvolucaoRetorno,
    toggleIncluirReceitaRetorno,
    toggleIncluirAtestadoRetorno,
    formRetorno,
    setFormRetorno,
    modalRetorno,
    setModalRetorno,
    handleAgendarRetorno,
    adicionarMedicamentoEvolucao,
    removerMedicamentoEvolucao,
    atualizarMedicamentoEvolucao,
    adicionarMedicamentoEvolucaoRetorno,
    removerMedicamentoEvolucaoRetorno,
    atualizarMedicamentoEvolucaoRetorno,
    loadingHistorico,
    selectedConsulta,
    setSelectedConsulta,
    handleRegistrarEvolucaoRetorno,
    handleCancelarRetorno,
    handleAbrirEditarRetorno,
    
    // Exames
    exameSearchTerm,
    setExameSearchTerm,
    loadingExames,
    filteredExames,
    
    // Ações do Paciente (Modais)
    showHistoricoModal,
    setShowHistoricoModal,
    handleHistoricoSubmit,
    historicoData,
    setHistoricoData,
    isRegistrandoHistorico: createHistoricoMutation.isLoading,
    showVacinaModal,
    setShowVacinaModal,
    handleVacinaSubmit,
    vacinaData,
    setVacinaData,
    isRegistrandoVacina: createVacinaMutation.isLoading,
    showExameModal,
    setShowExameModal,
    handleExameSubmit,
    exameData,
    setExameData,
    isSolicitandoExame: solicitarExameMutation.isLoading,
    laboratorios,
    showInternacaoModal,
    setShowInternacaoModal,
    handleInternacaoSubmit,
    internacaoData,
    setInternacaoData,
    isSolicitandoInternacao: solicitarInternacaoMutation.isLoading,
    hospitais,
    loadingHospitais,
    hospitaisError,
    openVacinaModal,
    openExameModal,
    openInternacaoModal,
    openAdministrarMedicamentoModal,

    // Agendamentos de Campanha
    agendamentosCampanha,
    loadingAgendamentosCampanha,
    handleRealizarAgendamentoCampanha,
    handleCancelarAgendamentoCampanha,
  };
};
