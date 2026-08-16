import React from "react";

const Contact: React.FC = () => {
  return (
    <section className="contact" id="contact">
      <div className="contact-inner shell">
        <div className="contact-heading">
          <h2 className="contact-title">Get in touch</h2>
        </div>

        <nav className="contact-links" aria-label="Contact links">
          <a href="mailto:contact@jggames.dev" className="contact-item">
            <span className="label">Email</span>
            <span className="value">contact@jggames.dev</span>
          </a>
          <a
            href="https://jgibbs.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
          >
            <span className="label">Portfolio</span>
            <span className="value">jgibbs.dev</span>
          </a>
        </nav>

        <footer className="main-footer">
          &copy; {new Date().getFullYear()} Joe Gibbs. All rights reserved.
        </footer>
      </div>
    </section>
  );
};

export default Contact;
