import { tsParticles } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Initialize particles with enhanced configuration
async function loadParticles(options) {
    await loadFull(tsParticles); // Load full preset for more options
    await tsParticles.load({ id: "tsparticles", options });
}

// Enhanced particles configuration for a more design-oriented look
const particleConfig = {
    fullScreen: {
        enable: true,
        zIndex: 0
    },
    fpsLimit: 60,
    interactivity: {
        events: {
            onHover: {
                enable: true,
                mode: ["bubble", "connect"],
            },
            onClick: {
                enable: true,
                mode: "push",
            },
            resize: {
                enable: true,
                density: {
                    enable: true,
                    area: 800,
                }
            }
        },
        modes: {
            bubble: {
                distance: 200,
                duration: 2,
                opacity: 0.8,
                size: 8,
                speed: 3,
                color: {
                    value: "#ffffff"
                }
            },
            connect: {
                distance: 80,
                radius: 100,
                links: {
                    opacity: 0.3,
                }
            },
            push: {
                quantity: 4,
            },
            repulse: {
                distance: 100,
                duration: 0.4,
            },
        },
    },
    particles: {
        color: {
            value: "#ffffff",
        },
        links: {
            color: "random",
            distance: 150,
            enable: true,
            opacity: 0.3,
            width: 1,
            triangles: {
                enable: true,
                opacity: 0.05
            }
        },
        collisions: {
            enable: true,
        },
        move: {
            enable: true,
            speed: 0.5,
            direction: "none",
            random: true,
            straight: false,
            outMode: "bounce",
            attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200,
            },
            trail: {
                enable: true,
                length: 3,
                fillColor: "#000000"
            }
        },
        number: {
            density: {
                enable: true,
                area: 800,
            },
            value: 50,
        },
        opacity: {
            value: { min: 0.1, max: 0.4 },
            animation: {
                enable: true,
                speed: 1,
                minimumValue: 0.1,
                sync: false
            }
        },
        shape: {
            type: ["circle", "triangle", "polygon"],
        },
        size: {
            value: { min: 1, max: 3 },
            animation: {
                enable: true,
                speed: 2,
                minimumValue: 0.5,
                sync: false
            }
        },
    },
    detectRetina: true,
};

// Initialize scroll-based animations and interactive elements
function initAnimations() {
    // Initialize GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Navigation scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.main-nav');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Glitch effect timing adjustment
    const glitchText = document.querySelector('.glitch-text');
    if (glitchText) {
        glitchText.addEventListener('mouseover', () => {
            glitchText.style.animationDuration = '0.5s';
        });
        
        glitchText.addEventListener('mouseout', () => {
            glitchText.style.animationDuration = '3s';
        });
    }
    
    // Hero section animations
    gsap.from('.hero-content h1', {
        duration: 1.5,
        opacity: 0,
        y: 50,
        ease: "power3.out"
    });
    
    gsap.from('.reveal-text', {
        duration: 1.2,
        opacity: 0,
        y: 30,
        delay: 0.8,
        ease: "power3.out"
    });
    
    gsap.from('.cta-button', {
        duration: 1,
        opacity: 0,
        y: 20,
        delay: 1.2,
        ease: "power3.out"
    });
    
    // Section animations on scroll
    const sections = document.querySelectorAll('section:not(.hero-section)');
    sections.forEach(section => {
        // Section header animations
        const header = section.querySelector('.section-header');
        if (header) {
            gsap.from(header, {
                scrollTrigger: {
                    trigger: header,
                    start: "top 80%",
                    toggleActions: "play none none none"
                },
                duration: 1,
                opacity: 0,
                x: -50,
                ease: "power3.out"
            });
        }
        
        // Section content animations
        const content = section.querySelectorAll(':scope > div:not(.section-header)');
        if (content.length) {
            gsap.from(content, {
                scrollTrigger: {
                    trigger: content,
                    start: "top 75%",
                    toggleActions: "play none none none"
                },
                duration: 1.2,
                opacity: 0,
                y: 50,
                stagger: 0.2,
                ease: "power3.out"
            });
        }
    });
    
    // Add special animation for trailer
    const trailerContainer = document.querySelector('.trailer-container');
    if (trailerContainer) {
        gsap.from(trailerContainer, {
            scrollTrigger: {
                trigger: trailerContainer,
                start: "top 75%",
                toggleActions: "play none none none"
            },
            duration: 1.5,
            opacity: 0,
            y: 80,
            ease: "power3.out"
        });
    }
    
    // Add animations for game info elements
    const gameInfoContainer = document.querySelector('.game-info-container');
    if (gameInfoContainer) {
        // Logo animation
        gsap.from('.game-logo img', {
            scrollTrigger: {
                trigger: gameInfoContainer,
                start: "top 75%",
                toggleActions: "play none none none"
            },
            duration: 1.2,
            opacity: 0,
            scale: 0.8,
            ease: "back.out(1.7)"
        });
        
        // Game details staggered animation
        gsap.from('.game-details > *', {
            scrollTrigger: {
                trigger: gameInfoContainer,
                start: "top 75%",
                toggleActions: "play none none none"
            },
            duration: 0.8,
            opacity: 0,
            y: 30,
            stagger: 0.15,
            ease: "power2.out"
        });
        
        // Features pop-in animation
        gsap.from('.feature', {
            scrollTrigger: {
                trigger: '.game-features',
                start: "top 80%",
                toggleActions: "play none none none"
            },
            duration: 0.5,
            opacity: 0,
            y: 20,
            scale: 0.9,
            stagger: 0.1,
            ease: "back.out(1.7)"
        });
        
        // Game unique selling point animation
        gsap.from('.game-unique-selling-point', {
            scrollTrigger: {
                trigger: '.game-unique-selling-point',
                start: "top 85%"
            },
            duration: 0.8,
            opacity: 0,
            x: -30,
            ease: "power2.out"
        });
    }
    
    // Extended details animation
    const gameDetailsExtended = document.querySelector('.game-details-extended');
    if (gameDetailsExtended) {
        gsap.from('.detail-column', {
            scrollTrigger: {
                trigger: gameDetailsExtended,
                start: "top 80%"
            },
            duration: 0.8,
            opacity: 0,
            y: 50,
            stagger: 0.15,
            ease: "power2.out"
        });
    }
    
    // Interactive hover effects
    const addHoverEffects = () => {
        const gameInfo = document.querySelector('.game-info-container');
        if (gameInfo) {
            gameInfo.addEventListener('mouseenter', () => {
                gsap.to(gameInfo, {
                    y: -10,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            gameInfo.addEventListener('mouseleave', () => {
                gsap.to(gameInfo, {
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out"
                });
            });
        }
        
        // Feature hover effect
        const features = document.querySelectorAll('.feature');
        features.forEach(feature => {
            feature.addEventListener('mouseenter', () => {
                gsap.to(feature, {
                    y: -5,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                    duration: 0.2
                });
            });
            
            feature.addEventListener('mouseleave', () => {
                gsap.to(feature, {
                    y: 0,
                    boxShadow: "none",
                    duration: 0.3
                });
            });
        });
    };
    
    addHoverEffects();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Load particles
    await loadParticles(particleConfig);
    
    // Adjust particle colors for white sections
    const whiteSection = document.querySelector('.section-white');
    if (whiteSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // When white section is in view, make particles darker and more visible
                const particles = tsParticles.domItem(0);
                if (particles) {
                    if (entry.isIntersecting) {
                        particles.options.particles.color.value = "#222222";
                        particles.options.particles.links.color = "#333333";
                        particles.options.particles.opacity.value = { min: 0.3, max: 0.6 }; // Higher opacity
                        particles.refresh(); // Force refresh to apply changes
                    } else {
                        particles.options.particles.color.value = "#ffffff";
                        particles.options.particles.links.color = "random";
                        particles.options.particles.opacity.value = { min: 0.1, max: 0.4 }; // Original opacity
                        particles.refresh(); // Force refresh to apply changes
                    }
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(whiteSection);
    }
    
    // Initialize animations after a slight delay to ensure DOM is ready
    setTimeout(initAnimations, 100);
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop,
                    behavior: 'smooth'
                });
                
                // Update active navigation link
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
});

// Update active nav based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}); 