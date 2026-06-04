import React, { useEffect, useMemo, useState } from "react";
import { FileText, Download, Search, X, Plus, Trash2 } from "lucide-react";
import { api } from "../services/api";
import { generateAtestadoPDF, generateReceitaPDF } from "../utils/pdfGenerator";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

interface ReceitasAtestadoProps {
  onClose?: () => void;
}

interface Medicamento {
  id?: string;
  medicamento: string;
  dosagem: string;
  quantidade: string;
  posologia: string;
  observacoes: string;
}

const ReceitasAtestado: React.FC<ReceitasAtestadoProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [tipo, setTipo] = useState<"receita" | "atestado">("receita");
  const [cpfBusca, setCpfBusca] = useState("");
  const [paciente, setPaciente] = useState<any>(null);
  const [carregandoPaciente, setCarregandoPaciente] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [documentoSalvo, setDocumentoSalvo] = useState<any>(null);
  const [documentosSalvos, setDocumentosSalvos] = useState<any[]>([]);
  const [carregandoDocumentos, setCarregandoDocumentos] = useState(false);
  const [medicoInfo, setMedicoInfo] = useState<any>(null);
  const [assinandoDocumento, setAssinandoDocumento] = useState<any>(null);
  const [assinaturaPos, setAssinaturaPos] = useState({ x: 32, y: 230 });
  const [assinando, setAssinando] = useState(false);

  const estadoInicial = {
    descricao: "",
    cid: "",
    medicamentos: [{ medicamento: "", dosagem: "", quantidade: "1", posologia: "", observacoes: "" }],
    diasRepouso: "",
    observacoes: "",
    dataEmissao: new Date().toISOString().slice(0, 10),
  };

  const [form, setForm] = useState(estadoInicial);

  // Funções para gerenciar medicamentos
  const adicionarMedicamento = () => {
    setForm((prev) => ({
      ...prev,
      medicamentos: [
        ...prev.medicamentos,
        { medicamento: "", dosagem: "", quantidade: "1", posologia: "", observacoes: "" },
      ],
    }));
  };

  const removerMedicamento = (index: number) => {
    setForm((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.filter((_, i) => i !== index),
    }));
  };

  const atualizarMedicamento = (index: number, campo: string, valor: string) => {
    setForm((prev) => {
      const novosMedicamentos = [...prev.medicamentos];
      novosMedicamentos[index] = {
        ...novosMedicamentos[index],
        [campo]: valor,
      };
      return {
        ...prev,
        medicamentos: novosMedicamentos,
      };
    });
  };

  const gerarRegistroAssinatura = () =>
    `REG-SISC${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

  const obterTextoAssinatura = () =>
    `Assinado digitalmente por ${medicoInfo?.nome || user?.nome} - CRM ${medicoInfo?.crm || "N/A"}`;

  const abrirModalAssinatura = (item: any) => {
    setAssinandoDocumento(item);
    setAssinaturaPos({
      x: item.assinaturaPosX ?? 32,
      y: item.assinaturaPosY ?? 267,
    });
  };

  const fecharModalAssinatura = () => {
    setAssinandoDocumento(null);
    setAssinando(false);
    setAssinaturaPos({ x: 25, y: 100 });
  };

  const handleAssinarDocumento = async () => {
    if (!assinandoDocumento) {
      return;
    }

    setAssinando(true);
    try {
      const assinaturaTexto = obterTextoAssinatura();
      const registroAssinatura = gerarRegistroAssinatura();
      const payload = {
        assinaturaTexto,
        assinaturaPosX: assinaturaPos.x,
        assinaturaPosY: assinaturaPos.y,
        registroAssinatura,
      };

      const res = await api.patch(
        `/funcionario/${assinandoDocumento.tipoDocumento}s/${assinandoDocumento.id}/assinatura`,
        payload,
      );

      const atualizado = {
        ...res.data,
        tipoDocumento: assinandoDocumento.tipoDocumento,
      };

      setDocumentoSalvo(atualizado);
      setDocumentosSalvos((prev) =>
        prev.map((item) => (item.id === atualizado.id ? atualizado : item)),
      );
      // Recarregar a lista do servidor para garantir sincronização com o banco
      await carregarDocumentos();
      toast.success("Documento assinado com sucesso!");
      fecharModalAssinatura();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Não foi possível assinar o documento.",
      );
    } finally {
      setAssinando(false);
    }
  };

  const carregarDocumentos = async () => {
    setCarregandoDocumentos(true);
    try {
      const [receitasRes, atestadosRes] = await Promise.all([
        api.get("/funcionario/receitas"),
        api.get("/funcionario/atestados"),
      ]);

      const lista = [
        ...(receitasRes.data || []).map((item: any) => ({
          ...item,
          tipoDocumento: "receita",
        })),
        ...(atestadosRes.data || []).map((item: any) => ({
          ...item,
          tipoDocumento: "atestado",
        })),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setDocumentosSalvos(lista);
    } catch {
      setDocumentosSalvos([]);
    } finally {
      setCarregandoDocumentos(false);
    }
  };

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const res = await api.get("/funcionario/me");
        setMedicoInfo(res.data);
      } catch {
        setMedicoInfo(null);
      }
    };

    carregarPerfil();
    carregarDocumentos();
    const onFocus = () => {
      carregarDocumentos();
    };

    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const buscarPaciente = async () => {
    if (!cpfBusca.trim()) {
      toast.error("Informe o CPF do paciente para continuar.");
      return;
    }

    setCarregandoPaciente(true);
    try {
      const res = await api.get("/funcionario/pacientes", {
        params: { busca: cpfBusca.trim() },
      });

      const encontrado = res.data?.find(
        (item: any) =>
          String(item.cpf).replace(/[^0-9]/g, "") ===
          cpfBusca.replace(/[^0-9]/g, ""),
      );

      if (!encontrado) {
        toast.error("Paciente não encontrado para esse CPF.");
        setPaciente(null);
        return;
      }

      setPaciente(encontrado);
      setDocumentoSalvo(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Não foi possível buscar o paciente.",
      );
    } finally {
      setCarregandoPaciente(false);
    }
  };

  const resetarFormulario = () => {
    setForm({
      ...estadoInicial,
      dataEmissao: new Date().toISOString().slice(0, 10),
    });
    setCpfBusca("");
    setPaciente(null);
    setDocumentoSalvo(null);
  };

  const salvarDocumento = async () => {
    if (!paciente) {
      toast.error("Selecione um paciente antes de salvar.");
      return;
    }

    setSalvando(true);
    try {
      if (tipo === "receita") {
        // Validar se há medicamentos
        const medicamentosValidos = form.medicamentos.filter(m => m.medicamento.trim());
        if (medicamentosValidos.length === 0) {
          toast.error("Adicione pelo menos um medicamento!");
          setSalvando(false);
          return;
        }

        const res = await api.post("/funcionario/receitas", {
          pacienteId: paciente.id,
          descricao: form.descricao,
          cid: form.cid,
          medicamentos: medicamentosValidos.map(m => ({
            medicamento: m.medicamento,
            dosagem: m.dosagem,
            quantidade: Number.parseInt(m.quantidade) || 1,
            posologia: m.posologia,
            observacoes: m.observacoes,
          })),
          observacoes: form.observacoes,
          dataEmissao: form.dataEmissao,
          status: "ativo",
        });
        setDocumentoSalvo({ ...res.data, tipoDocumento: "receita" });
        await carregarDocumentos();
        toast.success("Receita salva com sucesso!");
      } else {
        const res = await api.post("/funcionario/atestados", {
          pacienteId: paciente.id,
          descricao: form.descricao,
          cid: form.cid,
          diasRepouso: Number(form.diasRepouso || 0),
          observacoes: form.observacoes,
          dataEmissao: form.dataEmissao,
        });
        setDocumentoSalvo({ ...res.data, tipoDocumento: "atestado" });
        await carregarDocumentos();
        toast.success("Atestado salvo com sucesso!");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Não foi possível salvar o documento.",
      );
    } finally {
      setSalvando(false);
    }
  };

  const baixarDocumento = (item?: any) => {
    if (!item) {
      if (tipo === "receita") {
        generateReceitaPDF(
          { ...form, status: "ativo" },
          paciente,
          medicoInfo,
          medicoInfo?.ubs,
        );
      } else {
        generateAtestadoPDF(
          { ...form, diasRepouso: Number(form.diasRepouso || 0) },
          paciente,
          medicoInfo,
          medicoInfo?.ubs,
        );
      }
      return;
    }

    const assinaturaData = item.assinaturaConcluida
      ? {
          texto: item.assinaturaTexto,
          posX: item.assinaturaPosX,
          posY: item.assinaturaPosY,
          registro: item.registroAssinatura,
          data: item.assinaturaData
            ? new Date(item.assinaturaData).toLocaleDateString("pt-BR")
            : undefined,
        }
      : undefined;

    if (item.tipoDocumento === "receita") {
      generateReceitaPDF(
        item,
        item.paciente,
        item.funcionario,
        item.ubs,
        assinaturaData,
      );
      return;
    }

    generateAtestadoPDF(
      item,
      item.paciente,
      item.funcionario,
      item.ubs,
      assinaturaData,
    );
  };

  const titulo = useMemo(
    () => (tipo === "receita" ? "Nova receita médica" : "Novo atestado médico"),
    [tipo],
  );

  return (
    <section className="rounded-2xl border border-[#D9E4F0] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F7] pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5C7A9B]">
            Receitas e atestados
          </p>
          <h3 className="mt-1 text-xl font-bold text-[#0F2242]">{titulo}</h3>
          <p className="mt-1 text-sm text-[#5C7A9B]">
            Selecione o tipo, procure o paciente por CPF e registre a
            solicitação clínica.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#C8D9ED] bg-[#F4F8FC] p-2 text-[#5C7A9B] hover:bg-[#EAF2FB]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5 rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-5">
          <div>
            <label className="text-sm font-semibold text-[#1A2E4A]">
              Tipo de documento
            </label>
            <div className="mt-2 flex flex-wrap gap-3">
              {(["receita", "atestado"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTipo(item)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    tipo === item
                      ? "border-[#1A3F72] bg-[#1A3F72] text-white"
                      : "border-[#C8D9ED] bg-white text-[#1A2E4A] hover:bg-[#EEF4FA]"
                  }`}
                >
                  {item === "receita" ? "Receita médica" : "Atestado médico"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#1A2E4A]">
              CPF do paciente
            </label>
            <div className="mt-2 flex gap-3">
              <input
                type="text"
                value={cpfBusca}
                onChange={(e) => setCpfBusca(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full rounded-xl border border-[#C8D9ED] bg-white px-3 py-2.5 text-sm text-[#1A2E4A] outline-none"
              />
              <button
                type="button"
                onClick={buscarPaciente}
                disabled={carregandoPaciente}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1A3F72] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Search className="h-4 w-4" />
                {carregandoPaciente ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>

          {paciente && (
            <div className="rounded-2xl border border-[#C8D9ED] bg-white p-4 text-sm text-[#1A2E4A] shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-[#5C7A9B]">
                Paciente selecionado
              </p>
              <p className="mt-2 text-base font-semibold text-[#0F2242]">
                {paciente.nome}
              </p>
              <p className="text-[#5C7A9B]">CPF: {paciente.cpf}</p>
              <p className="text-[#5C7A9B]">CNS: {paciente.cns}</p>
            </div>
          )}

          <div className="space-y-4 rounded-2xl border border-[#E4EDF7] bg-white p-4 shadow-sm">
            <div>
              <label className="text-sm font-semibold text-[#1A2E4A]">
                Data de emissão
              </label>
              <input
                type="date"
                value={form.dataEmissao}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, dataEmissao: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-[#C8D9ED] bg-[#F8FAFD] px-3 py-2.5 text-sm text-[#1A2E4A] outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#1A2E4A]">
                Descrição / motivo
              </label>
              <textarea
                value={form.descricao}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, descricao: e.target.value }))
                }
                rows={3}
                placeholder="Descreva a indicação clínica do documento."
                className="mt-2 w-full rounded-xl border border-[#C8D9ED] bg-[#F8FAFD] px-3 py-2.5 text-sm text-[#1A2E4A] outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#1A2E4A]">
                CID
              </label>
              <input
                value={form.cid}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, cid: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-[#C8D9ED] bg-[#F8FAFD] px-3 py-2.5 text-sm text-[#1A2E4A] outline-none"
                placeholder="J840"
              />
            </div>

            {tipo === "receita" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#1A2E4A]">
                    Medicamentos prescritos
                  </label>
                  <span className="text-xs text-[#5C7A9B]">
                    {form.medicamentos.length} medicamento(s)
                  </span>
                </div>

                {/* Lista de medicamentos */}
                <div className="space-y-3 rounded-xl border border-[#E4EDF7] bg-[#F8FAFD] p-4">
                  {form.medicamentos.map((med, index) => (
                    <div
                      key={index}
                      className="space-y-3 rounded-xl border border-[#D9E4F0] bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[#1A2E4A]">
                          Medicamento {index + 1}
                        </p>
                        {form.medicamentos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removerMedicamento(index)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#FEE2E2] px-2 py-1 text-xs font-semibold text-[#DC2626] hover:bg-[#FECACA]"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remover
                          </button>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-[#5C7A9B]">
                            Nome do medicamento *
                          </label>
                          <input
                            type="text"
                            value={med.medicamento}
                            onChange={(e) =>
                              atualizarMedicamento(index, "medicamento", e.target.value)
                            }
                            placeholder="Ex.: Amoxicilina"
                            className="mt-1 w-full rounded-lg border border-[#C8D9ED] bg-white px-3 py-2 text-sm text-[#1A2E4A] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#5C7A9B]">
                            Dosagem *
                          </label>
                          <input
                            type="text"
                            value={med.dosagem}
                            onChange={(e) =>
                              atualizarMedicamento(index, "dosagem", e.target.value)
                            }
                            placeholder="Ex.: 500 mg"
                            className="mt-1 w-full rounded-lg border border-[#C8D9ED] bg-white px-3 py-2 text-sm text-[#1A2E4A] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#5C7A9B]">
                            Quantidade
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={med.quantidade}
                            onChange={(e) =>
                              atualizarMedicamento(index, "quantidade", e.target.value)
                            }
                            placeholder="Ex.: 30"
                            className="mt-1 w-full rounded-lg border border-[#C8D9ED] bg-white px-3 py-2 text-sm text-[#1A2E4A] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#5C7A9B]">
                            Posologia
                          </label>
                          <input
                            type="text"
                            value={med.posologia}
                            onChange={(e) =>
                              atualizarMedicamento(index, "posologia", e.target.value)
                            }
                            placeholder="Ex.: 1 comprimido a cada 8h"
                            className="mt-1 w-full rounded-lg border border-[#C8D9ED] bg-white px-3 py-2 text-sm text-[#1A2E4A] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#5C7A9B]">
                          Observações
                        </label>
                        <textarea
                          value={med.observacoes}
                          onChange={(e) =>
                            atualizarMedicamento(index, "observacoes", e.target.value)
                          }
                          placeholder="Ex.: Tomar com alimento"
                          rows={2}
                          className="mt-1 w-full rounded-lg border border-[#C8D9ED] bg-white px-3 py-2 text-sm text-[#1A2E4A] outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botão adicionar medicamento */}
                <button
                  type="button"
                  onClick={adicionarMedicamento}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#C8D9ED] bg-[#EEF4FA] px-4 py-2 text-sm font-semibold text-[#1A3F72] hover:bg-[#DFE8F4]"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar mais medicamento
                </button>
              </div>
            ) : (
              <div>
                <label className="text-sm font-semibold text-[#1A2E4A]">
                  Dias de repouso
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.diasRepouso}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      diasRepouso: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-[#C8D9ED] bg-[#F8FAFD] px-3 py-2.5 text-sm text-[#1A2E4A] outline-none"
                  placeholder="Ex.: 3"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-[#1A2E4A]">
                Observações
              </label>
              <textarea
                value={form.observacoes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, observacoes: e.target.value }))
                }
                rows={3}
                placeholder="Detalhes extras ou orientações para o paciente."
                className="mt-2 w-full rounded-xl border border-[#C8D9ED] bg-[#F8FAFD] px-3 py-2.5 text-sm text-[#1A2E4A] outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={salvarDocumento}
              disabled={salvando || !paciente}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1A3F72] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              {salvando ? "Salvando..." : "Salvar documento"}
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-[#E4EDF7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5C7A9B]">
            Pré-visualização
          </p>
          <div className="mt-4 rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 text-sm text-[#1A2E4A]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8FA8C4]">
              Documento
            </p>
            <h4 className="mt-2 text-lg font-semibold text-[#0F2242]">
              {tipo === "receita" ? "Receita médica" : "Atestado médico"}
            </h4>
            <p className="mt-2 text-[#5C7A9B]">
              Paciente: {paciente?.nome || "Aguardando busca"}
            </p>
            <p className="text-[#5C7A9B]">
              Data: {form.dataEmissao ? new Date(form.dataEmissao).toLocaleDateString("pt-BR"): " "
              }
            </p>
            <p className="text-[#5C7A9B]">CID: {form.cid || " "}</p>
            <p className="text-[#5C7A9B]">
              Médico: {medicoInfo?.nome || user?.nome || "Médico"}
            </p>
            <p className="text-[#5C7A9B]">
              UBS: {medicoInfo?.ubs?.nome || "UBS"}
            </p>
            {tipo === "receita" ? (
              <>
                <p className="text-[#5C7A9B]">
                  Medicamentos: {form.medicamentos.filter(m => m.medicamento).length} prescrito(s)
                </p>
                {form.medicamentos.map((med, idx) => (
                  med.medicamento && (
                    <div key={idx} className="rounded-lg bg-[#F0F5FA] p-2 text-sm">
                      <p className="font-semibold text-[#0F2242]">{med.medicamento}</p>
                      <p className="text-[#5C7A9B]">Dosagem: {med.dosagem || "—"}</p>
                      <p className="text-[#5C7A9B]">Qtd: {med.quantidade || "—"}</p>
                      {med.posologia && <p className="text-[#5C7A9B]">Posologia: {med.posologia}</p>}
                    </div>
                  )
                ))}
              </>
            ) : (
              <p className="text-[#5C7A9B]">
                Dias de repouso: {form.diasRepouso || " "}
              </p>
            )}
            <p className="mt-3 text-[#5C7A9B]">
              Descrição: {form.descricao || " "}
            </p>
            <div className="mt-4 rounded-2xl border border-dashed border-[#C8D9ED] bg-white p-4 text-center text-[#5C7A9B]">
              <p className="text-[11px] uppercase tracking-[0.18em]">
                Assinatura / carimbo
              </p>
              <div className="mt-3 h-12 rounded-xl border border-[#E4EDF7] bg-[#F8FAFD]" />
              <p className="mt-2 text-xs">
                {user?.nome || "Médico responsável"}
              </p>
            </div>
          </div>

          {documentoSalvo && (
            <div className="mt-4 rounded-2x1 border border-[#C8D9ED] bg-[#F4F8FC] p-4 text-sm text-[#1A2E4A]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#5C7A9B]">
                Documento salvo
              </p>
              <p className="mt-2 font-semibold text-[#0F2242]">
                {documentoSalvo.assinaturaConcluida
                  ? "Documento assinado com sucesso."
                  : "Documento aguardando assinatura digital."}
              </p>
              <p className="text-[#5C7A9B]">ID: {documentoSalvo.id}</p>
              {documentoSalvo.assinaturaConcluida && (
                <p className="text-[#5C7A9B]">
                  Registro: {documentoSalvo.registroAssinatura}
                </p>
              )}
              {documentoSalvo.tipoDocumento === "receita" && documentoSalvo.itens && documentoSalvo.itens.length > 0 && (
                <div className="mt-3 space-y-1.5 rounded-lg bg-white p-2 border border-[#D9E4F0]">
                  <p className="text-xs font-semibold text-[#0F2242]">Medicamentos prescritos:</p>
                  {documentoSalvo.itens.map((med: any, idx: number) => (
                    <p key={idx} className="text-xs text-[#5C7A9B]">
                      • {med.medicamento} - {med.dosagem} (Qtd: {med.quantidade})
                      {med.posologia && ` - ${med.posologia}`}
                    </p>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {!documentoSalvo.assinaturaConcluida ? (
                  <button
                    type="button"
                    onClick={() => abrirModalAssinatura(documentoSalvo)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1A3F72] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Assinar documento
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => baixarDocumento(documentoSalvo)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#C8D9ED] bg-white px-3 py-2 text-sm font-semibold text-[#1A3F72]"
                  >
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      <section className="mt-6 rounded-2xl border border-[#E4EDF7] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5C7A9B]">
              Documentos salvos
            </p>
            <p className="mt-1 text-sm text-[#5C7A9B]">
              Receitas e atestados já registrados para impressão rápida.
            </p>
          </div>
          <button
            type="button"
            onClick={carregarDocumentos}
            className="rounded-xl border border-[#C8D9ED] bg-[#F4F8FC] px-3 py-2 text-sm font-semibold text-[#1A3F72]"
          >
            Atualizar
          </button>
        </div>

        {carregandoDocumentos ? (
          <p className="mt-4 text-sm text-[#5C7A9B]">
            Carregando documentos...
          </p>
        ) : documentosSalvos.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-[#C8D9ED] bg-[#F8FAFD] p-4 text-sm text-[#5C7A9B]">
            Ainda não há receitas ou atestados salvos para este médico.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {documentosSalvos.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border-2 border-[#E5EDF7] bg-white p-6 shadow-md hover:shadow-lg transition-all hover:border-[#D0DEF0]"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FB]">
                        {item.tipoDocumento === "receita" ? (
                          <p className="text-lg">💊</p>
                        ) : (
                          <p className="text-lg">📋</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#7A8FA8]">
                          {item.tipoDocumento === "receita"
                            ? "Receita Médica"
                            : "Atestado Médico"}
                        </p>
                        <h4 className="text-lg font-bold text-[#1A3F72]">
                          {item.paciente?.nome || "Paciente"}
                        </h4>
                      </div>
                    </div>
                  <div className="grid gap-2 text-sm text-[#5C7A9B]">
                      <p>
                        <span className="font-semibold">CID:</span>{" "}
                        {item.cid || "—"}
                      </p>
                      <p>
                        <span className="font-semibold">Data:</span>{" "}
                        {item.dataEmissao
                          ? new Date(item.dataEmissao).toLocaleDateString(
                              "pt-BR",
                            )
                          : "—"}
                      </p>
                      {item.tipoDocumento === "receita" && item.itens && item.itens.length > 0 && (
                        <div className="mt-2 space-y-1.5 rounded-lg bg-[#F0F5FA] p-2">
                          <p className="text-xs font-semibold text-[#0F2242]">Medicamentos:</p>
                          {item.itens.map((med: any, idx: number) => (
                            <p key={idx} className="text-xs text-[#5C7A9B]">
                              • {med.medicamento} {med.dosagem ? `(${med.dosagem})` : ""}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {item.assinaturaConcluida ? (
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F9F0] px-4 py-2.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                        <span className="text-sm font-bold text-[#1F7A44]">
                          ✓ Assinado
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#FEF3E2] px-4 py-2.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
                        <span className="text-sm font-bold text-[#92400E]">
                          ⧗ Pendente
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#F8FAFD] px-4 py-3">
                    <p className="text-xs text-[#7A8FA8] font-semibold">
                      {item.tipoDocumento === "receita"
                        ? "Medicamento"
                        : "Dias de repouso"}
                    </p>
                    <p className="mt-1 font-semibold text-[#1A3F72]">
                      {item.tipoDocumento === "receita"
                        ? item.medicamento || "Não informado"
                        : `${item.diasRepouso || 0} dia(s)`}
                    </p>
                  </div>
                  {item.assinaturaConcluida && (
                    <div className="rounded-2xl bg-[#E8F9F0] px-4 py-3">
                      <p className="text-xs text-[#1F7A44] font-semibold">
                        Registro de assinatura
                      </p>
                      <p className="mt-1 font-semibold text-[#1F7A44] text-sm">
                        {item.registroAssinatura}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {!item.assinaturaConcluida ? (
                    <button
                      type="button"
                      onClick={() => abrirModalAssinatura(item)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1A3F72] to-[#2B5BA8] px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg transition-all"
                    >
                      <span>✏️</span> Assinar agora
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => baixarDocumento(item)}
                      className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#1A3F72] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A3F72] hover:bg-[#F8FAFD] transition-all"
                    >
                      <Download className="h-4 w-4" />
                      Baixar PDF
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => baixarDocumento(item)}
                    className="rounded-2xl border border-[#D9E4F0] bg-white px-5 py-2.5 text-sm font-semibold text-[#5C7A9B] hover:bg-[#F8FAFD] transition-all"
                  >
                    👁️ Visualizar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {assinandoDocumento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-6">
          <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#E2EAF4]">
            {/* HEADER */}
            <div className="flex items-center justify-between gap-4 bg-[#0F2D56] px-8 py-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.25)]" />
                  <span className="text-[11px] font-medium uppercase tracking-widest text-white/70">
                    Confirmação de assinatura digital
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {assinandoDocumento.tipoDocumento === "receita"
                    ? "Assinar Receita Médica"
                    : "Assinar Atestado Médico"}
                </h3>
              </div>
              <button
                type="button"
                onClick={fecharModalAssinatura}
                className="flex-shrink-0 rounded-xl border border-white/20 bg-white/10 p-2 text-white/80 hover:bg-white/20 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* BODY */}
            <div
              className="overflow-y-auto px-8 py-7"
              style={{ maxHeight: "calc(100vh - 9rem)" }}
            >
              <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                {/* PREVIEW DO DOCUMENTO */}
                <div className="overflow-hidden rounded-2xl border border-[#E2EAF4] bg-white">
                  <div className="flex items-center gap-2 border-b border-[#E2EAF4] bg-[#F5F8FC] px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E6F1FB] px-2.5 py-1 text-xs font-medium text-[#185FA5]">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {assinandoDocumento.tipoDocumento === "receita"
                        ? "Receita Médica"
                        : "Atestado Médico"}
                    </span>
                    <span className="text-xs font-medium text-[#8A9BB0]">
                      Pré-visualização do documento
                    </span>
                  </div>

                  <div
                    className="relative overflow-hidden bg-white"
                    style={{ width: "100%", height: 520 }}
                  >
                    <div className="absolute inset-0 bg-white p-4">
                      {/* Cabeçalho simulado */}
                      <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#E6F1FB] px-3 py-2.5">
                        <div className="h-7 w-7 rounded-lg bg-[#185FA5]" />
                        <div className="flex flex-col gap-1">
                          <div className="h-1.5 w-20 rounded-full bg-[#B5D4F4]" />
                          <div className="h-1.5 w-14 rounded-full bg-[#B5D4F4] opacity-50" />
                        </div>
                      </div>

                      {/* Linhas de conteúdo */}
                      <div className="mb-3 space-y-2">
                        <div className="h-1.5 w-full rounded-full bg-[#E5EDF7]" />
                        <div className="h-1.5 w-5/6 rounded-full bg-[#E5EDF7]" />
                        <div className="h-1.5 w-2/3 rounded-full bg-[#E5EDF7]" />
                        <div className="h-1.5 w-4/5 rounded-full bg-[#E5EDF7]" />
                        <div className="h-1.5 w-3/4 rounded-full bg-[#E5EDF7]" />
                      </div>

                      {/* Dados do paciente */}
                      <div className="mb-3 rounded-xl border border-[#D9E4F0] bg-white p-3">
                        <p className="text-[11px] font-semibold text-[#0F2D56]">
                          {assinandoDocumento.tipoDocumento === "receita"
                            ? "Receita Médica"
                            : "Atestado Médico"}
                        </p>
                        <p className="mt-1.5 font-mono text-[10px] text-[#52606D]">
                          Paciente: {assinandoDocumento.paciente?.nome || " "}
                        </p>
                        <p className="font-mono text-[10px] text-[#52606D]">
                          CPF: {assinandoDocumento.paciente?.cpf || " "}
                        </p>
                      </div>

                      {/* Resumo */}
                      <div className="mb-3 rounded-xl border border-dashed border-[#93C5FD] bg-[#EFF6FF] p-3">
                        <p className="text-[11px] font-semibold text-[#0C4A6E]">
                          Resumo do documento
                        </p>
                        <p className="mt-1 text-[10px] text-[#0C4A6E]">
                          O documento será assinado automaticamente no local
                          abaixo.
                        </p>
                      </div>

                      {/* Rodapé do documento */}
                      <div className="absolute inset-x-4 bottom-20 flex items-center justify-between border-t border-[#D9E4F0] bg-white px-3 py-2">
                        <span className="font-mono text-[9px] text-[#8A9BB0]">
                          Sistema Individual de Saude do Cidadão
                        </span>
                        <span className="font-mono text-[9px] font-semibold text-[#8A9BB0]">
                          Assinatura e carimbo do médico
                        </span>
                      </div>
                    </div>

                    {/* ZONA DE ASSINATURA — left: 20 conforme original */}
                    <div
                      className="absolute rounded-xl border-2 border-[#185FA5] bg-[#E6F1FB] px-3 py-2"
                      style={{ left: 20, top: 345, width: 320, minHeight: 60 }}
                    >
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-[#185FA5]">
                        Assinatura
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-[#378ADD]">
                        {obterTextoAssinatura()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PAINEL DIREITO */}
                <div className="flex flex-col gap-3">
                  {/* Status */}
                  <div className="flex items-start gap-3 rounded-2xl border border-[#C0DD97] bg-[#EAF3DE] p-4">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#639922]">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#3B6D11]">
                        Pronto para assinar
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#639922]">
                        O documento será assinado automaticamente com os dados
                        do médico responsável.
                      </p>
                    </div>
                  </div>

                  {/* Coordenadas */}
                  <div className="rounded-2xl border border-[#E2EAF4] bg-white p-4">
                    <p className="mb-3 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-[#8A9BB0]">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Posição da assinatura
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[#E2EAF4] bg-[#F5F8FC] p-3">
                        <p className="text-[11px] font-medium text-[#8A9BB0]">
                          Horizontal (X)
                        </p>
                        <p className="mt-1.5 font-mono text-2xl font-semibold text-[#0F2D56]">
                          {assinaturaPos.x}
                          <span className="ml-1 text-xs font-normal text-[#8A9BB0]">
                            mm
                          </span>
                        </p>
                      </div>
                      <div className="rounded-xl border border-[#E2EAF4] bg-[#F5F8FC] p-3">
                        <p className="text-[11px] font-medium text-[#8A9BB0]">
                          Vertical (Y)
                        </p>
                        <p className="mt-1.5 font-mono text-2xl font-semibold text-[#0F2D56]">
                          {assinaturaPos.y}
                          <span className="ml-1 text-xs font-normal text-[#8A9BB0]">
                            mm
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Aviso */}
                  <div className="flex items-start gap-2.5 rounded-2xl border border-[#F7C1C1] bg-[#FCEBEB] p-4">
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#A32D2D]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs leading-relaxed text-[#791F1F]">
                      Ao confirmar, a rubrica será gravada no documento com base
                      nas coordenadas exibidas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-end gap-3 border-t border-[#E2EAF4] bg-[#F5F8FC] px-8 py-4">
              <button
                type="button"
                onClick={fecharModalAssinatura}
                className="rounded-xl border border-[#D9E4F0] bg-white px-5 py-2.5 text-sm font-medium text-[#0F2D56] hover:bg-[#F5F8FC] transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAssinarDocumento}
                disabled={assinando}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F2D56] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#185FA5] transition-all disabled:opacity-60"
              >
                {assinando ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    Assinando...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Confirmar Assinatura
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReceitasAtestado;
