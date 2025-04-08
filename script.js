/**
 * script.js for Koozie Sports
 * Handles header shrinking, mobile navigation, drunk mode toggle,
 * scroll animations, dynamic year update, smooth scrolling,
 * YouTube video fetching, and navbar scrollspy.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const YOUTUBE_API_KEY = 'AIzaSyDae1uS8BJ6VRxAEZtD7ZWXHEUuY7zim3M'; // PASTE YOUR YOUTUBE DATA API KEY HERE
    const YOUTUBE_CHANNEL_ID = 'UCQf5nnIl4ANXzQzftW4Vpfw'; // Koozie Sports Channel ID
    const MAX_YOUTUBE_VIDEOS = 4; // How many latest videos to show
    // Scrollspy Configuration
    const SCROLLSPY_ROOT_MARGIN = "-15% 0px -75% 0px"; // Adjust trigger point: top offset 15%, bottom 75%
    const SCROLLSPY_THRESHOLD = 0; // Trigger as soon as any part enters the margin area

    // --- Cache DOM Elements ---
    const mainHeader = document.getElementById('main-header');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinksContainer = document.getElementById('nav-links'); // Container ul
    const navLinksItems = navLinksContainer ? navLinksContainer.querySelectorAll('a.nav-item[href^="#"]') : []; // Scrollspy links
    const drunkModeToggle = document.getElementById('drunk-mode-toggle');
    const drunkModeTooltip = drunkModeToggle ? drunkModeToggle.querySelector('.tooltip-text') : null;
    const bodyElement = document.body;
    const currentYearSpan = document.getElementById('current-year');
    const scrollAnimateElements = document.querySelectorAll('.animate-on-scroll');
    const internalLinks = document.querySelectorAll('a[href^="#"]'); // For smooth scroll
    const drunkModeMascot = document.getElementById('drunk-mode-mascot'); // Fun element
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
        if (!navLinksContainer || !hamburgerMenu) return;

        if (forceClose) {
            isMenuOpen = false;
        } else {
            isMenuOpen = !isMenuOpen;
        }

        navLinksContainer.classList.toggle('nav-open', isMenuOpen);
        hamburgerMenu.setAttribute('aria-expanded', isMenuOpen);
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

        // Toggle mascot visibility
        if (drunkModeMascot) {
            // Add/remove class to trigger CSS transition/animation
             // No need to check isDrunkMode here, toggle handles both states
             // We rely on the CSS defined in style.css for the actual animation/transition
             // If the mascot was already visible due to localStorage load, this ensures class matches
            bodyElement.classList.contains('drunk-mode-active')
               ? drunkModeMascot.classList.add('visible') // Not strictly needed if only CSS driven by body class
               : drunkModeMascot.classList.remove('visible');
        }


        // Update button title and tooltip text
        const newTitle = isDrunkMode ? 'Deactivate "Fun" Mode' : 'Activate "Fun" Mode';
        drunkModeToggle.setAttribute('title', newTitle);
        if (drunkModeTooltip) {
            drunkModeTooltip.textContent = newTitle;
        }

        // Apply/Remove random tilt only when activating/deactivating
        const tiltElements = document.querySelectorAll('.tilt-element');
        if (isDrunkMode) {
             console.log("🍻 Koozie Mode Activated! Things might get wobbly.");
            tiltElements.forEach(el => {
                const randomTiltValue = Math.random();
                el.style.setProperty('--random-tilt', randomTiltValue);
            });
            if (drunkModeSound) {
                drunkModeSound.play().catch(e => console.warn("Drunk mode sound play failed:", e));
            }
        } else {
             console.log("🍺 Koozie Mode Deactivated. Back to sober reality.");
             tiltElements.forEach(el => el.style.removeProperty('--random-tilt'));
        }

        // Persist choice in localStorage
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
            threshold: 0.15 // Become visible when 15% enters viewport
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Stop observing once visible
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
        if (targetId === '#') return; // Ignore empty hash links

        // Close mobile menu if open and a nav link inside it was clicked
        if (isMenuOpen && navLinksContainer && navLinksContainer.contains(link)) {
             toggleMobileNav(true); // Force close
        }

        // Handle #page-top specifically
        if (targetId === '#page-top') {
             event.preventDefault();
             window.scrollTo({ top: 0, behavior: 'smooth' });
             // Manually activate 'Home' link when scrolling to top
             activateNavLink(document.querySelector('a.nav-item[href="#page-top"]'));
             return;
        }

        // Handle other internal links
        try {
             const targetElement = document.querySelector(targetId);
             if (targetElement) {
                 event.preventDefault(); // Prevent default jump only if target exists

                 targetElement.scrollIntoView({
                     behavior: 'smooth',
                     block: 'start' // Align to top, respecting scroll-padding-top
                 });
                 // Scrollspy observer will handle activating the link during scroll
             } else {
                 console.warn(`Smooth scroll target element not found for selector: ${targetId}`);
                 // Allow default behavior (might be link to another page's anchor)
             }
        } catch (e) {
            console.error(`Error finding smooth scroll target: ${targetId}`, e);
        }
    };


    // --- Function: Activate Nav Link (Helper for Scrollspy & Smooth Scroll) ---
    const activateNavLink = (targetLink) => {
        if (!navLinksItems || navLinksItems.length === 0) return;

        navLinksItems.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        if (targetLink) {
            targetLink.classList.add('active');
            targetLink.setAttribute('aria-current', 'page');
        }
    };


    // --- Function: Navbar Scrollspy (Intersection Observer) ---
    const handleScrollspy = () => {
        if (!('IntersectionObserver' in window) || navLinksItems.length === 0) {
            console.warn("Scrollspy requires IntersectionObserver and nav links.");
            return;
        }

        // Create a map of target IDs to nav link elements
        const navLinkMap = new Map();
        navLinksItems.forEach(link => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                 // Use querySelector which is more robust for IDs that might need escaping
                try {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        navLinkMap.set(targetElement, link);
                    }
                } catch (e) {
                    console.warn(`Scrollspy could not find target element for: ${targetId}`, e);
                }
            } else if (targetId === '#page-top') {
                // Special handling for #page-top (often the body or a specific top element)
                const topElement = document.getElementById('page-top'); // Use body ID
                 if (topElement) {
                     navLinkMap.set(topElement, link);
                 }
            }
        });

        // Get all section elements that have corresponding nav links
        const sections = Array.from(navLinkMap.keys());
        if (sections.length === 0) return;

        const observerOptions = {
            root: null, // Use the viewport
            rootMargin: SCROLLSPY_ROOT_MARGIN, // Trigger area adjustment
            threshold: SCROLLSPY_THRESHOLD // Trigger as soon as it enters the margin
        };

        const observerCallback = (entries, observer) => {
            // Find the entry most visible within the trigger zone (closest to top)
            let bestEntry = null;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!bestEntry || entry.boundingClientRect.top < bestEntry.boundingClientRect.top) {
                         bestEntry = entry;
                     }
                 }
             });

             // Activate the link corresponding to the best entry
             if (bestEntry) {
                 const targetLink = navLinkMap.get(bestEntry.target);
                 activateNavLink(targetLink);
             } else {
                // If nothing is intersecting in the defined zone (e.g., scrolled past last section),
                // check if we are close to the bottom. If so, keep the last link active.
                const scrollPosition = window.scrollY + window.innerHeight;
                const bodyHeight = document.body.offsetHeight;
                if ((bodyHeight - scrollPosition) < 150) { // Close to bottom threshold
                    // Find the link corresponding to the last section in the map
                    const lastSection = sections[sections.length - 1];
                    const lastLink = navLinkMap.get(lastSection);
                    activateNavLink(lastLink);
                } else if (window.scrollY < 100) {
                    // If near the top, ensure Home is active
                    activateNavLink(document.querySelector('a.nav-item[href="#page-top"]'));
                }
             }
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        sections.forEach(section => observer.observe(section));
    };


    // --- Function: Fetch Latest YouTube Videos ---
    const fetchYouTubeVideos = async () => {
        if (!youtubeVideosContainer || !YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY' || YOUTUBE_API_KEY === 'AIzaSyDae1uS8BJ6VRxAEZtD7ZWXHEUuY7zim3M') { // Added check for the actual placeholder key
            const message = !YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY' || YOUTUBE_API_KEY === 'AIzaSyDae1uS8BJ6VRxAEZtD7ZWXHEUuY7zim3M'
                ? "YouTube API Key not configured."
                : "YouTube container element missing.";
            console.warn(message, "Skipping video fetch.");
            if (youtubeLoadingMessage) youtubeLoadingMessage.style.display = 'none';
            if (youtubeErrorMessage) {
                youtubeErrorMessage.textContent = message;
                youtubeErrorMessage.style.display = 'block';
            }
            if(youtubeFallbackMessage) youtubeFallbackMessage.style.display = 'block';
            return;
        }

        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&maxResults=${MAX_YOUTUBE_VIDEOS}&order=date&type=video&key=${YOUTUBE_API_KEY}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); }
                catch (parseError) { throw new Error(`HTTP error ${response.status}: ${response.statusText}`); }
                const errorMessage = errorData?.error?.message || `API request failed with status ${response.status}`;
                console.error("YouTube API Error:", errorData);
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.items && data.items.length > 0) {
                youtubeVideosContainer.innerHTML = '';
                if (youtubeLoadingMessage) youtubeLoadingMessage.style.display = 'none';
                if(youtubeFallbackMessage) youtubeFallbackMessage.style.display = 'none';

                data.items.forEach(item => {
                    const videoId = item.id.videoId;
                    const title = item.snippet.title;
                    const thumbnailUrl = item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url;
                    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

                    const videoElement = document.createElement('div');
                    videoElement.classList.add('youtube-video-item');
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
                 youtubeErrorMessage.textContent = `Could not load videos. (${error.message || 'Check console for details'})`;
                 youtubeErrorMessage.style.display = 'block';
            }
             if(youtubeFallbackMessage) youtubeFallbackMessage.style.display = 'block';
        }
    };


    // --- Initialize Functionality on Page Load ---

    // 0. Check for saved drunk mode preference
    try {
        const savedDrunkMode = localStorage.getItem('koozieDrunkMode');
        if (savedDrunkMode === 'true' && !isDrunkMode) {
            toggleDrunkMode(); // Activate if saved as true and not already active
        } else if (savedDrunkMode === 'false' && isDrunkMode) {
            toggleDrunkMode(); // Deactivate if saved as false and currently active
        } else if (savedDrunkMode === 'true' && isDrunkMode) {
            // If already active and saved as active, ensure mascot is visible on load
             if (drunkModeMascot) drunkModeMascot.classList.add('visible');
             // Also apply random tilt on load if starting in drunk mode
             const tiltElements = document.querySelectorAll('.tilt-element');
              tiltElements.forEach(el => {
                 const randomTiltValue = Math.random();
                 el.style.setProperty('--random-tilt', randomTiltValue);
             });
        }
    } catch (e) {
         console.warn("Could not read/apply drunk mode preference from localStorage:", e);
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
    if (hamburgerMenu && navLinksContainer) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
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
    document.addEventListener('click', handleSmoothScroll);

    // 7. Initialize Navbar Scrollspy
    handleScrollspy();

    // 8. Fetch YouTube Videos
    fetchYouTubeVideos();


    // --- Optional: Close mobile menu if clicking outside ---
    document.addEventListener('click', (event) => {
        if (isMenuOpen && navLinksContainer && hamburgerMenu) {
            if (!navLinksContainer.contains(event.target) && !hamburgerMenu.contains(event.target)) {
                toggleMobileNav(true); // Force close
            }
        }
    });
    // Stop propagation on clicks inside the nav menu itself
    if (navLinksContainer) {
        navLinksContainer.addEventListener('click', (event) => {
            // Allow clicks on links to propagate for smooth scroll handling
            if (!event.target.closest('a')) {
                 event.stopPropagation();
            }
        });
    }


    console.log("Koozie Sports Script Initialized Successfully! Scrollspy Active.");

}); // End DOMContentLoaded
