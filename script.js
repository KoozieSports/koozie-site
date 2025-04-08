/**
 * script.js for Koozie Sports
 * Handles header shrinking, mobile navigation, drunk mode toggle,
 * scroll animations, dynamic year update, smooth scrolling,
 * and fetching YouTube videos.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const YOUTUBE_API_KEY = 'AIzaSyDae1uS8BJ6VRxAEZtD7ZWXHEUuY7zim3M'; // PASTE YOUR YOUTUBE DATA API KEY HERE
    const YOUTUBE_CHANNEL_ID = 'UCQf5nnIl4ANXzQzftW4Vpfw'; // Koozie Sports Channel ID
    const MAX_YOUTUBE_VIDEOS = 4; // How many latest videos to show

    // --- Cache DOM Elements ---
    const mainHeader = document.getElementById('main-header');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.getElementById('nav-links');
    const drunkModeToggle = document.getElementById('drunk-mode-toggle');
    const drunkModeTooltip = drunkModeToggle ? drunkModeToggle.querySelector('.tooltip-text') : null;
    const bodyElement = document.body;
    const currentYearSpan = document.getElementById('current-year');
    const scrollAnimateElements = document.querySelectorAll('.animate-on-scroll');
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    // YouTube specific elements
    const youtubeVideosContainer = document.getElementById('youtube-video-items');
    const youtubeLoadingMessage = document.querySelector('.youtube-carousel-placeholder p:first-of-type');
    const youtubeErrorMessage = document.getElementById('youtube-error-message');
    const youtubeFallbackMessage = document.getElementById('youtube-fallback-message');
    // Drunk mode sound (optional)
    const drunkModeSound = document.getElementById('drunk-mode-sound');


    // --- State Variables ---
    let isMenuOpen = false;
    let isDrunkMode = bodyElement.classList.contains('drunk-mode-active'); // Initialize based on current class


    // --- Function: Header Shrink on Scroll ---
    const handleHeaderScroll = () => {
        if (!mainHeader) return;
        const scrollThreshold = 50;
        if (window.scrollY > scrollThreshold) {
            mainHeader.classList.add('scrolled');
            bodyElement.classList.add('header-scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
            bodyElement.classList.remove('header-scrolled');
        }
    };

    // --- Function: Toggle Mobile Navigation ---
    const toggleMobileNav = (forceClose = false) => {
        if (!navLinks || !hamburgerMenu) return;

        if (forceClose) {
            isMenuOpen = false;
        } else {
            isMenuOpen = !isMenuOpen;
        }

        navLinks.classList.toggle('nav-open', isMenuOpen);
        hamburgerMenu.setAttribute('aria-expanded', isMenuOpen);
        // Toggle class to prevent body scroll when menu is open
        bodyElement.classList.toggle('body-menu-open', isMenuOpen);

        const icon = hamburgerMenu.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !isMenuOpen);
            icon.classList.toggle('fa-times', isMenuOpen);
            icon.style.transform = isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)';
        }
    };

    // --- Function: Toggle Drunk Mode ---
    const toggleDrunkMode = () => {
        if (!bodyElement || !drunkModeToggle) return;

        isDrunkMode = !isDrunkMode;
        bodyElement.classList.toggle('drunk-mode-active', isDrunkMode);

        // Update button title and tooltip text
        const newTitle = isDrunkMode ? 'Deactivate "Fun" Mode' : 'Activate "Fun" Mode';
        drunkModeToggle.setAttribute('title', newTitle);
        if (drunkModeTooltip) {
            drunkModeTooltip.textContent = newTitle;
        }

        // Apply/Remove random tilt only when activating/deactivating
        const tiltElements = document.querySelectorAll('.tilt-element');
        if (isDrunkMode) {
             console.log("🍻 Koozie Sports: Fun Mode Activated! Things might get wobbly.");
            tiltElements.forEach(el => {
                const randomTiltValue = Math.random(); // Value between 0 and 1
                // Use CSS variable defined in style.css
                el.style.setProperty('--random-tilt', randomTiltValue);
            });
            // Optional: Play sound
            if (drunkModeSound) {
                drunkModeSound.play().catch(e => console.warn("Drunk mode sound play failed:", e));
            }
        } else {
             console.log("🍺 Koozie Sports: Fun Mode Deactivated. Back to boring reality.");
            // Remove the CSS variable; styles will revert to non-drunk mode state
             tiltElements.forEach(el => el.style.removeProperty('--random-tilt'));
        }

        // Persist choice in localStorage (optional)
        try {
            localStorage.setItem('koozieDrunkMode', isDrunkMode);
        } catch (e) {
            console.warn("Could not save drunk mode preference to localStorage:", e);
        }
    };

    // --- Function: Update Copyright Year ---
    const updateCopyrightYear = () => {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    };

    // --- Function: Handle Scroll Animations (Intersection Observer) ---
    const handleScrollAnimations = () => {
        if (!('IntersectionObserver' in window)) {
            console.warn("IntersectionObserver not supported, scroll animations disabled.");
            scrollAnimateElements.forEach(el => el.classList.add('visible'));
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        scrollAnimateElements.forEach(el => observer.observe(el));
    };

    // --- Function: Smooth Scrolling for Internal Links ---
    const handleSmoothScroll = (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href');
        if (targetId === '#') return; // Ignore links like href="#"

        // Close mobile menu if open and a nav link inside it was clicked
        if (isMenuOpen && navLinks && navLinks.contains(link)) {
             toggleMobileNav(true); // Force close
        }

        if (targetId === '#page-top') {
             event.preventDefault();
             window.scrollTo({ top: 0, behavior: 'smooth' });
             return;
        }

        try {
             const targetElement = document.querySelector(targetId);
             if (targetElement) {
                 event.preventDefault(); // Prevent default jump only if target exists

                 targetElement.scrollIntoView({
                     behavior: 'smooth',
                     block: 'start' // Align to top, respecting scroll-padding-top
                 });
             } else {
                 console.warn(`Smooth scroll target element not found for selector: ${targetId}`);
                 // Allow default behavior if target not found (e.g., link to another page)
             }
        } catch (e) {
            // If querySelector fails (e.g., invalid ID), allow default link behavior
            console.error(`Error finding smooth scroll target: ${targetId}`, e);
        }
    };

    // --- Function: Update Dynamic Content (Example Placeholder) ---
    const updateDynamicContent = () => {
        const leagueNameEl = document.querySelector('.dynamic-league-name');
        const weekNumberEl = document.querySelector('.dynamic-week');
        // ... Add logic later if needed ...
    };

     // --- Function: Initialize Lightbox (Example Placeholder) ---
     const initializeLightbox = () => {
        // if (typeof lightbox !== 'undefined') {
        //     lightbox.option({ 'resizeDuration': 200, 'wrapAround': true });
        // }
     };

     // --- Function: Fetch Latest YouTube Videos ---
     const fetchYouTubeVideos = async () => {
        if (!youtubeVideosContainer || !YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
            console.warn("YouTube API Key or container missing. Skipping video fetch.");
            if (youtubeLoadingMessage) youtubeLoadingMessage.style.display = 'none';
            if (youtubeErrorMessage) {
                 youtubeErrorMessage.textContent = "YouTube API Key not configured.";
                 youtubeErrorMessage.style.display = 'block';
            }
             if(youtubeFallbackMessage) youtubeFallbackMessage.style.display = 'block';
            return;
        }

        // Use the 'search' endpoint to find the latest videos for the channel
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&maxResults=${MAX_YOUTUBE_VIDEOS}&order=date&type=video&key=${YOUTUBE_API_KEY}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                // Attempt to parse error message from YouTube API response
                let errorData;
                try {
                     errorData = await response.json();
                } catch (parseError) {
                     // If response is not JSON or empty
                     throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
                }
                 const errorMessage = errorData?.error?.message || `API request failed with status ${response.status}`;
                 console.error("YouTube API Error:", errorData);
                 throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.items && data.items.length > 0) {
                youtubeVideosContainer.innerHTML = ''; // Clear previous items/loading text
                if (youtubeLoadingMessage) youtubeLoadingMessage.style.display = 'none';
                 if(youtubeFallbackMessage) youtubeFallbackMessage.style.display = 'none'; // Hide fallback if successful

                data.items.forEach(item => {
                    const videoId = item.id.videoId;
                    const title = item.snippet.title;
                    // Use high quality thumbnail if available, otherwise default
                    const thumbnailUrl = item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url;
                    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

                    const videoElement = document.createElement('div');
                    videoElement.classList.add('youtube-video-item'); // Use class from CSS

                    videoElement.innerHTML = `
                        <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" title="${title}">
                            <img src="${thumbnailUrl}" alt="${title}" loading="lazy">
                        </a>
                        <p>${title}</p>
                    `;
                    youtubeVideosContainer.appendChild(videoElement);
                });
            } else {
                 throw new Error("No video items found in API response.");
            }

        } catch (error) {
            console.error('Failed to fetch YouTube videos:', error);
            if (youtubeLoadingMessage) youtubeLoadingMessage.style.display = 'none';
            if (youtubeErrorMessage) {
                 // Display a user-friendly message, potentially masking specific API errors
                 youtubeErrorMessage.textContent = `Could not load videos. (${error.message || 'Check console for details'})`;
                 youtubeErrorMessage.style.display = 'block';
            }
             if(youtubeFallbackMessage) youtubeFallbackMessage.style.display = 'block'; // Show fallback on error
        }
     };


    // --- Initialize Functionality on Page Load ---

    // 0. Check for saved drunk mode preference
    try {
        const savedDrunkMode = localStorage.getItem('koozieDrunkMode');
        if (savedDrunkMode === 'true' && !isDrunkMode) {
            toggleDrunkMode(); // Activate if saved preference is true and it's not already active
        } else if (savedDrunkMode === 'false' && isDrunkMode) {
            toggleDrunkMode(); // Deactivate if saved preference is false and it is currently active
        }
    } catch (e) {
         console.warn("Could not read drunk mode preference from localStorage:", e);
    }
    // Initial tooltip update after potentially loading from localStorage
     if (drunkModeToggle && drunkModeTooltip) {
         const initialTitle = isDrunkMode ? 'Deactivate "Fun" Mode' : 'Activate "Fun" Mode';
         drunkModeToggle.setAttribute('title', initialTitle);
         drunkModeTooltip.textContent = initialTitle;
     }


    // 1. Header Scroll Listener
    if (mainHeader) {
        window.addEventListener('scroll', handleHeaderScroll, { passive: true });
        handleHeaderScroll(); // Initial check
    }

    // 2. Mobile Nav Toggle Listener
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click bubbling to the document listener
            toggleMobileNav();
        });
    }

    // 3. Drunk Mode Toggle Listener
    if (drunkModeToggle) {
        drunkModeToggle.addEventListener('click', toggleDrunkMode);
    }

    // 4. Update Copyright Year
    updateCopyrightYear();

    // 5. Initialize Scroll Animations
    handleScrollAnimations();

    // 6. Initialize Smooth Scrolling for all internal links
    document.addEventListener('click', handleSmoothScroll); // Listen on document for better delegation

    // 7. Initialize Dynamic Content (Placeholder)
    updateDynamicContent();

    // 8. Initialize Lightbox (Placeholder)
    initializeLightbox();

    // 9. Fetch YouTube Videos
    fetchYouTubeVideos();


    // --- Optional: Close mobile menu if clicking outside ---
    document.addEventListener('click', (event) => {
        if (isMenuOpen && navLinks && hamburgerMenu) {
            // Check if the click is outside the nav menu AND not on the hamburger button itself
            if (!navLinks.contains(event.target) && !hamburgerMenu.contains(event.target)) {
                toggleMobileNav(true); // Force close
            }
        }
    });

    // Stop propagation on clicks inside the nav menu itself to prevent immediate closure
    if (navLinks) {
        navLinks.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }


    console.log("Koozie Sports Script Initialized Successfully!");

}); // End DOMContentLoaded
