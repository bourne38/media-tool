import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProcessingProvider } from './context/ProcessingContext';
import { FFmpegProvider } from './context/FFmpegContext';
import Header from './components/Header';
import Home from './pages/Home';
import Convert from './pages/Convert';
import GifMaker from './pages/GifMaker';
import Trim from './pages/Trim';
import Watermark from './pages/Watermark';
import Queue from './pages/Queue';
import Help from './pages/Help';
import TrailerMaker from './pages/TrailerMaker';
import Footer from './components/Footer';
import FFmpegLoader from './components/FFmpegLoader';
import './App.css';

function App() {
  return (
    <FFmpegProvider>
      <ProcessingProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <FFmpegLoader />
            <Header />
            <main className="flex-grow container mx-auto px-4 py-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/convert" element={<Convert />} />
                <Route path="/gif" element={<GifMaker />} />
                <Route path="/trim" element={<Trim />} />
                <Route path="/watermark" element={<Watermark />} />
                <Route path="/trailer" element={<TrailerMaker />} />
                <Route path="/queue" element={<Queue />} />
                <Route path="/help" element={<Help />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ProcessingProvider>
    </FFmpegProvider>
  );
}

export default App;