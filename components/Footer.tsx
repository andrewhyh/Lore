import React from 'react';

const DinosaurLogoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500 fill-current">
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

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
                <DinosaurLogoIcon/>
                <span className="font-bold text-slate-200">Lore</span>
            </div>
            <p className="text-sm text-slate-400 text-center md:text-left">
                &copy; {new Date().getFullYear()} Lore Inc. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
                <a href="#" className="text-slate-400 hover:text-white">Privacy</a>
                <a href="#" className="text-slate-400 hover:text-white">Terms</a>
                <a href="#" className="text-slate-400 hover:text-white">Contact</a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;