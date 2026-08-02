import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { PrivateRoute } from './components/PrivateRoute';

// Import pages
import { Home } from './pages/Home';
import { Avisos } from './pages/Avisos';
import { Vitrine } from './pages/Vitrine';
import { Deck } from './pages/Deck';
import { Prestacoes } from './pages/Prestacoes';
import { Aniversariantes } from './pages/Aniversariantes';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/avisos" element={<Avisos />} />
          <Route path="/vitrine" element={<Vitrine />} />
          <Route path="/deck" element={<Deck />} />
          <Route path="/prestacoes" element={<Prestacoes />} />
          <Route path="/aniversariantes" element={<Aniversariantes />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
