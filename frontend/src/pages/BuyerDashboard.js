import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

function BuyerDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const buyerName = localStorage.getItem('buyerName') || 'Buyer';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('buyerName');
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>{t('dashboard.buyerTitle')}</h1>
          <div className="header-right">
            <span className="welcome-text">{t('dashboard.welcomeText')} {buyerName}</span>
            <button onClick={handleLogout} className="btn-logout">{t('dashboard.logout')}</button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        <div className="dashboard-grid">
          <div className="dash-card">
            <h3>{t('dashboard.browseCrops')}</h3>
            <p>{t('dashboard.browseCropsDesc')}</p>
            <button className="btn-primary" onClick={() => navigate('/marketplace')}>
              {t('dashboard.goToMarketplace')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.pendingRequests')}</h3>
            <p>{t('dashboard.pendingRequestsDesc')}</p>
            <button className="btn-primary" onClick={() => navigate('/buyer/pending-requests')}>
              {t('dashboard.viewRequests')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.acceptedOrders')}</h3>
            <p>{t('dashboard.acceptedOrdersDesc')}</p>
            <button className="btn-primary" onClick={() => navigate('/buyer/accepted-orders')}>
              {t('dashboard.proceedToPay')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.myOrders')}</h3>
            <p>{t('dashboard.myOrdersDesc')}</p>
            <button className="btn-primary" onClick={() => navigate('/buyer-orders')}>
              {t('dashboard.viewOrders')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.trackDelivery')}</h3>
            <p>{t('dashboard.trackDeliveryDesc')}</p>
            <button className="btn-primary" onClick={() => navigate('/track-delivery')}>
              {t('dashboard.trackOrders')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.priceComparison')}</h3>
            <p>{t('dashboard.priceComparisonDesc')}</p>
            <button className="btn-primary" onClick={() => navigate('/price-comparison')}>
              {t('dashboard.viewPrices')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.payments')}</h3>
            <p>{t('dashboard.paymentsDesc')}</p>
            <button className="btn-primary" onClick={() => navigate('/buyer-payments')}>
              {t('dashboard.viewPayments')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.ratings')}</h3>
            <p>{t('dashboard.ratingsDesc')}</p>
            <button className="btn-primary" onClick={() => navigate('/buyer-ratings')}>
              {t('dashboard.viewRatings')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.notifications')}</h3>
            <p>{t('dashboard.notificationsDesc')}</p>
            <button className="btn-primary" onClick={() => navigate('/buyer-notifications')}>
              {t('dashboard.viewAll')}
            </button>
          </div>

          <div className="dash-card">
            <h3>💬 {t('dashboard.myChats')}</h3>
            <p>{t('dashboard.myChatsDesc')}</p>
            <button className="btn-primary" onClick={() => navigate('/chats')}>
              {t('dashboard.viewChats')}
            </button>
          </div>

          <div className="dash-card">
            <h3>{t('dashboard.profile')}</h3>
            <p>{t('dashboard.profileDesc')}</p>
            <button className="btn-primary" onClick={() => navigate('/buyer-profile')}>
              {t('dashboard.editProfile')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyerDashboard;
