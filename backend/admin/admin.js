const API = '/api';

// ========== Navigation ==========
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        item.classList.add('active');
        document.getElementById('section-' + item.dataset.section).classList.add('active');
    });
});

// ========== Toast ==========
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ========== File Upload Helper ==========
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(API + '/upload/single', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
}

// ========== Portfolio ==========
let portfolioData = [];
let portfolioFilter = 'all';
let portfolioSort = 'sort_order';

async function loadPortfolio() {
    try {
        const res = await fetch(API + '/portfolio');
        portfolioData = await res.json();
        renderPortfolioTable();
    } catch (err) {
        showToast('Failed to load portfolio', 'error');
    }
}

function getFilteredPortfolio() {
    let data = [...portfolioData];
    if (portfolioFilter !== 'all') {
        data = data.filter(p => p.category === portfolioFilter);
    }
    data.sort((a, b) => {
        if (portfolioSort === 'title') return (a.title || '').localeCompare(b.title || '');
        if (portfolioSort === 'category') return (a.category || '').localeCompare(b.category || '');
        if (portfolioSort === 'latest') return (b.id) - (a.id);
        if (portfolioSort === 'oldest') return (a.id) - (b.id);
        return (a.sort_order || 0) - (b.sort_order || 0);
    });
    return data;
}

function renderPortfolioTable() {
    const filtered = getFilteredPortfolio();
    const tbody = document.querySelector('#portfolio-table tbody');
    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.title || ''}</td>
            <td>${p.category || ''}</td>
            <td>${p.image_type || 'none'}</td>
            <td>${p.sort_order || 0}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editPortfolio(${p.id})">Edit</button>
                <button class="btn btn-danger" onclick="deletePortfolio(${p.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function showPortfolioForm() {
    document.getElementById('portfolio-form-container').style.display = 'block';
    document.getElementById('portfolioForm').reset();
    document.getElementById('portfolio-id').value = '';
    document.getElementById('portfolio-sort-order').value = portfolioData.length + 1;
    loadPortfolioImages('');
}

function hidePortfolioForm() {
    document.getElementById('portfolio-form-container').style.display = 'none';
}

function editPortfolio(id) {
    const p = portfolioData.find(item => item.id === id);
    if (!p) return;
    document.getElementById('portfolio-id').value = p.id;
    document.getElementById('portfolio-title').value = p.title || '';
    document.getElementById('portfolio-category').value = p.category || 'work';
    document.getElementById('portfolio-description').value = p.description || '';
    document.getElementById('portfolio-skills').value = p.skills || '';
    document.getElementById('portfolio-image-type').value = p.image_type || 'none';
    document.getElementById('portfolio-sort-order').value = p.sort_order || 0;
    document.getElementById('portfolio-detail-description').value = p.detail_description || '';
    document.getElementById('portfolio-detail-skills').value = p.detail_skills || '';
    document.getElementById('portfolio-has-video').value = p.has_video ? '1' : '0';
    document.getElementById('portfolio-video-url').value = p.video_url || '';
    document.getElementById('portfolio-form-container').style.display = 'block';
    loadPortfolioImages(p.id);
}

async function savePortfolio(e) {
    e.preventDefault();
    const id = document.getElementById('portfolio-id').value;
    const data = {
        title: document.getElementById('portfolio-title').value,
        category: document.getElementById('portfolio-category').value,
        description: document.getElementById('portfolio-description').value,
        skills: document.getElementById('portfolio-skills').value,
        project_page_url: null,
        image_type: document.getElementById('portfolio-image-type').value,
        sort_order: parseInt(document.getElementById('portfolio-sort-order').value) || 0,
        detail_description: document.getElementById('portfolio-detail-description').value,
        detail_skills: document.getElementById('portfolio-detail-skills').value,
        has_video: document.getElementById('portfolio-has-video').value === '1',
        video_url: document.getElementById('portfolio-video-url').value || null
    };

    try {
        const url = id ? `${API}/portfolio/${id}` : `${API}/portfolio`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            showToast(id ? 'Portfolio updated' : 'Portfolio created');
            hidePortfolioForm();
            loadPortfolio();
        } else {
            const err = await res.json();
            showToast(err.error || 'Save failed', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
}

async function deletePortfolio(id) {
    if (!confirm('Delete this portfolio item? Associated images will also be deleted.')) return;
    try {
        const res = await fetch(`${API}/portfolio/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Portfolio item deleted');
            loadPortfolio();
            loadImages();
        }
    } catch (err) {
        showToast('Delete failed', 'error');
    }
}

// Portfolio inline image management
async function loadPortfolioImages(portfolioId) {
    const container = document.getElementById('portfolio-images-list');
    if (!portfolioId) {
        container.innerHTML = '<p style="font-size:12px;color:#94a3b8;">Save the project first, then add images.</p>';
        return;
    }
    try {
        const res = await fetch(`${API}/portfolio-images/portfolio/${portfolioId}`);
        const imgs = await res.json();
        if (!imgs.length) {
            container.innerHTML = '<p style="font-size:12px;color:#94a3b8;">No images yet.</p>';
            return;
        }
        container.innerHTML = imgs.map(img => `
            <div style="display:inline-flex;align-items:center;gap:6px;margin:4px 6px 4px 0;padding:4px 8px;background:#f1f5f9;border-radius:4px;font-size:12px;">
                <img src="${img.image_path.startsWith('/') ? img.image_path : '/' + img.image_path}" style="width:30px;height:30px;object-fit:cover;border-radius:3px;">
                <span style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${img.image_path.split('/').pop()}</span>
                <button type="button" onclick="removePortfolioImage(${img.id})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;">&times;</button>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '';
    }
}

async function uploadPortfolioImages() {
    const portfolioId = document.getElementById('portfolio-id').value;
    if (!portfolioId) {
        showToast('Save the project first, then upload images', 'error');
        return;
    }
    const fileInput = document.getElementById('portfolio-image-upload');
    const files = fileInput.files;
    if (!files.length) {
        showToast('Select files to upload', 'error');
        return;
    }

    let uploaded = 0;
    for (const file of files) {
        try {
            const result = await uploadFile(file);
            // Add to portfolio_images table
            await fetch(`${API}/portfolio-images`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    portfolio_id: parseInt(portfolioId),
                    image_path: result.url,
                    sort_order: uploaded + 1
                })
            });
            uploaded++;
        } catch (err) {
            showToast('Failed to upload ' + file.name, 'error');
        }
    }

    if (uploaded > 0) {
        showToast(`${uploaded} image(s) uploaded`);
        fileInput.value = '';
        loadPortfolioImages(portfolioId);
        loadImages();
    }
}

async function removePortfolioImage(imageId) {
    if (!confirm('Remove this image?')) return;
    try {
        await fetch(`${API}/portfolio-images/${imageId}`, { method: 'DELETE' });
        const portfolioId = document.getElementById('portfolio-id').value;
        loadPortfolioImages(portfolioId);
        loadImages();
        showToast('Image removed');
    } catch (err) {
        showToast('Failed', 'error');
    }
}

// ========== Portfolio Images ==========
let imagesData = [];
let imagesFilterProject = 'all';

async function loadImages() {
    try {
        const res = await fetch(API + '/portfolio-images');
        imagesData = await res.json();
        renderImagesTable();
        populateImageProjectSelect();
    } catch (err) {
        showToast('Failed to load images', 'error');
    }
}

function getFilteredImages() {
    if (imagesFilterProject === 'all') return imagesData;
    return imagesData.filter(img => img.portfolio_id === parseInt(imagesFilterProject));
}

function renderImagesTable() {
    const filtered = getFilteredImages();
    const tbody = document.querySelector('#images-table tbody');
    tbody.innerHTML = filtered.map(img => {
        const project = portfolioData.find(p => p.id === img.portfolio_id);
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(img.image_path || '');
        const imgSrc = (img.image_path || '').startsWith('/') ? img.image_path : '/' + img.image_path;
        const preview = isImage ? `<img src="${imgSrc}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:6px;">` : '';
        return `
        <tr>
            <td>${img.id}</td>
            <td>${project ? project.title : img.portfolio_id}</td>
            <td>${preview}${img.image_path || ''}</td>
            <td>${img.sort_order || 0}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editImage(${img.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteImage(${img.id})">Delete</button>
            </td>
        </tr>
    `}).join('');
}

function populateImageProjectSelect() {
    const select = document.getElementById('image-portfolio-id');
    select.innerHTML = portfolioData.map(p =>
        `<option value="${p.id}">${p.title}</option>`
    ).join('');

    const filterSelect = document.getElementById('images-filter-project');
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="all">All Projects</option>' +
            portfolioData.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
    }
}

function showImageForm() {
    document.getElementById('image-form-container').style.display = 'block';
    document.getElementById('imageForm').reset();
    document.getElementById('image-id').value = '';
    document.getElementById('image-path').value = '';
    document.getElementById('upload-preview').innerHTML = '';
}

function hideImageForm() {
    document.getElementById('image-form-container').style.display = 'none';
}

function editImage(id) {
    const img = imagesData.find(i => i.id === id);
    if (!img) return;
    document.getElementById('image-id').value = img.id;
    document.getElementById('image-portfolio-id').value = img.portfolio_id;
    document.getElementById('image-path').value = img.image_path || '';
    document.getElementById('image-sort-order').value = img.sort_order || 0;
    document.getElementById('upload-preview').innerHTML = '';
    document.getElementById('image-form-container').style.display = 'block';
}

async function handleImageUpload() {
    const fileInput = document.getElementById('image-file-upload');
    const file = fileInput.files[0];
    if (!file) return;

    try {
        showToast('Uploading...', 'success');
        const result = await uploadFile(file);
        document.getElementById('image-path').value = result.url;
        document.getElementById('upload-preview').innerHTML =
            `<span style="color:#059669;font-size:12px;">Uploaded: ${result.filename}</span>`;
        showToast('File uploaded');
    } catch (err) {
        showToast('Upload failed', 'error');
    }
}

async function saveImage(e) {
    e.preventDefault();
    const id = document.getElementById('image-id').value;
    const data = {
        portfolio_id: parseInt(document.getElementById('image-portfolio-id').value),
        image_path: document.getElementById('image-path').value,
        sort_order: parseInt(document.getElementById('image-sort-order').value) || 0
    };

    if (!data.image_path) {
        showToast('Please upload a file or enter an image path', 'error');
        return;
    }

    try {
        const url = id ? `${API}/portfolio-images/${id}` : `${API}/portfolio-images`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            showToast(id ? 'Image updated' : 'Image added');
            hideImageForm();
            loadImages();
        } else {
            const err = await res.json();
            showToast(err.error || 'Save failed', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
}

async function deleteImage(id) {
    if (!confirm('Delete this image?')) return;
    try {
        const res = await fetch(`${API}/portfolio-images/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Image deleted');
            loadImages();
        }
    } catch (err) {
        showToast('Delete failed', 'error');
    }
}

// ========== Contact ==========
let contactData = [];

async function loadContact() {
    try {
        const res = await fetch(API + '/contact');
        contactData = await res.json();
        renderContactTable();
    } catch (err) {
        showToast('Failed to load contact', 'error');
    }
}

function renderContactTable() {
    const tbody = document.querySelector('#contact-table tbody');
    tbody.innerHTML = contactData.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.type || ''}</td>
            <td>${c.label || ''}</td>
            <td title="${(c.value || '').replace(/"/g, '&quot;')}">${(c.value || '').substring(0, 40)}${(c.value || '').length > 40 ? '...' : ''}</td>
            <td>${c.show_in_nav ? '&#10003;' : ''}</td>
            <td>${c.show_in_contact ? '&#10003;' : ''}</td>
            <td>${c.show_in_mobile_menu ? '&#10003;' : ''}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editContact(${c.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteContact(${c.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function showContactForm() {
    document.getElementById('contact-form-container').style.display = 'block';
    document.getElementById('contactForm').reset();
    document.getElementById('contact-id').value = '';
}

function hideContactForm() {
    document.getElementById('contact-form-container').style.display = 'none';
}

function editContact(id) {
    const c = contactData.find(item => item.id === id);
    if (!c) return;
    document.getElementById('contact-id').value = c.id;
    document.getElementById('contact-type').value = c.type || 'email';
    document.getElementById('contact-label').value = c.label || '';
    document.getElementById('contact-value').value = c.value || '';
    document.getElementById('contact-icon').value = c.icon_class || '';
    document.getElementById('contact-sort-order').value = c.sort_order || 0;
    document.getElementById('contact-show-nav').value = c.show_in_nav ? '1' : '0';
    document.getElementById('contact-show-contact').value = c.show_in_contact ? '1' : '0';
    document.getElementById('contact-show-mobile').value = c.show_in_mobile_menu ? '1' : '0';
    document.getElementById('contact-form-container').style.display = 'block';
}

async function saveContact(e) {
    e.preventDefault();
    const id = document.getElementById('contact-id').value;
    const data = {
        type: document.getElementById('contact-type').value,
        label: document.getElementById('contact-label').value,
        value: document.getElementById('contact-value').value,
        icon_class: document.getElementById('contact-icon').value || null,
        sort_order: parseInt(document.getElementById('contact-sort-order').value) || 0,
        show_in_nav: document.getElementById('contact-show-nav').value === '1',
        show_in_contact: document.getElementById('contact-show-contact').value === '1',
        show_in_mobile_menu: document.getElementById('contact-show-mobile').value === '1'
    };

    try {
        const url = id ? `${API}/contact/${id}` : `${API}/contact`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            showToast(id ? 'Contact updated' : 'Contact created');
            hideContactForm();
            loadContact();
        } else {
            const err = await res.json();
            showToast(err.error || 'Save failed', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
}

async function deleteContact(id) {
    if (!confirm('Delete this contact entry?')) return;
    try {
        const res = await fetch(`${API}/contact/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Contact entry deleted');
            loadContact();
        }
    } catch (err) {
        showToast('Delete failed', 'error');
    }
}

// ========== Messages ==========
let messagesData = [];
let messagesFilter = 'all';
let messagesSort = 'latest';

async function loadMessages() {
    try {
        const res = await fetch(API + '/messages');
        messagesData = await res.json();
        renderMessagesTable();
    } catch (err) {
        showToast('Failed to load messages', 'error');
    }
}

function getFilteredMessages() {
    let data = [...messagesData];
    if (messagesFilter === 'unread') data = data.filter(m => !m.is_read);
    if (messagesFilter === 'read') data = data.filter(m => m.is_read);
    if (messagesSort === 'oldest') data.sort((a, b) => a.id - b.id);
    else data.sort((a, b) => b.id - a.id);
    return data;
}

function renderMessagesTable() {
    const filtered = getFilteredMessages();
    const tbody = document.querySelector('#messages-table tbody');
    tbody.innerHTML = filtered.map(m => {
        const date = m.created_at ? new Date(m.created_at).toLocaleDateString() : '';
        return `
        <tr>
            <td>${m.id}</td>
            <td>${m.name || ''}</td>
            <td>${m.email || ''}</td>
            <td title="${(m.message || '').replace(/"/g, '&quot;')}">${(m.message || '').substring(0, 50)}${(m.message || '').length > 50 ? '...' : ''}</td>
            <td>${date}</td>
            <td><span class="badge ${m.is_read ? 'badge-read' : 'badge-unread'}">${m.is_read ? 'Read' : 'Unread'}</span></td>
            <td class="actions">
                <button class="btn btn-sm" style="background:#6366f1;color:#fff;" onclick="viewMessage(${m.id})">View</button>
                ${!m.is_read ? `<button class="btn btn-sm btn-primary" onclick="markRead(${m.id})">Mark Read</button>` : ''}
                <button class="btn btn-danger" onclick="deleteMessage(${m.id})">Delete</button>
            </td>
        </tr>
    `}).join('');
}

function viewMessage(id) {
    const m = messagesData.find(item => item.id === id);
    if (!m) return;
    document.getElementById('modal-name').textContent = m.name || '';
    document.getElementById('modal-email').textContent = m.email || '';
    document.getElementById('modal-date').textContent = m.created_at ? new Date(m.created_at).toLocaleString() : '';
    document.getElementById('modal-status').innerHTML = `<span class="badge ${m.is_read ? 'badge-read' : 'badge-unread'}">${m.is_read ? 'Read' : 'Unread'}</span>`;
    document.getElementById('modal-message').textContent = m.message || '';
    document.getElementById('messageModal').style.display = 'flex';
    // Auto mark as read when viewed
    if (!m.is_read) markRead(id);
}

function closeMessageModal(e) {
    if (!e || e.target === document.getElementById('messageModal')) {
        document.getElementById('messageModal').style.display = 'none';
    }
}

async function markRead(id) {
    try {
        const res = await fetch(`${API}/messages/${id}/read`, { method: 'PATCH' });
        if (res.ok) {
            showToast('Marked as read');
            loadMessages();
        }
    } catch (err) {
        showToast('Failed', 'error');
    }
}

async function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    try {
        const res = await fetch(`${API}/messages/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Message deleted');
            loadMessages();
        }
    } catch (err) {
        showToast('Delete failed', 'error');
    }
}

// ========== Resume ==========
let resumeData = [];
let resumeFilter = 'all';
let resumeSort = 'section';

async function loadResume() {
    try {
        const res = await fetch(API + '/resume');
        resumeData = await res.json();
        renderResumeTable();
    } catch (err) {
        showToast('Failed to load resume', 'error');
    }
}

function getFilteredResume() {
    let data = [...resumeData];
    if (resumeFilter !== 'all') {
        data = data.filter(r => r.section === resumeFilter);
    }
    data.sort((a, b) => {
        if (resumeSort === 'title') return (a.title || '').localeCompare(b.title || '');
        if (resumeSort === 'date') return (a.date_range || '').localeCompare(b.date_range || '');
        if (resumeSort === 'latest') return b.id - a.id;
        if (resumeSort === 'oldest') return a.id - b.id;
        const sectionOrder = ['education', 'work_experience', 'leadership', 'skills', 'research'];
        return sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section) || (a.sort_order || 0) - (b.sort_order || 0);
    });
    return data;
}

function renderResumeTable() {
    const filtered = getFilteredResume();
    const tbody = document.querySelector('#resume-table tbody');
    tbody.innerHTML = filtered.map(r => `
        <tr>
            <td>${r.id}</td>
            <td>${r.section || ''}</td>
            <td>${r.title || ''}</td>
            <td>${r.subtitle || ''}</td>
            <td>${r.date_range || ''}</td>
            <td>${r.sort_order || 0}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editResume(${r.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteResume(${r.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function showResumeForm() {
    document.getElementById('resume-form-container').style.display = 'block';
    document.getElementById('resumeForm').reset();
    document.getElementById('resume-id').value = '';
    document.getElementById('resume-upload-preview').innerHTML = '';
}

function hideResumeForm() {
    document.getElementById('resume-form-container').style.display = 'none';
}

function editResume(id) {
    const r = resumeData.find(item => item.id === id);
    if (!r) return;
    document.getElementById('resume-id').value = r.id;
    document.getElementById('resume-section').value = r.section || 'education';
    document.getElementById('resume-title').value = r.title || '';
    document.getElementById('resume-subtitle').value = r.subtitle || '';
    document.getElementById('resume-date-range').value = r.date_range || '';
    document.getElementById('resume-description').value = r.description || '';
    document.getElementById('resume-button-label').value = r.button_label || '';
    document.getElementById('resume-button-url').value = r.button_url || '';
    document.getElementById('resume-sort-order').value = r.sort_order || 0;
    document.getElementById('resume-form-container').style.display = 'block';
}

async function saveResume(e) {
    e.preventDefault();
    const id = document.getElementById('resume-id').value;
    const data = {
        section: document.getElementById('resume-section').value,
        title: document.getElementById('resume-title').value,
        subtitle: document.getElementById('resume-subtitle').value || null,
        date_range: document.getElementById('resume-date-range').value || null,
        description: document.getElementById('resume-description').value || null,
        button_label: document.getElementById('resume-button-label').value || null,
        button_url: document.getElementById('resume-button-url').value || null,
        sort_order: parseInt(document.getElementById('resume-sort-order').value) || 0
    };

    try {
        const url = id ? `${API}/resume/${id}` : `${API}/resume`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            showToast(id ? 'Resume entry updated' : 'Resume entry created');
            hideResumeForm();
            loadResume();
        } else {
            const err = await res.json();
            showToast(err.error || 'Save failed', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
}

async function deleteResume(id) {
    if (!confirm('Delete this resume entry?')) return;
    try {
        const res = await fetch(`${API}/resume/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Resume entry deleted');
            loadResume();
        }
    } catch (err) {
        showToast('Delete failed', 'error');
    }
}

async function handleResumeFileUpload() {
    const fileInput = document.getElementById('resume-file-upload');
    const file = fileInput.files[0];
    if (!file) return;

    try {
        showToast('Uploading...', 'success');
        const result = await uploadFile(file);
        document.getElementById('resume-button-url').value = result.url;
        document.getElementById('resume-upload-preview').innerHTML =
            `<span style="color:#059669;font-size:12px;">Uploaded: ${result.filename}</span>`;
        // Auto-fill button label if empty
        const labelField = document.getElementById('resume-button-label');
        if (!labelField.value) {
            labelField.value = 'View';
        }
        showToast('File uploaded');
    } catch (err) {
        showToast('Upload failed', 'error');
    }
}

// ========== Homepage ==========
let homepageData = [];
let homepageFilter = 'all';

async function loadHomepage() {
    try {
        const res = await fetch(API + '/homepage');
        homepageData = await res.json();
        renderHomepageTable();
    } catch (err) {
        showToast('Failed to load homepage', 'error');
    }
}

function getFilteredHomepage() {
    if (homepageFilter === 'all') return homepageData;
    return homepageData.filter(h => h.section === homepageFilter);
}

function renderHomepageTable() {
    const filtered = getFilteredHomepage();
    const tbody = document.querySelector('#homepage-table tbody');
    tbody.innerHTML = filtered.map(h => {
        const val = (h.content_value || '').substring(0, 60) + ((h.content_value || '').length > 60 ? '...' : '');
        return `
        <tr>
            <td>${h.id}</td>
            <td>${h.section || ''}</td>
            <td>${h.content_key || ''}</td>
            <td title="${(h.content_value || '').replace(/"/g, '&quot;')}">${val}</td>
            <td>${h.content_type || 'text'}</td>
            <td>${h.sort_order || 0}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editHomepage(${h.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteHomepage(${h.id})">Delete</button>
            </td>
        </tr>
    `}).join('');
}

function showHomepageForm() {
    document.getElementById('homepage-form-container').style.display = 'block';
    document.getElementById('homepageForm').reset();
    document.getElementById('homepage-id').value = '';
    document.getElementById('homepage-upload-preview').innerHTML = '';
}

function hideHomepageForm() {
    document.getElementById('homepage-form-container').style.display = 'none';
}

function editHomepage(id) {
    const h = homepageData.find(item => item.id === id);
    if (!h) return;
    document.getElementById('homepage-id').value = h.id;
    document.getElementById('homepage-section').value = h.section || 'hero';
    document.getElementById('homepage-key').value = h.content_key || '';
    document.getElementById('homepage-value').value = h.content_value || '';
    document.getElementById('homepage-type').value = h.content_type || 'text';
    document.getElementById('homepage-sort-order').value = h.sort_order || 0;
    document.getElementById('homepage-upload-preview').innerHTML = '';
    document.getElementById('homepage-form-container').style.display = 'block';
}

async function saveHomepage(e) {
    e.preventDefault();
    const id = document.getElementById('homepage-id').value;
    const data = {
        section: document.getElementById('homepage-section').value,
        content_key: document.getElementById('homepage-key').value,
        content_value: document.getElementById('homepage-value').value,
        content_type: document.getElementById('homepage-type').value,
        sort_order: parseInt(document.getElementById('homepage-sort-order').value) || 0
    };

    try {
        const url = id ? `${API}/homepage/${id}` : `${API}/homepage`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            showToast(id ? 'Entry updated' : 'Entry created');
            hideHomepageForm();
            loadHomepage();
        } else {
            const err = await res.json();
            showToast(err.error || 'Save failed', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
}

async function deleteHomepage(id) {
    if (!confirm('Delete this entry?')) return;
    try {
        const res = await fetch(`${API}/homepage/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Entry deleted');
            loadHomepage();
        }
    } catch (err) {
        showToast('Delete failed', 'error');
    }
}

async function handleHomepageFileUpload() {
    const fileInput = document.getElementById('homepage-file-upload');
    const file = fileInput.files[0];
    if (!file) return;
    try {
        showToast('Uploading...', 'success');
        const result = await uploadFile(file);
        document.getElementById('homepage-value').value = result.url;
        document.getElementById('homepage-upload-preview').innerHTML =
            `<span style="color:#059669;font-size:12px;">Uploaded: ${result.filename}</span>`;
        showToast('File uploaded');
    } catch (err) {
        showToast('Upload failed', 'error');
    }
}

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
    loadPortfolio();
    loadImages();
    loadContact();
    loadMessages();
    loadResume();
    loadHomepage();

    // Filter/Sort event listeners
    document.getElementById('portfolio-filter-category').addEventListener('change', function() {
        portfolioFilter = this.value;
        renderPortfolioTable();
    });
    document.getElementById('portfolio-sort').addEventListener('change', function() {
        portfolioSort = this.value;
        renderPortfolioTable();
    });
    document.getElementById('images-filter-project').addEventListener('change', function() {
        imagesFilterProject = this.value;
        renderImagesTable();
    });
    document.getElementById('messages-filter-status').addEventListener('change', function() {
        messagesFilter = this.value;
        renderMessagesTable();
    });
    document.getElementById('messages-sort').addEventListener('change', function() {
        messagesSort = this.value;
        renderMessagesTable();
    });
    document.getElementById('resume-filter-section').addEventListener('change', function() {
        resumeFilter = this.value;
        renderResumeTable();
    });
    document.getElementById('resume-sort').addEventListener('change', function() {
        resumeSort = this.value;
        renderResumeTable();
    });
    document.getElementById('homepage-filter-section').addEventListener('change', function() {
        homepageFilter = this.value;
        renderHomepageTable();
    });
});
