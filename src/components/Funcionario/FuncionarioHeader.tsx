import React from "react";
import { Stethoscope, LogOut } from "lucide-react";

interface FuncionarioHeaderProps {
  userNome?: string;
  userFuncao?: string;
  onLogout: () => void;
}

export const FuncionarioHeader: React.FC<FuncionarioHeaderProps> = ({
  userNome,
  userFuncao,
  onLogout,
}) => {
  return (
    <header
      className="sticky top-0 z-50 border-b border-[#1A3F72]/20"
      style={{
        background: "#1A3F72",
        boxShadow: "0 2px 16px rgba(26,63,114,0.3)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5">
          {/* Esquerda */}
          <div className="flex items-center gap-3.5">
            <div
              className="flex items-center justify-center h-10 w-10 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.13)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[15px] font-bold tracking-tight text-white leading-tight">
                Painel do Funcionário
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-white/60">
                  Bem-vindo,{" "}
                  <span className="font-semibold text-white/90">
                    {userNome}
                  </span>
                </p>
                <span className="text-white/30">·</span>
                <p className="text-xs text-white/60">
                  <span className="font-medium text-white/80">
                    {userFuncao || "Não informada"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Botão sair */}
          <button
            onClick={onLogout}
            className="group flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white/90 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
            }
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};