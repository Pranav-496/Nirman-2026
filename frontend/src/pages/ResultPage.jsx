import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import ResultCard from '../components/ResultCard';

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-bg-3 flex items-center justify-center mx-auto mb-4">
          <Download className="w-8 h-8 text-fg-3" />
        </div>
        <h2 className="text-xl font-bold text-fg mb-2">No Result Found</h2>
        <p className="text-fg-3 mb-6 text-sm">Please upload a certificate first to see verification results.</p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary px-6 py-2.5 rounded-xl text-sm"
        >
          Go to Verify
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 animate-slide-up">
        <button
          onClick={() => navigate('/')}
          className="btn-ghost flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Verify Another
        </button>
        <button
          onClick={() => window.print()}
          className="btn-ghost flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
      </div>

      <ResultCard data={result} />
    </div>
  );
}
