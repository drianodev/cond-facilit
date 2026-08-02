import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Cake, Plus, Trash2, X, Calendar } from 'lucide-react';

interface Aniversariante {
  id: string;
  nome: string;
  apartamento: string;
  dia: number;
  mes: number; // 1 to 12
  createdAt: any;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function Aniversariantes() {
  const { isAdmin } = useAuth();
  const currentMonthNum = new Date().getMonth() + 1; // 1-indexed
  
  const [selectedMes, setSelectedMes] = useState<number>(currentMonthNum);
  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [apartamento, setApartamento] = useState('');
  const [dia, setDia] = useState<number>(1);
  const [mes, setMes] = useState<number>(currentMonthNum);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'aniversariantes'), orderBy('dia', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Aniversariante[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Aniversariante));
      setAniversariantes(docs);
      setLoading(false);
    }, (err) => {
      console.error("Erro ao carregar aniversariantes do Firestore", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !apartamento.trim()) {
      alert("Por favor, preencha o nome e o apartamento.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'aniversariantes'), {
        nome: nome.trim(),
        apartamento: apartamento.trim(),
        dia: Number(dia),
        mes: Number(mes),
        createdAt: serverTimestamp()
      });

      setNome('');
      setApartamento('');
      setDia(1);
      setShowModal(false);
    } catch (err) {
      console.error("Erro ao cadastrar aniversariante", err);
      alert("Erro ao cadastrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este morador da lista?")) return;
    try {
      await deleteDoc(doc(db, 'aniversariantes', id));
    } catch (err) {
      console.error("Erro ao remover aniversariante", err);
    }
  };

  const aniversariantesFiltrados = aniversariantes.filter(a => a.mes === selectedMes);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="icon-wrapper bg-info-light" style={{ marginBottom: 0 }}>
            <Cake size={24} color="#007bff" />
          </div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            Aniversariantes do Mês
          </h1>
        </div>
        
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Adicionar Aniversariante
          </button>
        )}
      </div>

      {/* Month Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <Calendar size={18} color="var(--color-text-muted)" style={{ marginRight: '0.25rem' }} />
        {MESES.map((nomeMes, index) => {
          const monthIndex = index + 1;
          const isSelected = selectedMes === monthIndex;
          return (
            <button
              key={nomeMes}
              onClick={() => setSelectedMes(monthIndex)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                border: isSelected ? 'none' : '1px solid #ccc',
                backgroundColor: isSelected ? '#007bff' : 'transparent',
                color: isSelected ? 'white' : 'var(--color-text)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: isSelected ? 'bold' : 'normal',
                whiteSpace: 'nowrap'
              }}
            >
              {nomeMes}
            </button>
          );
        })}
      </div>

      {/* List / Cards */}
      {loading ? (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>Carregando dados do banco...</p>
      ) : aniversariantesFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
          <Cake size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>Nenhum aniversariante cadastrado em {MESES[selectedMes - 1]}</h3>
          <p>Os aniversariantes deste mês serão exibidos aqui.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {aniversariantesFiltrados.map(pessoa => (
            <div key={pessoa.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%', 
                  backgroundColor: '#007bff',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '0.7rem', opacity: 0.85, textTransform: 'uppercase' }}>Dia</span>
                  <span style={{ fontSize: '1.4rem', lineHeight: '1.1' }}>{pessoa.dia}</span>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{pessoa.nome}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Apt {pessoa.apartamento}</p>
                </div>
              </div>

              {isAdmin && (
                <button 
                  onClick={() => handleDelete(pessoa.id)}
                  style={{ background: 'none', border: 'none', color: '#cf222e', cursor: 'pointer', padding: '0.25rem' }}
                  title="Excluir da lista"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Adicionar Aniversariante</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCadastrar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Nome do Morador *</label>
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="Ex: Carlos Almeida"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Apartamento / Bloco *</label>
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="Ex: 402B"
                  value={apartamento}
                  onChange={(e) => setApartamento(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Dia *</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31" 
                    className="input-control"
                    value={dia}
                    onChange={(e) => setDia(Number(e.target.value))}
                    required
                  />
                </div>

                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Mês *</label>
                  <select 
                    className="input-control"
                    value={mes}
                    onChange={(e) => setMes(Number(e.target.value))}
                  >
                    {MESES.map((m, idx) => (
                      <option key={m} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ backgroundColor: '#eee' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Salvando...' : 'Cadastrar Morador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

