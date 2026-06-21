import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNotificacoes, TAB_POR_TIPO, Notificacao } from "../../hooks/useNotificacoes";

interface PacienteNotificacoesBellProps {
  setActiveTab: (tab: string) => void;
}

export const PacienteNotificacoesBell: React.FC<PacienteNotificacoesBellProps> = ({
  setActiveTab,
}) => {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { naoLidas, notificacoes, marcarLida, marcarTodasLidas, refetch } =
    useNotificacoes();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const next = !aberto;
    setAberto(next);
    if (next) refetch();
  };

  const handleClickNotificacao = async (notificacao: Notificacao) => {
    if (!notificacao.lida) {
      await marcarLida(notificacao.id);
    }
    const tab = TAB_POR_TIPO[notificacao.tipo] || "home";
    setActiveTab(tab);
    setAberto(false);
  };

  const handleMarcarTodas = async () => {
    await marcarTodasLidas();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {naoLidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {naoLidas > 99 ? "99+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 sm:w-96 rounded-xl border border-gray-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
            {naoLidas > 0 && (
              <button
                type="button"
                onClick={handleMarcarTodas}
                className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                Nenhuma notificação
              </p>
            ) : (
              notificacoes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClickNotificacao(n)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-teal-50/50 transition-colors ${
                    !n.lida ? "bg-teal-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.lida && (
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-teal-500" />
                    )}
                    <div className={`flex-1 min-w-0 ${n.lida ? "ml-4" : ""}`}>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {n.titulo}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {n.mensagem}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    {n.lida && (
                      <Check className="h-3.5 w-3.5 text-gray-300 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
