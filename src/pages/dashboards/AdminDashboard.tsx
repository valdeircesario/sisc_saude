import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../../services/api";
import { toast } from "react-toastify";

import { AdminHeader } from "../../components/Admin/AdminHeader";
import { AdminTabs } from "../../components/Admin/AdminTabs";
import { AdminTable } from "../../components/Admin/AdminTable";
import { AdminModal } from "../../components/Admin/AdminModal";

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("ubs");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    cnpj: "",
    email: "",
    senha: "",
  });

  // Queries
  const { data: ubsList, isLoading: loadingUBS } = useQuery(
    ["admin-ubs"],
    () => api.get("/admin/ubs").then((res) => res.data),
    { enabled: activeTab === "ubs" },
  );

  const { data: farmacias, isLoading: loadingFarmacias } = useQuery(
    ["admin-farmacias"],
    () => api.get("/admin/farmacias").then((res) => res.data),
    { enabled: activeTab === "farmacias" },
  );

  const { data: hospitais, isLoading: loadingHospitais } = useQuery(
    ["admin-hospitais"],
    () => api.get("/admin/hospitais").then((res) => res.data),
    { enabled: activeTab === "hospitais" },
  );

  const { data: laboratorios, isLoading: loadingLabs } = useQuery(
    ["admin-laboratorios"],
    () => api.get("/admin/laboratorios").then((res) => res.data),
    { enabled: activeTab === "laboratorios" },
  );

  const { data: upas, isLoading: loadingUpas } = useQuery(
    ["admin-upas"],
    () => api.get("/admin/upas").then((res) => res.data),
    { enabled: activeTab === "upas" },
  );

  // Mutations
  const createMutation = useMutation(
    ({ endpoint, data }: { endpoint: string; data: any }) => api.post(`/admin/${endpoint}`, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries([`admin-${variables.endpoint}`]);
        toast.success("Cadastro realizado com sucesso!");
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Erro ao cadastrar");
      },
    }
  );

  const updateMutation = useMutation(
    ({ endpoint, id, data }: { endpoint: string; id: string; data: any }) => api.put(`/admin/${endpoint}/${id}`, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries([`admin-${variables.endpoint}`]);
        toast.success("Atualização realizada com sucesso!");
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Erro ao atualizar");
      },
    }
  );

  const deleteMutation = useMutation(
    ({ endpoint, id }: { endpoint: string; id: string }) => api.delete(`/admin/${endpoint}/${id}`),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries([`admin-${variables.endpoint}`]);
        toast.success("Registro deletado com sucesso!");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Erro ao deletar");
      },
    }
  );

  const resetForm = () => {
    setFormData({
      nome: "",
      endereco: "",
      telefone: "",
      cnpj: "",
      email: "",
      senha: "",
    });
    setEditingItem(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ endpoint: activeTab, id: editingItem.id, data: formData });
    } else {
      createMutation.mutate({ endpoint: activeTab, data: formData });
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      nome: item.nome,
      endereco: item.endereco,
      telefone: item.telefone,
      cnpj: item.cnpj,
      email: item.email,
      senha: "",
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este item?")) {
      deleteMutation.mutate({ endpoint: activeTab, id });
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getActiveData = () => {
    switch (activeTab) {
      case "ubs": return ubsList;
      case "laboratorios": return laboratorios;
      case "hospitais": return hospitais;
      case "farmacias": return farmacias;
      case "upas": return upas;
      default: return [];
    }
  };

  const getActiveLoading = () => {
    switch (activeTab) {
      case "ubs": return loadingUBS;
      case "laboratorios": return loadingLabs;
      case "hospitais": return loadingHospitais;
      case "farmacias": return loadingFarmacias;
      case "upas": return loadingUpas;
      default: return false;
    }
  };

  const tabNames: Record<string, string> = {
    ubs: "Unidades de Saúde",
    laboratorios: "Laboratórios",
    hospitais: "Hospitais",
    farmacias: "Farmácias",
    upas: "UPAs",
  };

  const entityName = tabNames[activeTab] || "Item";
  const items = getActiveData();
  const isLoading = getActiveLoading();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <AdminHeader userNome={user?.nome} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{entityName}</h2>
            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>
                Adicionar {activeTab === "ubs" ? "UBS" : activeTab === "upas" ? "UPA" : entityName.slice(0, -1)}
              </span>
            </button>
          </div>

          <AdminTable
            items={items}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <AdminModal
        isOpen={showModal}
        activeTab={activeTab}
        editingItem={editingItem}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default AdminDashboard;
