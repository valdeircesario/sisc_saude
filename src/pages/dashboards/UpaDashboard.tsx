import React, { useState } from 'react';
import {
  Activity, UserCheck, ClipboardList, Pill, FlaskConical,
  LogOut, X, Save, Eye, CheckCircle2,
  ArrowRightCircle, UserX, Building2, Plus, ChevronRight, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

/* ─────────────────── Status config ─────────────────── */
type StatusKey = 'pendente' | 'em_atendimento' | 'finalizado' | 'ausente' | 'encaminhado';

const STATUS_CONFIG: Record<StatusKey, { label: string; textColor: string; bgColor: string; borderColor: string; pulse?: boolean }> = {
  pendente:       { label: 'Pendente',        textColor: '#92400e', bgColor: '#fef3c7', borderColor: '#fcd34d' },
  em_atendimento: { label: 'Em Atendimento',  textColor: '#ffffff', bgColor: '#f59e0b', borderColor: '#d97706', pulse: true },
  finalizado:     { label: 'Finalizado',      textColor: '#ffffff', bgColor: '#059669', borderColor: '#047857' },
  ausente:        { label: 'Ausente',         textColor: '#ffffff', bgColor: '#6b7280', borderColor: '#4b5563' },
  encaminhado:    { label: 'Encaminhado',     textColor: '#ffffff', bgColor: '#4f46e5', borderColor: '#4338ca' },
};

const LOCKED_STATUSES: StatusKey[] = ['finalizado', 'ausente', 'encaminhado'];

function normalizeStatus(s?: string): StatusKey {
  const val = (s || '').toLowerCase().replace(/-/g, '_').replace(/ /g, '_');
  if (val in STATUS_CONFIG) return val as StatusKey;
  return 'pendente';
}

function StatusBadge({ status }: { status?: string }) {
  const key = normalizeStatus(status);
  const cfg = STATUS_CONFIG[key];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, letterSpacing: 0.2,
      background: cfg.bgColor, color: cfg.textColor,
      border: `1px solid ${cfg.borderColor}`,
      animation: cfg.pulse ? 'upaPulse 1.5s ease-in-out infinite' : 'none',
    }}>
      {cfg.label}
    </span>
  );
}

/* ─────────────────── Stat Card ─────────────────── */
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
      padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10, flexShrink: 0,
        background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value ?? 0}</div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

/* ─────────────────── Priority Badge ─────────────────── */
function PrioBadge({ prio }: { prio: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    alto:  { bg: '#fee2e2', color: '#dc2626', label: '▲ Alta' },
    medio: { bg: '#fef9c3', color: '#ca8a04', label: '● Média' },
    baixo: { bg: '#dcfce7', color: '#16a34a', label: '▼ Baixa' },
  };
  const c = map[prio] ?? map.medio;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 6 }}>
      {c.label}
    </span>
  );
}

/* ─────────────────── Button helper ─────────────────── */
type BtnVariant = 'primary' | 'secondary' | 'blue' | 'amber' | 'indigo' | 'red' | 'ghost';
const btnVariants: Record<BtnVariant, React.CSSProperties> = {
  primary:   { background: '#059669', color: '#fff', border: 'none' },
  secondary: { background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' },
  blue:      { background: '#2563eb', color: '#fff', border: 'none' },
  amber:     { background: '#f59e0b', color: '#fff', border: 'none' },
  indigo:    { background: '#4f46e5', color: '#fff', border: 'none' },
  red:       { background: '#dc2626', color: '#fff', border: 'none' },
  ghost:     { background: 'transparent', color: '#6b7280', border: '1px solid #d1d5db' },
};

function Btn({
  variant = 'primary', size, onClick, disabled, children, style,
}: {
  variant?: BtnVariant; size?: 'sm'; onClick?: () => void; disabled?: boolean;
  children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: size === 'sm' ? '5px 12px' : '8px 16px',
        borderRadius: 8,
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.45 : 1,
        ...btnVariants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ─────────────────── Main Component ─────────────────── */
const UpaDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'triagens' | 'atendimentos' | 'medicacoes' | 'exames'>('triagens');

  /* patient search */
  const [searchTerm, setSearchTerm] = useState('');
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);

  /* triagem form */
  const [triagemForm, setTriagemForm] = useState({ sintomas: '', sinais: '', prioridade: 'medio', observacoes: '' });

  /* modal */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTriagem, setModalTriagem] = useState<any>(null);
  const [modalAtendimento, setModalAtendimento] = useState<any>(null); // null = novo
  const [modalReadOnly, setModalReadOnly] = useState(false);
  const [stagedStatus, setStagedStatus] = useState<StatusKey>('pendente');
  const [laudoText, setLaudoText] = useState('');
  const [notasText, setNotasText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /* pending child records */
  const [pendingMeds, setPendingMeds] = useState<any[]>([]);
  const [pendingExames, setPendingExames] = useState<any[]>([]);
  const [pendingEncaminhamentos, setPendingEncaminhamentos] = useState<any[]>([]);

  /* inline modal forms */
  const [prescNome, setPrescNome] = useState('');
  const [prescDosagem, setPrescDosagem] = useState('');
  const [prescVia, setPrescVia] = useState('');
  const [prescObs, setPrescObs] = useState('');
  const [exameTipo, setExameTipo] = useState('');
  const [exameLab, setExameLab] = useState('');
  const [encHospital, setEncHospital] = useState('');
  const [encMotivo, setEncMotivo] = useState('');

  /* queries */
  const { data: triagens = [], isLoading: loadingTriagens } = useQuery(
    ['upa-triagens'], () => api.get('/upa/triagens').then(r => r.data), { refetchInterval: 60000 }
  );
  const { data: atendimentos = [], isLoading: loadingAtend } = useQuery(
    ['upa-atendimentos'], () => api.get('/upa/atendimentos').then(r => r.data), { refetchInterval: 60000 }
  );
  const { data: meds = [] } = useQuery(
    ['upa-medicacoes'], () => api.get('/upa/medicacoes').then(r => r.data),
    { enabled: activeTab === 'medicacoes' || modalOpen }
  );
  const { data: exames = [] } = useQuery(
    ['upa-solicitacoes-exame'], () => api.get('/upa/solicitacoes-exame').then(r => r.data),
    { enabled: activeTab === 'exames' || modalOpen }
  );
  const { data: encaminhamentos = [] } = useQuery(
    ['upa-encaminhamentos'], () => api.get('/upa/encaminhamentos').then(r => r.data),
    { enabled: modalOpen }
  );
  const { data: hospitais = [] } = useQuery(
    ['upa-hospitais'], () => api.get('/upa/hospitais').then(r => r.data)
  );
  const { data: laboratorios = [] } = useQuery(
    ['upa-laboratorios'], () => api.get('/upa/laboratorios').then(r => r.data)
  );

  /* stats */
  const stats = {
    triagens: triagens.length,
    atendimentos: atendimentos.length,
    emAtendimento: atendimentos.filter((a: any) => normalizeStatus(a.status) === 'em_atendimento').length,
    finalizados: atendimentos.filter((a: any) => normalizeStatus(a.status) === 'finalizado').length,
    ausentes: atendimentos.filter((a: any) => normalizeStatus(a.status) === 'ausente').length,
    encaminhados: atendimentos.filter((a: any) => normalizeStatus(a.status) === 'encaminhado').length,
    medicacoes: meds.length,
  };

  /* mutations */
  const createTriagem = useMutation(
    (data: any) => api.post('/upa/triagens', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['upa-triagens']);
        toast.success('Triagem registrada com sucesso!');
        setTriagemForm({ sintomas: '', sinais: '', prioridade: 'medio', observacoes: '' });
        setSelectedPaciente(null); setPacientes([]); setSearchTerm('');
      },
      onError: (e: any) => toast.error(e.response?.data?.message || 'Erro ao criar triagem'),
    }
  );
  const createAtendimento = useMutation(
    (data: any) => api.post('/upa/atendimentos', data),
    { onError: (e: any) => toast.error(e.response?.data?.message || 'Erro ao criar atendimento') }
  );
  const updateAtendimento = useMutation(
    ({ id, data }: { id: string; data: any }) => api.put(`/upa/atendimentos/${id}`, data),
    { onError: (e: any) => toast.error(e.response?.data?.message || 'Erro ao atualizar atendimento') }
  );
  const createMed   = useMutation((data: any) => api.post('/upa/medicacoes', data));
  const createExame = useMutation((data: any) => api.post('/upa/solicitar-exame', data));
  const createEnc   = useMutation((data: any) => api.post('/upa/encaminhamentos', data));

  /* helpers */
  const searchPacientes = async (termo?: string) => {
    // Accept an explicit term to avoid stale closure on the searchTerm state
    const busca = (termo ?? searchTerm).trim();
    if (!busca) { toast.warn('Digite um nome, CPF ou CNS para buscar.'); return; }
    setLoadingPacientes(true);
    setPacientes([]);
    try {
      const res = await api.get('/upa/pacientes', { params: { busca } });
      const lista = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setPacientes(lista);
      if (!lista.length) toast.info('Nenhum paciente encontrado para "' + busca + '".');
    } catch (e: any) {
      console.error('Erro busca paciente:', e);
      toast.error(e.response?.data?.message || 'Erro ao buscar pacientes. Verifique a conexão.');
    } finally { setLoadingPacientes(false); }
  };

  function resetPending()     { setPendingMeds([]); setPendingExames([]); setPendingEncaminhamentos([]); }
  function resetInlineForms() { setPrescNome(''); setPrescDosagem(''); setPrescVia(''); setPrescObs(''); setExameTipo(''); setExameLab(''); setEncHospital(''); setEncMotivo(''); }

  function openNewAtendimento(triagem: any) {
    setModalTriagem(triagem);
    setModalAtendimento(null);
    setModalReadOnly(false);
    setStagedStatus('pendente');
    setLaudoText(''); setNotasText('');
    resetPending(); resetInlineForms();
    setModalOpen(true);
  }

  function openEditAtendimento(triagem: any, atendimento: any) {
    setModalTriagem(triagem);
    setModalAtendimento(atendimento);
    setModalReadOnly(false);
    setStagedStatus(normalizeStatus(atendimento.status));
    setLaudoText(atendimento.laudo || ''); setNotasText(atendimento.notas || '');
    resetPending(); resetInlineForms();
    setModalOpen(true);
  }

  function openViewAtendimento(triagem: any, atendimento: any) {
    setModalTriagem(triagem);
    setModalAtendimento(atendimento);
    setModalReadOnly(true);
    setStagedStatus(normalizeStatus(atendimento.status));
    setLaudoText(atendimento.laudo || ''); setNotasText(atendimento.notas || '');
    resetPending(); resetInlineForms();
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); resetPending(); resetInlineForms(); }

  const isLocked   = (status?: string) => LOCKED_STATUSES.includes(normalizeStatus(status));
  const canEdit    = !modalReadOnly && !isLocked(modalAtendimento?.status);
  const isEmAtend  = stagedStatus === 'em_atendimento';

  async function handleSaveModal() {
    if (!modalTriagem) return;
    setIsSaving(true);
    try {
      let atendimentoId: string | null = modalAtendimento?.id ?? null;

      if (!atendimentoId) {
        const res = await createAtendimento.mutateAsync({
          pacienteId: modalTriagem.pacienteId,
          triagemId: modalTriagem.id,
          profissional: user?.nome || '',
          status: stagedStatus,
          laudo: laudoText || undefined,
          notas: notasText || undefined,
        });
        const created = res?.data ?? res;
        atendimentoId = created?.id;
        setModalAtendimento(created);
        toast.success('Atendimento criado!');
      } else {
        await updateAtendimento.mutateAsync({
          id: atendimentoId,
          data: { status: stagedStatus, laudo: laudoText || undefined, notas: notasText || undefined },
        });
        toast.success('Atendimento atualizado!');
      }

      // Persist child records only when em_atendimento
      if (isEmAtend && atendimentoId) {
        for (const m  of pendingMeds)             await createMed.mutateAsync({ ...m, atendimentoId });
        for (const ex of pendingExames)            await createExame.mutateAsync({ ...ex, atendimentoId });
        for (const en of pendingEncaminhamentos)   await createEnc.mutateAsync({ ...en, atendimentoId });
      }

      resetPending();
      queryClient.invalidateQueries(['upa-atendimentos']);
      queryClient.invalidateQueries(['upa-medicacoes']);
      queryClient.invalidateQueries(['upa-solicitacoes-exame']);
      queryClient.invalidateQueries(['upa-encaminhamentos']);
      closeModal();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao salvar');
    } finally { setIsSaving(false); }
  }

  /* derived */
  const priSort = (a: any, b: any) => ({ alto: 3, medio: 2, baixo: 1 }[b.prioridade] || 0) - ({ alto: 3, medio: 2, baixo: 1 }[a.prioridade] || 0);

  // Triagens com atendimento em_atendimento → mostrar na aba Triagens
  const triagensByStatus = triagens.filter((t: any) => {
    const a = atendimentos.find((x: any) => x.triagemId === t.id);
    return a && normalizeStatus(a.status) === 'em_atendimento';
  });

  // Triagens SEM atendimento → aparecem na aba Atendimentos
  const triagensSemAtend = triagens.filter((t: any) =>
    !atendimentos.find((a: any) => a.triagemId === t.id)
  );

  /* ─── shared style snippets ─── */
  const cardStyle: React.CSSProperties = {
    background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10,
    padding: '12px 16px', display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 12, marginBottom: 8,
  };
  const inputStyle: React.CSSProperties = {
    background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: 8,
    padding: '9px 13px', color: '#111827', fontSize: 13, width: '100%',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const selectStyle: React.CSSProperties = { ...inputStyle };
  const textareaStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 80 };
  const modalSectionStyle: React.CSSProperties = {
    background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10,
    padding: 16, marginBottom: 14,
  };

  /* ══════════════════════════════════ RENDER ══════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes upaPulse { 0%,100%{opacity:1} 50%{opacity:.65} }
        @keyframes upaSpin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: #059669 !important; outline: none; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: "'Inter',-apple-system,sans-serif", color: '#111827' }}>

        {/* ─── Header ─── */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#059669,#0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Activity size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Painel UPA</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{user?.nome}</div>
            </div>
          </div>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <LogOut size={14} /> Sair
          </button>
        </header>

        {/* ─── Stats grid ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, padding: '24px 32px 0' }}>
          <StatCard icon={UserCheck}        label="Triagens"        value={stats.triagens}      color="#059669" />
          <StatCard icon={ClipboardList}    label="Atendimentos"    value={stats.atendimentos}  color="#2563eb" />
          <StatCard icon={Activity}         label="Em Atendimento"  value={stats.emAtendimento} color="#f59e0b" />
          <StatCard icon={CheckCircle2}     label="Finalizados"     value={stats.finalizados}   color="#10b981" />
          <StatCard icon={UserX}            label="Ausentes"        value={stats.ausentes}      color="#6b7280" />
          <StatCard icon={ArrowRightCircle} label="Encaminhados"    value={stats.encaminhados}  color="#4f46e5" />
          <StatCard icon={Pill}             label="Medicações"      value={stats.medicacoes}    color="#f97316" />
        </div>

        {/* ─── Tabs ─── */}
        <div style={{ display: 'flex', gap: 4, padding: '20px 32px 0' }}>
          {([
            { key: 'triagens',     label: 'Triagens',     Icon: UserCheck },
            { key: 'atendimentos', label: 'Atendimentos', Icon: ClipboardList },
            { key: 'medicacoes',   label: 'Medicações',   Icon: Pill },
            { key: 'exames',       label: 'Exames',       Icon: FlaskConical },
          ] as const).map(({ key, label, Icon }) => {
            const active = activeTab === key;
            return (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                border: active ? '1px solid #d1fae5' : '1px solid transparent',
                background: active ? '#ecfdf5' : 'transparent',
                color: active ? '#059669' : '#6b7280',
              }}>
                <Icon size={14} />{label}
              </button>
            );
          })}
        </div>

        {/* ─── Tab content ─── */}
        <div style={{ padding: '20px 32px 60px' }}>

          {/* ═══ TRIAGENS ═══ */}
          {activeTab === 'triagens' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Nova triagem */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Nova Triagem</div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    style={inputStyle}
                    placeholder="Buscar paciente — CNS, nome ou CPF"
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); if (pacientes.length > 0) setPacientes([]); }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); searchPacientes(e.currentTarget.value); } }}
                  />
                  <Btn
                    variant="blue"
                    disabled={loadingPacientes || !searchTerm.trim()}
                    onClick={() => searchPacientes(searchTerm)}
                  >
                    {loadingPacientes ? 'Buscando...' : 'Buscar'}
                  </Btn>
                </div>
                {loadingPacientes && (
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #d1d5db', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'upaSpin 0.7s linear infinite' }} />
                    Buscando pacientes...
                  </div>
                )}

                {pacientes.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    {pacientes.map((p: any) => (
                      <div key={p.id} style={cardStyle}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{p.nome}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>CPF: {p.cpf}{p.cns ? ` · CNS: ${p.cns}` : ''}{p.dataNascimento ? ` · Nasc: ${p.dataNascimento}` : ''}</div>
                        </div>
                        <Btn size="sm" variant="primary" onClick={() => { setSelectedPaciente(p); setPacientes([]); setSearchTerm(''); }}>Selecionar</Btn>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPaciente && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>✓ <strong>{selectedPaciente.nome}</strong></span>
                    <Btn size="sm" variant="ghost" onClick={() => setSelectedPaciente(null)}>Trocar</Btn>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <select style={selectStyle} value={triagemForm.prioridade} onChange={e => setTriagemForm({ ...triagemForm, prioridade: e.target.value })}>
                    <option value="alto">🔴 Alta Prioridade</option>
                    <option value="medio">🟡 Média Prioridade</option>
                    <option value="baixo">🟢 Baixa Prioridade</option>
                  </select>
                  <textarea style={textareaStyle} placeholder="Sintomas relatados..." value={triagemForm.sintomas} onChange={e => setTriagemForm({ ...triagemForm, sintomas: e.target.value })} />
                  <textarea style={textareaStyle} placeholder="Sinais clínicos..." value={triagemForm.sinais} onChange={e => setTriagemForm({ ...triagemForm, sinais: e.target.value })} />
                  <textarea style={{ ...textareaStyle, minHeight: 60 }} placeholder="Observações adicionais..." value={triagemForm.observacoes} onChange={e => setTriagemForm({ ...triagemForm, observacoes: e.target.value })} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Btn variant="primary" disabled={!selectedPaciente || createTriagem.isLoading} onClick={() => createTriagem.mutate({ ...triagemForm, pacienteId: selectedPaciente?.id })}>
                      <Plus size={14} /> Registrar Triagem
                    </Btn>
                  </div>
                </div>
              </div>

              {/* Atendimentos em andamento */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Atendimentos em Andamento</div>
                {loadingTriagens || loadingAtend ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 13 }}>Carregando...</div>
                ) : triagensByStatus.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 13 }}>
                    <Activity size={28} style={{ margin: '0 auto 8px', display: 'block' }} />
                    Nenhum atendimento em andamento.
                  </div>
                ) : (
                  triagensByStatus.map((t: any) => {
                    const atend = atendimentos.find((a: any) => a.triagemId === t.id);
                    return (
                      <div key={t.id} style={cardStyle}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{t.paciente?.nome}</span>
                            <PrioBadge prio={t.prioridade} />
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{t.sintomas}</div>
                          {atend && <div style={{ marginTop: 6 }}><StatusBadge status={atend.status} /></div>}
                        </div>
                        <Btn size="sm" variant="ghost" onClick={() => atend && openViewAtendimento(t, atend)}>
                          <Eye size={12} /> Visualizar
                        </Btn>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ═══ ATENDIMENTOS ═══ */}
          {activeTab === 'atendimentos' && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Gestão de Atendimentos</div>

              {/* Triagens aguardando → iniciar atendimento */}
              {triagensSemAtend.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: 10 }}>
                    Aguardando atendimento ({triagensSemAtend.length})
                  </div>
                  {triagensSemAtend.slice().sort(priSort).map((t: any) => (
                    <div key={t.id} style={cardStyle}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{t.paciente?.nome}</span>
                          <PrioBadge prio={t.prioridade} />
                          <StatusBadge status="pendente" />
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          {t.sintomas && <span>Sintomas: {t.sintomas}</span>}
                          {t.sinais && <span> · Sinais: {t.sinais}</span>}
                        </div>
                      </div>
                      {/* ← chama openNewAtendimento(t) diretamente */}
                      <Btn variant="amber" onClick={() => openNewAtendimento(t)}>
                        <Plus size={13} /> Iniciar Atendimento
                      </Btn>
                    </div>
                  ))}
                  <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />
                </>
              )}

              {/* Atendimentos existentes */}
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: 10 }}>
                Atendimentos registrados ({atendimentos.length})
              </div>
              {loadingAtend ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: 13 }}>Carregando...</div>
              ) : atendimentos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: 13 }}>
                  <ClipboardList size={28} style={{ margin: '0 auto 8px', display: 'block' }} />
                  Nenhum atendimento registrado ainda.
                </div>
              ) : (
                atendimentos.map((a: any) => {
                  const triagem = triagens.find((t: any) => t.id === a.triagemId);
                  const locked = isLocked(a.status);
                  return (
                    <div key={a.id} style={cardStyle}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{a.paciente?.nome}</span>
                          <StatusBadge status={a.status} />
                          {triagem && <PrioBadge prio={triagem.prioridade} />}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          {a.profissional && `Prof.: ${a.profissional} · `}
                          {new Date(a.dataAtendimento || a.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <Btn
                        size="sm"
                        variant={locked ? 'ghost' : 'blue'}
                        onClick={() => {
                          if (!triagem) return;
                          locked ? openViewAtendimento(triagem, a) : openEditAtendimento(triagem, a);
                        }}
                      >
                        {locked ? <><Eye size={12} /> Visualizar</> : <><ChevronRight size={12} /> Abrir</>}
                      </Btn>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ═══ MEDICAÇÕES ═══ */}
          {activeTab === 'medicacoes' && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Medicações Administradas</div>
              {meds.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 13 }}>
                  <Pill size={28} style={{ margin: '0 auto 8px', display: 'block' }} />Nenhuma medicação.
                </div>
              ) : meds.map((m: any) => (
                <div key={m.id} style={cardStyle}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.nomeMedicacao}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Paciente: {m.paciente?.nome || m.pacienteId} · Dosagem: {m.dosagem} · Via: {m.viaAdministracao}{m.administradorNome ? ` · Por: ${m.administradorNome}` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ EXAMES ═══ */}
          {activeTab === 'exames' && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Solicitações de Exame</div>
              {exames.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 13 }}>
                  <FlaskConical size={28} style={{ margin: '0 auto 8px', display: 'block' }} />Nenhum exame.
                </div>
              ) : exames.map((s: any) => (
                <div key={s.id} style={cardStyle}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.tipoExame}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Paciente: {s.paciente?.nome || s.pacienteId} · Lab: {s.laboratorio?.nome || '—'} · Status: {s.status}{s.resultado ? ` · Resultado: ${s.resultado}` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════ MODAL ═══════════════════════ */}
        {modalOpen && modalTriagem && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16, backdropFilter: 'blur(3px)' }}
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, width: '100%', maxWidth: 920, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>

              {/* Modal header */}
              <div style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, borderRadius: '14px 14px 0 0' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {modalAtendimento?.id ? 'Atendimento' : 'Novo Atendimento'} — {modalTriagem.paciente?.nome}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {modalReadOnly ? 'Modo visualização' : modalAtendimento?.id ? 'Editar atendimento' : 'Criar atendimento'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {/* Status selector — only editable + not locked */}
                  {canEdit && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Status:</span>
                      <select
                        value={stagedStatus}
                        onChange={e => setStagedStatus(e.target.value as StatusKey)}
                        style={{ ...selectStyle, width: 'auto', padding: '6px 10px', fontSize: 13 }}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em_atendimento">Em Atendimento</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="ausente">Ausente</option>
                        <option value="encaminhado">Encaminhado</option>
                      </select>
                    </div>
                  )}
                  {/* Show badge when read-only or locked */}
                  {(modalReadOnly || isLocked(modalAtendimento?.status)) && (
                    <StatusBadge status={modalAtendimento?.status || stagedStatus} />
                  )}
                  <Btn size="sm" variant="ghost" onClick={closeModal}><X size={13} /> Fechar</Btn>
                </div>
              </div>

              {/* Modal body */}
              <div style={{ padding: 24 }}>

                {/* Patient + Triagem */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div style={modalSectionStyle}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 10 }}>Dados do Paciente</div>
                    <div style={{ fontSize: 13, lineHeight: 1.9 }}>
                      <div><strong>{modalTriagem.paciente?.nome}</strong></div>
                      {modalTriagem.paciente?.cpf && <div style={{ color: '#6b7280' }}>CPF: {modalTriagem.paciente.cpf}</div>}
                      {modalTriagem.paciente?.cns && <div style={{ color: '#6b7280' }}>CNS: {modalTriagem.paciente.cns}</div>}
                      {modalTriagem.paciente?.nascimento && <div style={{ color: '#6b7280' }}>Nascimento: {modalTriagem.paciente.nascimento}</div>}
                    </div>
                  </div>
                  <div style={modalSectionStyle}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 10 }}>Dados da Triagem</div>
                    <div style={{ fontSize: 13, lineHeight: 1.9 }}>
                      <PrioBadge prio={modalTriagem.prioridade} />
                      {modalTriagem.sintomas && <div style={{ marginTop: 6 }}>Sintomas: {modalTriagem.sintomas}</div>}
                      {modalTriagem.sinais && <div>Sinais: {modalTriagem.sinais}</div>}
                      {modalTriagem.observacoes && <div style={{ color: '#6b7280' }}>{modalTriagem.observacoes}</div>}
                    </div>
                  </div>
                </div>

                {/* Laudo & notas */}
                <div style={modalSectionStyle}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 10 }}>Laudo & Anotações</div>
                  {isLocked(modalAtendimento?.status) ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>LAUDO</div>
                        <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', color: '#374151' }}>{modalAtendimento?.laudo || '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>NOTAS</div>
                        <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', color: '#374151' }}>{modalAtendimento?.notas || '—'}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <textarea style={textareaStyle} placeholder="Laudo / diagnóstico..." value={laudoText} onChange={e => setLaudoText(e.target.value)} />
                      <textarea style={textareaStyle} placeholder="Anotações clínicas..." value={notasText} onChange={e => setNotasText(e.target.value)} />
                    </div>
                  )}
                </div>

                {/* Hint for pending status */}
                {canEdit && !isEmAtend && stagedStatus === 'pendente' && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400e', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={14} />
                    Altere o status para <strong>Em Atendimento</strong> para registrar medicamentos, exames e encaminhamentos.
                  </div>
                )}

                {/* Action panels — only when em_atendimento and editable */}
                {canEdit && isEmAtend && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>

                    <div style={modalSectionStyle}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 10 }}>Prescrever Medicação</div>
                      <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Nome *" value={prescNome} onChange={e => setPrescNome(e.target.value)} />
                      <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Dosagem" value={prescDosagem} onChange={e => setPrescDosagem(e.target.value)} />
                      <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Via de administração" value={prescVia} onChange={e => setPrescVia(e.target.value)} />
                      <textarea style={{ ...textareaStyle, minHeight: 52, marginBottom: 8 }} placeholder="Observações" value={prescObs} onChange={e => setPrescObs(e.target.value)} />
                      <Btn size="sm" variant="blue" disabled={!prescNome} onClick={() => {
                        setPendingMeds([...pendingMeds, { pacienteId: modalTriagem.pacienteId, nomeMedicacao: prescNome, dosagem: prescDosagem, viaAdministracao: prescVia, administradorNome: user?.nome, observacoes: prescObs }]);
                        setPrescNome(''); setPrescDosagem(''); setPrescVia(''); setPrescObs('');
                      }}><Plus size={12} /> Adicionar</Btn>
                    </div>

                    <div style={modalSectionStyle}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 10 }}>Solicitar Exame</div>
                      <select style={{ ...selectStyle, marginBottom: 8 }} value={exameLab} onChange={e => setExameLab(e.target.value)}>
                        <option value="">Laboratório (opcional)</option>
                        {laboratorios.map((l: any) => <option key={l.id} value={l.id}>{l.nome}</option>)}
                      </select>
                      <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Tipo de exame *" value={exameTipo} onChange={e => setExameTipo(e.target.value)} />
                      <Btn size="sm" variant="indigo" disabled={!exameTipo} onClick={() => {
                        setPendingExames([...pendingExames, { pacienteId: modalTriagem.pacienteId, laboratorioId: exameLab || undefined, tipoExame: exameTipo }]);
                        setExameTipo(''); setExameLab('');
                      }}><Plus size={12} /> Adicionar</Btn>
                    </div>

                    <div style={modalSectionStyle}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 10 }}>Encaminhar p/ Hospital</div>
                      <select style={{ ...selectStyle, marginBottom: 8 }} value={encHospital} onChange={e => setEncHospital(e.target.value)}>
                        <option value="">Selecionar hospital *</option>
                        {hospitais.map((h: any) => <option key={h.id} value={h.id}>{h.nome}</option>)}
                      </select>
                      <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Motivo" value={encMotivo} onChange={e => setEncMotivo(e.target.value)} />
                      <Btn size="sm" variant="red" disabled={!encHospital} onClick={() => {
                        setPendingEncaminhamentos([...pendingEncaminhamentos, { pacienteId: modalTriagem.pacienteId, hospitalId: encHospital, motivo: encMotivo }]);
                        setEncHospital(''); setEncMotivo('');
                      }}><ArrowRightCircle size={12} /> Adicionar</Btn>
                    </div>
                  </div>
                )}

                {/* Pending items list */}
                {(pendingMeds.length > 0 || pendingExames.length > 0 || pendingEncaminhamentos.length > 0) && (
                  <div style={modalSectionStyle}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 10 }}>
                      Itens pendentes — serão salvos ao confirmar
                    </div>
                    {pendingMeds.map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '7px 12px', marginBottom: 6, fontSize: 13 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Pill size={12} style={{ color: '#2563eb' }} />{m.nomeMedicacao}{m.dosagem ? ` — ${m.dosagem}` : ''}</span>
                        <Btn size="sm" variant="ghost" style={{ color: '#dc2626' }} onClick={() => setPendingMeds(pendingMeds.filter((_, idx) => idx !== i))}>Remover</Btn>
                      </div>
                    ))}
                    {pendingExames.map((ex, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '7px 12px', marginBottom: 6, fontSize: 13 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FlaskConical size={12} style={{ color: '#4f46e5' }} />{ex.tipoExame}</span>
                        <Btn size="sm" variant="ghost" style={{ color: '#dc2626' }} onClick={() => setPendingExames(pendingExames.filter((_, idx) => idx !== i))}>Remover</Btn>
                      </div>
                    ))}
                    {pendingEncaminhamentos.map((en, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '7px 12px', marginBottom: 6, fontSize: 13 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Building2 size={12} style={{ color: '#dc2626' }} />{hospitais.find((h: any) => h.id === en.hospitalId)?.nome || en.hospitalId}{en.motivo ? ` — ${en.motivo}` : ''}</span>
                        <Btn size="sm" variant="ghost" style={{ color: '#dc2626' }} onClick={() => setPendingEncaminhamentos(pendingEncaminhamentos.filter((_, idx) => idx !== i))}>Remover</Btn>
                      </div>
                    ))}
                  </div>
                )}

                {/* Linked records */}
                {modalAtendimento?.id && (
                  <div style={modalSectionStyle}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: 10 }}>Registros vinculados</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>MEDICAÇÕES</div>
                        {meds.filter((m: any) => m.atendimentoId === modalAtendimento.id).length === 0
                          ? <div style={{ fontSize: 12, color: '#9ca3af' }}>Nenhuma</div>
                          : meds.filter((m: any) => m.atendimentoId === modalAtendimento.id).map((m: any) => (
                            <div key={m.id} style={{ padding: '5px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>{m.nomeMedicacao} — {m.dosagem}</div>
                          ))}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>EXAMES</div>
                        {exames.filter((s: any) => s.atendimentoId === modalAtendimento.id).length === 0
                          ? <div style={{ fontSize: 12, color: '#9ca3af' }}>Nenhum</div>
                          : exames.filter((s: any) => s.atendimentoId === modalAtendimento.id).map((s: any) => (
                            <div key={s.id} style={{ padding: '5px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>{s.tipoExame} · {s.status}</div>
                          ))}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>ENCAMINHAMENTOS</div>
                        {encaminhamentos.filter((e: any) => e.atendimentoId === modalAtendimento.id).length === 0
                          ? <div style={{ fontSize: 12, color: '#9ca3af' }}>Nenhum</div>
                          : encaminhamentos.filter((e: any) => e.atendimentoId === modalAtendimento.id).map((e: any) => (
                            <div key={e.id} style={{ padding: '5px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>{e.hospital?.nome || e.hospitalId} · {e.status}</div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <Btn variant="secondary" onClick={closeModal}><X size={13} /> Cancelar</Btn>
                  {canEdit && (
                    <Btn variant="primary" disabled={isSaving} onClick={handleSaveModal}>
                      <Save size={13} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Btn>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default UpaDashboard;