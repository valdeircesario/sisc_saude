import React from "react";
import { FlaskConical, LogOut } from "lucide-react";

interface LaboratorioHeaderProps {
  userNome?: string;
  onLogout: () => void;
}

export const LaboratorioHeader: React.FC<LaboratorioHeaderProps> = ({
  userNome,
  onLogout,
}) => {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-sky-50 rounded-xl">
              <FlaskConical className="h-8 w-8 text-sky-600" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                SISC <span className="text-sky-600">LAB</span>
              </h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Bem-vindo, {userNome}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
