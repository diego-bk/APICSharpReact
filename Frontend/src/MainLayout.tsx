import React from 'react';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout }) => {
  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🐾 VetApp</div>
        <nav className="sidebar-nav">
          <a href="#/clientes">Clientes</a>
          <a href="#/mascotas">Mascotas</a>
          <a href="#/citas">Citas</a>
          <a href="#/tratamientos">Tratamientos</a>
          <a href="#/veterinarios">Veterinarios</a>
          <a href="#/usuarios">Usuarios</a>
        </nav>
      </aside>
      <div className="main-content">
        <header className="header">
          <h1>Menú Principal</h1>
          <button className="logout-btn" onClick={onLogout}>Cerrar sesión</button>
        </header>
        <main className="content-area">{children}</main>
        <footer className="footer">
          &copy; {new Date().getFullYear()} VetApp. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
