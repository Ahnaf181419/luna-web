import React, { useState, useEffect } from 'react';
import { Search, Compass } from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Thesis', href: '#thesis' },
    { label: 'Theory & Fusion', href: '#theory' },
    { label: '3D Cutaway', href: '#cutaway' },
    { label: '3D Globe', href: '#observatory' },
    { label: 'Candidate Atlas', href: '#atlas' },
    { label: 'Gates & Journey', href: '#gates' },
    { label: 'Compute Ledger', href: '#ledger' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-space-950/90 backdrop-blur-md border-b border-space-700/80 py-2.5 shadow-2xl'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <a href="#" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-mono font-black text-white text-xs tracking-wider shadow-lg shadow-blue-900/30 group-hover:bg-blue-500 transition">
            LV
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm tracking-wider text-zinc-100">
                LUNARVOID
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/60">
                GATE G2 REVIEW
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono hidden md:block">
              Calibrated Subsurface Inference
            </p>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs font-mono text-zinc-400">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-2.5 py-1 rounded hover:text-zinc-100 hover:bg-space-850 transition"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Tools: Quick Command Search */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center space-x-2 px-3 py-1.5 rounded bg-space-850/80 hover:bg-space-800 border border-space-700 text-zinc-300 hover:text-white text-xs font-mono transition shadow-sm"
            title="Search Project Catalog (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline text-[11px]">Search Catalog</span>
            <kbd className="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded bg-space-950 border border-space-700 text-zinc-400">
              ⌘K
            </kbd>
          </button>

          <a
            href="#observatory"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold transition shadow-md shadow-blue-950"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Launch 3D</span>
          </a>
        </div>
      </div>

      {/* Reading Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-space-800">
        <div
          className="h-full bg-blue-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </header>
  );
};
