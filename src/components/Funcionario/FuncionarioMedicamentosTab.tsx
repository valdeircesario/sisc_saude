import React from "react";
import { Search } from "lucide-react";

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
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "#fff",
        border: "1px solid #D9E4F0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
            Medicamentos
          </h2>
          <p className="text-sm text-[#8FA8C4] mt-0.5">
            Use os controles abaixo para editar estoque ou administrar
            medicação.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#8FA8C4]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            placeholder="Buscar medicamento ou paciente..."
          />
        </div>
      </div>

      {loadingMedicamentos ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#C8D9ED] border-t-[#1A3F72] mx-auto"></div>
          <p className="mt-3 text-sm text-[#8FA8C4]">
            Carregando medicamentos...
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {medicamentosDaUbs && medicamentosDaUbs.length > 0 ? (
            medicamentosDaUbs.map((med: any) => (
              <div
                key={med.id}
                className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{
                  border: "1px solid #E4EDF7",
                  background: "#FAFCFF",
                }}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 items-center">
                    <p className="text-xs text-[#8FA8C4]">{med.nome}</p>
                    <span
                      className="px-2 py-0.5 text-xs rounded-full font-medium"
                      style={{
                        background: "#EBF2FB",
                        color: "#1A3F72",
                      }}
                    >
                      UBS: {med.ubs?.nome || "Não informada"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0F2242]">
                    {med.descricao}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#5C7A9B]">
                    <p>
                      <span className="font-semibold text-[#3A5B82]">Lote:</span>{" "}
                      {med.lote}
                    </p>
                    <p>
                      <span className="font-semibold text-[#3A5B82]">
                        Quantidade:
                      </span>{" "}
                      {med.quantidade}
                    </p>
                    <p>
                      <span className="font-semibold text-[#3A5B82]">
                        Validade:
                      </span>{" "}
                      {med.dataValidade?.split("T")[0] || "-"}
                    </p>
                    <p
                      className={
                        med.vencido
                          ? "text-[#8B1F1F] font-semibold"
                          : "text-[#145C35] font-semibold"
                      }
                    >
                      <span className="font-semibold text-[#3A5B82]">
                        Status:
                      </span>{" "}
                      {med.vencido ? "Vencido" : "Válido"}
                    </p>
                  </div>
                  {!Number(med.quantidade) ? (
                    <div
                      className="mt-2 rounded-lg px-3 py-2 text-xs font-medium"
                      style={{
                        background: "#FEF0F0",
                        color: "#8B1F1F",
                        border: "1px solid #F0C0C0",
                      }}
                    >
                      Sem estoque disponível no momento.
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {Number(med.quantidade) > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEditMed(med)}
                        className="px-3 py-2 text-xs font-semibold rounded-lg text-white transition-all"
                        style={{ background: "#1A3F72" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#0F2A52")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#1A3F72")
                        }
                      >
                        Atualizar medicação
                      </button>
                      <button
                        type="button"
                        onClick={() => openAdministrarMed(med)}
                        className="px-3 py-2 text-xs font-semibold rounded-lg text-white transition-all"
                        style={{ background: "#145C35" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#0E4226")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#145C35")
                        }
                      >
                        Ministrar ao paciente
                      </button>
                    </>
                  ) : (
                    <span
                      className="px-3 py-2 rounded-lg text-xs font-medium"
                      style={{
                        border: "1px solid #F0C0C0",
                        background: "#FEF0F0",
                        color: "#8B1F1F",
                      }}
                    >
                      Ações desabilitadas por falta de estoque
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#8FA8C4]">
              Nenhum medicamento encontrado para sua UBS.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FuncionarioMedicamentosTab;
