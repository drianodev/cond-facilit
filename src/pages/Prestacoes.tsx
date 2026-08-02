import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FileText, ExternalLink, CheckCircle, ShieldCheck } from 'lucide-react';

export function Prestacoes() {
  const { isAdmin, user } = useAuth();
  const [driveLink, setDriveLink] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'configuracoes', 'prestacoes');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDriveLink(data.driveLink || '');
        setInstrucoes(data.instrucoes || '');
      }
      setLoading(false);
    }, (err) => {
      console.error("Erro ao carregar link de prestações", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveLink.trim()) return;

    setSaving(true);
    setSavedSuccess(false);

    try {
      await setDoc(doc(db, 'configuracoes', 'prestacoes'), {
        driveLink: driveLink.trim(),
        instrucoes: instrucoes.trim(),
        updatedBy: user?.displayName || 'Síndico',
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error("Erro ao salvar link no Firestore", err);
      alert("Erro ao salvar alterações no banco de dados.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="icon-wrapper bg-warning-light" style={{ marginBottom: 0 }}>
          <FileText size={24} color="var(--color-warning)" />
        </div>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Prestações e Boletos</h1>
      </div>

      <div className="card" style={{ maxWidth: '650px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
          <ShieldCheck size={22} />
          <h3 style={{ margin: 0 }}>Transparência Condominial</h3>
        </div>

        <p style={{ marginBottom: '1rem', fontSize: '1.05rem', color: 'var(--color-text)' }}>
          {instrucoes || 'O síndico disponibiliza todos os boletos, balancetes mensais e notas fiscais de prestação de contas através de uma pasta compartilhada no Google Drive.'}
        </p>

        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Carregando dados do banco...</p>
        ) : driveLink ? (
          <a 
            href={driveLink} 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-primary"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1.125rem',
              textDecoration: 'none' 
            }}
          >
            <ExternalLink size={20} /> Acessar Pasta no Google Drive
          </a>
        ) : (
          <div style={{ padding: '1rem', backgroundColor: '#fff8c5', borderRadius: '6px', color: '#8a6d3b' }}>
            O link da pasta de prestações ainda não foi cadastrado pelo síndico.
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="card" style={{ maxWidth: '650px', border: '1px dashed var(--color-primary)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>⚙️ Área do Síndico: Atualizar Link & Instruções</h3>
          
          <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label style={{ fontWeight: 'bold' }}>URL da Pasta do Google Drive *</label>
              <input 
                type="url" 
                className="input-control" 
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                required
              />
            </div>

            <div className="input-group">
              <label style={{ fontWeight: 'bold' }}>Mensagem / Orientações aos Moradores (Opcional)</label>
              <textarea 
                className="input-control"
                rows={3}
                value={instrucoes}
                onChange={(e) => setInstrucoes(e.target.value)}
                placeholder="Ex: Balancete de Julho publicado. Segunda via de boleto solicitar até o dia 10..."
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button type="submit" disabled={saving} className="btn btn-secondary">
                {saving ? 'Salvando no Banco...' : 'Salvar Alterações'}
              </button>

              {savedSuccess && (
                <span style={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  <CheckCircle size={16} /> Atualizado com sucesso!
                </span>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

