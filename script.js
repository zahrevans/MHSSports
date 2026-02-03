// Smooth scroll 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

//  navbar scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

//  button click 
document.querySelector('.hero-btn').addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});

// Event card enhanced interactions
document.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('click', function() {
        const title = this.querySelector('h3').textContent;
        console.log('Event selected:', title);
    });
    
    card.addEventListener('mouseenter', function() {
        this.style.animation = 'cardPulse 0.6s ease-out';
    });
});

// Intersection Observer for staggered fade-in animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.animation = 'slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                entry.target.style.animationFillMode = 'forwards';
            }, index * 100);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.event-card, .highlight-card, .contact-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// card pulse
const style = document.createElement('style');
style.textContent = `
    @keyframes cardPulse {
        0% {
            box-shadow: 0 8px 32px rgba(0, 31, 63, 0.12);
        }
        50% {
            box-shadow: 0 16px 40px rgba(0, 31, 63, 0.25);
        }
        100% {
            box-shadow: 0 16px 40px rgba(0, 31, 63, 0.25);
        }
    }
`;
document.head.appendChild(style);
