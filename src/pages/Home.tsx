import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, Users, Calendar, FileText, Cake } from 'lucide-react';
import './Home.css';

export function Home() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="welcome-header">
        <h1 className="page-title">Olá, {user?.displayName?.split(' ')[0] || 'Morador'} 👋</h1>
        <p>Bem-vindo ao portal do seu condomínio. O que você gostaria de acessar hoje?</p>
      </div>

      <div className="dashboard-grid">
        <Link to="/avisos" className="dashboard-card card">
          <div className="icon-wrapper bg-primary-light">
            <Bell size={24} color="var(--color-primary-dark)" />
          </div>
          <h3>Quadro de Avisos</h3>
          <p>Fique por dentro das últimas novidades e comunicados importantes do síndico.</p>
        </Link>
        
        <Link to="/vitrine" className="dashboard-card card">
          <div className="icon-wrapper bg-secondary-light">
            <Users size={24} color="var(--color-secondary-dark)" />
          </div>
          <h3>Vitrine de Empreendedores</h3>
          <p>Conheça os produtos e serviços oferecidos pelos seus vizinhos.</p>
        </Link>
        
        <Link to="/deck" className="dashboard-card card">
          <div className="icon-wrapper bg-success-light">
            <Calendar size={24} color="var(--color-success)" />
          </div>
          <h3>Agendamento do Deck</h3>
          <p>Reserve o espaço do deck para seus eventos e confraternizações.</p>
        </Link>

        <Link to="/prestacoes" className="dashboard-card card">
          <div className="icon-wrapper bg-warning-light">
            <FileText size={24} color="var(--color-warning)" />
          </div>
          <h3>Prestações</h3>
          <p>Acesse as prestações de contas e boletos do condomínio.</p>
        </Link>
        
        <Link to="/aniversariantes" className="dashboard-card card">
          <div className="icon-wrapper bg-info-light">
            <Cake size={24} color="#007bff" />
          </div>
          <h3>Aniversariantes</h3>
          <p>Veja quem está de parabéns este mês no condomínio!</p>
        </Link>
      </div>
    </div>
  );
}
