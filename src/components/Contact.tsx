import React from 'react';
import FadeIn from './FadeIn';
import EmbersBackground from './EmbersBackground';

const Contact: React.FC = () => {
  return (
    <section className="full-height bg-black" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Full-screen embers background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <EmbersBackground />
      </div>
      
      {/* Content overlay */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2rem' }}>
        <FadeIn>
          <h2 className="title text-center">Connect</h2>
          <div className="contact-links" style={{ marginTop: '2rem' }}>
            <a href="mailto:contact@jggames.dev" className="contact-item">
              <span className="label">Email</span>
              <span className="value">contact@jggames.dev</span>
            </a>
            <a href="https://jgibbs.dev" target="_blank" rel="noopener noreferrer" className="contact-item">
              <span className="label">Portfolio</span>
              <span className="value">jgibbs.dev</span>
            </a>
          </div>
        </FadeIn>
        
        <FadeIn delay={400}>
            <footer className="main-footer">
            &copy; {new Date().getFullYear()} Joe Gibbs. All rights reserved.
            </footer>
        </FadeIn>
      </div>
    </section>
  );
};

export default Contact;
