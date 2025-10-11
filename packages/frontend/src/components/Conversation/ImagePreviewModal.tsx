'use client';

import Image from 'next/image';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImagePreviewModal({ imageUrl, onClose }: ImagePreviewModalProps) {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 md:p-4" 
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <Image
          src={imageUrl}
          alt="Full size image"
          width={800}
          height={600}
          className="max-w-full max-h-[90vh] w-auto h-auto rounded-lg object-contain"
        />
        <button 
          className="btn btn-circle btn-sm md:btn-md absolute top-2 right-2 bg-base-100/90 hover:bg-base-100"
          onClick={onClose}
          aria-label="Close image preview"
        >
          ✕
        </button>
      </div>
    </div>
  );
}