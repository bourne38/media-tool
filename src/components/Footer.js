import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} VideoProcessor - Client-side video processing tool</p>
        <p className="mt-1">All processing happens in your browser - your videos never leave your device.</p>
      </div>
    </footer>
  );
};

export default Footer;