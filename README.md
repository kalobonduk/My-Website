# Shahrier Hossain Fahim — Personal Portfolio Website

A modern, minimal, and fully responsive single-page portfolio website built with plain HTML5, CSS3, and vanilla JavaScript.

## Live Preview

Open `index.html` directly in any modern browser — no build step or server required.

## Project Structure

```
My Website/
├── index.html          # Main single-page HTML (all 6 sections)
├── css/
│   └── style.css       # Complete stylesheet (mobile-first, responsive)
├── js/
│   └── main.js         # Smooth scroll, nav highlighting, animations, form validation
├── assets/             # Placeholder for images/media (profile photo, etc.)
└── README.md           # This file
```

## Features

- **Single-page layout** with smooth-scroll anchor navigation (Home, About, Expertise, Projects, Education, Contact)
- **Sticky navbar** with active section highlighting that updates as you scroll
- **Mobile hamburger menu** with overlay, keyboard (Escape) close, and body scroll lock
- **Scroll animations** — elements fade/slide in as they enter the viewport (IntersectionObserver)
- **Contact form** with client-side validation (name, email format, message required)
- **Fully responsive** — mobile-first CSS with breakpoints at 640px, 768px, 1024px, and 1280px
- **Accessible** — semantic HTML5, ARIA labels, proper heading hierarchy, alt text placeholders
- **Modern design** — custom color palette, Poppins + Inter typography, rounded cards, subtle shadows, hover transitions

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Markup     | HTML5 (semantic)                            |
| Styling    | CSS3 (custom properties, flexbox, grid)     |
| JavaScript | Vanilla ES6+ (no frameworks)                |
| Icons      | Lucide Icons (CDN)                          |
| Fonts      | Google Fonts — Poppins & Inter              |

## How to Run

1. **Clone or download** this folder to your machine.
2. **Open `index.html`** in a web browser (Chrome, Firefox, Edge, Safari).
3. That's it — no dependencies to install, no build process needed.

### Optional: Local Dev Server

If you prefer a local server (for testing, live-reload, etc.):

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using VS Code
# Install "Live Server" extension → right-click index.html → "Open with Live Server"
```

## Contact Form — Backend Note

The contact form includes full **client-side validation** (required fields, email format). However, it does **not** send emails out of the box. To enable real submissions, connect one of these services:

- **[Formspree](https://formspree.io/)** — add your Formspree endpoint as the form `action`
- **[EmailJS](https://www.emailjs.com/)** — integrate their SDK in `js/main.js`
- **[Netlify Forms](https://docs.netlify.com/forms/setup/)** — add `netlify` attribute to the form if deploying on Netlify

## Color Palette

| Role       | Color     | Hex       |
|------------|-----------|-----------|
| Primary    | Deep Navy | `#0F172A` |
| Background | Off-white | `#F8FAFC` |
| Body Text  | Dark Gray | `#334155` |
| Accent     | Electric Blue | `#2563EB` |

## Browser Support

Tested and works in all modern browsers:
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Customization

- **Profile photo**: Replace the icon placeholder in the hero section with an `<img>` tag pointing to your photo in `assets/`.
- **Colors**: Edit CSS custom properties in `:root` at the top of `css/style.css`.
- **Content**: All text content lives directly in `index.html` — edit sections as needed.
- **Icons**: Browse available icons at [lucide.dev](https://lucide.dev/) and swap `data-lucide` attribute values.

## License

Personal use. All content belongs to Shahrier Hossain Fahim.
