// JavaScript for the Automated API Testing Report

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initSmoothScrolling();
    initActiveNavigation();
    initBackToTop();
    initResponsiveSidebar();
});

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.sidebar__link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerOffset = 20;
                const elementPosition = targetSection.offsetTop;
                const offsetPosition = elementPosition - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Active navigation highlighting based on scroll position
function initActiveNavigation() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.sidebar__link');
    
    function updateActiveNav() {
        let currentSection = '';
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // Update active state
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').substring(1);
            if (href === currentSection) {
                link.classList.add('active');
            }
        });
    }
    
    // Throttle scroll events for better performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveNav, 10);
    });
    
    // Initial call
    updateActiveNav();
}

// Back to top button functionality
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (!backToTopButton) return;
    
    // Show/hide button based on scroll position
    function toggleBackToTop() {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }
    
    // Smooth scroll to top
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(toggleBackToTop, 10);
    });
    
    // Initial call
    toggleBackToTop();
}

// Responsive sidebar functionality
function initResponsiveSidebar() {
    const sidebar = document.getElementById('sidebar');
    
    if (!sidebar) return;
    
    // Handle mobile sidebar behavior
    function handleResize() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            sidebar.style.position = 'static';
            sidebar.style.height = 'auto';
        } else {
            sidebar.style.position = 'sticky';
            sidebar.style.height = '100vh';
        }
    }
    
    // Debounce resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(handleResize, 100);
    });
    
    // Initial call
    handleResize();
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Press 'Home' key to scroll to top
    if (e.key === 'Home' && e.ctrlKey) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Press 'End' key to scroll to bottom
    if (e.key === 'End' && e.ctrlKey) {
        e.preventDefault();
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }
});

// Add intersection observer for section animations (optional enhancement)
function initSectionAnimations() {
    const sections = document.querySelectorAll('.section');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// Initialize section animations if intersection observer is supported
if ('IntersectionObserver' in window) {
    initSectionAnimations();
}

// Accessibility improvements
function enhanceAccessibility() {
    // Add skip link functionality
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Pular para o conteúdo principal';
    skipLink.className = 'sr-only';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--color-primary);
        color: var(--color-btn-primary-text);
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content id for skip link
    const mainContent = document.querySelector('.content');
    if (mainContent) {
        mainContent.id = 'main-content';
        mainContent.setAttribute('tabindex', '-1');
    }
}

// Initialize accessibility enhancements
enhanceAccessibility();

// Performance optimization: Lazy load content if needed
function initLazyLoading() {
    // This could be used for lazy loading images or other content
    // Currently not needed for this text-based report
}

// Error handling for missing elements
function handleMissingElements() {
    const requiredElements = [
        'sidebar',
        'backToTop'
    ];
    
    requiredElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Warning: Required element with id '${elementId}' not found`);
        }
    });
}

// Initialize error handling
handleMissingElements();

// Print functionality enhancement
window.addEventListener('beforeprint', function() {
    // Expand all sections for printing
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.pageBreakInside = 'avoid';
    });
});

// Analytics helper (placeholder for future implementation)
function trackNavigation(sectionId) {
    // This could be used to track which sections users visit most
    // console.log('User navigated to:', sectionId);
}

// Export functions for potential testing or external use
window.ReportAPI = {
    scrollToSection: function(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    scrollToTop: function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    getCurrentSection: function() {
        const sections = document.querySelectorAll('.section');
        const scrollPosition = window.scrollY + 100;
        
        for (let section of sections) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                return section.getAttribute('id');
            }
        }
        return null;
    }
};