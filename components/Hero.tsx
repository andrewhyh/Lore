import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-100 leading-tight mb-6">
          Preserve Your Legacy, <br className="hidden md:block" />
          <span className="text-emerald-400">Together.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 mb-10">
          Lore is the AI-powered home for your family and community history. Effortlessly archive memories, visualize relationships, and connect across generations.
        </p>
        <a 
          href="#cta" 
          className="inline-block bg-emerald-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-600 transition-transform transform hover:scale-105 shadow-lg"
        >
          Request Beta
        </a>
      </div>
    </section>
  );
};

export default Hero;
