import React, { useState } from "react";
import { Search, Pill, Package, AlertCircle, CheckCircle } from "lucide-react";
import { Pagination } from "../UI/Pagination";

interface MedicamentosTabProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  loadingMedicamentos: boolean;
  medicamentosDaUbs: any[];
  handleEditMed: (med: any) => void;
  openAdministrarMed: (med: any) => void;
}

const FuncionarioMedicamentosTab: React.FC<MedicamentosTabProps> = ({
  searchTerm,
  setSearchTerm,
  loadingMedicamentos,
  medicamentosDaUbs,
  handleEditMed,
  openAdministrarMed,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Paginação local
  const totalPages = Math.ceil((medicamentosDaUbs?.length || 0) / itemsPerPage);
  const currentItems = medicamentosDaUbs?.slice(
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
            <div className="w-10 h-10 rounded-xl bg-[#F0EDFB] flex items-center justify-center border border-[#DED7F7]">
              <Pill className="h-5 w-5 text-[#4C3799]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                Controle de Medicamentos
              </h2>
              <p className="text-xs text-[#8FA8C4]">
                Gerencie o estoque e a administração de fármacos.
              </p>
            </div>
          </div>
          <div className="relative md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#8FA8C4]" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              placeholder="Buscar medicamento ou lote..."
            />
          </div>
        </div>

        {loadingMedicamentos ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#C8D9ED] border-t-[#1A3F72] mx-auto"></div>
            <p className="mt-4 text-sm font-medium text-[#5C7A9B]">Carregando estoque...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((med: any) => (
                <div
                  key={med.id}
                  className="rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 group"
                  style={{
                    border: "1px solid #E4EDF7",
                    background: "#FAFCFF",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#A8C4E0";
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,63,114,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E4EDF7";
                    e.currentTarget.style.background = "#FAFCFF";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#F8FAFD] flex items-center justify-center border border-[#E4EDF7]">
                          <Package className="h-4 w-4 text-[#3A5B82]" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA8C4]">
                          Lote: {med.lote}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          med.vencido
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                      >
                        {med.vencido ? "VENCIDO" : "VÁLIDO"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#0F2242] group-hover:text-[#1A3F72] transition-colors">
                        {med.descricao}
                      </h3>
                      <p className="text-xs text-[#5C7A9B] mt-1 font-medium italic">
                        {med.nome}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-white p-2 rounded-xl border border-[#EEF2F7]">
                        <p className="text-[9px] font-black text-[#8FA8C4] uppercase tracking-widest mb-1">Estoque</p>
                        <p className={`text-sm font-black ${!Number(med.quantidade) ? 'text-rose-600' : 'text-[#1A3F72]'}`}>
                          {med.quantidade} un
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-[#EEF2F7]">
                        <p className="text-[9px] font-black text-[#8FA8C4] uppercase tracking-widest mb-1">Validade</p>
                        <p className="text-sm font-bold text-[#3A5B82]">
                          {med.dataValidade?.split("T")[0] || "-"}
                        </p>
                      </div>
                    </div>

                    {!Number(med.quantidade) && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-bold animate-pulse">
                        <AlertCircle className="h-3.5 w-3.5" />
                        ESTOQUE ZERADO
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[#EEF2F7]">
                    <button
                      type="button"
                      onClick={() => handleEditMed(med)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-sm"
                      style={{ background: "#1A3F72", color: "#fff" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#0F2A52")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#1A3F72")}
                    >
                      Estoque
                    </button>
                    {Number(med.quantidade) > 0 && (
                      <button
                        type="button"
                        onClick={() => openAdministrarMed(med)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-sm"
                        style={{ background: "#145C35", color: "#fff" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#0E4226")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#145C35")}
                      >
                        Ministrar
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#F8FAFD] rounded-2xl border border-dashed border-[#C8D9ED]">
                <Pill className="h-12 w-12 text-[#C8D9ED] mb-4" />
                <p className="text-sm font-bold text-[#8FA8C4] uppercase tracking-widest">Nenhum medicamento encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={medicamentosDaUbs?.length || 0}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default FuncionarioMedicamentosTab;
