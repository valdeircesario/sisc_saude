import React from "react";
import { Package, Box, CheckCheck, AlertCircle } from "lucide-react";
import { InfoItem } from "./FarmaciaUtils";

export interface DispensacaoPayload {
  id?: string;
  dataDispensacao?: string;
  createdAt?: string;
  statusDispensacao?: string;
  quantidadeDispensada?: string | number;
  farmaciaResponsavel?: string | null;
  medicamentoFornecido?: string | null;
  observacoesDispensacao?: string | null;
  farmacia?: { nome: string } | null;
  receitaMedicamentoId?: string | null;
}

export interface ReceitaMedicamento {
  id: string;
  medicamento: string;
  dosagem: string;
  quantidade: number;
  posologia?: string;
  observacoes?: string;
  status: string; // "pendente" | "dispensado"
  dispensado?: boolean;
}

export interface ReceitaPayload {
  id: string;
  registroAssinatura?: string | null;
  medicamento: string;
  dosagem: string;
  quantidade: string;
  descricao?: string;
  observacoes?: string | null;
  status: string;
  paciente?: { nome: string } | null;
  funcionario?: { nome: string } | null;
  ubs?: { nome: string } | null;
  dispensacoes?: DispensacaoPayload[] | null;
  itens?: ReceitaMedicamento[] | null;
}

interface FarmaciaResultCardProps {
  receita: ReceitaPayload;
  contagem: { total: number; completas: number; parciais: number };
  ultimaDispensacao: DispensacaoPayload | null;
  validacaoDispensacao: { pode: boolean; motivo: string | null };
  onDispensarClick: () => void;
  formatarDataDispensacao?: (disp: DispensacaoPayload) => string;
}

export const FarmaciaResultCard: React.FC<FarmaciaResultCardProps> = ({
  receita,
  contagem,
  ultimaDispensacao,
  validacaoDispensacao,
  onDispensarClick,
  formatarDataDispensacao,
}) => (
  <div className="mt-5 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 shadow-sm">
    {/* Header */}
    <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-red-600 px-6 py-4">
      <div>
        <h3
          className="text-base font-semibold text-white"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Receita encontrada
        </h3>

        <p className="mt-1 text-xs text-indigo-100">
          Registro: {receita.registroAssinatura || receita.id}
        </p>
      </div>

      <span
        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
          receita.status === "ativo"
            ? "border border-white/30 bg-white/20 text-white"
            : "bg-black/20 text-white"
        }`}
      >
        {receita.status}
      </span>
    </div>

    <div className="space-y-6 p-6">
      {/* Paciente */}
      <section>
        <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Dados do paciente
        </h4>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InfoItem label="Paciente" value={receita.paciente?.nome || "—"} />

          <InfoItem label="UBS" value={receita.ubs?.nome || "—"} />

          <InfoItem
            label="Médico responsável"
            value={receita.funcionario?.nome || "—"}
          />
        </div>
      </section>

      <div className="border-t border-slate-200" />

      {/* Prescrição */}
      <section>
        <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Medicamentos prescritos
        </h4>

        {receita.itens && receita.itens.length > 0 ? (
          <div className="space-y-3">
            {receita.itens.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-4 ${
                  item.status === "dispensado"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                      item.status === "dispensado"
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-700">
                      {item.medicamento}
                      {item.status === "dispensado" && (
                        <span className="ml-2 text-xs font-semibold text-emerald-600">
                          ✓ Dispensado
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      <strong>Dosagem:</strong> {item.dosagem} |{" "}
                      <strong>Qtd:</strong> {item.quantidade}
                    </p>
                    {item.posologia && (
                      <p className="mt-1 text-xs text-slate-600">
                        <strong>Posologia:</strong> {item.posologia}
                      </p>
                    )}
                    {item.observacoes && (
                      <p className="mt-1 text-xs text-slate-500">
                        <strong>Obs:</strong> {item.observacoes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <InfoItem
                label="Medicamento prescrito"
                value={receita.medicamento}
                fullWidth
              />
            </div>

            <InfoItem label="Dosagem" value={receita.dosagem} />

            <InfoItem label="Comprimidos" value={receita.quantidade} />
          </div>
        )}
      </section>

      {receita.observacoes && (
        <>
          <div className="border-t border-slate-200" />

          <section>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Observações
            </h4>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-700">{receita.observacoes}</p>
            </div>
          </section>
        </>
      )}

      {!!receita.dispensacoes?.length && (
        <>
          <div className="border-t border-slate-200" />

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Histórico de dispensações
              </h4>

              <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-red-600">
                {receita.dispensacoes.length} registro(s)
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {receita.dispensacoes.map((disp, index) => (
                <div
                  key={disp.id || index}
                  className="flex gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0"
                >
                  <div
                    className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                      disp.statusDispensacao === "parcial"
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700">
                      {disp.statusDispensacao === "parcial"
                        ? `Dispensação parcial ${index + 1}`
                        : `Dispensação completa ${index + 1}`}

                      {disp.medicamentoFornecido &&
                        ` • ${disp.medicamentoFornecido}`}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(
                        disp.dataDispensacao || disp.createdAt || Date.now(),
                      ).toLocaleString("pt-BR")}
                    </p>

                    {(disp.farmaciaResponsavel ||
                      disp.observacoesDispensacao) && (
                      <p className="mt-1 text-xs text-slate-400">
                        {disp.farmaciaResponsavel}

                        {disp.farmaciaResponsavel &&
                          disp.observacoesDispensacao &&
                          " • "}

                        {disp.observacoesDispensacao}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {(contagem.total > 0 || ultimaDispensacao) && (
        <>
          <div className="border-t border-slate-200" />

          <section>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Resumo da dispensação
            </h4>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2">
                <Box size={14} />
                <span className="text-xs font-medium">
                  {contagem.total} dispensações
                </span>
              </div>

              {contagem.completas > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2">
                  <CheckCheck size={14} />
                  <span className="text-xs font-medium text-emerald-700">
                    {contagem.completas} completas
                  </span>
                </div>
              )}

              {contagem.parciais > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
                  <AlertCircle size={14} />
                  <span className="text-xs font-medium text-amber-700">
                    {contagem.parciais} parciais
                  </span>
                </div>
              )}
            </div>

            {ultimaDispensacao && (
              <p className="mt-4 text-xs italic text-slate-500">
                Última dispensação:{" "}
                {formatarDataDispensacao
                  ? formatarDataDispensacao(ultimaDispensacao)
                  : new Date(
                      ultimaDispensacao.dataDispensacao ||
                        ultimaDispensacao.createdAt ||
                        Date.now(),
                    ).toLocaleString("pt-BR")}
              </p>
            )}
          </section>
        </>
      )}

      {validacaoDispensacao.pode && (
        <>
          <div className="border-t border-slate-200" />

          <div className="flex justify-end">
            <button
              onClick={onDispensarClick}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700"
            >
              <Package size={16} />
              Dispensar receita
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);
