import React from 'react';

const CTA: React.FC = () => {
  return (
    <section id="cta">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-slate-800 rounded-2xl p-10 md:p-16 text-center shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to Start Your Story?
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-300 mb-8">
            Join thousands of others in preserving what matters most. Create your free archive today and invite your community to contribute.
          </p>
          <a
            href="#"
            className="inline-block bg-emerald-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-600 transition-transform transform hover:scale-105 shadow-lg"
          >
            Request Beta
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTA;
