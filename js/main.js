/* ============================================================
   PORTFOLIO WEBSITE — MAIN JAVASCRIPT
   Features: Smooth scroll, active nav highlighting,
             hamburger menu, scroll animations, form validation,
             navbar scroll effect, Lucide icons init
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ===== DOM REFERENCES =====
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const contactForm = document.getElementById('contactForm');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    // Create mobile overlay element
    const overlay = document.createElement('div');
    overlay.classList.add('nav-overlay');
    document.body.appendChild(overlay);

    // ===== NAVBAR SCROLL EFFECT =====
    // Adds shadow when page is scrolled past 50px
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ===== ACTIVE NAV LINK HIGHLIGHTING =====
    // Highlights the nav link corresponding to the currently visible section
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 150; // Offset for navbar height

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach((link) => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ===== HAMBURGER MENU TOGGLE =====
    function toggleMobileMenu() {
        const isOpen = navMenu.classList.contains('open');

        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        navMenu.classList.add('open');
        navToggle.classList.add('open');
        overlay.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    function closeMobileMenu() {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        overlay.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = ''; // Restore scroll
    }

    // Close menu when a nav link is clicked (mobile)
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Close menu when overlay is clicked
    overlay.addEventListener('click', closeMobileMenu);

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('open')) {
            closeMobileMenu();
        }
    });

    // ===== SCROLL ANIMATIONS (Intersection Observer) =====
    // Fades in elements as they enter the viewport
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    animatedElements.forEach((el) => {
        scrollObserver.observe(el);
    });

    // ===== CONTACT FORM VALIDATION =====
    function validateForm(e) {
        e.preventDefault();

        const nameInput = document.getElementById('formName');
        const emailInput = document.getElementById('formEmail');
        const messageInput = document.getElementById('formMessage');
        const nameError = document.getElementById('nameError');
        const emailError = document.getElementById('emailError');
        const messageError = document.getElementById('messageError');
        const formSuccess = document.getElementById('formSuccess');

        let isValid = true;

        // Reset previous errors
        resetFormErrors();

        // Validate Name
        if (!nameInput.value.trim()) {
            showError(nameInput, nameError);
            isValid = false;
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
            showError(emailInput, emailError);
            isValid = false;
        }

        // Validate Message
        if (!messageInput.value.trim()) {
            showError(messageInput, messageError);
            isValid = false;
        }

        // If valid, show success message
        if (isValid) {
            formSuccess.classList.add('visible');
            contactForm.reset();

            // Hide success message after 5 seconds
            setTimeout(() => {
                formSuccess.classList.remove('visible');
            }, 5000);
        }
    }

    function showError(input, errorElement) {
        input.classList.add('invalid');
        errorElement.classList.add('visible');
    }

    function resetFormErrors() {
        const inputs = contactForm.querySelectorAll('input, textarea');
        const errors = contactForm.querySelectorAll('.form-error');
        const formSuccess = document.getElementById('formSuccess');

        inputs.forEach((input) => input.classList.remove('invalid'));
        errors.forEach((error) => error.classList.remove('visible'));
        formSuccess.classList.remove('visible');
    }

    // Remove error styling on input focus
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach((input) => {
        input.addEventListener('focus', () => {
            input.classList.remove('invalid');
            const errorEl = input.parentElement.querySelector('.form-error');
            if (errorEl) errorEl.classList.remove('visible');
        });
    });

    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    // Handles smooth scrolling for all internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== EVENT LISTENERS =====
    window.addEventListener('scroll', () => {
        handleNavbarScroll();
        updateActiveNavLink();
    }, { passive: true });

    navToggle.addEventListener('click', toggleMobileMenu);
    contactForm.addEventListener('submit', validateForm);

    // ===== INITIAL STATE =====
    // Run on page load to set correct states
    handleNavbarScroll();
    updateActiveNavLink();
});
