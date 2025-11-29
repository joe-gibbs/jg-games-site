import React, { useEffect, useRef } from 'react';

const EmbersBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    interface Ember {
      x: number;
      y: number;
      prevX: number;
      prevY: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      maxLife: number;
      heat: number;
      drag: number;
      gravity: number;
      turbulencePhase: number;
      rotationSpeed: number;
    }

    const embers: Ember[] = [];
    const MAX_EMBERS = 45;

    const createEmber = (): Ember => {
      const spawnX = width * 0.1 + Math.random() * width * 0.8;
      const spawnY = height + 10;
      
      // Strongly upward with minimal horizontal spread
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
      const speed = 2 + Math.random() * 3;
      
      return {
        x: spawnX,
        y: spawnY,
        prevX: spawnX,
        prevY: spawnY + 5,
        vx: Math.cos(angle) * speed * 0.3, // Reduce horizontal velocity
        vy: Math.sin(angle) * speed,        // Keep strong upward velocity
        size: 2 + Math.random() * 3,
        life: 0,
        maxLife: 200 + Math.random() * 300,
        heat: 0.5 + Math.random() * 0.5,
        drag: 0.99 + Math.random() * 0.008,
        gravity: -0.03 - Math.random() * 0.04, // Stronger upward pull
        turbulencePhase: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      };
    };

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      
      embers.length = 0;
      for (let i = 0; i < MAX_EMBERS * 0.6; i++) {
        const ember = createEmber();
        ember.y = Math.random() * height;
        ember.x = Math.random() * width;
        ember.prevX = ember.x;
        ember.prevY = ember.y;
        ember.life = Math.random() * ember.maxLife * 0.5;
        embers.push(ember);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    let frameCount = 0;

    const animate = () => {
      frameCount++;
      
      // Fade previous frame for motion trail
      ctx.fillStyle = 'rgba(5, 2, 0, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Spawn new embers
      if (embers.length < MAX_EMBERS && frameCount % 4 === 0) {
        embers.push(createEmber());
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        
        // Store previous position for motion blur
        e.prevX = e.x;
        e.prevY = e.y;
        
        e.life++;
        
        // Turbulence - mostly horizontal sway, minimal vertical
        const turbX = Math.sin(frameCount * 0.012 + e.turbulencePhase) * 0.08;
        e.vx += turbX + (Math.random() - 0.5) * 0.04;
        
        // Buoyancy
        e.vy += e.gravity;
        
        // Drag
        e.vx *= e.drag;
        e.vy *= e.drag;
        
        // Move
        e.x += e.vx;
        e.y += e.vy;
        
        // Wrap
        if (e.x < -30) e.x = width + 30;
        if (e.x > width + 30) e.x = -30;

        const lifeRatio = e.life / e.maxLife;
        const currentHeat = e.heat * (1 - lifeRatio * 0.6);
        const currentSize = e.size * (1 - lifeRatio * 0.4);
        
        // Alpha with fade in/out
        let alpha = 1;
        if (lifeRatio < 0.05) {
          alpha = lifeRatio / 0.05;
        } else if (lifeRatio > 0.6) {
          alpha = (1 - lifeRatio) / 0.4;
        }
        
        // Flicker
        const flicker = 0.75 + 0.25 * Math.sin(frameCount * 0.25 + e.turbulencePhase * 8);
        alpha *= flicker;

        // Color
        let r, g, b;
        if (currentHeat > 0.7) {
          r = 255;
          g = 180 + currentHeat * 70;
          b = 80 + currentHeat * 120;
        } else if (currentHeat > 0.4) {
          r = 255;
          g = 60 + currentHeat * 160;
          b = 10 + currentHeat * 30;
        } else {
          r = 160 + currentHeat * 95;
          g = 30 + currentHeat * 70;
          b = 5 + currentHeat * 15;
        }

        // Calculate motion blur direction and length
        const dx = e.x - e.prevX;
        const dy = e.y - e.prevY;
        const speed = Math.sqrt(dx * dx + dy * dy);
        const trailLength = Math.min(speed * 4, 25); // Cap trail length
        
        if (trailLength > 1) {
          // Normalize direction
          const nx = dx / speed;
          const ny = dy / speed;
          
          // Draw motion blur trail
          const trailSteps = Math.ceil(trailLength / 2);
          for (let t = trailSteps; t >= 0; t--) {
            const trailRatio = t / trailSteps;
            const tx = e.x - nx * trailLength * trailRatio;
            const ty = e.y - ny * trailLength * trailRatio;
            const trailAlpha = alpha * (1 - trailRatio) * 0.6;
            const trailSize = currentSize * (1 - trailRatio * 0.5);
            
            // Trail glow
            const glowGradient = ctx.createRadialGradient(tx, ty, 0, tx, ty, trailSize * 3);
            glowGradient.addColorStop(0, `rgba(${r}, ${g * 0.5}, ${b * 0.3}, ${trailAlpha * 0.5})`);
            glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.beginPath();
            ctx.arc(tx, ty, trailSize * 3, 0, Math.PI * 2);
            ctx.fillStyle = glowGradient;
            ctx.fill();
          }
        }

        // Main glow
        const glowSize = currentSize * 5;
        const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, glowSize);
        gradient.addColorStop(0, `rgba(${r}, ${g * 0.6}, ${b * 0.4}, ${alpha * 0.7})`);
        gradient.addColorStop(0.3, `rgba(${r * 0.8}, ${g * 0.3}, 0, ${alpha * 0.3})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(e.x, e.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(e.x, e.y, currentSize * flicker, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
        
        // Hot white center for brightest embers
        if (currentHeat > 0.6) {
          ctx.beginPath();
          ctx.arc(e.x, e.y, currentSize * 0.4 * flicker, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 240, ${alpha * currentHeat * 0.8})`;
          ctx.fill();
        }

        // Remove dead
        if (e.life >= e.maxLife || e.y < -60) {
          embers.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'block',
      }} 
    />
  );
};

export default EmbersBackground;
