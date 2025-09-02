import './App.css';
import LoginForm from './LoginForm';
import MainLayout from './MainLayout';
import { useState, useEffect } from 'react';
import ClientesPage from './ClientesPage';
import TratamientosPage from './TratamientosPage';
import MascotasPage from './MascotasPage';
import UsuariosPage from './UsuariosPage';
import VeterinariosPage from './VeterinariosPage';
import CitasPage from './CitasPage';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <LoginForm onLoginSuccess={setToken} />;
  }
  const [route, setRoute] = useState(window.location.hash || '#/');
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  let content = (
    <div className="main-welcome">
      <h2>¡Bienvenido al sistema VetApp!</h2>
      <p>Selecciona una opción del menú lateral para comenzar.</p>
    </div>
  );
  if (route.startsWith('#/clientes')) content = <ClientesPage />;
  if (route.startsWith('#/tratamientos')) content = <TratamientosPage />;
  if (route.startsWith('#/mascotas')) content = <MascotasPage />;
  if (route.startsWith('#/usuarios')) content = <UsuariosPage />;
  if (route.startsWith('#/veterinarios')) content = <VeterinariosPage />;
  if (route.startsWith('#/citas')) content = <CitasPage />;

  return (
    <MainLayout onLogout={handleLogout}>{content}</MainLayout>
  );
}

export default App
