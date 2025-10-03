import PasteTestComponent from '@/components/PasteTestComponent';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function PasteTestPage() {
  return (
    <div className="min-h-screen bg-white font-ui">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Blog Formatting Fix - Test Page
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Test the enhanced paste functionality that preserves formatting from ChatGPT, 
              Canvas, Notion, and other rich text sources.
            </p>
          </div>
          
          <PasteTestComponent />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
