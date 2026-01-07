import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, isLoading }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Pass to parent
    onImageSelected(file);
  };

  const triggerClick = () => {
    if(!isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div 
        onClick={triggerClick}
        className={`
          relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden
          ${preview ? 'border-orange-500 bg-gray-900' : 'border-orange-300 bg-white hover:border-orange-500 hover:bg-orange-50'}
          ${isLoading ? 'cursor-not-allowed opacity-90' : ''}
          shadow-sm h-80 flex flex-col justify-center items-center group
        `}
      >
        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Meal Preview" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-3" />
                <p className="text-white font-medium animate-pulse">Analyzing your thali...</p>
              </div>
            )}
            {!isLoading && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-40">
                    <p className="text-white font-medium bg-black bg-opacity-50 px-4 py-2 rounded-full">Change Photo</p>
                </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center z-10">
            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Meal Photo</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Take a picture of your Thali, Biryani, or Curry. We'll count the macros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};