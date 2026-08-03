import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Users, MessageCircle, Plus, Trash2, X, Filter } from 'lucide-react';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface Empreendedor {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  whatsapp: string;
  instagram?: string;
  apartamento?: string;
  ownerUid?: string;
  createdAt: any;
}

// Helpers for WhatsApp and Instagram URLs
const formatWhatsappLink = (phone: string) => {
  let clean = phone.replace(/\D/g, '');
  if (clean.length === 10 || clean.length === 11) {
    clean = '55' + clean;
  }
  return `https://wa.me/${clean}`;
};

const formatInstagramUrl = (raw?: string) => {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanHandle = trimmed
    .replace(/^@/, '')
    .replace(/^instagram\.com\//, '')
    .replace(/^www\.instagram\.com\//, '')
    .replace(/\/$/, '');
  return `https://instagram.com/${cleanHandle}`;
};

export function Vitrine() {
  const { user, isAdmin } = useAuth();
  const [empreendedores, setEmpreendedores] = useState<Empreendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('Todas');

  // Form states
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Alimentação');
  const [descricao, setDescricao] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [apartamento, setApartamento] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'vitrine'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Empreendedor[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Empreendedor));
      setEmpreendedores(docs);
      setLoading(false);
    }, (err) => {
      console.error("Erro ao carregar vitrine", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !whatsapp.trim() || !descricao.trim()) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'vitrine'), {
        nome: nome.trim(),
        categoria,
        descricao: descricao.trim(),
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim(),
        apartamento: apartamento.trim(),
        ownerUid: user?.uid || '',
        createdAt: serverTimestamp()
      });

      // Reset form & close modal
      setNome('');
      setCategoria('Alimentação');
      setDescricao('');
      setWhatsapp('');
      setInstagram('');
      setApartamento('');
      setShowModal(false);
    } catch (err) {
      console.error("Erro ao salvar negócio na vitrine", err);
      alert("Erro ao cadastrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este anúncio?")) return;
    try {
      await deleteDoc(doc(db, 'vitrine', id));
    } catch (err) {
      console.error("Erro ao remover anúncio", err);
    }
  };

  const categoriasUnicas = ['Todas', 'Alimentação', 'Serviços', 'Vendas', 'Beleza e Estética', 'Outros'];

  const filteredEmpreendedores = selectedCategoria === 'Todas'
    ? empreendedores
    : empreendedores.filter(e => e.categoria === selectedCategoria);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="icon-wrapper bg-secondary-light" style={{ marginBottom: 0 }}>
            <Users size={24} color="var(--color-secondary-dark)" />
          </div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Vitrine de Empreendedores</h1>
        </div>
        
        <button onClick={() => setShowModal(true)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Divulgar meu Negócio / Serviço
        </button>
      </div>

      {/* Categorias Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <Filter size={18} color="var(--color-text-muted)" style={{ marginRight: '0.25rem' }} />
        {categoriasUnicas.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategoria(cat)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              border: selectedCategoria === cat ? 'none' : '1px solid #ccc',
              backgroundColor: selectedCategoria === cat ? 'var(--color-secondary)' : 'transparent',
              color: selectedCategoria === cat ? 'white' : 'var(--color-text)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: selectedCategoria === cat ? 'bold' : 'normal',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards List */}
      {loading ? (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>Carregando empreendedores do banco de dados...</p>
      ) : filteredEmpreendedores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
          <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>Nenhum empreendedor registrado {selectedCategoria !== 'Todas' ? `na categoria "${selectedCategoria}"` : ''}</h3>
          <p>Seja o primeiro a cadastrar seu serviço ou produto para os vizinhos!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {filteredEmpreendedores.map(emp => {
            const waUrl = formatWhatsappLink(emp.whatsapp);
            const igUrl = formatInstagramUrl(emp.instagram);

            return (
              <div key={emp.id} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '0.25rem 0.75rem', 
                    backgroundColor: 'var(--color-primary-light)', 
                    color: 'white', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                  }}>
                    {emp.categoria}
                  </span>

                  {(isAdmin || user?.uid === emp.ownerUid) && (
                    <button 
                      onClick={() => handleDelete(emp.id)}
                      style={{ background: 'none', border: 'none', color: '#cf222e', cursor: 'pointer' }}
                      title="Excluir negócio"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{emp.nome}</h3>
                {emp.apartamento && (
                  <small style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Bloco/Apt: {emp.apartamento}</small>
                )}

                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', flex: 1, whiteSpace: 'pre-line' }}>
                  {emp.descricao}
                </p>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a 
                    href={waUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn" 
                    style={{ backgroundColor: '#25D366', color: 'white', flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                  {igUrl && (
                    <a 
                      href={igUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn" 
                      style={{ backgroundColor: '#E1306C', color: 'white', padding: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Ver Instagram"
                    >
                      <InstagramIcon />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Modal */}
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
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Divulgar meu Negócio / Serviço</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCadastrar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Nome do Negócio / Profissional *</label>
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="Ex: Maria Bolos ou João Eletricista"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Categoria *</label>
                <select 
                  className="input-control"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <option value="Alimentação">Alimentação</option>
                  <option value="Serviços">Serviços</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Beleza e Estética">Beleza e Estética</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>WhatsApp (com DDD) *</label>
                <input 
                  type="tel" 
                  className="input-control" 
                  placeholder="Ex: 88999999999 ou (88) 99999-9999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Instagram ou Site (Opcional)</label>
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="Ex: @agenciatymax ou https://instagram.com/agenciatymax"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Seu Apartamento / Bloco (Opcional)</label>
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="Ex: Apt 402 Bloco B"
                  value={apartamento}
                  onChange={(e) => setApartamento(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Descrição dos Produtos / Serviços *</label>
                <textarea 
                  className="input-control" 
                  rows={3}
                  placeholder="Descreva o que você faz, horários, preços ou especialidades..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ backgroundColor: '#eee' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="btn btn-secondary">
                  {submitting ? 'Salvando...' : 'Cadastrar na Vitrine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
