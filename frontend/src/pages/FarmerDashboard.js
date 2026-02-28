import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

function FarmerDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>{t('dashboard.farmerTitle')}</h1>
          <button onClick={handleLogout} className="btn-logout">{t('dashboard.logout')}</button>
        </div>
      </header>

      <div className="dashboard-container">
        <div className="dashboard-grid">
          <div className="dash-card">
            <h3>{t('dashboard.listNewCrop')}</h3>
            <button className="btn-primary" onClick={() => navigate('/add-crop')}>
              {t('dashboard.listCrop')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.myListings')}</h3>
            <button className="btn-primary" onClick={() => navigate('/my-listings')}>
              {t('dashboard.viewListings')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.mandiPrices')}</h3>
            <button className="btn-primary" onClick={() => navigate('/price-comparison')}>
              {t('dashboard.viewPrices')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.incomingOrders')}</h3>
            <button className="btn-primary" onClick={() => navigate('/incoming-orders')}>
              {t('dashboard.viewOrders')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.assignedTrucks')}</h3>
            <button className="btn-primary" onClick={() => navigate('/assigned-trucks')}>
              {t('dashboard.viewTrucks')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.payments')}</h3>
            <button className="btn-primary" onClick={() => navigate('/my-payments')}>
              {t('dashboard.viewPayments')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.ratings')}</h3>
            <button className="btn-primary" onClick={() => navigate('/my-ratings')}>
              {t('dashboard.viewRatings')}
            </button>
          </div>

          <div className="dash-card">
            <h3>💬 {t('chat.myChats')}</h3>
            <button className="btn-primary" onClick={() => navigate('/chats')}>
              {t('chat.viewChats')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.notifications')}</h3>
            <button className="btn-primary" onClick={() => navigate('/my-notifications')}>
              {t('dashboard.viewAll')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmerDashboard;
