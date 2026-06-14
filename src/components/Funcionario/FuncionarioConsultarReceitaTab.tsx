import React from "react";
import { Search, Package, User, Clock, MapPin, FileText, CheckCircle, AlertCircle, ShieldCheck, Pill } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConsultarReceitaTabProps {
  receitaEncontrada: any;
  handleBuscarReceita: (e: React.FormEvent) => void;
  registroReceitaBusca: string;
  setRegistroReceitaBusca: (val: string) => void;
  buscarReceitaLoading: boolean;
  carregandoReceita: boolean;
  handleLimparReceita: () => void;
  setShowDetalhesDispensacaoModal: (show: boolean) => void;
  handleValidarDispensacao: () => void;
  isDispensando: boolean;
  isValidando: boolean;
}

const FuncionarioConsultarReceitaTab: React.FC<ConsultarReceitaTabProps> = ({
  receitaEncontrada,
  handleBuscarReceita,
  registroReceitaBusca,
  setRegistroReceitaBusca,
  buscarReceitaLoading,
  carregandoReceita,
  handleLimparReceita,
  setShowDetalhesDispensacaoModal,
  handleValidarDispensacao,
  isDispensando,
  isValidando,
}) => {
  return (
    <div
      className="rounded-2xl flex flex-col h-full"
      style={{
        background: "#fff",
        border: "1px solid #D9E4F0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center border border-[#DCFCE7]">
            <ShieldCheck className="h-5 w-5 text-[#166534]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
              Validação de Prescrições
            </h2>
            <p className="text-xs text-[#8FA8C4]">
              Consulte receitas digitais e realize a dispensação de medicamentos.
            </p>
          </div>
        </div>

        {!receitaEncontrada ? (
          <div className="max-w-2xl mx-auto py-10">
            <form
              onSubmit={handleBuscarReceita}
              className="p-1.5 bg-[#F8FAFD] border border-[#E4EDF7] rounded-2xl flex flex-col sm:flex-row gap-2 shadow-sm"
            >
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FileText className="h-4 w-4 text-[#8FA8C4]" />
                </div>
                <input
                  type="text"
                  value={registroReceitaBusca}
                  onChange={(e) => setRegistroReceitaBusca(e.target.value)}
                  placeholder="Código de Registro (Ex: REG-SISC1A2B3C...)"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#D9E4F0] rounded-xl text-sm font-medium text-[#0F2242] outline-none focus:border-[#1A3F72] transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={buscarReceitaLoading || carregandoReceita}
                className="px-6 py-3 bg-[#1A3F72] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#1A3F72]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {buscarReceitaLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Consultar
              </button>
            </form>
            <div className="mt-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#F8FAFD] flex items-center justify-center mb-4 border border-[#E4EDF7]">
                <ShieldCheck className="h-8 w-8 text-[#C8D9ED]" />
              </div>
              <p className="text-sm text-[#8FA8C4] max-w-sm">
                O código de registro garante a autenticidade da prescrição e evita dispensações duplicadas.
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header do Resultado */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-4 bg-[#EBF2FB] rounded-2xl border border-[#C8D9ED]">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    receitaEncontrada.status === "ativa"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-rose-50 text-rose-700 border-rose-100"
                  }`}
                >
                  {receitaEncontrada.status || "Pendente"}
                </span>
                <span className="text-xs font-bold text-[#3A5B82]">
                  REGISTRO: <span className="font-mono text-[#1A3F72]">{receitaEncontrada.registroAssinatura || "N/A"}</span>
                </span>
              </div>
              <button
                onClick={handleLimparReceita}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-[#5C7A9B] border border-[#C8D9ED] bg-white hover:bg-[#F8FAFD] transition-all"
              >
                Nova Consulta
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna 1 e 2: Detalhes */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card Paciente */}
                  <div className="p-5 bg-[#FAFCFF] border border-[#E4EDF7] rounded-2xl">
                    <p className="text-[10px] font-black text-[#8FA8C4] uppercase tracking-widest mb-3">Identificação do Paciente</p>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full bg-white border border-[#C8D9ED] flex items-center justify-center shadow-sm">
                        <User className="h-5.5 w-5.5 text-[#1A3F72]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#0F2242] truncate">{receitaEncontrada.paciente?.nome}</p>
                        <p className="text-[10px] font-bold text-[#3A5B82] uppercase">CPF: {receitaEncontrada.paciente?.cpf}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Emissor */}
                  <div className="p-5 bg-[#FAFCFF] border border-[#E4EDF7] rounded-2xl">
                    <p className="text-[10px] font-black text-[#8FA8C4] uppercase tracking-widest mb-3">Unidade e Profissional</p>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-11 h-11 rounded-full bg-white border border-[#C8D9ED] flex items-center justify-center shadow-sm">
                        <ShieldCheck className="h-5.5 w-5.5 text-[#145C35]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#0F2242] truncate">{receitaEncontrada.funcionario?.nome}</p>
                        <p className="text-[10px] font-bold text-[#3A5B82] uppercase truncate">{receitaEncontrada.ubs?.nome || "UBS Local"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de Medicamentos */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-[#0F2242] uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Pill className="h-4 w-4 text-[#1A3F72]" /> Itens da Prescrição
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {receitaEncontrada.itens?.map((item: any, idx: number) => {
                      const foiDispensado = receitaEncontrada.dispensacoes?.some(
                        (d: any) => d.medicamentoFornecido === item.medicamento
                      );
                      return (
                        <div key={idx} className="p-4 bg-white border border-[#E4EDF7] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#A8C4E0] transition-all group">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${foiDispensado ? 'bg-emerald-50 border-emerald-100' : 'bg-[#F8FAFD] border-[#E4EDF7] group-hover:bg-[#EBF2FB]'}`}>
                              <Package className={`h-5 w-5 ${foiDispensado ? 'text-emerald-600' : 'text-[#3A5B82]'}`} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#0F2242] leading-tight">{item.medicamento}</p>
                              <p className="text-[11px] font-medium text-[#5C7A9B] mt-0.5">{item.dosagem} • {item.posologia}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                            <div className="text-right">
                              <p className="text-xs font-black text-[#1A3F72]">{item.quantidade} un</p>
                              <p className="text-[9px] font-bold text-[#8FA8C4] uppercase">Quantidade</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                              foiDispensado ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {foiDispensado ? "Dispensado" : "Pendente"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Coluna 3: Ações e Histórico */}
              <div className="space-y-6">
                {/* Ações */}
                <div className="p-5 bg-[#F8FAFD] border border-[#C8D9ED] rounded-2xl shadow-sm">
                  <p className="text-[10px] font-black text-[#8FA8C4] uppercase tracking-widest mb-4">Gerenciamento</p>
                  <div className="space-y-3">
                    {receitaEncontrada.itens?.some((m: any) => m.status === "pendente") ? (
                      <button
                        onClick={handleValidarDispensacao}
                        disabled={isDispensando || isValidando}
                        className="w-full py-3.5 bg-[#145C35] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isValidando ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Validar e Dispensar
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowDetalhesDispensacaoModal(true)}
                        className="w-full py-3.5 bg-[#1A3F72] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#1A3F72]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Detalhes da Dispensação
                      </button>
                    )}
                  </div>
                </div>

                {/* Mini Histórico */}
                <div className="p-5 bg-white border border-[#E4EDF7] rounded-2xl">
                  <p className="text-[10px] font-black text-[#8FA8C4] uppercase tracking-widest mb-4">Últimas Dispensações</p>
                  {receitaEncontrada.dispensacoes && receitaEncontrada.dispensacoes.length > 0 ? (
                    <div className="space-y-3">
                      {receitaEncontrada.dispensacoes.slice(0, 3).map((disp: any, idx: number) => (
                        <div key={idx} className="pb-3 border-b border-[#F4F8FC] last:border-0 last:pb-0">
                          <p className="text-xs font-bold text-[#0F2242] truncate">{disp.farmaciaResponsavel || "Unidade Local"}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-[#8FA8C4]">{format(new Date(disp.dataDispensacao || disp.createdAt), "dd/MM/yy")}</span>
                            <span className="text-[10px] font-bold text-emerald-600">✓ Concluída</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Clock className="h-6 w-6 text-[#C8D9ED] mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-[#8FA8C4] uppercase">Nenhum registro</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuncionarioConsultarReceitaTab;
