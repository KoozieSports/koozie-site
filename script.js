/**
 * script.js for Koozie Sports
 * Handles header shrinking, mobile navigation, drunk mode toggle,
 * scroll animations, dynamic year update, and smooth scrolling.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Cache DOM Elements ---
    const mainHeader = document.getElementById('main-header');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.getElementById('nav-links');
    const drunkModeToggle = document.getElementById('drunk-mode-toggle');
    const drunkModeTooltip = drunkModeToggle ? drunkModeToggle.querySelector('.tooltip-text') : null; // Get tooltip span
    const bodyElement = document.body;
    const currentYearSpan = document.getElementById('current-year');
    const scrollAnimateElements = document.querySelectorAll('.animate-on-scroll');
    const internalLinks = document.querySelectorAll('a[href^="#"]'); // For smooth scroll

    // --- State Variables ---
    let isMenuOpen = false;
    let isDrunkMode = false; // Initialize based on class potentially set server-side or localStorage
    if (bodyElement.classList.contains('drunk-mode-active')) {
        isDrunkMode = true;
    }


    // --- Function: Header Shrink on Scroll ---
    const handleHeaderScroll = () => {
        if (!mainHeader) return;
        const scrollThreshold = 50;
        if (window.scrollY > scrollThreshold) {
            mainHeader.classList.add('scrolled');
            bodyElement.classList.add('header-scrolled'); // Used by CSS for scroll-padding-top adjustment on html
        } else {
            mainHeader.classList.remove('scrolled');
            bodyElement.classList.remove('header-scrolled');
        }
    };

    // --- Function: Toggle Mobile Navigation ---
    const toggleMobileNav = () => {
        if (!navLinks || !hamburgerMenu) return;

        isMenuOpen = !isMenuOpen;
        navLinks.classList.toggle('nav-open', isMenuOpen);
        hamburgerMenu.setAttribute('aria-expanded', isMenuOpen);
        bodyElement.classList.toggle('body-menu-open', isMenuOpen); // Optional: lock body scroll

        const icon = hamburgerMenu.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !isMenuOpen);
            icon.classList.toggle('fa-times', isMenuOpen);
            // Add a slight rotation animation for effect
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
                el.style.setProperty('--random-tilt', randomTiltValue);
            });
            // Optional: Play a sound?
            // const bubbleSound = document.getElementById('bubble-sound'); // Needs <audio id="bubble-sound" src="path/to/sound.mp3"></audio>
            // if(bubbleSound) bubbleSound.play().catch(e => console.error("Audio play failed:", e));
        } else {
             console.log("🍺 Koozie Sports: Fun Mode Deactivated. Back to boring reality.");
            // Optional: Explicitly remove tilt or let CSS defaults handle it
             tiltElements.forEach(el => el.style.removeProperty('--random-tilt'));
        }

        // Persist choice in localStorage (optional)
        // localStorage.setItem('koozieDrunkMode', isDrunkMode);
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
            // Fallback: Make all elements visible immediately if IO is not supported
            scrollAnimateElements.forEach(el => el.classList.add('visible'));
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15 // Trigger when 15% visible
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
        // Allow link to #page-top or actual IDs, ignore href="#"
        if (targetId === '#') return;

        // For #page-top, just scroll to top smoothly
        if (targetId === '#page-top') {
             event.preventDefault();
             window.scrollTo({ top: 0, behavior: 'smooth' });
             // Close mobile menu if open
             if (isMenuOpen && navLinks && navLinks.contains(link)) {
                 toggleMobileNav();
             }
             return;
        }

        // For other internal links
        try {
             const targetElement = document.querySelector(targetId);
             if (targetElement) {
                 event.preventDefault(); // Prevent default jump only if target exists

                 // Close mobile menu if open and a nav link is clicked
                 if (isMenuOpen && navLinks && navLinks.contains(link)) {
                      toggleMobileNav();
                 }

                 // Use scrollIntoView, respects scroll-padding-top set in CSS
                 targetElement.scrollIntoView({
                     behavior: 'smooth',
                     block: 'start' // Align to top, considering scroll-padding
                 });

                 // Optional: Update focus for accessibility
                 // setTimeout(() => { targetElement.focus(); }, 500); // Delay focus slightly after scroll
             }
        } catch (e) {
            console.error(`Smooth scroll target element not found for selector: ${targetId}`, e);
        }
    };

    // --- Function: Update Dynamic Content (Example) ---
    const updateDynamicContent = () => {
        const leagueNameEl = document.querySelector('.dynamic-league-name');
        const weekNumberEl = document.querySelector('.dynamic-week');

        if (leagueNameEl) {
            // In a real scenario, this might come from an API or config
            // leagueNameEl.textContent = "Flag Football Fury";
        }
        if (weekNumberEl) {
            // weekNumberEl.textContent = "12";
        }
    };

     // --- Function: Initialize Lightbox (Example Placeholder) ---
     const initializeLightbox = () => {
        // If using a library like Lightbox2, it often initializes itself.
        // If using a custom solution or another library, initialize it here.
        // Example for Lightbox2 (usually just needs the script included):
        // if (typeof lightbox !== 'undefined') {
        //     lightbox.option({
        //       'resizeDuration': 200,
        //       'wrapAround': true
        //     });
        //     console.log("Lightbox initialized.");
        // } else {
        //     console.warn("Lightbox script not found.");
        // }
     }


    // --- Initialize Functionality on Page Load ---

    // 0. Check for saved drunk mode preference (optional)
    // if (localStorage.getItem('koozieDrunkMode') === 'true') {
    //    if (!isDrunkMode) toggleDrunkMode(); // Ensure state matches if loaded differently
    // } else {
    //    if (isDrunkMode) toggleDrunkMode(); // Turn off if saved preference is false/null
    // }


    // 1. Header Scroll Listener
    if (mainHeader) {
        window.addEventListener('scroll', handleHeaderScroll, { passive: true });
        handleHeaderScroll(); // Initial check
    }

    // 2. Mobile Nav Toggle Listener
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', toggleMobileNav);
    }

    // 3. Drunk Mode Toggle Listener
    if (drunkModeToggle) {
        drunkModeToggle.addEventListener('click', toggleDrunkMode);
        // Initial tooltip text update in case it loaded active
        const initialTitle = isDrunkMode ? 'Deactivate "Fun" Mode' : 'Activate "Fun" Mode';
        drunkModeToggle.setAttribute('title', initialTitle);
        if (drunkModeTooltip) {
             drunkModeTooltip.textContent = initialTitle;
        }
    }

    // 4. Update Copyright Year
    updateCopyrightYear();

    // 5. Initialize Scroll Animations
    handleScrollAnimations();

    // 6. Initialize Smooth Scrolling
    internalLinks.forEach(link => {
        link.addEventListener('click', handleSmoothScroll);
    });

    // 7. Initialize Dynamic Content (Example)
    updateDynamicContent();

    // 8. Initialize Lightbox (Placeholder)
    initializeLightbox();


    // --- Optional: Close mobile menu if clicking outside ---
    document.addEventListener('click', (event) => {
        if (isMenuOpen && navLinks && hamburgerMenu) {
            // Ensure click is not the hamburger itself or inside the nav menu
            if (!navLinks.contains(event.target) && !hamburgerMenu.contains(event.target)) {
                toggleMobileNav();
            }
        }
    });

    console.log("Koozie Sports Script Initialized Successfully!");

}); // End DOMContentLoaded
