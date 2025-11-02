import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-200 min-h-screen relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <Features />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
      <ChatBot />
    </div>
  );
};

export default App;
