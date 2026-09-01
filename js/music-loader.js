/* ============================================================
   MUSIC SECTION LOADER
   Fetches music content from the homepage DB table and
   updates the .music-section on every page it's included on.
   ============================================================ */

(function () {
    var API = 'http://localhost:3000/api/homepage/section/music';

    // Convert any YouTube URL to embed format
    function toEmbedUrl(url) {
        if (!url) return '';
        if (url.includes('/embed/')) return url;
        var m = url.match(/[?&]v=([^&]+)/);
        if (m) return 'https://www.youtube.com/embed/' + m[1];
        m = url.match(/youtu\.be\/([^?&]+)/);
        if (m) return 'https://www.youtube.com/embed/' + m[1];
        return url;
    }

    function getValue(data, key) {
        var item = data.find(function (d) { return d.content_key === key; });
        return item ? item.content_value : null;
    }

    function loadMusic() {
        var section = document.querySelector('.music-section');
        if (!section) return;

        fetch(API)
            .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
            .then(function (data) {
                var videoUrl = getValue(data, 'video_url');
                var label    = getValue(data, 'label');

                if (label) {
                    var labelEl = section.querySelector('.music-label em');
                    if (labelEl) labelEl.textContent = label;
                }

                if (videoUrl) {
                    var iframe = section.querySelector('.music-video iframe');
                    if (iframe) iframe.src = toEmbedUrl(videoUrl);
                }
            })
            .catch(function () { /* keep static fallback */ });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadMusic);
    } else {
        loadMusic();
    }
})();
