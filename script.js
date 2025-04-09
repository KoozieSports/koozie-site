/**
 * script.js for Koozie Sports - Enhanced & Revised v2
 * Handles header shrinking, mobile navigation, dark mode, drunk mode,
 * scroll animations, scrollspy navbar highlighting, live scores popup,
 * dynamic quote, dynamic year update, smooth scrolling, YouTube BG video,
 * scroll progress bar, back-to-top button, basic form handling, etc.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const YOUTUBE_BG_VIDEO_ID = 'ERWsGzRMOEw'; // Background video ID (Set to null if no video)
    const SCROLLSPY_OFFSET_PERCENT = 30; // % of viewport height from top. Adjust 20-40 for best feel. Line where section becomes active.
    const BACK_TO_TOP_THRESHOLD = 300; // Pixels scrolled before Back-to-Top button appears
    const DRUNK_MODE_SHAKE_INTERVAL = 15000; // Approx. interval (ms) for random screen shake check
    const DRUNK_MODE_SHAKE_PROBABILITY = 0.3; // Probability (0-1) of shake occurring during check
    const DRUNK_MODE_SHAKE_DURATION = 300; // Duration (ms) of the screen shake animation
    const FORM_ENDPOINT = 'YOUR_FORM_ENDPOINT_HERE'; // <<<< TODO: Replace with your actual form processing URL

    // --- Cache DOM Elements ---
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const mainHeader = document.getElementById('main-header');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinksContainer = document.getElementById('nav-links');
    const navItems = navLinksContainer ? Array.from(navLinksContainer.querySelectorAll('.nav-item[data-section]')) : [];
    const sections = Array.from(document.querySelectorAll('main section[id]')); // Select sections within main with an ID
    const currentYearSpan = document.getElementById('current-year');
    const scrollAnimateElements = document.querySelectorAll('.animate-on-scroll');
    const youtubePlayerEl = document.getElementById('youtube-player');
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    const backToTopButton = document.querySelector('.back-to-top');
    const mainContent = document.getElementById('main-content'); // Assuming main content area has this ID

    // Toggles & Related Elements
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const liveScoresToggle = document.getElementById('live-scores-toggle'); // Button on index.html
    const liveScoresToggleLink = document.getElementById('live-scores-toggle-link'); // Link on blog.html
    const drunkModeToggle = document.getElementById('drunk-mode-toggle');

    // Popups & Overlays
    const liveScoresPopup = document.getElementById('live-scores-popup');
    const liveScoresCloseButton = liveScoresPopup?.querySelector('.popup-close-button');
    const liveScoresOverlay = liveScoresPopup?.querySelector('.popup-overlay');
    const bubbleOverlay = document.getElementById('bubble-overlay'); // For Drunk Mode

    // Dynamic Content Elements
    const dynamicQuoteTextEl = document.getElementById('dynamic-quote-text');
    const dynamicQuoteAttrEl = document.getElementById('dynamic-quote-attribution');

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    const formStatusEl = document.getElementById('form-status');

    // Audio
    const drunkModeSound = document.getElementById('drunk-mode-sound');

    // --- State Variables ---
    let isMenuOpen = false;
    let isDrunkMode = bodyElement.classList.contains('drunk-mode-active');
    let areLiveScoresOpen = liveScoresPopup ? !liveScoresPopup.hasAttribute('hidden') : false;
    let currentTheme = 'light'; // Initial default, will be updated by initDarkMode
    let ytPlayer; // YouTube Background Player instance
    let drunkModeInterval = null;
    let lastActiveSectionId = null; // Track the currently highlighted nav item's section
    let scrollspyObserver = null; // To potentially disconnect/reconnect later
    let animationObserver = null; // For scroll animations
    let lastScrollTop = 0; // For scroll direction detection
    let focusedElementBeforePopup = null; // For restoring focus after popup closes

    // --- Dynamic Content Definitions ---
    const dynamicQuotes = [
        // (Keep the extensive quote list from your original script)
        { quote: `"You miss 100% of the shots you don't take. - Wayne Gretzky"`, attribution: "- Michael Scott... probably" },
        { quote: "Always bet the over. Life's too short to root for defense.", attribution: "- A Wise Koozie Drinker" },
        { quote: "The best defense is a good offense... and maybe distracting the goalie with a shiny object.", attribution: "- Unofficial Koozie Playbook" },
        { quote: "Is this heaven? No, it's Iowa... but the tailgate scene is divine.", attribution: "- Field of Dreams (Revised)" },
        { quote: "Rule #76: No excuses. Play like a champion... or at least look like you know what you're doing.", attribution: "- Koozie Wedding Crashers" },
        { quote: "My therapist told me to write letters to the people I hate and then burn them. Did that, but now I don't know what to do with the letters.", attribution: "- Relatable Sports Fan" },
        { quote: "Tip of the Day: Never trust a ref wearing sunglasses indoors.", attribution: "- Koozie Sports Betting 'Advice'" },
        { quote: `"Did we just become best friends?!"`, attribution: "- Brennan Huff" },
        { quote: `"There's no crying in baseball!"`, attribution: "- Jimmy Dugan" },
        { quote: `"Just tap it in. Just tap it in. Give it a little tappy. Tap Tap Taparoo."`, attribution: "- Happy Gilmore" },
        { quote: `"99% of gamblers quit right before they're about to win big."`, attribution: "- Ancient Proverb (Probably)" },
        { quote: `"If you ain't first, you're last."`, attribution: "- Ricky Bobby" },
        // ... include all other quotes ...
         { quote: `"Baseball is theatre, and the ballpark is the stage."`, attribution: "- Suzyn Waldman (paraphrased sentiment)" },
    ];

    // --- Core Functions ---

    /**
     * Debounce function to limit the rate at which a function can fire.
     * @param {Function} func Function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @returns {Function} Debounced function.
     */
    const debounce = (func, wait = 15) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    /**
     * Sets the color theme (light/dark) for the site.
     * Updates localStorage, ARIA attributes, icons, and meta tags.
     * @param {string} theme - The theme to set ('light' or 'dark').
     */
    const setTheme = (theme) => {
        const newTheme = (theme === 'dark') ? 'dark' : 'light'; // Sanitize
        htmlElement.setAttribute('data-theme', newTheme);
        currentTheme = newTheme;

        try {
            localStorage.setItem('koozieTheme', newTheme);
        } catch (e) {
            console.warn("Could not save theme preference to localStorage:", e);
        }

        // Update toggle button state if it exists
        if (darkModeToggle) {
            const isDark = newTheme === 'dark';
            const moonIcon = darkModeToggle.querySelector('.fa-moon');
            const sunIcon = darkModeToggle.querySelector('.fa-sun');
            const tooltip = darkModeToggle.querySelector('.tooltip-text');

            if (moonIcon) moonIcon.style.display = isDark ? 'none' : 'inline-block';
            if (sunIcon) sunIcon.style.display = isDark ? 'inline-block' : 'none';

            const newTitle = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
            darkModeToggle.setAttribute('title', newTitle);
            darkModeToggle.setAttribute('aria-pressed', String(isDark));
            if (tooltip) tooltip.textContent = newTitle;
        }

        // Update meta theme-color (optional, good practice)
        document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: light)"]')?.setAttribute('content', newTheme === 'light' ? '#fdfaef' : '#1a1a1a');
        document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]')?.setAttribute('content', newTheme === 'dark' ? '#1a1a1a' : '#fdfaef');

        console.log(`Koozie Sports: Theme set to ${newTheme}`);
    };

    /**
     * Initializes the dark mode functionality.
     * Reads saved preference or system preference, sets initial theme,
     * and adds event listener to the toggle button.
     */
    const initDarkMode = () => {
        let initialTheme = 'light'; // Default
        try {
            const savedTheme = localStorage.getItem('koozieTheme');
            if (savedTheme === 'dark' || savedTheme === 'light') {
                initialTheme = savedTheme;
                console.log(`Found saved theme preference: ${initialTheme}`);
            } else {
                // Use system preference if no valid saved theme
                const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
                initialTheme = prefersDark ? 'dark' : 'light';
                console.log(`Using system theme preference: ${initialTheme}`);
            }
        } catch (e) {
             console.warn("Could not read theme preference from localStorage:", e);
             // Fallback to system preference check even if localStorage fails
             const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
             initialTheme = prefersDark ? 'dark' : 'light';
             console.log(`Using system theme preference after localStorage error: ${initialTheme}`);
        }

        // *** IMPORTANT FIX ***: Set the theme *before* adding the event listener.
        setTheme(initialTheme);

        // Add listener to toggle button *after* initial state is set
        darkModeToggle?.addEventListener('click', () => {
            setTheme(currentTheme === 'light' ? 'dark' : 'light');
        });

        // Listen for system preference changes (optional, only affects if no user pref saved)
        try {
            window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', event => {
                // Only update if no user preference is explicitly set
                if (!localStorage.getItem('koozieTheme')) {
                    console.log(`System theme changed. Updating to: ${event.matches ? 'dark' : 'light'}`);
                    setTheme(event.matches ? 'dark' : 'light');
                }
            });
        } catch (e) {
             console.warn("Could not add listener for system theme changes:", e);
        }
    };

    /**
     * Updates the quote section with a random quote from the list.
     */
    const updateDynamicQuote = () => {
        if (!dynamicQuoteTextEl || !dynamicQuoteAttrEl) return; // Exit if elements not found

        if (dynamicQuotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * dynamicQuotes.length);
            const selectedItem = dynamicQuotes[randomIndex];
            dynamicQuoteTextEl.innerHTML = selectedItem.quote; // Use innerHTML for potential formatting
            dynamicQuoteAttrEl.textContent = selectedItem.attribution || ''; // Use empty string if no attribution
        } else {
            dynamicQuoteTextEl.textContent = "Looks like the quote machine is on a beer run...";
            dynamicQuoteAttrEl.textContent = "";
        }
    };

    /**
     * Updates the footer with the current year.
     */
    const updateDynamicYear = () => {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    };

    /**
     * Handles scroll-related updates like header shrink, progress bar, and back-to-top button.
     */
    const handleScroll = () => {
        const scrollPosition = window.scrollY;

        // 1. Header Shrink
        if (mainHeader) {
            const isScrolled = scrollPosition > 50;
            mainHeader.classList.toggle('scrolled', isScrolled);
            bodyElement.classList.toggle('header-scrolled', isScrolled); // Add class to body for scroll-padding adjustment
        }

        // 2. Scroll Progress Bar
        if (scrollProgressBar) {
            const scrollHeight = Math.max(
                bodyElement.scrollHeight, document.documentElement.scrollHeight,
                bodyElement.offsetHeight, document.documentElement.offsetHeight,
                bodyElement.clientHeight, document.documentElement.clientHeight
            );
            const clientHeight = document.documentElement.clientHeight;
            const scrollableHeight = scrollHeight - clientHeight;
            const scrollPercentage = scrollableHeight > 0 ? (scrollPosition / scrollableHeight) * 100 : 0;
            scrollProgressBar.style.width = `${Math.min(scrollPercentage, 100)}%`; // Cap at 100%
        }

        // 3. Back to Top Button Visibility
        if (backToTopButton) {
            const isVisible = scrollPosition > BACK_TO_TOP_THRESHOLD;
            backToTopButton.style.opacity = isVisible ? '1' : '0';
            backToTopButton.style.visibility = isVisible ? 'visible' : 'hidden';
            backToTopButton.setAttribute('aria-hidden', String(!isVisible));
        }

        // 4. Update last scroll position for scroll direction detection
        lastScrollTop = scrollPosition <= 0 ? 0 : scrollPosition;
    };

    /**
     * Toggles the mobile navigation menu open/closed.
     * @param {boolean} [forceClose=false] - If true, forces the menu to close.
     */
    const toggleMobileNav = (forceClose = false) => {
        if (!navLinksContainer || !hamburgerMenu) return;

        isMenuOpen = forceClose ? false : !isMenuOpen;

        navLinksContainer.classList.toggle('nav-open', isMenuOpen);
        hamburgerMenu.setAttribute('aria-expanded', String(isMenuOpen));
        bodyElement.classList.toggle('body-menu-open', isMenuOpen); // Prevent body scroll

        const icon = hamburgerMenu.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !isMenuOpen);
            icon.classList.toggle('fa-times', isMenuOpen);
            icon.style.transform = isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)';
        }
        // Focus management for accessibility
        if (isMenuOpen) {
             navLinksContainer.querySelector('a')?.focus(); // Focus first link when opened
        } else {
             hamburgerMenu.focus(); // Return focus to the toggle button when closed
        }
        console.log(`Koozie Sports: Mobile menu ${isMenuOpen ? 'opened' : 'closed'}`);
    };

    /**
     * Handles clicks inside the navigation panel (e.g., closing menu on link click).
     * @param {Event} event - The click event.
     */
    const handleNavClick = (event) => {
        // Close menu only if a nav link (not the container itself) is clicked
        if (event.target.matches('.nav-item')) {
            toggleMobileNav(true); // Force close
        }
    };

    /**
     * Opens the specified popup.
     * @param {HTMLElement} popupElement - The popup container element.
     */
    const openPopup = (popupElement) => {
        if (!popupElement) return;

        // Store the element that was focused before opening the popup
        focusedElementBeforePopup = document.activeElement;

        popupElement.hidden = false;
        // Wait for the next frame to ensure 'hidden' is removed before transition starts
        requestAnimationFrame(() => {
            bodyElement.classList.add('live-scores-popup-open'); // Use specific class or generic 'popup-open'
            popupElement.setAttribute('aria-hidden', 'false');
            areLiveScoresOpen = true; // Update state if it's the scores popup

            // Focus the first focusable element in the popup (e.g., the close button)
            const firstFocusable = popupElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            firstFocusable?.focus();

            // Update toggle state if applicable (e.g., for live scores button)
            if (popupElement.id === 'live-scores-popup' && liveScoresToggle) {
                liveScoresToggle.setAttribute('aria-pressed', 'true');
            }
            console.log(`Popup opened: #${popupElement.id}`);
        });

        // Add keydown listener for Escape key
        document.addEventListener('keydown', handlePopupKeydown);
    };

     /**
     * Closes the specified popup.
     * @param {HTMLElement} popupElement - The popup container element.
     */
    const closePopup = (popupElement) => {
        if (!popupElement || popupElement.hidden) return;

        popupElement.hidden = true;
        bodyElement.classList.remove('live-scores-popup-open'); // Remove specific class
        popupElement.setAttribute('aria-hidden', 'true');
        areLiveScoresOpen = false; // Update state if it's the scores popup

        // Update toggle state if applicable
        if (popupElement.id === 'live-scores-popup' && liveScoresToggle) {
            liveScoresToggle.setAttribute('aria-pressed', 'false');
        }

        // Restore focus to the element that opened the popup
        focusedElementBeforePopup?.focus();
        focusedElementBeforePopup = null; // Clear reference

        console.log(`Popup closed: #${popupElement.id}`);

        // Remove keydown listener
        document.removeEventListener('keydown', handlePopupKeydown);
    };

    /**
     * Handles keydown events when a popup is open (e.g., Escape key).
     * @param {KeyboardEvent} event - The keydown event.
     */
    const handlePopupKeydown = (event) => {
        if (event.key === 'Escape') {
            if (liveScoresPopup && !liveScoresPopup.hidden) {
                closePopup(liveScoresPopup);
            }
            // Add checks for other popups if needed
        }
        // Basic focus trapping (can be more robust with libraries)
        if (event.key === 'Tab' && liveScoresPopup && !liveScoresPopup.hidden) {
            const focusableElements = Array.from(
                liveScoresPopup.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
            ).filter(el => el.offsetParent !== null); // Filter only visible elements

            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    };


    /**
     * Triggers a random screen shake effect if drunk mode is active.
     */
    const triggerScreenShake = () => {
         if (isDrunkMode && Math.random() < DRUNK_MODE_SHAKE_PROBABILITY) {
            console.log("Drunk Mode: Shake it!");
            bodyElement.classList.add('screen-shake');
            setTimeout(() => {
                bodyElement.classList.remove('screen-shake');
            }, DRUNK_MODE_SHAKE_DURATION);
         }
    };

    /**
     * Toggles Koozie (Drunk) Mode on/off.
     */
    const toggleDrunkMode = () => {
        if (!bodyElement || !drunkModeToggle) return;

        isDrunkMode = !isDrunkMode;
        bodyElement.classList.toggle('drunk-mode-active', isDrunkMode);
        drunkModeToggle.setAttribute('aria-pressed', String(isDrunkMode));

        const newTitle = isDrunkMode ? 'Deactivate Koozie Mode' : 'Activate Koozie Mode';
        drunkModeToggle.setAttribute('title', newTitle);
        const tooltip = drunkModeToggle.querySelector('.tooltip-text');
        if (tooltip) tooltip.textContent = newTitle;

        const tiltElements = document.querySelectorAll('.tilt-element');

        if (isDrunkMode) {
            console.log("🍻 Koozie Sports: Koozie Mode Activated! Things might get wobbly.");
            tiltElements.forEach(el => {
                // Set a random CSS variable for tilt effect in CSS
                el.style.setProperty('--random-tilt', Math.random());
            });
            // Play sound (handle potential errors)
            drunkModeSound?.play().catch(e => console.warn("Drunk mode sound play failed. User interaction likely required first.", e));

            // Start random shake interval
            if (drunkModeInterval) clearInterval(drunkModeInterval); // Clear existing interval first
            drunkModeInterval = setInterval(triggerScreenShake, DRUNK_MODE_SHAKE_INTERVAL);
            if(bubbleOverlay) bubbleOverlay.style.display = 'block'; // Show bubbles

        } else {
            console.log("Koozie Sports: Koozie Mode Deactivated. Back to 'normal'.");
            if (drunkModeInterval) {
                clearInterval(drunkModeInterval);
                drunkModeInterval = null;
            }
            // Remove tilt override (CSS handles hover tilt)
            tiltElements.forEach(el => el.style.removeProperty('--random-tilt'));
            if(bubbleOverlay) bubbleOverlay.style.display = 'none'; // Hide bubbles
            bodyElement.classList.remove('screen-shake'); // Ensure shake stops
        }
    };

    /**
     * Initializes Intersection Observer for scroll-triggered animations.
     */
    const initScrollAnimations = () => {
        if (!window.IntersectionObserver) {
            console.warn("Intersection Observer not supported. Scroll animations disabled.");
            // Fallback: Make all elements visible immediately if IO not supported
            scrollAnimateElements.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observerOptions = {
            root: null, // Observe intersections relative to the viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger when 10% of the element is visible
        };

        animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, observerOptions);

        scrollAnimateElements.forEach(el => {
            animationObserver.observe(el);
        });
        console.log(`Koozie Sports: Initialized Intersection Observer for ${scrollAnimateElements.length} animated elements.`);
    };

    /**
     * Initializes Intersection Observer for scrollspy navigation highlighting.
     */
    const initScrollspy = () => {
        if (!window.IntersectionObserver || navItems.length === 0 || sections.length === 0) {
            console.warn("Scrollspy initialization requirements not met (Intersection Observer support, nav items, or sections missing).");
            return;
        }

        // Calculate dynamic offset based on shrunken header height
        const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-shrink-height')) || 65;
        const offsetMargin = Math.round((window.innerHeight * SCROLLSPY_OFFSET_PERCENT) / 100);
        // Negative top margin means the trigger line is X pixels *below* the top of the viewport.
        // Positive bottom margin ensures sections near the bottom get activated.
        const rootMargin = `-${headerHeight + offsetMargin}px 0px -${window.innerHeight - headerHeight - offsetMargin - 10}px 0px`;


        const observerOptions = {
            root: null, // relative to viewport
            rootMargin: rootMargin,
            threshold: 0 // Trigger as soon as any part enters the rootMargin zone
        };

        scrollspyObserver = new IntersectionObserver((entries) => {
            let intersectingSectionId = null;

             // Determine the "most prominent" intersecting section based on scroll direction
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    intersectingSectionId = entry.target.id; // Prefer the one currently intersecting
                }
            });

            // If multiple intersect or none truly intersect within the thin threshold line,
            // find the section closest to the activation line based on boundingClientRect
            if (!intersectingSectionId && entries.length > 0) {
                 // Find the section whose top is closest to (or just above) the activation line
                 let closestSection = null;
                 let minDistance = Infinity;

                 sections.forEach(sec => {
                     const rect = sec.getBoundingClientRect();
                     const activationLine = headerHeight + offsetMargin;
                     // Consider sections whose top is above the activation line but bottom is below it
                     if (rect.top <= activationLine && rect.bottom >= activationLine) {
                         const distance = Math.abs(rect.top - activationLine);
                         if (distance < minDistance) {
                             minDistance = distance;
                             closestSection = sec;
                         }
                     }
                 });
                 intersectingSectionId = closestSection ? closestSection.id : null;
            }

            // Special case for reaching the very top
            if (window.scrollY < window.innerHeight * 0.3) { // If near the top of the page
                intersectingSectionId = 'page-top';
            }

            // Only update if the active section changes
            if (intersectingSectionId && intersectingSectionId !== lastActiveSectionId) {
                // console.log(`Scrollspy updating active section to: ${intersectingSectionId}`);
                navItems.forEach(item => {
                    const sectionTarget = item.getAttribute('data-section');
                    const isActive = sectionTarget === intersectingSectionId;
                    item.classList.toggle('active', isActive);
                    item.setAttribute('aria-current', isActive ? 'location' : 'false'); // Use 'location' for scrollspy
                });
                lastActiveSectionId = intersectingSectionId;
            } else if (!intersectingSectionId && lastActiveSectionId) {
                 // If scrolled out of all sections (e.g., into footer), maybe keep last one active or remove all
                 // Option: Remove active class from all if no section is intersecting
                 // navItems.forEach(item => item.classList.remove('active'));
                 // lastActiveSectionId = null;
            }

        }, observerOptions);

        sections.forEach(section => {
            // Ensure the section has an ID to be observed
            if (section.id) {
                scrollspyObserver.observe(section);
            }
        });

        console.log("Koozie Sports: Initialized Intersection Observer for Scrollspy.");
    };

    /**
     * Placeholder function to handle contact form submission.
     * Prevents default submission, shows feedback, and resets.
     * Replace with actual AJAX/Fetch logic.
     * @param {Event} event - The form submission event.
     */
    const handleContactFormSubmit = async (event) => {
        event.preventDefault(); // Prevent default page reload
        if (!contactForm || !formStatusEl) return;

        const formData = new FormData(contactForm);
        // Basic Honeypot Check
        if (formData.get('fax') !== '') {
            console.warn('Honeypot field filled. Likely bot.');
            return; // Silently exit
        }

        formStatusEl.textContent = 'Sending message...';
        formStatusEl.className = 'form-status'; // Reset classes
        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        // --- TODO: Replace this timeout with actual fetch ---
        // Example using Fetch:
        /*
        try {
            const response = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json' // Or other appropriate header
                }
            });

            if (response.ok) {
                formStatusEl.textContent = 'Message sent successfully! We\'ll ignore it shortly.';
                formStatusEl.classList.add('success');
                contactForm.reset(); // Clear the form
            } else {
                // Try to get error message from response if possible
                const errorData = await response.json().catch(() => ({})); // Gracefully handle non-JSON errors
                const errorMessage = errorData?.message || `Oops! Something went wrong. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            formStatusEl.textContent = `Error: ${error.message || 'Could not send message. Try again later.'}`;
            formStatusEl.classList.add('error');
        } finally {
             if (submitButton) submitButton.disabled = false; // Re-enable button
             // Optionally clear status after a few seconds
             setTimeout(() => { formStatusEl.textContent = ''; formStatusEl.className = 'form-status'; }, 6000);
        }
        */

        // --- Placeholder Simulation ---
        setTimeout(() => {
            // Simulate success/failure randomly
            if (Math.random() > 0.2) { // Simulate success
                formStatusEl.textContent = 'Message sent successfully! We\'ll ignore it shortly.';
                formStatusEl.classList.add('success');
                contactForm.reset();
            } else { // Simulate error
                formStatusEl.textContent = 'Error: Failed to send. Did you bribe the server?';
                formStatusEl.classList.add('error');
            }
            if (submitButton) submitButton.disabled = false;
            // Clear status after a few seconds
            setTimeout(() => { formStatusEl.textContent = ''; formStatusEl.className = 'form-status'; }, 7000);
        }, 1500); // Simulate network delay
        // --- End Placeholder Simulation ---
    };


    // --- YouTube Background Player Functions ---
    window.onYouTubeIframeAPIReady = function() {
        if (youtubePlayerEl && !ytPlayer && YOUTUBE_BG_VIDEO_ID) {
            console.log("YouTube API Ready. Creating background player...");
            try {
                ytPlayer = new YT.Player('youtube-player', {
                    videoId: YOUTUBE_BG_VIDEO_ID,
                    playerVars: {
                        'autoplay': 1, 'mute': 1, 'loop': 1, 'playlist': YOUTUBE_BG_VIDEO_ID,
                        'controls': 0, 'showinfo': 0, 'modestbranding': 1, 'playsinline': 1,
                        'fs': 0, 'iv_load_policy': 3, 'rel': 0, 'origin': window.location.origin
                    },
                    events: { 'onReady': onPlayerReady, 'onError': onPlayerError }
                });
            } catch (e) { console.error("Failed to create YouTube player:", e); }
        } else if (!youtubePlayerEl && document.getElementById('hero-section')) {
             console.warn("YouTube player element (#youtube-player) not found on hero section.");
        } else if (!YOUTUBE_BG_VIDEO_ID) {
             console.log("No YouTube background video ID configured.");
        }
    }
    function onPlayerReady(event) {
        console.log("YouTube Background Player Ready.");
        event.target.playVideo();
        event.target.mute(); // Ensure muted
    }
    function onPlayerError(event) {
        console.error("YouTube Background Player Error:", event.data);
        if (youtubePlayerEl?.parentElement) youtubePlayerEl.parentElement.style.backgroundColor = '#1a2a4a'; // Fallback bg color
    }
    function loadYouTubeAPI() {
        // Only load if the player element exists and video ID is set
        if (!youtubePlayerEl || !YOUTUBE_BG_VIDEO_ID) return;

        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
            console.log("Loading YouTube IFrame API...");
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag?.parentNode.insertBefore(tag, firstScriptTag);
        } else if ((typeof YT === 'undefined' || typeof YT.Player === 'undefined') && !ytPlayer) {
            console.log("API script tag found, but YT object not ready. Retrying...");
            setTimeout(loadYouTubeAPI, 500); // Check again shortly
        } else if (!ytPlayer) { // API loaded, but player not instantiated
            console.log("YouTube API already loaded, attempting player creation.");
            window.onYouTubeIframeAPIReady?.(); // Call ready function manually if needed
        }
    }


    // --- Initialization ---
    const initializeSite = () => {
        console.log("Koozie Sports: Initializing...");

        // Core Initializations
        initDarkMode(); // Initialize theme functionality first
        updateDynamicQuote(); // Set initial quote
        updateDynamicYear(); // Set footer year
        initScrollAnimations(); // Set up scroll-triggered animations
        if (navItems.length > 0 && sections.length > 0) { // Only init scrollspy if needed
           initScrollspy();
        }
        loadYouTubeAPI(); // Attempt to load YouTube API if needed

        // Add Event Listeners
        window.addEventListener('scroll', debounce(handleScroll), { passive: true }); // Debounced scroll handler

        // Mobile Navigation Listeners
        hamburgerMenu?.addEventListener('click', () => toggleMobileNav());
        navLinksContainer?.addEventListener('click', handleNavClick); // Close nav on item click

        // Toggle Button Listeners
        drunkModeToggle?.addEventListener('click', toggleDrunkMode);

        // Live Scores Popup Listeners (only on pages where elements exist)
        if (liveScoresToggle && liveScoresPopup) {
             liveScoresToggle.addEventListener('click', () => {
                 if (liveScoresPopup.hidden) {
                     openPopup(liveScoresPopup);
                 } else {
                     closePopup(liveScoresPopup);
                 }
             });
        }
        liveScoresCloseButton?.addEventListener('click', () => closePopup(liveScoresPopup));
        liveScoresOverlay?.addEventListener('click', () => closePopup(liveScoresPopup));

        // Back to Top Listener
        backToTopButton?.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Contact Form Listener
        contactForm?.addEventListener('submit', handleContactFormSubmit);

        // Initial check for elements that depend on scroll position
        handleScroll();

        console.log("Koozie Sports: Initialization complete.");
    };

    // --- Run Initialization ---
    initializeSite();

}); // End DOMContentLoaded
