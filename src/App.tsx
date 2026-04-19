import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopAppBar from './components/TopAppBar';
import BottomNavBar from './components/BottomNavBar';
import { useApp } from './context/AppContext';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import UsersPage from './pages/UsersPage';
import SummaryPage from './pages/SummaryPage';
import AddTransactionPage from './pages/AddTransactionPage';
import AnalyticsPage from './pages/AnalyticsPage';

function AppContent() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-transparent">
        <span className="material-symbols-outlined text-[#00193c] text-5xl animate-spin">progress_activity</span>
        <p className="text-[#4e6874] font-bold">טוען נתונים...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-on-surface">
      <TopAppBar />
      <Routes>
        <Route path="/"             element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/users"        element={<UsersPage />} />
        <Route path="/summary"      element={<SummaryPage />} />
        <Route path="/add"          element={<AddTransactionPage />} />
        <Route path="/analytics"    element={<AnalyticsPage />} />
      </Routes>
      <BottomNavBar />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
