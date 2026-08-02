import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Bell, Trash2, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface AvisoItem {
  id: string;
  titulo: string;
  texto: string;
  prioridade: 'normal' | 'importante' | 'urgente';
  autor: string;
  createdAt: any;
}

export function Avisos() {
  const { user, isAdmin } = useAuth();
  const [avisos, setAvisos] = useState<AvisoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [prioridade, setPrioridade] = useState<'normal' | 'importante' | 'urgente'>('normal');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'avisos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: AvisoItem[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as AvisoItem));
      setAvisos(docs);
      setLoading(false);
    }, (err) => {
      console.error("Erro ao carregar avisos do Firestore", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'avisos'), {
        titulo: titulo.trim() || 'Comunicado Oficial',
        texto: texto.trim(),
        prioridade,
        autor: user?.displayName || 'Síndico',
        createdAt: serverTimestamp()
      });
      setTitulo('');
      setTexto('');
      setPrioridade('normal');
    } catch (err) {
      console.error("Erro ao publicar aviso", err);
      alert("Erro ao publicar aviso. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este aviso?")) return;
    try {
      await deleteDoc(doc(db, 'avisos', id));
    } catch (err) {
      console.error("Erro ao excluir aviso", err);
    }
  };

  const getPriorityBadge = (p: 'normal' | 'importante' | 'urgente') => {
    switch (p) {
      case 'urgente':
        return <span style={{ backgroundColor: '#ffebe9', color: '#cf222e', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><AlertCircle size={14} /> URGENTE</span>;
      case 'importante':
        return <span style={{ backgroundColor: '#fff8c5', color: '#9a6700', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={14} /> IMPORTANTE</span>;
      default:
        return <span style={{ backgroundColor: '#ddf4ff', color: '#0969da', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Info size={14} /> INFORMATIVO</span>;
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="icon-wrapper bg-primary-light" style={{ marginBottom: 0 }}>
          <Bell size={24} color="var(--color-primary-dark)" />
        </div>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Quadro de Avisos</h1>
      </div>

      {isAdmin && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
          <h3 style={{ marginBottom: '1rem' }}>📢 Publicar Novo Comunicado</h3>
          <form onSubmit={handleAddAviso} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                className="input-control" 
                style={{ flex: 2, minWidth: '200px' }}
                placeholder="Título do aviso (opcional)..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
              <select 
                className="input-control"
                style={{ flex: 1, minWidth: '150px' }}
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as any)}
              >
                <option value="normal">Informativo</option>
                <option value="importante">Importante</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            
            <textarea 
              className="input-control"
              style={{ minHeight: '80px', resize: 'vertical' }}
              placeholder="Escreva a mensagem ou comunicado para os moradores..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              required
            />

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              {submitting ? 'Publicando...' : 'Publicar Comunicado'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>Carregando comunicados do banco de dados...</p>
      ) : avisos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
          <Bell size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>Nenhum aviso publicado ainda</h3>
          <p>Os comunicados da administração aparecerão nesta página.</p>
        </div>
      ) : (
        <div className="avisos-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {avisos.map(aviso => (
            <div key={aviso.id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  {getPriorityBadge(aviso.prioridade)}
                  <h3 style={{ fontSize: '1.2rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>{aviso.titulo}</h3>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(aviso.id)} 
                    style={{ background: 'none', border: 'none', color: '#cf222e', cursor: 'pointer', padding: '0.25rem' }}
                    title="Excluir aviso"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <p style={{ fontSize: '1rem', color: 'var(--color-text)', whiteSpace: 'pre-line', marginBottom: '1rem' }}>
                {aviso.texto}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <span>Por: <strong>{aviso.autor || 'Administração'}</strong></span>
                <span>{aviso.createdAt?.toDate ? aviso.createdAt.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recentemente'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

