import React from "react";
import { Package, LogOut } from "lucide-react";

interface FarmaciaHeaderProps {
  userName: string;
  onLogout: () => void;
}

export const FarmaciaHeader: React.FC<FarmaciaHeaderProps> = ({
  userName,
  onLogout,
}) => (
  <header className="bg-white/85 backdrop-blur-md border-b border-black/5 sticky top-0 z-40">
    <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Package size={18} className="text-white" />
        </div>
        <div>
          <h1
            className="text-base font-bold text-red-950"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Painel Farmácia
          </h1>
          <p className="text-[0.7rem] text-gray-400 font-light">
            Bem-vindo, {userName}
          </p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium transition-all hover:border-red-300 hover:text-red-500 hover:bg-red-50"
      >
        <LogOut size={15} />
        Sair
      </button>
    </div>
  </header>
);
