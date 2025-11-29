import React from 'react';
import FadeIn from './FadeIn';

const Hero: React.FC = () => {
  return (
    <section className="full-height bg-black text-center">
      <div className="hero-content">
        <img src="/logo.png" alt="JG Games Logo" className="hero-logo" />
        
        <FadeIn delay={500}>
            <h1 className="title">JG Games</h1>
        </FadeIn>
      </div>
    </section>
  );
};

export default Hero;
