/**
 * script.js for Koozie Sports
 * Handles header shrinking, mobile navigation, drunk mode toggle,
 * scroll animations, and dynamic year update.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Koozie Sports Script Loaded!"); // Confirmation message

    // --- Cache DOM Elements ---
    const mainHeader = document.getElementById('main-header');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.getElementById('nav-links');
    const drunkModeToggle = document.getElementById('drunk-mode-toggle');
    const bodyElement = document.body;
    const currentYearSpan = document.getElementById('current-year');
    const scrollAnimateElements = document.querySelectorAll('.animate-on-scroll');
    const internalLinks = document.querySelectorAll('a[href^="#"]'); // For smooth scroll

    // --- State Variables ---
    let isMenuOpen = false;
    let isDrunkMode = false;

    // --- Function: Header Shrink on Scroll ---
    const handleHeaderScroll = () => {
        if (!mainHeader) return; // Exit if header doesn't exist

        const scrollThreshold = 50; // Pixels scrolled down to trigger shrink
        if (window.scrollY > scrollThreshold) {
            mainHeader.classList.add('scrolled');
            bodyElement.classList.add('header-scrolled'); // For main padding adjustment
        } else {
            mainHeader.classList.remove('scrolled');
            bodyElement.classList.remove('header-scrolled');
        }
    };

    // --- Function: Toggle Mobile Navigation ---
    const toggleMobileNav = () => {
        if (!navLinks || !hamburgerMenu) return; // Exit if elements missing

        isMenuOpen = !isMenuOpen;
        navLinks.classList.toggle('nav-open', isMenuOpen);
        hamburgerMenu.setAttribute('aria-expanded', isMenuOpen);
        bodyElement.classList.toggle('body-menu-open', isMenuOpen); // Optional: prevents body scroll

        // Change hamburger icon (optional visual cue)
        const icon = hamburgerMenu.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !isMenuOpen);
            icon.classList.toggle('fa-times', isMenuOpen); // 'X' icon when open
        }
    };

    // --- Function: Toggle Drunk Mode ---
    const toggleDrunkMode = () => {
        if (!bodyElement) return;

        isDrunkMode = !isDrunkMode;
        bodyElement.classList.toggle('drunk-mode-active', isDrunkMode);

        // Apply random tilt to elements if drunk mode is active
        if (isDrunkMode) {
            const tiltElements = document.querySelectorAll('.tilt-element');
            tiltElements.forEach(el => {
                // Set a random CSS variable for tilt degree variation
                const randomTiltValue = Math.random(); // Value between 0 and 1
                el.style.setProperty('--random-tilt', randomTiltValue);
            });
        } else {
            // Optional: Reset tilt by removing the variable (or let CSS handle default)
            // const tiltElements = document.querySelectorAll('.tilt-element');
            // tiltElements.forEach(el => el.style.removeProperty('--random-tilt'));
        }

        console.log(`Drunk Mode: ${isDrunkMode ? 'Activated!' : 'Deactivated.'}`);
        // You could also update the toggle button's title attribute here
        if (drunkModeToggle) {
            drunkModeToggle.setAttribute('title', isDrunkMode ? 'Deactivate "Fun" Mode' : 'Activate "Fun" Mode');
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
        if (!scrollAnimateElements || scrollAnimateElements.length === 0) return;

        const observerOptions = {
            root: null, // relative to document viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger when 10% of the element is visible
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
        const link = event.target.closest('a[href^="#"]'); // Ensure we get the link itself
        if (!link) return;

        const targetId = link.getAttribute('href');
        // Ensure it's not just a "#" link (like placeholder links)
        if (targetId === '#' || targetId.length < 2) return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            event.preventDefault(); // Prevent default jump

            // Calculate offset if header is fixed (CSS `scroll-padding-top` is often preferred)
            let headerOffset = 0;
            if (mainHeader) {
                headerOffset = mainHeader.offsetHeight;
                // Or use the computed style if height transitions:
                // headerOffset = parseFloat(window.getComputedStyle(mainHeader).height);
            }

            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;


            // Close mobile menu if open and a link is clicked
            if (isMenuOpen && navLinks && navLinks.contains(link)) {
                 toggleMobileNav();
            }

            // Use native smooth scrolling
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            // Alternative: Use element.scrollIntoView (less control over offset)
            // targetElement.scrollIntoView({
            //     behavior: 'smooth',
            //     block: 'start' // 'start', 'center', 'end', or 'nearest'
            // });
        }
    };

    // --- Initialize Functionality ---

    // 1. Header Scroll Listener
    if (mainHeader) {
        window.addEventListener('scroll', handleHeaderScroll, { passive: true });
        // Initial check in case the page loads already scrolled
        handleHeaderScroll();
    }

    // 2. Mobile Nav Toggle Listener
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', toggleMobileNav);
    }

    // 3. Drunk Mode Toggle Listener
    if (drunkModeToggle) {
        drunkModeToggle.addEventListener('click', toggleDrunkMode);
    }

    // 4. Update Copyright Year
    updateCopyrightYear();

    // 5. Initialize Scroll Animations
    handleScrollAnimations();

    // 6. Initialize Smooth Scrolling
    internalLinks.forEach(link => {
        link.addEventListener('click', handleSmoothScroll);
    });

    // --- Optional: Close mobile menu if clicking outside ---
    document.addEventListener('click', (event) => {
        if (isMenuOpen && navLinks && hamburgerMenu) {
            // Check if the click was outside the navLinks and not on the hamburger button
            if (!navLinks.contains(event.target) && !hamburgerMenu.contains(event.target)) {
                toggleMobileNav();
            }
        }
    });

}); // End DOMContentLoaded
