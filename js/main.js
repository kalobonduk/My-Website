/* ============================================================
   PORTFOLIO WEBSITE — MAIN JAVASCRIPT
   Features: Smooth scroll, slideshow, Lucide icons
   ============================================================ */

// Page Loader
window.addEventListener('load', function() {
    var loader = document.getElementById('pageLoader');
    if (loader) {
        setTimeout(function() {
            loader.classList.add('hidden');
            document.body.classList.add('loaded');
        }, 400);
    }
});

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function () {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Smooth scroll for nav links
document.querySelectorAll('nav a').forEach(function (link) {
    link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        var targetElement = document.querySelector(targetId);

        if (targetElement) {
            e.preventDefault();
            var navHeight = document.querySelector('nav').offsetHeight;
            var targetPosition = targetElement.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Show name in navbar on scroll
var navName = document.querySelector('.nav-name');
var homeSection = document.getElementById('home');

if (navName && homeSection) {
    window.addEventListener('scroll', function () {
        var homeBottom = homeSection.offsetTop + homeSection.offsetHeight;
        if (window.scrollY > homeBottom - 100) {
            navName.classList.add('visible');
        } else {
            navName.classList.remove('visible');
        }
    });
}

// Slideshow function
function startSlideshow(slideshowId, interval) {

    var slideshow = document.getElementById(slideshowId);

    if (!slideshow) return;

    var slides = slideshow.querySelectorAll(".slide");

    var currentSlide = 0;

    setInterval(function () {

        slides[currentSlide].classList.remove("active");

        currentSlide++;

        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        slides[currentSlide].classList.add("active");

    }, interval);
}

startSlideshow("project2-slideshow", 3000);
startSlideshow("project3-slideshow", 3000);

// Typewriter effect
var typewriterWords = ["PROBLEM SOLVING?", "ANALYZING?", "DATA MINING?", "RESEARCHING?", "LEARNING?"];
var typewriterColors = ["#00ffff", "#0080ff", "#0000ff", "#8000ff", "#ff00ff"];
var wordIndex = 0;
var charIndex = 0;
var isDeleting = false;
var typewriterElement = document.getElementById("typewriter");

function typeWriter() {
    var currentWord = typewriterWords[wordIndex];

    if (isDeleting) {
        typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    typewriterElement.style.color = typewriterColors[wordIndex];

    var speed = 100;

    if (isDeleting) {
        speed = 50;
    }

    if (!isDeleting && charIndex === currentWord.length) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex++;
        if (wordIndex >= typewriterWords.length) {
            wordIndex = 0;
        }
        speed = 500;
    }

    setTimeout(typeWriter, speed);
}

typeWriter();

// Mobile Menu Toggle
var mobileMenuBtn = document.getElementById('mobileMenuBtn');
var mobileMenu = document.getElementById('mobileMenu');
var mobileMenuClose = document.getElementById('mobileMenuClose');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    });
}

if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    });
}

// Close mobile menu when a link is clicked
if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

// Auto-update copyright year
document.querySelectorAll('.copyright-year').forEach(function(el) {
    el.textContent = new Date().getFullYear();
});
