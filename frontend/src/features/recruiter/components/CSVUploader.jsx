import { useState } from "react";

export default function CSVUploader({ onEmailsExtracted }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const emails = [];
        
        // Extract emails from CSV (assuming first column or email format)
        lines.forEach(line => {
          const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
          columns.forEach(col => {
            if (col.includes('@') && col.includes('.')) {
              emails.push(col);
            }
          });
        });

        onEmailsExtracted([...new Set(emails)]); // Remove duplicates
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      } finally {
        setUploading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      
      <label htmlFor="csv-upload" className="cursor-pointer">
        <span className="text-sm text-slate-600">
          {uploading ? 'Processing...' : 'Drop CSV file here or click to browse'}
        </span>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>
      
      <p className="text-xs text-slate-500 mt-2">
        CSV should contain email addresses (first column or any column with @)
      </p>
    </div>
  );
}
