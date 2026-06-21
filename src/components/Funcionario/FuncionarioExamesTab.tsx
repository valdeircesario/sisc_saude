import React, { useState } from "react";
import { Search, Download, FileText, FlaskConical, User, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { downloadExamePDF } from "../../utils/downloadFile";
import { Pagination } from "../UI/Pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Paginação local
  const totalPages = Math.ceil((filteredExames?.length || 0) / itemsPerPage);
  const currentItems = filteredExames?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF2FB] flex items-center justify-center border border-[#C8D9ED]">
              <FlaskConical className="h-5 w-5 text-[#1A3F72]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                Laudos e Exames
              </h2>
              <p className="text-xs text-[#8FA8C4]">
                Consulte resultados e realize o download de laudos técnicos.
              </p>
            </div>
          </div>
          <div className="relative md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#8FA8C4]" />
            </div>
            <input
              type="text"
              value={exameSearchTerm}
              onChange={(e) => setExameSearchTerm(e.target.value)}
              placeholder="Buscar paciente ou tipo..."
              className="block w-full pl-9 pr-3 py-2 text-sm text-[#1A2E4A] placeholder-[#8FA8C4] rounded-lg outline-none transition-all shadow-sm"
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
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#C8D9ED] border-t-[#1A3F72] mx-auto"></div>
            <p className="mt-4 text-sm font-medium text-[#5C7A9B]">Carregando laudos...</p>
          </div>
        ) : filteredExames.length > 0 ? (
          <div className="flex flex-col gap-3 min-h-[400px]">
            <div className="hidden lg:grid grid-cols-[1.5fr_1.2fr_1fr_1fr_auto] gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#8FA8C4] border-b border-[#EEF2F7]">
              <span>Paciente</span>
              <span>Laboratório</span>
              <span>Tipo de Exame</span>
              <span>Realizado em</span>
              <span className="text-right px-4">Ação</span>
            </div>
            <div className="divide-y divide-[#F4F8FC]">
              {currentItems.map((item: any) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 lg:grid-cols-[1.5fr_1.2fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 transition-all duration-200 hover:bg-[#F8FAFD] rounded-xl group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center border border-[#E2E8F0] group-hover:bg-[#fff] transition-colors">
                      <User className="h-4.5 w-4.5 text-[#64748B]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0F2242]">
                        {item.paciente?.nome || "Paciente não informado"}
                      </p>
                      <p className="text-[10px] font-bold text-[#8FA8C4]">
                        CPF: {item.paciente?.cpf || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[#F8FAFD] flex items-center justify-center border border-[#E4EDF7]">
                      <MapPin className="h-3.5 w-3.5 text-[#3A5B82]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#3A5B82] truncate">
                        {item.laboratorio?.nome || "Não informado"}
                      </p>
                      <p className="text-[9px] font-medium text-[#8FA8C4]">
                        {item.laboratorio?.telefone || "Sem contato"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#3A5B82]">
                      {item.tipo || "Exame"}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 mt-1">
                      Concluído
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#3A5B82]">
                      {item.dataRealizado
                        ? format(new Date(item.dataRealizado), "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </p>
                    <p className="text-[9px] font-medium text-[#8FA8C4]">
                      {item.dataRealizado ? format(new Date(item.dataRealizado), "HH:mm") : "—"}
                    </p>
                  </div>

                  <div className="flex justify-end lg:pl-4">
                    {item.arquivoPdf ? (
                      <button
                        onClick={() => downloadExamePDF(item.arquivoPdf)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-[#1A3F72]/20 hover:scale-105 active:scale-95"
                        style={{ background: "#1A3F72" }}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Baixar Laudo
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-bold uppercase">
                        Indisponível
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-[#F8FAFD] rounded-2xl border border-dashed border-[#C8D9ED]">
            <FlaskConical className="h-12 w-12 text-[#C8D9ED] mb-4" />
            <p className="text-sm font-bold text-[#8FA8C4] uppercase tracking-widest text-center">Nenhum exame localizado</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredExames?.length || 0}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default FuncionarioExamesTab;
