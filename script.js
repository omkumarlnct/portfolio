// Set dark mode as default and only mode
const html = document.documentElement;
html.setAttribute('data-theme', 'dark');

// Apply content overrides from localStorage (admin panel)
(function applyAdminData() {
    const KEY = 'siteData';
    let data = {};
    try { data = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { data = {}; }
    if (!data || Object.keys(data).length === 0) return;

    // Hero
    if (data.hero) {
        const titleSpan = document.querySelector('.hero-title .highlight');
        const subtitle = document.querySelector('.hero-subtitle');
        const desc = document.querySelector('.hero-description');
        if (data.hero.name && titleSpan) titleSpan.textContent = data.hero.name;
        if (data.hero.subtitle && subtitle) subtitle.textContent = data.hero.subtitle;
        if (data.hero.description && desc) desc.textContent = data.hero.description;
    }

    // Social links (hero + contact sections share same class names)
    if (data.social) {
        document.querySelectorAll('.social-links a[aria-label=\"LinkedIn\"]').forEach(a => {
            if (data.social.linkedin) { a.href = data.social.linkedin; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        });
        document.querySelectorAll('.social-links a[aria-label=\"GitHub\"]').forEach(a => {
            if (data.social.github) { a.href = data.social.github; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        });
        document.querySelectorAll('.social-links a[aria-label=\"Email\"]').forEach(a => {
            if (data.social.email) { a.href = `mailto:${data.social.email}`; }
        });
        const phoneLink = document.querySelector('.contact .contact-item a[href^=\"tel:\"]');
        if (phoneLink && data.social.phone) {
            phoneLink.href = `tel:${data.social.phone.replace(/\\s+/g,'')}`;
            phoneLink.textContent = data.social.phone;
        }
        const locationP = document.querySelector('.contact .contact-item p');
        if (locationP && data.social.location) {
            locationP.textContent = data.social.location;
        }
        const emailLink = document.querySelector('.contact .contact-item a[href^=\"mailto:\"]');
        if (emailLink && data.social.email) {
            emailLink.href = `mailto:${data.social.email}`;
            emailLink.textContent = data.social.email;
        }
    }

    // Resume link (hero button)
    if (data.resume && data.resume.url) {
        const resumeBtn = document.querySelector('.hero-buttons a[download]');
        if (resumeBtn) {
            resumeBtn.href = data.resume.url;
        }
    }
})();

// Send visit to backend
(function sendVisit() {
    const API = window.PORTFOLIO_API || 'http://localhost:4000';
    try {
        fetch(`${API}/api/visit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: window.location.pathname,
                referrer: document.referrer || ''
            })
        }).catch(() => {});
    } catch {}
})();

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Active Navigation Link on Scroll
const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// Navbar Background on Scroll
const navbar = document.querySelector('.navbar');
const scrollProgress = document.querySelector('.scroll-progress');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Update scroll progress
    if (scrollProgress) {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollProgress.style.width = scrolled + '%';
    }
});

// Animate Skill Bars on Scroll
const skillBars = document.querySelectorAll('.skill-progress');
const skillsSection = document.querySelector('#skills');

function animateSkillBars() {
    if (!skillsSection) return;

    const sectionTop = skillsSection.offsetTop;
    const sectionHeight = skillsSection.offsetHeight;
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;

    if (scrollY + windowHeight > sectionTop && scrollY < sectionTop + sectionHeight) {
        skillBars.forEach(bar => {
            const progress = bar.getAttribute('data-progress');
            bar.style.width = progress + '%';
        });
    }
}

// Initial check and scroll listener for skill bars
window.addEventListener('scroll', animateSkillBars);
window.addEventListener('load', animateSkillBars);

// Contact Form Handling -> send to backend
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        if (!name || !email || !subject || !message) {
            alert('Please fill in all fields.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        const API = window.PORTFOLIO_API || 'http://localhost:4000';
        try {
            const res = await fetch(`${API}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message })
            });
            const data = await res.json();
            if (data && data.ok) {
                alert('Thank you for your message! I will get back to you soon.');
                contactForm.reset();
            } else {
                alert('Error sending message. Please try again.');
            }
        } catch {
            alert('Network error. Please try again later.');
        }
    });
}


// Scroll to Top Button (Optional Enhancement)
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.className = 'scroll-to-top';
    button.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(button);

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });
}

createScrollToTopButton();

// Intersection Observer for Fade-in Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            // Trigger skill bar animations when skills section is visible
            if (entry.target.id === 'skills') {
                animateSkillBars();
            }
        }
    });
}, observerOptions);

// Observe all sections for fade-in effect
sections.forEach(section => {
    observer.observe(section);
});

// Enhanced scroll animations
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.skill-item, .project-card, .timeline-item, .certification-card, .stat-item');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Project Cards Hover Effect
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Animate Numbers on Scroll
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-item h3');
    const statsSection = document.querySelector('.about-stats');
    
    if (!statsSection) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNumbers.forEach(stat => {
                    const target = stat.textContent;
                    const isNumber = target.match(/\d+/);
                    
                    if (isNumber) {
                        const finalNumber = parseInt(isNumber[0]);
                        const hasPlus = target.includes('+');
                        const hasPercent = target.includes('%');
                        let current = 0;
                        const increment = finalNumber / 50;
                        const duration = 2000;
                        const stepTime = duration / 50;
                        
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= finalNumber) {
                                stat.textContent = finalNumber + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
                                clearInterval(timer);
                            } else {
                                stat.textContent = Math.floor(current) + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
                            }
                        }, stepTime);
                        
                        observer.unobserve(entry.target);
                    }
                });
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(statsSection);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial active nav link
    if (window.location.hash) {
        const targetSection = document.querySelector(window.location.hash);
        if (targetSection) {
            const navLink = document.querySelector(`.nav-link[href="${window.location.hash}"]`);
            if (navLink) {
                navLinks.forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    } else {
        // Set home as active by default
        const homeLink = document.querySelector('.nav-link[href="#home"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }
    }
    
    // Initialize number animation
    animateNumbers();
});

