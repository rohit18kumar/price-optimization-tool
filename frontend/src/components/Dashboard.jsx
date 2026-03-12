import { useState, useEffect } from 'react';
import { getCurrentUser, logout as apiLogout } from '../services/api';
import { removeToken } from '../utils/auth';
import ProductsScreen from './ProductsScreen';
import OptimizationScreen from './OptimizationScreen';

function Dashboard({ onLogout }) {
  const [view, setView] = useState('products');
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then((res) => setUser(res.data))
      .catch(() => setUser({ role: 'buyer' }));
  }, []);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch(e) {}
    removeToken();
    onLogout();
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Price Optimization Tool</h1>
        <nav className="main-nav">
          <button
            className={view === 'products' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setView('products')}
          >
            Products
          </button>
          <button
            className={view === 'optimization' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setView('optimization')}
          >
            Price Optimization
          </button>
        </nav>
        <div className="header-actions">
          <span>Welcome{user?.first_name ? `, ${user.first_name}` : ''}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {view === 'products' && (
          <ProductsScreen user={user} isAdmin={isAdmin} />
        )}
        {view === 'optimization' && (
          <OptimizationScreen isAdmin={isAdmin} />
        )}
      </main>
    </div>
  );
}

export default Dashboard;
