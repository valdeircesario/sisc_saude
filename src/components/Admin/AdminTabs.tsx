import React from 'react';
import { Building2, FlaskConical } from 'lucide-react';

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'ubs', label: 'Unidades de Saúde', icon: Building2 },
    { id: 'laboratorios', label: 'Laboratórios', icon: FlaskConical },
    { id: 'hospitais', label: 'Hospitais', icon: Building2 },
    { id: 'upas', label: 'UPAs', icon: Building2 },
    { id: 'farmacias', label: 'Farmácias', icon: Building2 },
  ];

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-5 w-5 inline mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
