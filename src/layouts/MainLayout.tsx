import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Bell, Users, Calendar, FileText, Cake, Shield, Menu, X } from 'lucide-react';
import './MainLayout.css';

export function MainLayout() {
  const { user, logout, isAdmin, canToggleRole, toggleRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/avisos', label: 'Avisos', icon: Bell },
    { path: '/vitrine', label: 'Vitrine', icon: Users },
    { path: '/deck', label: 'Deck', icon: Calendar },
    { path: '/prestacoes', label: 'Prestações', icon: FileText },
    { path: '/aniversariantes', label: 'Aniversariantes', icon: Cake },
  ];

  return (
    <div className="layout-container">
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-backdrop" onClick={closeMobileMenu} />
      )}

      {/* Sidebar / Mobile Drawer */}
      <nav className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>CondFacilit</h2>
          <button className="mobile-close-btn" onClick={closeMobileMenu}>
            <X size={24} />
          </button>
        </div>
        
        <ul className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer">
          {user && (
            <div className="user-info" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src={user.photoURL || 'https://via.placeholder.com/40'} alt="Perfil" className="user-avatar" />
                <div className="user-details" style={{ flex: 1, overflow: 'hidden' }}>
                  <span className="user-name" style={{ fontSize: '0.875rem', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block' }}>
                    {user.displayName}
                  </span>
                  
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

      {/* Main Content Area */}
      <main className="main-content">
        <header className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h2>CondFacilit</h2>
          </div>
          {user && (
            <img src={user.photoURL || 'https://via.placeholder.com/32'} alt="Perfil" className="user-avatar-small" />
          )}
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
