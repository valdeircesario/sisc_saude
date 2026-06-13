import React from "react";
import { Search, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExamesTabProps {
  exameSearchTerm: string;
  setExameSearchTerm: (val: string) => void;
  loadingExames: boolean;
  filteredExames: any[];
}

const FuncionarioExamesTab: React.FC<ExamesTabProps> = ({
  exameSearchTerm,
  setExameSearchTerm,
  loadingExames,
  filteredExames,
}) => {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "#fff",
        border: "1px solid #D9E4F0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
            Exames realizados
          </h2>
          <p className="text-sm text-[#8FA8C4] mt-0.5">
            Liste os exames concluídos e realize o download do laudo.
          </p>
        </div>
        <div className="relative md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#8FA8C4]" />
          </div>
          <input
            type="text"
            value={exameSearchTerm}
            onChange={(e) => setExameSearchTerm(e.target.value)}
            placeholder="Buscar por nome do paciente, laboratório ou tipo"
            className="block w-full pl-9 pr-3 py-2 text-sm text-[#1A2E4A] placeholder-[#8FA8C4] rounded-lg outline-none transition-all"
            style={{
              border: "1px solid #C8D9ED",
              background: "#F4F8FC",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#1A3F72";
              e.target.style.background = "#fff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#C8D9ED";
              e.target.style.background = "#F4F8FC";
            }}
          />
        </div>
      </div>

      {loadingExames ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#C8D9ED] border-t-[#1A3F72] mx-auto"></div>
          <p className="mt-3 text-sm text-[#8FA8C4]">Carregando...</p>
        </div>
      ) : filteredExames.length > 0 ? (
        <div
          className="overflow-hidden rounded-xl border"
          style={{ borderColor: "#E4EDF7" }}
        >
          <div className="grid grid-cols-[1.8fr_1.4fr_1fr_1.2fr_auto] gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] bg-[#F8FAFD]">
            <span>Paciente</span>
            <span>Laboratório</span>
            <span>Tipo de exame</span>
            <span>Data da realização</span>
            <span className="text-right">Ações</span>
          </div>
          <div className="divide-y" style={{ borderColor: "#E4EDF7" }}>
            {filteredExames.map((item: any) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.8fr_1.4fr_1fr_1.2fr_auto] gap-3 items-center px-4 py-3 bg-white"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0F2242]">
                    {item.paciente?.nome || "Paciente não informado"}
                  </p>
                  <p className="text-xs text-[#8FA8C4]">
                    CPF: {item.paciente?.cpf || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#3A5B82]">
                    {item.laboratorio?.nome || "Não informado"}
                  </p>
                  <p className="text-xs text-[#8FA8C4]">
                    {item.laboratorio?.telefone || "Sem contato"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#3A5B82]">
                    {item.tipo || "Exame"}
                  </p>
                  <p className="text-xs text-[#8FA8C4]">
                    Status: {item.status || "realizado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#3A5B82]">
                    {item.dataRealizado
                      ? format(new Date(item.dataRealizado), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })
                      : item.dataAgendada
                        ? format(
                            new Date(item.dataAgendada),
                            "dd/MM/yyyy HH:mm",
                            {
                              locale: ptBR,
                            },
                          )
                        : "Data não informada"}
                  </p>
                </div>
                <div className="flex justify-end">
                  {item.arquivoPdf ? (
                    <a
                      href={`http://localhost:3001/api/exames/download/${item.arquivoPdf}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                      style={{ background: "#1A3F72" }}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar laudo
                    </a>
                  ) : (
                    <span
                      className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: "#F4F8FC",
                        color: "#8FA8C4",
                      }}
                    >
                      Laudo indisponível
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-10 w-10 mx-auto mb-3 text-[#C8D9ED]" />
          <p className="text-sm text-[#8FA8C4]">
            Nenhum exame realizado encontrado.
          </p>
        </div>
      )}
    </div>
  );
};

export default FuncionarioExamesTab;
