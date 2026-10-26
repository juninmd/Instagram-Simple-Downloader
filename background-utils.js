/**
 * Background Utility functions and constants.
 * @namespace ISD_BG_UTILS
 */
(function() {
    window.ISD_BG_UTILS = window.ISD_BG_UTILS || {};

    /** @type {string[]} */
    const ALLOWED_MEDIA_HOSTS = ['.cdninstagram.com', '.fbcdn.net'];

    /** @type {string[]} */
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'mp4', 'mov'];

    /** @type {number} */
    const MAX_URL_LENGTH = 4096;

    /**
     * Validates the incoming download request, checking sender identity, origin, media host, and type.
     * @param {Object} request - The message request payload.
     * @param {Object} sender - The sender object provided by extension runtime.
     * @param {string} extensionId - The extension ID to validate against sender.id.
     * @returns {{ ok: boolean, url?: string, type?: string, error?: string }} Validation result object.
     */
    window.ISD_BG_UTILS.validateRequest = function(request, sender, extensionId) {
        if (!request || !request.url) {
            return { ok: false, error: 'Invalid request: URL is missing.' };
        }

        if (!sender || !sender.id || sender.id !== extensionId) {
            return { ok: false, error: 'Blocked: invalid request sender.' };
        }

        if (!sender.tab || !sender.tab.url) {
            return { ok: false, error: 'Blocked: sender tab URL missing.' };
        }

        try {
            const senderOrigin = new URL(sender.tab.url).origin;
            if (senderOrigin !== 'https://www.instagram.com') {
                return { ok: false, error: 'Blocked: request origin must be instagram.com.' };
            }
        } catch {
            return { ok: false, error: 'Blocked: invalid sender origin.' };
        }

        if (request.type !== 'image' && request.type !== 'video') {
            return { ok: false, error: 'Blocked: invalid media type.' };
        }

        if (typeof request.url !== 'string' || request.url.length > MAX_URL_LENGTH) {
            return { ok: false, error: 'Blocked: URL exceeds maximum length.' };
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(request.url);
        } catch {
            return { ok: false, error: 'Blocked: invalid media URL.' };
        }

        if (parsedUrl.protocol !== 'https:') {
            return { ok: false, error: 'Blocked: protocol must be https:.' };
        }

        const host = parsedUrl.hostname.toLowerCase();
        const isAllowedHost = ALLOWED_MEDIA_HOSTS.some((allowed) => {
            const domain = allowed.startsWith('.') ? allowed.slice(1) : allowed;
            return host === domain || host.endsWith('.' + domain);
        });

        if (!isAllowedHost) {
            return { ok: false, error: 'Blocked: unsupported media host.' };
        }

        return { ok: true, url: request.url, type: request.type };
    };

    /**
     * Extracts and sanitizes a filename from the given URL and enforces valid media extensions.
     * @param {string} requestUrl - The URL of the media file.
     * @param {string} mediaType - The type of the media ('image' or 'video').
     * @returns {string} The parsed and sanitized filename or default fallback.
     */
    window.ISD_BG_UTILS.extractFilename = function(requestUrl, mediaType) {
        let rawSegment;
        try {
            const urlObj = new URL(requestUrl);
            rawSegment = urlObj.pathname.split('/').pop() || '';
        } catch {
            rawSegment = String(requestUrl || '').split('/').pop() || '';
        }

        if (!rawSegment) {
            return mediaType === 'video' ? 'video.mp4' : 'image.jpg';
        }

        let decoded = rawSegment;
        try {
            decoded = decodeURIComponent(rawSegment);
        } catch {
            // Keep rawSegment if decodeURIComponent fails
        }

        let sanitized = decoded.replace(/\\|\/|:|\*|\?|"|<|>|\|/g, '');
        let clean = '';
        for (let i = 0; i < sanitized.length; i++) {
            const code = sanitized.charCodeAt(i);
            if ((code >= 32 && code <= 126) || code > 159) {
                clean += sanitized[i];
            }
        }
        sanitized = clean.replace(/\.\./g, '').replace(/^\.+|\.+$/g, '').trim();

        if (!sanitized) {
            return mediaType === 'video' ? 'video.mp4' : 'image.jpg';
        }

        const lastDot = sanitized.lastIndexOf('.');
        let stem = sanitized;
        let ext;

        if (lastDot > 0) {
            stem = sanitized.slice(0, lastDot);
            ext = sanitized.slice(lastDot + 1).toLowerCase();
        }

        const defaultExt = mediaType === 'video' ? 'mp4' : 'jpg';
        const finalExt = ext && ALLOWED_EXTENSIONS.includes(ext) ? ext : defaultExt;

        if (!stem) {
            stem = mediaType === 'video' ? 'video' : 'image';
        }

        const maxStemLength = 100 - (1 + finalExt.length);
        if (stem.length > maxStemLength) {
            stem = stem.slice(0, maxStemLength);
        }

        return `${stem}.${finalExt}`;
    };
})();
