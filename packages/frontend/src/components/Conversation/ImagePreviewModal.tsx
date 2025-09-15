'use client';

import Image from 'next/image';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImagePreviewModal({ imageUrl, onClose }: ImagePreviewModalProps) {
  if (!imageUrl) return null;

  return (
    <div className="modal modal-open" onClick={onClose}>
      <div className="modal-box max-w-4xl p-0 bg-transparent shadow-none">
        <div className="relative">
          <Image
            src={imageUrl}
            alt="Full size image"
            width={800}
            height={600}
            className="w-full h-auto rounded-lg"
          />
          <button 
            className="btn btn-circle btn-sm absolute top-2 right-2"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}