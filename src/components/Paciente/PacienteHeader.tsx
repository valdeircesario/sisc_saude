import React from "react";
import { Menu } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PacienteHeaderProps {
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  navigation: Array<{ name: string; key: string; icon: any }>;
}

export const PacienteHeader: React.FC<PacienteHeaderProps> = ({
  setSidebarOpen,
  activeTab,
  navigation,
}) => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-5 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-gray-900">
            {navigation.find((n) => n.key === activeTab)?.name ??
              "Portal do Paciente"}
          </h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
          <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
          Online
        </span>
      </div>
    </header>
  );
};
