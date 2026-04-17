import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage, FileText, CheckCircle } from 'lucide-react';

export default function DropZone({ onFileSelect, disabled }) {
  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length > 0) onFileSelect(accepted);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024,
    disabled,
  });

  const fileCount = acceptedFiles.length;

  return (
    <div
      {...getRootProps()}
      className={`relative group border-2 border-dashed rounded-2xl p-10 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? 'border-primary bg-primary-muted scale-[1.02] animate-pulse-scan'
          : disabled
          ? 'border-border opacity-50 cursor-not-allowed'
          : 'border-border hover:border-primary/50 hover:bg-primary-muted/50'
      }`}
    >
      <input {...getInputProps()} />

      {/* Background glow on hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 transition-opacity duration-500 pointer-events-none ${isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:animate-pulse-scan'}`} />


      <div className="relative flex flex-col items-center gap-4">
        {fileCount > 0 ? (
          <>
            <div className="relative">
              <FileImage className="w-14 h-14 text-primary-light animate-float" />
              <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-valid" />
            </div>
            <div>
              <p className="text-lg font-semibold text-fg">{fileCount} file{fileCount > 1 ? 's' : ''} selected</p>
              <p className="text-sm text-fg-3 mt-1">
                Click or drop to replace
              </p>
            </div>
          </>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragActive
                ? 'bg-primary/20 scale-110'
                : 'bg-bg-3'
            }`}>
              <Upload className={`w-8 h-8 transition-colors duration-300 ${
                isDragActive ? 'text-primary' : 'text-fg-3'
              }`} />
            </div>
            <div>
              <p className="text-lg font-semibold text-fg">
                {isDragActive ? 'Drop your certificate here' : 'Drag & drop a certificate'}
              </p>
              <p className="text-sm text-fg-3 mt-1">
                PNG, JPG, PDF up to 10 MB — or click to browse
              </p>
            </div>
            {/* Format badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {['PNG', 'JPG', 'PDF', 'TIFF', 'WebP'].map(fmt => (
                <span key={fmt} className="text-[10px] font-medium text-fg-3 bg-bg-3 px-2 py-0.5 rounded">
                  {fmt}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
