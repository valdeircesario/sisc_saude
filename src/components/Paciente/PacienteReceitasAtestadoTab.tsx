import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Building2, 
  CheckCircle, 
  Clock,
  Filter,
  ClipboardList,
  Pill
} from "lucide-react";
import { generateAtestadoPDF, generateReceitaPDF } from "../../utils/pdfGenerator";

interface PacienteReceitasAtestadoTabProps {
  receitas: any[];
  atestados: any[];
  perfil: any;
  SectionHeader: React.FC<{ icon: any; title: string; color?: string }>;
  EmptyState: React.FC<{ icon: any; message: string }>;
}

export const PacienteReceitasAtestadoTab: React.FC<PacienteReceitasAtestadoTabProps> = ({
  receitas,
  atestados,
  perfil,
  SectionHeader,
  EmptyState,
}) => {
  const [filtro, setFiltro] = useState<"todos" | "receita" | "atestado">("todos");

  const todosDocumentos = useMemo(() => {
    const docs = [
      ...(receitas || []).map((r) => ({ ...r, tipoDoc: "receita" })),
      ...(atestados || []).map((a) => ({ ...a, tipoDoc: "atestado" })),
    ].sort((a, b) => {
      const dateA = a.dataEmissao ? new Date(a.dataEmissao).getTime() : 0;
      const dateB = b.dataEmissao ? new Date(b.dataEmissao).getTime() : 0;
      return dateB - dateA;
    });

    if (filtro === "todos") return docs;
    return docs.filter(doc => doc.tipoDoc === filtro);
  }, [receitas, atestados, filtro]);

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

    if (item.tipoDoc === "receita") {
      generateReceitaPDF(
        item,
        perfil,
        item.funcionario,
        item.ubs,
        assinaturaData
      );
    } else {
      generateAtestadoPDF(
        item,
        perfil,
        item.funcionario,
        item.ubs,
        assinaturaData
      );
    }
  };

  const formatarData = (data: any) => {
    if (!data) return "—";
    try {
      const date = new Date(data);
      // Compensa o fuso horário para exibir a data correta (evita o problema de "dia anterior")
      const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      return format(adjustedDate, "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "—";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <SectionHeader
            icon={FileText}
            title="Minhas Receitas e Atestados"
            color="teal"
          />

          {/* Filtros */}
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
            <button
              onClick={() => setFiltro("todos")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                filtro === "todos"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-100"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Filter className="h-3.5 w-3.5" /> TODOS
            </button>
            <button
              onClick={() => setFiltro("receita")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                filtro === "receita"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-100"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Pill className="h-3.5 w-3.5" /> RECEITAS
            </button>
            <button
              onClick={() => setFiltro("atestado")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                filtro === "atestado"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-100"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" /> ATESTADOS
            </button>
          </div>
        </div>

        {todosDocumentos.length > 0 ? (
          <div className="space-y-3">
            {todosDocumentos.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white transition-all hover:border-teal-200 hover:bg-teal-50/30"
              >
                {/* Ícone e Tipo */}
                <div className="flex items-center gap-4 md:w-1/4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                    item.tipoDoc === 'receita' 
                      ? 'bg-teal-50 text-teal-600 border border-teal-100' 
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                  }`}>
                    {item.tipoDoc === 'receita' ? <Pill className="h-6 w-6" /> : <ClipboardList className="h-6 w-6" />}
                  </div>
                  <div className="min-w-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      item.tipoDoc === 'receita' ? 'text-teal-600' : 'text-indigo-600'
                    }`}>
                      {item.tipoDoc === 'receita' ? "Receita Médica" : "Atestado Médico"}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 truncate">
                      {item.tipoDoc === 'receita' ? (item.descricao || "Receita Médica") : item.descricao}
                    </h4>
                  </div>
                </div>

                {/* Info Médica/Data */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Data</span>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-teal-500" />
                      {formatarData(item.dataEmissao)}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Profissional</span>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mt-0.5 truncate">
                      <User className="h-3.5 w-3.5 text-teal-500" />
                      {item.funcionario?.nome || "—"}
                    </div>
                  </div>

                  <div className="flex flex-col col-span-2 md:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Unidade</span>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mt-0.5">
                      <Building2 className="h-3.5 w-3.5 text-teal-500" />
                      {item.ubs?.nome || "—"}
                    </div>
                  </div>
                </div>

                {/* Status e Ação */}
                <div className="flex items-center justify-between md:justify-end gap-6 mt-2 md:mt-0">
                  <div className="flex flex-col items-start md:items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</span>
                    {item.assinaturaConcluida ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-100">
                        <CheckCircle className="h-3 w-3" /> ASSINADO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600 border border-amber-100">
                        <Clock className="h-3 w-3" /> PENDENTE
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => baixarDocumento(item)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-100 transition-all hover:bg-teal-700 hover:-translate-y-1 active:scale-95"
                    title="Baixar Documento"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            message={`Nenhuma ${filtro === 'atestado' ? 'atestado médico' : filtro === 'receita' ? 'receita médica' : 'documento'} encontrado`}
          />
        )}
      </div>
    </div>
  );
};
