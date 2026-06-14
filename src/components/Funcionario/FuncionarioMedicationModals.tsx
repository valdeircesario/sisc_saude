import React from "react";
import { X, Pill, Package, Save, CheckCircle, Search, User, ClipboardList } from "lucide-react";

interface MedicationModalsProps {
  showAdministradorMedicamentoModal: boolean;
  selectedAdminPaciente: any;
  resetAdministracaoForm: () => void;
  medSearchTerm: string;
  setMedSearchTerm: (val: string) => void;
  loadingMedicamentos: boolean;
  filteredMedicamentos: any[];
  openAdministrarMed: (med: any) => void;
  editingMed: any;
  resetMedForm: () => void;
  medData: any;
  setMedData: (data: any) => void;
  handleMedSubmit: (e: React.FormEvent) => void;
  isUpdatingMed: boolean;
  selectedMed: any;
  administracaoData: any;
  setAdministracaoData: (data: any) => void;
  handleAdministrarSubmit: (e: React.FormEvent) => void;
  isAdministrandoMed: boolean;
}

const FuncionarioMedicationModals: React.FC<MedicationModalsProps> = ({
  showAdministradorMedicamentoModal,
  selectedAdminPaciente,
  resetAdministracaoForm,
  medSearchTerm,
  setMedSearchTerm,
  loadingMedicamentos,
  filteredMedicamentos,
  openAdministrarMed,
  editingMed,
  resetMedForm,
  medData,
  setMedData,
  handleMedSubmit,
  isUpdatingMed,
  selectedMed,
  administracaoData,
  setAdministracaoData,
  handleAdministrarSubmit,
  isAdministrandoMed,
}) => {
  const ModalHeader = ({ title, subtitle, icon: Icon, colorClass, onClose }: any) => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEF2F7]">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#0F2242] leading-tight">{title}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8FA8C4] mt-0.5">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-full hover:bg-[#F8FAFD] text-[#8FA8C4] hover:text-[#1A3F72] transition-all"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <>
      {showAdministradorMedicamentoModal && selectedAdminPaciente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A192F]/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
            <ModalHeader 
              title="Administração de Medicamentos" 
              subtitle="Seleção de Item" 
              icon={Pill} 
              colorClass="bg-[#F0EDFB] text-[#4C3799] border-[#DED7F7]"
              onClose={resetAdministracaoForm}
            />
            
            <div className="p-6 bg-[#F8FAFD] border-b border-[#E4EDF7]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#C8D9ED] flex items-center justify-center shadow-sm">
                    <User className="h-6 w-6 text-[#1A3F72]" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#0F2242]">{selectedAdminPaciente.nome}</p>
                    <p className="text-[10px] font-bold text-[#3A5B82] uppercase tracking-widest">CNS: {selectedAdminPaciente.cns}</p>
                  </div>
                </div>
                <div className="relative w-full max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-[#8FA8C4]" />
                  </div>
                  <input
                    type="text"
                    value={medSearchTerm}
                    onChange={(e) => setMedSearchTerm(e.target.value)}
                    placeholder="Buscar medicação..."
                    className="block w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#C8D9ED] rounded-xl outline-none focus:border-[#1A3F72] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingMedicamentos ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#C8D9ED] border-t-[#1A3F72]"></div>
                  <p className="mt-4 text-xs font-bold text-[#8FA8C4] uppercase tracking-widest">Sincronizando estoque...</p>
                </div>
              ) : filteredMedicamentos?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMedicamentos.map((med: any) => (
                    <div
                      key={med.id}
                      className="p-4 rounded-2xl border border-[#E4EDF7] bg-[#FAFCFF] flex flex-col justify-between gap-4 group hover:border-[#A8C4E0] hover:bg-white transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-lg bg-[#EBF2FB] text-[10px] font-black uppercase text-[#1A3F72] border border-[#C8D9ED]">
                            {med.nome}
                          </span>
                          <span className="text-[10px] font-bold text-[#8FA8C4]">Lote: {med.lote}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0F2242]">{med.descricao}</h4>
                        <div className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-[#8FA8C4]" />
                          <span className={`text-xs font-bold ${!Number(med.quantidade) ? 'text-rose-600' : 'text-[#3A5B82]'}`}>
                            {med.quantidade} unidades disponíveis
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => openAdministrarMed(med)}
                        disabled={!Number(med.quantidade)}
                        className="w-full py-2 rounded-xl bg-[#1A3F72] text-white text-[11px] font-bold shadow-md shadow-sky-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                      >
                        Selecionar para Administração
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-[#F8FAFD] rounded-2xl border border-dashed border-[#C8D9ED]">
                  <Pill className="h-10 w-10 text-[#C8D9ED] mx-auto mb-3" />
                  <p className="text-xs font-bold text-[#8FA8C4] uppercase">Nenhum medicamento disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editingMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A192F]/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <ModalHeader 
              title="Ajuste de Estoque" 
              subtitle={editingMed.descricao} 
              icon={Package} 
              colorClass="bg-[#EBF2FB] text-[#1A3F72] border-[#C8D9ED]"
              onClose={resetMedForm}
            />
            <form onSubmit={handleMedSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-[#8FA8C4] ml-1">Quantidade em Unidades</label>
                  <input
                    type="number"
                    min="0"
                    value={medData.quantidade}
                    onChange={(e) => setMedData({ ...medData, quantidade: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFD] border border-[#C8D9ED] rounded-xl text-sm font-medium outline-none focus:border-[#1A3F72] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-[#8FA8C4] ml-1">Data de Validade</label>
                  <input
                    type="date"
                    value={medData.dataValidade}
                    onChange={(e) => setMedData({ ...medData, dataValidade: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFD] border border-[#C8D9ED] rounded-xl text-sm font-medium outline-none focus:border-[#1A3F72] transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-[#8FA8C4] ml-1">Observações de Estoque</label>
                <textarea
                  value={medData.observacoes}
                  onChange={(e) => setMedData({ ...medData, observacoes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-[#F8FAFD] border border-[#C8D9ED] rounded-xl text-sm font-medium outline-none focus:border-[#1A3F72] transition-all resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetMedForm} className="px-6 py-2.5 text-xs font-bold text-[#5C7A9B] hover:bg-[#F8FAFD] rounded-xl">Cancelar</button>
                <button
                  type="submit"
                  disabled={isUpdatingMed}
                  className="px-8 py-2.5 bg-[#1A3F72] text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isUpdatingMed ? "Salvando..." : "Confirmar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedMed && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0A192F]/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <ModalHeader 
              title="Registrar Administração" 
              subtitle={selectedMed.descricao} 
              icon={ClipboardList} 
              colorClass="bg-[#EAF5EF] text-[#145C35] border-[#C8EBD9]"
              onClose={resetAdministracaoForm}
            />
            <div className="p-6 bg-[#F8FAFD] border-b border-[#E4EDF7]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-[#8FA8C4] uppercase">Paciente Selecionado</p>
                  <p className="text-sm font-black text-[#0F2242]">{selectedAdminPaciente?.nome}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#8FA8C4] uppercase">Item / Lote</p>
                  <p className="text-sm font-bold text-[#3A5B82]">{selectedMed.nome} • {selectedMed.lote}</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleAdministrarSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-[#8FA8C4] ml-1">Quantidade a Ministrar *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedMed.quantidade}
                    value={administracaoData.quantidade}
                    onChange={(e) => setAdministracaoData({ ...administracaoData, quantidade: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-[#C8D9ED] rounded-xl text-sm font-medium outline-none focus:border-[#1A3F72] transition-all"
                    placeholder={`Máx: ${selectedMed.quantidade}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-[#8FA8C4] ml-1">Data e Hora do Procedimento *</label>
                  <input
                    type="datetime-local"
                    value={administracaoData.dataRetirada}
                    onChange={(e) => setAdministracaoData({ ...administracaoData, dataRetirada: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-[#C8D9ED] rounded-xl text-sm font-medium outline-none focus:border-[#1A3F72] transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-[#8FA8C4] ml-1">Relatório de Administração</label>
                <textarea
                  value={administracaoData.observacoes}
                  onChange={(e) => setAdministracaoData({ ...administracaoData, observacoes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-[#C8D9ED] rounded-xl text-sm font-medium outline-none focus:border-[#1A3F72] transition-all resize-none"
                  placeholder="Informações relevantes sobre a administração..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetAdministracaoForm} className="px-6 py-2.5 text-xs font-bold text-[#5C7A9B] hover:bg-[#F8FAFD] rounded-xl">Cancelar</button>
                <button
                  type="submit"
                  disabled={isAdministrandoMed}
                  className="px-8 py-2.5 bg-[#145C35] text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isAdministrandoMed ? "Processando..." : "Confirmar Administração"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FuncionarioMedicationModals;
