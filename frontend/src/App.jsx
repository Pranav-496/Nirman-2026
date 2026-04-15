import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import UploadPage from './pages/UploadPage';
import ResultPage from './pages/ResultPage';
import QRPage from './pages/QRPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-bg text-fg">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/qr" element={<QRPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
