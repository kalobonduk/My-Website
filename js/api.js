/* ============================================================
   API CONNECTION — Fetches data from backend dynamically
   Backend runs on http://localhost:3000
   ============================================================ */

const API_BASE = 'http://localhost:3000/api';

// Convert any YouTube URL to embed format
function toEmbedUrl(url) {
    if (!url) return '';
    if (url.includes('/embed/')) return url;
    var match = url.match(/[?&]v=([^&]+)/);
    if (match) return 'https://www.youtube.com/embed/' + match[1];
    match = url.match(/youtu\.be\/([^?&]+)/);
    if (match) return 'https://www.youtube.com/embed/' + match[1];
    match = url.match(/youtube\.com\/v\/([^?&]+)/);
    if (match) return 'https://www.youtube.com/embed/' + match[1];
    return url;
}

// ========== Portfolio Page ==========
async function loadPortfolioFromAPI() {
    const container = document.querySelector('.project-container');
    if (!container) return;

    try {
        const res = await fetch(API_BASE + '/portfolio');
        if (!res.ok) return;
        const projects = await res.json();
        if (!projects.length) return;

        // Get all images
        const imgRes = await fetch(API_BASE + '/portfolio-images');
        const allImages = imgRes.ok ? await imgRes.json() : [];

        // Clear existing static content
        container.innerHTML = '';

        projects.forEach((project) => {
            const images = allImages.filter(img => img.portfolio_id === project.id);
            const card = createProjectCard(project, images);
            container.appendChild(card);
        });

        // Re-initialize slideshows
        document.querySelectorAll('.slideshow').forEach(slideshow => {
            startSlideshow(slideshow.id, 3000);
        });

        // Re-bind filter tabs
        rebindFilterTabs();
    } catch (err) {
        console.log('API unavailable, using static content');
    }
}

function createProjectCard(project, images) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-category', project.category || 'work');

    let mediaHTML = '';

    // CARD media logic: depends on image_type and has_video fields
    // image_type controls what IMAGE media shows on card
    // has_video controls whether video shows on card

    if (project.image_type === 'slideshow' && images.length > 0) {
        const slideshowId = 'slideshow-' + project.id;
        mediaHTML = `<div class="slideshow" id="${slideshowId}">`;
        images.forEach((img, i) => {
            const src = img.image_path.startsWith('/') ? img.image_path : '/' + img.image_path;
            mediaHTML += `<img src="${src}" alt="${project.title}" class="slide${i === 0 ? ' active' : ''}">`;
        });
        mediaHTML += '</div>';
    } else if (project.image_type === 'gif' && images.length > 0) {
        const src = images[0].image_path.startsWith('/') ? images[0].image_path : '/' + images[0].image_path;
        mediaHTML = `<img src="${src}" alt="${project.title}" class="project-image">`;
    } else if (project.image_type === 'single' && images.length > 0) {
        const src = images[0].image_path.startsWith('/') ? images[0].image_path : '/' + images[0].image_path;
        mediaHTML = `<img src="${src}" alt="${project.title}" class="project-image">`;
    } else if (project.has_video && project.video_url) {
        // No image — show video in the media slot (above title)
        var embedUrl = toEmbedUrl(project.video_url);
        mediaHTML = `
            <div class="project-video">
                <iframe src="${embedUrl}" title="${project.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        `;
    }
    // image_type === 'none' and no video means no media above title

    card.innerHTML = `
        ${mediaHTML}
        <div class="project-content">
            <h3>${project.title}</h3>
            <p>${project.description || ''}</p>
            <p class="project-skills"><strong>Skills:</strong> ${project.skills || ''}</p>
            ${project.project_page_url ? `<a href="${project.project_page_url}" class="project-button">View Project</a>` : ''}
        </div>
    `;

    return card;
}

function rebindFilterTabs() {
    var filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(function(btn) {
        var newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');

            var filter = this.getAttribute('data-filter');
            document.querySelectorAll('.project-card').forEach(function(card) {
                if (filter === 'all') {
                    card.style.display = '';
                } else if (card.getAttribute('data-category') === filter) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });

            var dontTouchBtn = document.querySelector('.dont-touch-wrapper');
            if (dontTouchBtn) {
                dontTouchBtn.style.display = (filter === 'hobby') ? '' : 'none';
            }
        });
    });
}

// ========== Contact Page ==========
async function loadContactFromAPI() {
    try {
        const res = await fetch(API_BASE + '/contact');
        if (!res.ok) return;
        const contacts = await res.json();
        if (!contacts.length) return;

        const contactInfo = document.querySelector('.contact-info');
        if (!contactInfo) return;

        const email = contacts.find(c => c.type === 'email');
        const location = contacts.find(c => c.type === 'location');

        const contactItems = contactInfo.querySelectorAll('.contact-info-item');
        if (contactItems.length >= 1 && email) {
            const span = contactItems[0].querySelector('span');
            if (span) span.textContent = email.value;
        }
        if (contactItems.length >= 2 && location) {
            const span = contactItems[1].querySelector('span');
            if (span) span.textContent = location.value;
        }

        const facebook = contacts.find(c => c.type === 'facebook');
        const instagram = contacts.find(c => c.type === 'instagram');
        const linkedin = contacts.find(c => c.type === 'linkedin');

        const socialLinks = contactInfo.querySelectorAll('.contact-social a');
        if (socialLinks.length >= 1 && facebook) socialLinks[0].href = facebook.value;
        if (socialLinks.length >= 2 && instagram) socialLinks[1].href = instagram.value;
        if (socialLinks.length >= 3 && linkedin) socialLinks[2].href = linkedin.value;
    } catch (err) {
        console.log('API unavailable, using static contact info');
    }
}

async function submitContactForm(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.querySelector('#formName').value,
        email: form.querySelector('#formEmail').value,
        message: form.querySelector('#formMessage').value
    };

    try {
        const res = await fetch(API_BASE + '/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            form.reset();
            showFormNotification('Message sent successfully!', 'success');
        } else {
            const err = await res.json();
            showFormNotification(err.error || 'Failed to send message', 'error');
        }
    } catch (err) {
        showFormNotification('Unable to connect to server. Please try again later.', 'error');
    }
}

function showFormNotification(message, type) {
    const existing = document.querySelector('.form-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'form-notification ' + type;
    notification.textContent = message;
    notification.style.cssText = `
        padding: 12px 20px;
        margin-top: 15px;
        border-radius: 5px;
        font-size: 14px;
        font-weight: 500;
        ${type === 'success' ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
    `;

    const form = document.getElementById('contactForm');
    form.parentNode.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// ========== Resume Page ==========
async function loadResumeFromAPI() {
    const resumeNav = document.querySelector('.resume-nav');
    if (!resumeNav) return;

    try {
        const res = await fetch(API_BASE + '/resume');
        if (!res.ok) return;
        const entries = await res.json();
        if (!entries.length) return;

        const sections = {};
        entries.forEach(entry => {
            if (!sections[entry.section]) sections[entry.section] = [];
            sections[entry.section].push(entry);
        });

        const sectionNames = {
            'education': 'Education',
            'work_experience': 'Work Experience',
            'leadership': 'Leadership & Extracurriculars',
            'skills': 'Skills',
            'research': 'Research & Publication'
        };

        resumeNav.innerHTML = '';

        Object.keys(sectionNames).forEach(key => {
            const items = sections[key] || [];
            if (!items.length) return;

            const accordion = document.createElement('div');
            accordion.className = 'resume-accordion';

            let bodyHTML = '';
            items.forEach(item => {
                let descriptionHTML = '';
                if (item.description) {
                    try {
                        const bullets = JSON.parse(item.description);
                        if (Array.isArray(bullets)) {
                            descriptionHTML = '<ul>' + bullets.map(b => `<li>${b}</li>`).join('') + '</ul>';
                        } else {
                            descriptionHTML = `<p>${item.description}</p>`;
                        }
                    } catch {
                        descriptionHTML = `<p>${item.description}</p>`;
                    }
                }

                let buttonHTML = '';
                if (item.button_url && item.button_label) {
                    const isExternal = item.button_url.startsWith('http') || item.button_url.endsWith('.pdf');
                    buttonHTML = `<a href="${item.button_url}" class="courses-btn" ${isExternal ? 'target="_blank"' : ''}>${item.button_label}</a>`;
                }

                bodyHTML += `
                    <div class="accordion-item">
                        <h4>${item.title || ''}</h4>
                        ${item.subtitle ? `<p>${item.subtitle}</p>` : ''}
                        ${item.date_range ? `<p class="accordion-date">${item.date_range}</p>` : ''}
                        ${descriptionHTML}
                        ${buttonHTML}
                    </div>
                `;
            });

            accordion.innerHTML = `
                <div class="resume-accordion-header">
                    <span>${sectionNames[key]}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="resume-accordion-body">
                    ${bodyHTML}
                </div>
            `;

            resumeNav.appendChild(accordion);
        });

        // Re-bind accordion toggle
        document.querySelectorAll('.resume-accordion-header').forEach(function(header) {
            header.addEventListener('click', function() {
                var accordion = this.parentElement;
                var isOpen = accordion.classList.contains('open');
                document.querySelectorAll('.resume-accordion').forEach(function(a) { a.classList.remove('open'); });
                if (!isOpen) accordion.classList.add('open');
            });
        });

    } catch (err) {
        console.log('API unavailable, using static resume content');
    }
}

// ========== Auto-initialize based on page ==========
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;

    if (path.includes('portfolio')) {
        loadPortfolioFromAPI();
    } else if (path.includes('contact')) {
        loadContactFromAPI();
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', submitContactForm);
        }
    } else if (path.includes('resume')) {
        loadResumeFromAPI();
    }
});
