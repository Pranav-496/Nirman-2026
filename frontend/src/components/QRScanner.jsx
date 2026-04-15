import { Search, QrCode } from 'lucide-react';

export default function QRScanner({ onSubmit, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const id = e.target.certId.value.trim();
    if (id) onSubmit(id);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div>
        <label htmlFor="certId" className="block text-sm font-medium text-fg-2 mb-2">
          Enter Certificate ID
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <QrCode className="w-4 h-4 text-fg-3" />
          </div>
          <input
            id="certId"
            name="certId"
            type="text"
            placeholder="e.g. CERT-100001"
            className="input-field w-full rounded-xl pl-10 pr-12 py-3 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center bg-primary-muted text-primary-light hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-xs text-fg-3">
        This simulates scanning a QR code on a printed certificate. Enter the ID embedded in the QR.
      </p>
    </form>
  );
}
