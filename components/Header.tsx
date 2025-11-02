import React, { useState } from 'react';

const DinosaurLogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500 fill-current">
        <g transform="rotate(90 50 50) translate(0, 7.5)">
            <path d="M99.28,29.62c-0.3-3.1-1.3-6.2-3.1-8.9c-3.5-5.3-9-8.9-15.3-9.5c-2.3-0.2-4.6,0-6.9,0.5
	c-2.3,0.5-4.6,1.4-6.7,2.5c-4.3,2.3-8,5.7-10.9,9.8c-0.2,0.3-0.4,0.6-0.7,0.8c-1.5,1.9-3.2,3.6-5,5.1c-0.3-0.2-0.5-0.4-0.8-0.6
	c-2.8-1.9-5.9-3.4-9.1-4.5c-3.2-1.1-6.5-1.7-9.8-1.7c-8.9,0-17.5,3.6-23.7,9.8c-6.1,6.1-9.8,14.6-9.8,23.5
	c0,2.6,0.2,5.2,0.7,7.7H1.33c-0.8,0-1.3,0.5-1.3,1.3v4.2c0,0.8,0.5,1.3,1.3,1.3h5.9c-0.2,1.3-0.3,2.6-0.3,3.9
	c0,3.5,0.6,6.9,1.8,10.2c0.2,0.6,0.5,1.1,0.8,1.7c0.3,0.6,0.6,1.1,1,1.7c1.3,1.9,3,3.6,5,4.9c0.5,0.3,1,0.6,1.5,0.9
	c0.5,0.3,1,0.5,1.5,0.7c1,0.4,2,0.7,3,1h10.9c0.8,0,1.3-0.5,1.3-1.3v-4.2c0-0.8-0.5-1.3-1.3-1.3h-4.6
	c0.4-1.2,0.8-2.5,1.1-3.7c0.3-1.2,0.6-2.5,0.8-3.7h8.2c0.8,0,1.3-0.5,1.3-1.3v-4.2c0-0.8-0.5-1.3-1.3-1.3h-3.3
	c0.7-2.3,1.2-4.7,1.6-7.1c0.4-2.4,0.6-4.8,0.7-7.2h28c1.8,7.9,5.2,15.4,10,21.8c4.8,6.4,10.9,11.5,17.9,14.7
	c6.6,3,13.6,4,20.6,2.8c6.9-1.2,13.3-4.5,18.7-9.5c5.3-5,9.5-11.4,12.1-18.7c2.1-5.9,2.8-12.1,2.1-18.2L99.28,29.62z"/>
        </g>
    </svg>
);


const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Testimonials', href: '#testimonials' },
    ];

  return (
    <header className="bg-slate-900/80 backdrop-blur-lg sticky top-0 z-40 w-full border-b border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2">
            <DinosaurLogoIcon />
            <span className="text-xl font-bold text-slate-100">Lore</span>
          </a>
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    {link.name}
                </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
             <a href="#cta" className="hidden md:inline-block bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm">
                Request Beta
            </a>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
              </svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
            <div className="md:hidden py-4">
                <nav className="flex flex-col space-y-4">
                 {navLinks.map((link) => (
                    <a key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-slate-300 hover:text-white transition-colors">
                        {link.name}
                    </a>
                ))}
                <a href="#cta" onClick={() => setIsMenuOpen(false)} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm text-center">
                    Request Beta
                </a>
                </nav>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;