import { tsParticles } from "@tsparticles/engine";
// import { loadAll } from "tsparticles-all"; // if you are going to use `loadAll`, install the "tsparticles-all" package too.
// import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
import { loadBasic } from "@tsparticles/basic"; // if you are going to use `loadBasic`, install the "@tsparticles/basic" package too.
// import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.

async function loadParticles(options) {
    await loadBasic(tsParticles); // Load the basic preset bundle

    await tsParticles.load({ id: "tsparticles", options });
}



const configs = {
    background: {
        color: {
            value: "#0a0a0a", // Match CSS background
        },
    },
    fpsLimit: 60,
    interactivity: {
        events: {
            onHover: {
                enable: true,
                mode: "repulse", // Repulse particles on hover
            },
            onClick: {
                enable: true,
                mode: "push", // Push particles on click
            },
            resize: {
                enable: true
            }
        },
        modes: {
            push: { // Configuration for the push interaction
                quantity: 4,
            },
            repulse: {
                distance: 100, // Interaction radius
                duration: 0.4,
                factor: 50, // Repulsion strength
                speed: 1,
                maxSpeed: 50,
                easing: "ease-out-quad",
                divs: {
                  distance: 200,
                  duration: 0.4,
                  factor: 100,
                  speed: 1,
                  maxSpeed: 50,
                  easing: "ease-out-quad",
                  selectors: [],
                },
            },
        },
    },
    particles: {
        color: {
            value: "#888", // Default particle color
        },
        links: {
            color: "#666", // Color of lines between particles (slightly darker grey)
            distance: 150,
            enable: true, // Enable connecting lines
            opacity: 0.4, // Make lines somewhat faint
            width: 1,
        },
        move: {
            direction: "none",
            enable: true,
            outModes: {
                default: "out", // Particles disappear off screen
            },
            random: true,
            speed: 0.5, // Slow drift speed
            straight: false,
        },
        number: {
            density: {
                enable: true,
                area: 1000, // Adjust density
            },
            value: 80, // Base number of particles
        },
        opacity: {
            value: 0.6,
        },
        shape: {
            type: "circle",
        },
        size: {
            value: { min: 1, max: 4 }, // Random size between 1 and 4
        },
        // Change color on hover (Requires custom particle update)
        // This is more complex in tsparticles v2, often done via interaction modes
        // The repulse mode itself doesn't directly change color, but we can simulate
        // by adding an attractor or other interactive element if needed.
        // For now, we'll rely on the visual effect of repulsion.
    },
    detectRetina: true,
};

loadParticles(configs); 