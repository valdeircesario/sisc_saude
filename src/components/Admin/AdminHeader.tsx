import React from 'react';
import { Settings, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  userNome?: string;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userNome, onLogout }) => {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Painel Administrativo
              </h1>
              <p className="text-sm text-gray-600">Bem-vindo, {userNome}</p>
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
