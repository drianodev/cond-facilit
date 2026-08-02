import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Calendar as CalendarIcon, Clock, Trash2, CheckCircle2, User as UserIcon } from 'lucide-react';

interface Reserva {
  id: string;
  dataReserva: string;
  periodo: string;
  apartamento: string;
  solicitante: string;
  userUid: string;
  createdAt: any;
}

export function Deck() {
  const { user, isAdmin } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState('');
  const [periodo, setPeriodo] = useState('Dia Inteiro (08:00 - 22:00)');
  const [apartamento, setApartamento] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const q = query(collection(db, 'reservasDeck'), orderBy('dataReserva', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Reserva[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Reserva));
      setReservas(docs);
      setLoading(false);
    }, (err) => {
      console.error("Erro ao carregar reservas do Deck", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const diasBloqueados = reservas.map(r => r.dataReserva);

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !apartamento.trim()) {
      alert("Por favor, preencha a data e o apartamento.");
      return;
    }
    
    // Check if date is already booked
    const conflito = reservas.find(r => r.dataReserva === selectedDate);
    if (conflito) {
      alert(`O Deck já está reservado no dia ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')} pelo apartamento ${conflito.apartamento}. Escolha outra data.`);
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reservasDeck'), {
        dataReserva: selectedDate,
        periodo,
        apartamento: apartamento.trim(),
        solicitante: user?.displayName || 'Morador',
        userUid: user?.uid || '',
        createdAt: serverTimestamp()
      });

      alert("🎉 Reserva realizada com sucesso no banco de dados!");
      setSelectedDate('');
      setApartamento('');
    } catch (err) {
      console.error("Erro ao salvar reserva", err);
      alert("Erro ao realizar reserva. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelarReserva = async (id: string) => {
    if (!confirm("Deseja realmente cancelar esta reserva?")) return;
    try {
      await deleteDoc(doc(db, 'reservasDeck', id));
    } catch (err) {
      console.error("Erro ao cancelar reserva", err);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="icon-wrapper bg-success-light" style={{ marginBottom: 0 }}>
          <CalendarIcon size={24} color="var(--color-success)" />
        </div>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Agendamento do Deck</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Form Card */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={20} /> Nova Solicitação de Reserva
          </h3>
          
          <form onSubmit={handleAgendar} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="input-group">
              <label htmlFor="data" style={{ fontWeight: 'bold' }}>Escolha a Data *</label>
              <input 
                type="date" 
                id="data"
                className="input-control" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={todayStr}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="periodo" style={{ fontWeight: 'bold' }}>Período do Evento *</label>
              <select
                id="periodo"
                className="input-control"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <option value="Dia Inteiro (08:00 - 22:00)">Dia Inteiro (08:00 - 22:00)</option>
                <option value="Manhã (08:00 - 14:00)">Manhã (08:00 - 14:00)</option>
                <option value="Tarde / Noite (15:00 - 22:00)">Tarde / Noite (15:00 - 22:00)</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="apt" style={{ fontWeight: 'bold' }}>Seu Apartamento / Bloco *</label>
              <input 
                type="text" 
                id="apt"
                className="input-control" 
                placeholder="Ex: 204 Bloco A"
                value={apartamento}
                onChange={(e) => setApartamento(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </form>
        </div>

        {/* List of Reservations */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} /> Calendário de Reservas Confirmadas
          </h3>

          {loading ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>Carregando reservas...</p>
          ) : reservas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)' }}>
              <CheckCircle2 size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p>Nenhuma reserva agendada para o Deck.</p>
              <small>Todas as datas estão livres no momento!</small>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '450px', overflowY: 'auto' }}>
              {reservas.map(res => {
                const dateObj = new Date(res.dataReserva + 'T12:00:00');
                const formattedDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
                const isOwnerOrAdmin = isAdmin || user?.uid === res.userUid;

                return (
                  <div key={res.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--color-bg)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--color-success)'
                  }}>
                    <div>
                      <span style={{ fontWeight: 'bold', fontSize: '1rem', display: 'block', textTransform: 'capitalize' }}>
                        {formattedDate}
                      </span>
                      <small style={{ color: 'var(--color-text-muted)', display: 'block' }}>
                        Apt {res.apartamento} • {res.periodo}
                      </small>
                      <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                        <UserIcon size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {res.solicitante}
                      </small>
                    </div>

                    {isOwnerOrAdmin && (
                      <button 
                        onClick={() => handleCancelarReserva(res.id)}
                        style={{ background: 'none', border: 'none', color: '#cf222e', cursor: 'pointer', padding: '0.25rem' }}
                        title="Cancelar reserva"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

