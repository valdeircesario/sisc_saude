import React from "react";
import { Building2, LogOut, User, Activity } from "lucide-react";

interface UBSHeaderProps {
  userNome?: string;
  onLogout: () => void;
}

export const UBSHeader: React.FC<UBSHeaderProps> = ({ userNome, onLogout }) => {
  return (
    <header 
      className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm"
      style={{ borderTop: "4px solid #0A6B6B" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-100 shadow-sm"
            >
              <Building2 className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 tracking-tight leading-none">
                SISC <span className="text-teal-700">Saúde</span>
              </h1>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-0.5">
                Unidade Básica de Saúde
              </p>
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-gray-100">
              <div className="text-right">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider leading-none">
                  Gestor de Unidade
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {userNome}
                </p>
              </div>
              <div className="w-9 h-9 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all duration-200 text-xs font-bold"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair do Sistema</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
