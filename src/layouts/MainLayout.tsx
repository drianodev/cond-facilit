import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Bell, Users, Calendar, FileText, Cake, Shield } from 'lucide-react';
import './MainLayout.css';

export function MainLayout() {
  const { user, logout, isAdmin, canToggleRole, toggleRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>CondFacilit</h2>
        </div>
        
        <ul className="nav-menu">
          <li>
            <Link to="/" className="nav-link">
              <Home size={20} />
              <span>Início</span>
            </Link>
          </li>
          <li>
            <Link to="/avisos" className="nav-link">
              <Bell size={20} />
              <span>Avisos</span>
            </Link>
          </li>
          <li>
            <Link to="/vitrine" className="nav-link">
              <Users size={20} />
              <span>Vitrine</span>
            </Link>
          </li>
          <li>
            <Link to="/deck" className="nav-link">
              <Calendar size={20} />
              <span>Deck</span>
            </Link>
          </li>
          <li>
            <Link to="/prestacoes" className="nav-link">
              <FileText size={20} />
              <span>Prestações</span>
            </Link>
          </li>
          <li>
            <Link to="/aniversariantes" className="nav-link">
              <Cake size={20} />
              <span>Aniversariantes</span>
            </Link>
          </li>
        </ul>

        <div className="sidebar-footer">
          {user && (
            <div className="user-info" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src={user.photoURL || 'https://via.placeholder.com/40'} alt="Perfil" className="user-avatar" />
                <div className="user-details" style={{ flex: 1, overflow: 'hidden' }}>
                  <span className="user-name" style={{ fontSize: '0.875rem', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block' }}>{user.displayName}</span>
                  
                  {canToggleRole ? (
                    <button 
                      onClick={toggleRole} 
                      style={{ 
                        background: isAdmin ? '#e8f5e9' : '#e3f2fd', 
                        color: isAdmin ? '#2e7d32' : '#1565c0', 
                        border: 'none', 
                        borderRadius: '12px', 
                        padding: '2px 8px', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '2px'
                      }}
                      title="Clique para alternar entre perfil de Síndico e Morador para testes"
                    >
                      <Shield size={12} /> {isAdmin ? 'Perfil: Síndico ⚡' : 'Perfil: Morador'}
                    </button>
                  ) : (
                    <span 
                      style={{ 
                        background: isAdmin ? '#e8f5e9' : '#f5f5f5', 
                        color: isAdmin ? '#2e7d32' : '#616161', 
                        borderRadius: '12px', 
                        padding: '2px 8px', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '2px'
                      }}
                    >
                      <Shield size={12} /> {isAdmin ? 'Perfil: Síndico' : 'Perfil: Morador'}
                    </span>
                  )}
                </div>
                <button onClick={handleLogout} className="logout-btn" title="Sair">
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="main-content">
        <header className="mobile-header">
          <h2>CondFacilit</h2>
          {/* Mobile menu toggle would go here */}
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
