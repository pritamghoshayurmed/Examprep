import React, { useCallback, useRef } from 'react';
import { UploadedFile } from '../types';

interface FileUploadProps {
  label: string;
  accept: string;
  multiple?: boolean;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  icon?: React.ReactNode;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  multiple = false,
  files,
  onFilesChange,
  icon
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesList = Array.from(e.target.files);
      const newFiles: UploadedFile[] = filesList.map((file) => ({
        file: file as File,
        id: crypto.randomUUID()
      }));

      if (multiple) {
        onFilesChange([...files, ...newFiles]);
      } else {
        onFilesChange(newFiles);
      }
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  };

  const triggerUpload = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full mb-6">
      <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
      
      <div 
        onClick={triggerUpload}
        className="border-2 border-dashed border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500 transition-all rounded-xl p-6 cursor-pointer flex flex-col items-center justify-center min-h-[120px] group"
      >
        <input 
          ref={inputRef}
          type="file" 
          accept={accept} 
          multiple={multiple} 
          className="hidden" 
          onChange={handleFileChange}
        />
        
        <div className="text-slate-500 group-hover:text-blue-400 mb-2 transition-colors">
          {icon || (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>
        <p className="text-sm text-slate-400 font-medium">Click to upload {multiple ? 'files' : 'file'}</p>
        <p className="text-xs text-slate-500 mt-1">PDF format only</p>
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between bg-slate-800/80 px-4 py-2 rounded-lg text-sm border border-slate-700">
              <span className="truncate max-w-[80%] text-slate-300">{f.file.name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/10 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUpload;