import React, { useEffect, useState } from "react";
import { FileText, Download, Search, X, ShieldCheck, Pill, ClipboardList } from "lucide-react";
import { api } from "../services/api";
import { generateAtestadoPDF, generateReceitaPDF } from "../utils/pdfGenerator";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

interface ReceitasAtestadoProps {
  onClose?: () => void;
}

const ReceitasAtestado: React.FC<ReceitasAtestadoProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [documentosSalvos, setDocumentosSalvos] = useState<any[]>([]);
  const [carregandoDocumentos, setCarregandoDocumentos] = useState(false);
  const [medicoInfo, setMedicoInfo] = useState<any>(null);
  const [assinandoDocumento, setAssinandoDocumento] = useState<any>(null);
  const [assinaturaPos, setAssinaturaPos] = useState({ x: 32, y: 230 });
  const [assinando, setAssinando] = useState(false);

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

      await api.patch(
        `/funcionario/${assinandoDocumento.tipoDocumento}s/${assinandoDocumento.id}/assinatura`,
        payload,
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

  const baixarDocumento = (item: any) => {
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

  return (
    <section className="rounded-2xl border border-[#D9E4F0] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F7] pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5C7A9B]">
            Receitas e atestados
          </p>
          <h3 className="mt-1 text-xl font-bold text-[#0F2242]">Meus Documentos Emitidos</h3>
          <p className="mt-1 text-sm text-[#5C7A9B]">
            Lista de receitas e atestados emitidos durante as consultas para assinatura e download.
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

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5C7A9B]">
              Documentos Registrados
            </p>
            <p className="mt-1 text-sm text-[#5C7A9B]">
              Assine digitalmente os documentos criados durante o atendimento.
            </p>
          </div>
          <button
            type="button"
            onClick={carregarDocumentos}
            className="inline-flex items-center gap-2 rounded-xl border border-[#C8D9ED] bg-white px-4 py-2 text-sm font-bold text-[#1A3F72] hover:bg-[#F8FAFD] transition-all"
          >
            Atualizar Lista
          </button>
        </div>

        {carregandoDocumentos ? (
          <div className="mt-8 flex flex-col items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1A3F72] border-r-transparent" />
            <p className="mt-4 text-sm font-bold text-[#5C7A9B]">Carregando documentos...</p>
          </div>
        ) : documentosSalvos.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#E5EDF7] bg-[#F8FAFD] py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <FileText className="h-8 w-8 text-[#8FA8C4]" />
            </div>
            <p className="max-w-xs text-sm font-bold text-[#5C7A9B]">
              Ainda não há receitas ou atestados emitidos por você.
            </p>
            <p className="mt-1 text-xs text-[#8FA8C4]">Os documentos aparecem aqui após serem registrados na evolução da consulta.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {documentosSalvos.map((item) => (
              <article
                key={item.id}
                className="group relative overflow-hidden rounded-3xl border-2 border-[#E5EDF7] bg-white p-6 shadow-md transition-all hover:border-[#D0DEF0] hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${
                        item.tipoDocumento === "receita" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                      }`}>
                        {item.tipoDocumento === "receita" ? <Pill className="h-6 w-6" /> : <ClipboardList className="h-6 w-6" />}
                      </div>
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          item.tipoDocumento === "receita" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                        }`}>
                          {item.tipoDocumento === "receita" ? "Receita Médica" : "Atestado Médico"}
                        </span>
                        <h4 className="mt-1.5 text-lg font-black text-[#0F2242] leading-tight">
                          {item.paciente?.nome || "Paciente"}
                        </h4>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[#5C7A9B]">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#C8D9ED]" />
                        <span className="font-bold">CID:</span> {item.cid || "—"}
                      </div>
                      <div className="flex items-center gap-2 text-[#5C7A9B]">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#C8D9ED]" />
                        <span className="font-bold">Data:</span> {item.dataEmissao
                          ? new Date(item.dataEmissao.split('T')[0] + 'T12:00:00').toLocaleDateString("pt-BR")
                          : "—"}
                      </div>
                      
                      {item.tipoDocumento === "receita" && item.itens && item.itens.length > 0 && (
                        <div className="mt-3 rounded-2xl bg-[#F8FAFD] p-3 border border-[#E4EDF7]">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#8FA8C4] mb-2 flex items-center gap-1.5">
                            <Pill className="h-3 w-3" /> Itens Prescritos
                          </p>
                          <div className="space-y-1.5">
                            {item.itens.map((med: any, idx: number) => (
                              <p key={idx} className="text-xs font-bold text-[#1A3F72] flex items-center gap-1.5">
                                <span className="text-[10px] text-blue-400">•</span> {med.medicamento}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {item.assinaturaConcluida ? (
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F9F0] px-4 py-2 border border-[#BFF0D4] shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                        <span className="text-xs font-black uppercase tracking-widest text-[#1F7A44]">
                          Assinado
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 border border-amber-100 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-amber-700">
                          Pendente
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 mb-5">
                  <div className="rounded-2xl bg-[#F8FAFD] px-4 py-3 border border-[#EEF2F7]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#8FA8C4]">
                      {item.tipoDocumento === "receita" ? "Medicação" : "Repouso"}
                    </p>
                    <p className="mt-1 text-sm font-black text-[#1A3F72] truncate">
                      {item.tipoDocumento === "receita"
                        ? item.medicamento || "Múltiplos itens"
                        : `${item.diasRepouso || 0} dia(s)`}
                    </p>
                  </div>
                  {item.assinaturaConcluida && (
                    <div className="rounded-2xl bg-emerald-50/50 px-4 py-3 border border-emerald-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70">
                        Registro Digital
                      </p>
                      <p className="mt-1 text-[11px] font-mono font-bold text-emerald-700 truncate">
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
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0F2242] px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <ShieldCheck className="h-4 w-4" /> Assinar Agora
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => baixarDocumento(item)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#0F2242] bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-[#0F2242] hover:bg-[#F8FAFD] transition-all"
                    >
                      <Download className="h-4 w-4" /> Baixar PDF
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => baixarDocumento(item)}
                    className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#D9E4F0] text-[#5C7A9B] hover:bg-[#EEF4FA] transition-all"
                    title="Visualizar Detalhes"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

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
