import React, { useEffect, useRef, useState } from 'react';

const IntroAnimation: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = 2.0;
      
      // Play attempt (some browsers require interaction, but muted usually works)
      video.play().catch(err => {
        console.warn("Video autoplay failed:", err);
        // If autoplay fails, we might want to just remove the overlay or show a play button.
        // For this requirement, we'll just hide it if it fails to play to avoid a stuck black screen.
        setIsFading(true);
        setTimeout(() => setIsVisible(false), 1000); 
      });
    }
  }, []);

  const handleVideoEnd = () => {
    setIsFading(true);
    // Wait for transition to finish before removing from DOM
    setTimeout(() => {
      setIsVisible(false);
    }, 1000); // Matches CSS transition duration
  };

  if (!isVisible) return null;

  return (
    <div className={`intro-overlay ${isFading ? 'fade-out' : ''}`}>
      <video
        ref={videoRef}
        src="/logo.mp4"
        className="intro-video"
        muted
        playsInline
        onEnded={handleVideoEnd}
      />
    </div>
  );
};

export default IntroAnimation;

