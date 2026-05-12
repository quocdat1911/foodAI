import React, { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  imagePreview: string | null;
  isLoading: boolean;
}

export default function ImageUpload({ onImageSelected, imagePreview, isLoading }: ImageUploadProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  };

  return (
    <div className="w-full flex justify-center flex-col gap-4">
      <div 
        className={`relative w-full overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200 aspect-video flex flex-col items-center justify-center 
          ${isDragging 
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' 
            : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 bg-white dark:bg-neutral-900'
          }
          ${imagePreview && !isLoading ? 'border-solid border-neutral-200 dark:border-neutral-800 p-2 context-preview' : 'p-6 cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !imagePreview && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />

        {imagePreview ? (
          <div className="relative w-full h-full rounded-xl overflow-hidden group">
            <Image 
              src={imagePreview} 
              alt="Ingredient Preview" 
              fill
              className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100 group-hover:scale-105'}`}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {!isLoading && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t.changeImage}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={`p-4 rounded-full mb-4 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 group-hover:scale-110 transition-transform ${isDragging ? 'scale-110' : ''}`}>
              <UploadCloud size={32} />
            </div>
            <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-1 pointer-events-none text-center">
              {t.uploadClick}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500 pointer-events-none text-center">
              {t.uploadFormat}
            </p>
          </>
        )}
      </div>
      
      {imagePreview && (
         <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center flex items-center justify-center gap-2">
            <ImageIcon size={14} /> {t.imageLoaded}
         </p>
      )}
    </div>
  );
}
