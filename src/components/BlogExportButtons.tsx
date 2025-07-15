"use client";

import { useState } from 'react';
import { FaFilePdf, FaImage, FaDownload } from 'react-icons/fa';

interface BlogExportButtonsProps {
  slug: string;
  title: string;
}

export default function BlogExportButtons({ slug, title }: BlogExportButtonsProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const generatePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      
      const response = await fetch(`/api/blogs/${slug}/generate-pdf`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generateImage = async () => {
    try {
      setIsGeneratingImage(true);
      
      const response = await fetch(`/api/blogs/${slug}/generate-image`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-preview.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FaDownload className="w-5 h-5" />
        Export Options
      </h3>
      
      <div className="flex flex-wrap gap-4">
        <button
          onClick={generatePdf}
          disabled={isGeneratingPdf}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isGeneratingPdf
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5'
          } text-white`}
        >
          <FaFilePdf className="w-4 h-4" />
          {isGeneratingPdf ? 'Generating PDF...' : 'Download as PDF'}
        </button>

        <button
          onClick={generateImage}
          disabled={isGeneratingImage}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isGeneratingImage
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'
          } text-white`}
        >
          <FaImage className="w-4 h-4" />
          {isGeneratingImage ? 'Generating Image...' : 'Download as Image'}
        </button>
      </div>

      <p className="text-sm text-gray-600 mt-3">
        Generate PDF for offline reading or create a social media preview image.
      </p>
    </div>
  );
} 