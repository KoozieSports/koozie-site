/**
 * script.js for Koozie Sports - Enhanced & Revised
 * Handles header shrinking, mobile navigation, dark mode, drunk mode,
 * scroll animations, scrollspy navbar highlighting, live scores popup,
 * dynamic quote, dynamic year update, smooth scrolling, YouTube BG video,
 * scroll progress bar, back-to-top button, etc.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const YOUTUBE_BG_VIDEO_ID = 'ERWsGzRMOEw'; // Background video ID
    const SCROLLSPY_OFFSET_PERCENT = 30; // % of viewport height from top. Adjust 20-40 for best feel. Line where section becomes active.
    const BACK_TO_TOP_THRESHOLD = 300; // Pixels scrolled before Back-to-Top button appears
    const DRUNK_MODE_SHAKE_INTERVAL = 15000; // Approx. interval (ms) for random screen shake check
    const DRUNK_MODE_SHAKE_PROBABILITY = 0.3; // Probability (0-1) of shake occurring during check
    const DRUNK_MODE_SHAKE_DURATION = 300; // Duration (ms) of the screen shake animation

    // --- Cache DOM Elements ---
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const mainHeader = document.getElementById('main-header');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinksContainer = document.getElementById('nav-links');
    const navItems = navLinksContainer ? Array.from(navLinksContainer.querySelectorAll('.nav-item[data-section]')) : []; // Use Array.from
    const sections = Array.from(document.querySelectorAll('section[data-id]')); // Use Array.from
    const currentYearSpan = document.getElementById('current-year');
    const scrollAnimateElements = document.querySelectorAll('.animate-on-scroll');
    const youtubePlayerEl = document.getElementById('youtube-player');
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    const backToTopButton = document.querySelector('.back-to-top');

    // Toggles & Related Elements
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIconMoon = darkModeToggle?.querySelector('.fa-moon'); // Optional chaining
    const darkModeIconSun = darkModeToggle?.querySelector('.fa-sun');
    const darkModeTooltip = darkModeToggle?.querySelector('.tooltip-text');

    const liveScoresToggle = document.getElementById('live-scores-toggle');
    const liveScoresPopup = document.getElementById('live-scores-popup'); // The popup itself
    const liveScoresCloseButton = liveScoresPopup?.querySelector('.popup-close-button');
    const liveScoresTooltip = liveScoresToggle?.querySelector('.tooltip-text');

    const drunkModeToggle = document.getElementById('drunk-mode-toggle');
    const drunkModeTooltip = drunkModeToggle?.querySelector('.tooltip-text');
    const drunkModeSound = document.getElementById('drunk-mode-sound');
    const bubbleOverlay = document.getElementById('bubble-overlay');

    // Dynamic Quote
    const dynamicQuoteTextEl = document.getElementById('dynamic-quote-text');
    const dynamicQuoteAttrEl = document.getElementById('dynamic-quote-attribution');

    // --- State Variables ---
    let isMenuOpen = false;
    let isDrunkMode = bodyElement.classList.contains('drunk-mode-active');
    let areLiveScoresOpen = liveScoresPopup ? !liveScoresPopup.hasAttribute('hidden') : false; // Check initial state from HTML
    let currentTheme = localStorage.getItem('koozieTheme') || 'light';
    let ytPlayer; // YouTube Background Player instance
    let drunkModeInterval = null;
    let lastActiveSectionId = null; // Track the currently highlighted nav item's section
    let scrollspyObserver = null; // To potentially disconnect/reconnect later
    let lastScrollTop = 0; // For scroll direction detection in scrollspy

    // --- Dynamic Content Definitions ---
    // Revision: Restored the full quotes list
    const dynamicQuotes = [
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
        { quote: `"Shake and bake!"`, attribution: "- Ricky Bobby & Cal Naughton Jr." },
        { quote: `"I wanna go fast!"`, attribution: "- Ricky Bobby" },
        { quote: `"Help me Tom Cruise! Tom Cruise, use your witchcraft on me to get the fire off me!"`, attribution: "- Ricky Bobby" },
        { quote: `"60% of the time, it works every time."`, attribution: "- Brian Fantana" },
        { quote: `"If you can dodge a wrench, you can dodge a ball."`, attribution: "- Patches O'Houlihan" },
        { quote: `"Everybody panic! It's just like the Titanic, but it's full of bears!"`, attribution: "- Jackie Moon" },
        { quote: `"You're killin' me, Smalls!"`, attribution: "- Ham Porter" },
        { quote: `"Heroes get remembered, but legends never die."`, attribution: "- The Babe (via Narrator)" },
        { quote: `"Remember kid, there's heroes and there's legends. Heroes get remembered but legends never die, follow your heart kid, and you'll never go wrong."`, attribution: "- Babe Ruth's Ghost" },
        { quote: `"Juuuuust a bit outside."`, attribution: "- Harry Doyle" },
        { quote: `"Are you saying Jesus Christ can't hit a curveball?"`, attribution: "- Eddie Harris" },
        { quote: `"Now that's what I call high-quality H2O."`, attribution: "- Bobby Boucher" },
        { quote: `"You can do it!"`, attribution: "- Various Townies" },
        { quote: `"We goin' Sizzler! We goin' Sizzler!"`, attribution: "- Sidney Deane" },
        { quote: `"You can listen to Jimi but you can't hear him."`, attribution: "- Sidney Deane" },
        { quote: `"Let's get tropical!"`, attribution: "- Jackie Moon" },
        { quote: `"In the annals of history, people are gonna be talking about three things: the discovery of fire, invention of the submarine, and the Flint Michigan Mega Bowl!"`, attribution: "- Jackie Moon" },
        { quote: `"Now get out there and take your pants off!"`, attribution: "- Coach Morris Buttermaker" },
        { quote: `"All I know is when we win a game, it's a team win. When we lose a game, it's my fault."`, attribution: "- Coach Morris Buttermaker" },
        { quote: `"I am 'The Hammer'! Prepare to be nailed!"`, attribution: "- Richie Goodman" },
        { quote: `"We're like the Jamaican bobsled team of baseball."`, attribution: "- Clark Reedy" },
        { quote: `"How can you not be romantic about baseball?"`, attribution: "- Billy Beane" },
        { quote: `"It's a process, trust the process."`, attribution: "- Billy Beane" },
        { quote: `"He gets on base."`, attribution: "- Peter Brand" },
        { quote: `"Our deepest fear is not that we are inadequate. Our deepest fear is that we are powerful beyond measure."`, attribution: "- Timo Cruz (quoting Marianne Williamson)" },
        { quote: `"Sir, they can cut the chains off the door, but they can't make us play."`, attribution: "- Jason Lyle" },
        { quote: `"Five foot nothin', a hundred and nothin', and hardly a spec of athletic ability."`, attribution: "- Fortune (Describing Rudy?)" },
        { quote: `"Being told 'no' just means try harder... or maybe get a restraining order."`, attribution: "- Rudy-esque determination" },
        { quote: `"It is high! It is far! It is gone!"`, attribution: "- John Sterling" },
        { quote: `"All Rise! Here comes the Judge!"`, attribution: "- John Sterling (on an Aaron Judge HR)" },
        { quote: `"Ballgame over! Yankees win! Theeeeeeeee Yankees win!"`, attribution: "- John Sterling" },
        { quote: `"Roger Clemens is in George Steinbrenner's box! And I am not afraid to say it!"`, attribution: "- Suzyn Waldman" },
        { quote: `"Oh my goodness gracious! Of all the dramatic things I've ever seen..."`, attribution: "- Suzyn Waldman" },
        { quote: `"Baseball is theatre, and the ballpark is the stage."`, attribution: "- Suzyn Waldman (paraphrased sentiment)" },
    ];

    // --- YouTube Background Player Functions ---
    window.onYouTubeIframeAPIReady = function() {
        if (youtubePlayerEl && !ytPlayer) {
            console.log("YouTube API Ready. Creating background player...");
            try {
                ytPlayer = new YT.Player('youtube-player', {
                    height: '360', width: '640', videoId: YOUTUBE_BG_VIDEO_ID,
                    playerVars: {
                        'autoplay': 1, 'mute': 1, 'loop': 1, 'playlist': YOUTUBE_BG_VIDEO_ID, // Required for loop
                        'controls': 0, 'showinfo': 0, 'modestbranding': 1, 'playsinline': 1,
                        'fs': 0, 'iv_load_policy': 3, 'rel': 0, 'origin': window.location.origin // Helps prevent some errors
                    },
                    events: { 'onReady': onPlayerReady, 'onError': onPlayerError }
                });
            } catch (e) { console.error("Failed to create YouTube player:", e); }
        } else if (!youtubePlayerEl) {
            // Only log warning if the element is expected (e.g., on index.html)
             if (document.getElementById('hero-section')) {
                console.warn("YouTube player element (#youtube-player) not found on a page where it might be expected.");
             }
        }
    }
    function onPlayerReady(event) {
        console.log("YouTube Background Player Ready."); event.target.playVideo(); event.target.mute(); // Ensure muted
    }
    function onPlayerError(event) {
        console.error("YouTube Background Player Error:", event.data);
        // Maybe hide the player wrapper or show a static background as fallback
        if (youtubePlayerEl?.parentElement) youtubePlayerEl.parentElement.style.backgroundColor = '#1a2a4a'; // Fallback bg color
    }
    function loadYouTubeAPI() {
        // Only load if the player element exists on the current page
        if (!youtubePlayerEl) return;

        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
            console.log("Loading YouTube IFrame API...");
            const tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
            console.log("API script tag found, waiting for YT object...");
            // Check again if API loaded after a delay, only if player not already created
            if(!ytPlayer) setTimeout(loadYouTubeAPI, 500);
        } else {
            console.log("YouTube API already loaded.");
            // If API is loaded but player not ready, trigger the ready function
            if (typeof window.onYouTubeIframeAPIReady === 'function' && !ytPlayer) {
                window.onYouTubeIframeAPIReady();
            }
        }
    }

    // --- Function: Set Theme (Dark/Light) ---
    const setTheme = (theme) => {
        if (theme !== 'light' && theme !== 'dark') theme = 'light'; // Sanitize
        htmlElement.setAttribute('data-theme', theme);
        currentTheme = theme;
        try { localStorage.setItem('koozieTheme', theme); }
        catch (e) { console.warn("Could not save theme preference to localStorage:", e); }

        // Update toggle button state
        if (darkModeToggle && darkModeIconMoon && darkModeIconSun && darkModeTooltip) {
            const isDark = theme === 'dark';
            darkModeIconMoon.style.display = isDark ? 'none' : 'inline-block';
            darkModeIconSun.style.display = isDark ? 'inline-block' : 'none';
            const newTitle = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
            darkModeToggle.setAttribute('title', newTitle);
            darkModeToggle.setAttribute('aria-pressed', String(isDark));
            darkModeTooltip.textContent = newTitle;
        }

        // Update meta theme-color (optional, but good practice)
        document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: light)"]')?.setAttribute('content', theme === 'light' ? '#fdfaef' : '#1a1a1a');
        document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]')?.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#fdfaef');

        console.log(`Koozie Sports: Theme changed to ${theme}`);
    };

    // --- Function: Initialize Dark Mode ---
    const initDarkMode = () => {
        let initialTheme = 'light';
        try {
            const savedTheme = localStorage.getItem('koozieTheme');
            if (savedTheme === 'dark' || savedTheme === 'light') {
                initialTheme = savedTheme;
            } else {
                // Use system preference if no saved theme
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                initialTheme = prefersDark ? 'dark' : 'light';
            }
        } catch(e) {
             console.warn("Could not read theme preference from localStorage:", e);
             const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
             initialTheme = prefersDark ? 'dark' : 'light';
        }

        setTheme(initialTheme); // Set the theme initially

        // Add listener to toggle button
        darkModeToggle?.addEventListener('click', () => {
            setTheme(currentTheme === 'light' ? 'dark' : 'light');
        });

        // Listen for system preference changes (only affects if no user pref saved)
        try {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
                if (!localStorage.getItem('koozieTheme')) { // Only update if no user preference is set
                    setTheme(event.matches ? 'dark' : 'light');
                }
            });
        } catch (e) { console.warn("Could not add listener for system theme changes:", e); }
    };

    // --- Function: Update Dynamic Quote ---
    const updateDynamicQuote = () => {
        if (dynamicQuotes.length > 0 && dynamicQuoteTextEl && dynamicQuoteAttrEl) {
            const randomIndex = Math.floor(Math.random() * dynamicQuotes.length);
            const selectedItem = dynamicQuotes[randomIndex];
            dynamicQuoteTextEl.innerHTML = selectedItem.quote; // Use innerHTML for potential formatting within quote
            dynamicQuoteAttrEl.textContent = selectedItem.attribution ? ` - ${selectedItem.attribution}` : ''; // Add dash only if attribution exists
        } else if (dynamicQuoteTextEl) {
            // Only run this if the element exists (i.e., on index.html)
            dynamicQuoteTextEl.textContent = "Looks like the quote machine is on a beer run...";
            if(dynamicQuoteAttrEl) dynamicQuoteAttrEl.textContent = "";
        }
    };

    // --- Function: Handle Scroll-Related Updates ---
    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        // 1. Header Shrink
        if (mainHeader) {
            const isScrolled = scrollPosition > 50;
            mainHeader.classList.toggle('scrolled', isScrolled);
            bodyElement.classList.toggle('header-scrolled', isScrolled);
        }

        // 2. Scroll Progress Bar
        if (scrollProgressBar) {
            const scrollPercentage = scrollHeight > clientHeight ? (scrollPosition / (scrollHeight - clientHeight)) * 100 : 0;
            scrollProgressBar.style.width = `${Math.min(scrollPercentage, 100)}%`; // Cap at 100%
        }

        // 3. Back to Top Button Visibility
        if (backToTopButton) {
            const isVisible = scrollPosition > BACK_TO_TOP_THRESHOLD;
            backToTopButton.style.opacity = isVisible ? '1' : '0';
            backToTopButton.style.visibility = isVisible ? 'visible' : 'hidden';
        }

        // 4. Update Scroll Direction for Scrollspy
        lastScrollTop = scrollPosition <= 0 ? 0 : scrollPosition; // For scroll direction detection
    };

    // --- Function: Toggle Mobile Navigation ---
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
        console.log(`Koozie Sports: Mobile menu ${isMenuOpen ? 'opened' : 'closed'}`);
    };

    // --- Function: Trigger Random Screen Shake (for Drunk Mode) ---
    const triggerScreenShake = () => {
         if (isDrunkMode && Math.random() < DRUNK_MODE_SHAKE_PROBABILITY) {
            console.log("Drunk Mode: Shake it!");
            bodyElement.classList.add('screen-shake');
            setTimeout(() => {
                bodyElement.classList.remove('screen-shake');
            }, DRUNK_MODE_SHAKE_DURATION);
         }
    };

    // --- Function: Toggle Drunk Mode ---
    const toggleDrunkMode = () => {
        if (!bodyElement || !drunkModeToggle) return;

        isDrunkMode = !isDrunkMode;
        bodyElement.classList.toggle('drunk-mode-active', isDrunkMode);
        drunkModeToggle.setAttribute('aria-pressed', String(isDrunkMode));

        const newTitle = isDrunkMode ? 'Deactivate Koozie Mode' : 'Activate Koozie Mode';
        drunkModeToggle.setAttribute('title', newTitle);
        if (drunkModeTooltip) drunkModeTooltip.textContent = newTitle;

        const tiltElements = document.querySelectorAll('.tilt-element');

        if (isDrunkMode) {
            console.log("🍻 Koozie Sports: Koozie Mode Activated! Things might get wobbly.");
            tiltElements.forEach(el => {
                // Set a random value for the CSS variable used in the transform
                el.style.setProperty('--random-tilt', Math.random());
            });
            drunkModeSound?.play().catch(e => console.warn("Drunk mode sound play failed:", e));
            // Bubble overlay visibility is handled by CSS via .drunk-mode-active

            // Start random shake interval
            if (drunkModeInterval) clearInterval(drunkModeInterval); // Clear existing interval if any
            drunkModeInterval = setInterval(triggerScreenShake, DRUNK_MODE_SHAKE_INTERVAL);

        } else {
            console.log("🍺 Koozie Sports: Koozie Mode Deactivated. Back to sober reality.");
            tiltElements.forEach(el => el.style.removeProperty('--random-tilt')); // Remove the tilt override
            bodyElement.classList.remove('screen-shake'); // Ensure shake class is removed immediately
            if (drunkModeInterval) clearInterval(drunkModeInterval); // Stop interval
            drunkModeInterval = null;
        }

        try {
            localStorage.setItem('koozieDrunkMode', String(isDrunkMode));
        } catch (e) {
            console.warn("Could not save drunk mode preference to localStorage:", e);
        }
    };

    // --- Functions: Open/Close Live Scores Popup ---
    const openLiveScoresPopup = () => {
        if (!liveScoresPopup || areLiveScoresOpen) return;
        areLiveScoresOpen = true;
        liveScoresPopup.removeAttribute('hidden');
        bodyElement.classList.add('live-scores-popup-open'); // For overlay & scroll lock
        liveScoresToggle?.setAttribute('aria-pressed', 'true');
        liveScoresCloseButton?.focus(); // Focus the close button for accessibility
        console.log("Live Scores Popup Opened");
        // Optional: If the widget needs re-initialization after being revealed
        // if (window._365Scores) { /* Check if widget API exists */
        //    window._365Scores.widgetControl('refresh'); // Example, check widget docs
        // }
    };

    const closeLiveScoresPopup = () => {
        if (!liveScoresPopup || !areLiveScoresOpen) return;
        areLiveScoresOpen = false;
        liveScoresPopup.setAttribute('hidden', '');
        bodyElement.classList.remove('live-scores-popup-open');
        liveScoresToggle?.setAttribute('aria-pressed', 'false');
        liveScoresToggle?.focus(); // Return focus to the toggle button
        console.log("Live Scores Popup Closed");
    };

    const toggleLiveScores = () => {
        if (areLiveScoresOpen) {
            closeLiveScoresPopup();
        } else {
            openLiveScoresPopup();
        }
        // Update tooltip (optional, might be better to have separate open/close tooltips)
        const newTitle = areLiveScoresOpen ? 'Hide Live Scores' : 'Show Live Scores';
        liveScoresToggle?.setAttribute('title', newTitle);
        if (liveScoresTooltip) liveScoresTooltip.textContent = newTitle;
        // Save preference (optional)
        try { localStorage.setItem('koozieLiveScoresOpen', String(areLiveScoresOpen)); }
        catch(e) { console.warn("Could not save live scores pref:", e); }
    };

    // --- Function: Update Copyright Year ---
    const updateCopyrightYear = () => {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    };

    // --- Function: Handle Scroll Animations (Intersection Observer) ---
    const initScrollAnimations = () => {
        if (!('IntersectionObserver' in window) || scrollAnimateElements.length === 0) {
            if (scrollAnimateElements.length > 0) {
                console.warn("IntersectionObserver not supported, scroll animations disabled.");
                scrollAnimateElements.forEach(el => el.classList.add('visible')); // Show all
            }
            return;
        }

        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 }; // Trigger when 15% visible
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
        // Ensure it's a valid internal link and not just "#"
        if (!targetId || targetId === '#' || !targetId.startsWith('#')) return;

        // Close mobile menu if open and a nav link inside it was clicked
        if (isMenuOpen && navLinksContainer && navLinksContainer.contains(link)) {
            toggleMobileNav(true); // Force close
        }

        // Special case for #page-top
        if (targetId === '#page-top') {
             event.preventDefault();
             window.scrollTo({ top: 0, behavior: 'smooth' });
             // Optionally remove hash from URL
             if (history.pushState) history.pushState(null, null, window.location.pathname + window.location.search);
             // Manually activate home link if scrollspy doesn't catch it immediately
             updateActiveNavLink('page-top');
             return;
        }

        // Handle other internal links
        try {
            // Try finding by ID first, then by data-id if it's a section target
            const targetElement = document.querySelector(targetId) || document.querySelector(`section[data-id="${targetId.substring(1)}"]`);

            if (targetElement) {
                event.preventDefault(); // Prevent default jump only if target exists

                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start' // Align to top (respects scroll-padding-top)
                });

                // Optional: Update URL hash after scroll finishes (can sometimes interfere with scrollspy)
                // setTimeout(() => {
                //    if (history.pushState) { history.pushState(null, null, targetId); }
                // }, 600);

            } else {
                console.warn(`Smooth scroll target element not found for selector: ${targetId}`);
                // Allow default browser behavior if target isn't found on the page
            }
        } catch (e) {
           console.error(`Error finding smooth scroll target: ${targetId}`, e);
           // Allow default browser behavior on error
        }
    };

     // --- Function: Update Active Nav Link Helper ---
     const updateActiveNavLink = (activeSectionId) => {
         // Only update if the active section has changed or if forcing an update
         if (!activeSectionId || activeSectionId === lastActiveSectionId) {
            return;
         }

         // console.log(`Scrollspy: Updating active link from '${lastActiveSectionId}' to '${activeSectionId}'`); // Debugging

         navItems.forEach(navLink => {
            const section = navLink.getAttribute('data-section');
             if (section === activeSectionId) {
                 navLink.classList.add('active');
                 navLink.setAttribute('aria-current', 'page'); // Better accessibility
             } else {
                 navLink.classList.remove('active');
                 navLink.removeAttribute('aria-current');
             }
         });
         lastActiveSectionId = activeSectionId; // Update the tracker
     };

    // --- Function: Initialize Scrollspy (Navbar Highlighting) ---
    const initScrollspy = () => {
        // Only run scrollspy on pages with sections and nav items to track
        if (!('IntersectionObserver' in window) || sections.length === 0 || navItems.length === 0) {
            console.warn("Scrollspy prerequisites not met (IntersectionObserver, sections[data-id], or navItems[data-section]). Scrollspy disabled.");
            // Try activating home link by default if on index page
            if (document.body.id === 'page-top') updateActiveNavLink('page-top');
            return;
        }
         if (scrollspyObserver) {
             scrollspyObserver.disconnect(); // Disconnect previous observer if re-initializing
             console.log("Scrollspy: Disconnected previous observer.");
         }

        // Calculate the top offset based on the shrunken header height for the trigger line
        const headerHeight = mainHeader ? parseInt(getComputedStyle(htmlElement).getPropertyValue('--header-shrink-height'), 10) || 60 : 60;
        const offsetPx = (window.innerHeight * SCROLLSPY_OFFSET_PERCENT) / 100;
        // rootMargin: top defines the line below the header. bottom defines how far down the viewport the section needs to reach.
        // Positive bottom margin means the trigger zone extends *below* the viewport bottom (less useful here).
        // Negative bottom margin pushes the bottom boundary *up* from the viewport bottom.
        // We want the section to be active when its top passes the offset line.
        const rootMarginTop = `-${headerHeight + 1}px`; // Trigger point starts just below the header
        const rootMarginBottom = `-${window.innerHeight - offsetPx - headerHeight}px`; // Bottom boundary is effectively the offset line

        const observerOptions = {
            root: null, // relative to viewport
            rootMargin: `${rootMarginTop} 0px ${rootMarginBottom} 0px`,
            threshold: 0 // Trigger as soon as any part enters/leaves the intersection defined by rootMargin
        };

        const observerCallback = (entries) => {
            let bestVisibleSectionId = null;
            let intersectingSections = [];

            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    intersectingSections.push(entry.target.getAttribute('data-id'));
                }
            });

            // Determine the most relevant section based on scroll direction
            if (intersectingSections.length > 0) {
                // Find the section with the corresponding data-id in the original sections array to get its index
                const getSectionIndex = (id) => sections.findIndex(sec => sec.getAttribute('data-id') === id);

                if (intersectingSections.length === 1) {
                    bestVisibleSectionId = intersectingSections[0];
                } else {
                    // Sort intersecting sections by their order in the DOM
                    intersectingSections.sort((a, b) => getSectionIndex(a) - getSectionIndex(b));
                     // Scrolling Down: Prefer the lowest intersecting section.
                     // Scrolling Up: Prefer the highest intersecting section.
                     // (lastScrollTop is updated in handleScroll)
                    const scrollDown = window.scrollY > lastScrollTop;
                    bestVisibleSectionId = scrollDown ? intersectingSections[intersectingSections.length - 1] : intersectingSections[0];
                }
            }

            // --- Edge Case Handling ---
            // 1. Scrolled to the very top
            if (window.scrollY < headerHeight) {
                bestVisibleSectionId = 'page-top';
            }
            // 2. Scrolled to the very bottom
            else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) { // Check if near bottom
                 // Find the last section in the sections array
                 const lastSectionElement = sections[sections.length - 1];
                 if (lastSectionElement) bestVisibleSectionId = lastSectionElement.getAttribute('data-id');
            }
            // 3. No section is intersecting (gap between sections, possibly during fast scroll)
            //    Keep the last active section highlighted in this case, unless at top/bottom.
            else if (!bestVisibleSectionId && lastActiveSectionId) {
                 bestVisibleSectionId = lastActiveSectionId; // Maintain highlight
            }

            // Update the nav link only if the best section has changed
            updateActiveNavLink(bestVisibleSectionId);
        };

        scrollspyObserver = new IntersectionObserver(observerCallback, observerOptions);
        sections.forEach(section => scrollspyObserver.observe(section));
        console.log(`Scrollspy Initialized. Observing ${sections.length} sections. Offset: ${SCROLLSPY_OFFSET_PERCENT}%, Margin: ${rootMarginTop} 0px ${rootMarginBottom} 0px`);

        // Initial check in case the page loads scrolled somewhere
        handleScroll(); // Ensure header height is correct & lastScrollTop is set
        // Manually trigger observer callback logic once after setup for initial load state
        setTimeout(() => { // Short delay to ensure layout is stable
             if (scrollspyObserver) { // Check if observer was successfully created
                const initialEntries = scrollspyObserver.takeRecords ? scrollspyObserver.takeRecords() : []; // Get current state
                observerCallback(initialEntries); // Run callback logic
             } else {
                 // Fallback if observer failed - activate home
                 if (document.body.id === 'page-top') updateActiveNavLink('page-top');
             }
        }, 100);

    };

    // --- Function: Initialize Stored Preferences ---
    const initPreferences = () => {
         // Drunk Mode
         try {
             const savedDrunkMode = localStorage.getItem('koozieDrunkMode') === 'true';
             // Only toggle if saved state differs from the default class state
             if (savedDrunkMode !== isDrunkMode) {
                 toggleDrunkMode();
             } else { // Ensure button state matches initial state even if not toggled
                 if (drunkModeToggle) {
                     drunkModeToggle.setAttribute('aria-pressed', String(isDrunkMode));
                     const initialTitle = isDrunkMode ? 'Deactivate Koozie Mode' : 'Activate Koozie Mode';
                     drunkModeToggle.setAttribute('title', initialTitle);
                     if (drunkModeTooltip) drunkModeTooltip.textContent = initialTitle;
                 }
             }
         } catch (e) { console.warn("Could not read drunk mode preference from localStorage:", e); }

         // Live Scores Popup (optional: restore open state on page load?)
         // Generally better UX to have popups closed by default on load.
         // If you want to restore:
         // try {
         //     const savedScoresOpen = localStorage.getItem('koozieLiveScoresOpen') === 'true';
         //     if (savedScoresOpen) {
         //         openLiveScoresPopup();
         //     }
         // } catch (e) { console.warn("Could not read live scores pref:", e); }
    };


    // --- Initialize Functionality on Page Load ---

    // 1. Core Functionality
    initDarkMode(); // Must run first to set theme variables
    initPreferences(); // Load stored drunk mode state
    updateCopyrightYear();
    updateDynamicQuote(); // Run only if elements exist

    // 2. Event Listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleSmoothScroll); // Handles all internal links, including #page-top

    hamburgerMenu?.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from closing menu immediately via document listener
        toggleMobileNav();
    });

    drunkModeToggle?.addEventListener('click', toggleDrunkMode);

    // Live Scores Popup Listeners
    liveScoresToggle?.addEventListener('click', toggleLiveScores);
    liveScoresCloseButton?.addEventListener('click', closeLiveScoresPopup);

    // Close popup with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && areLiveScoresOpen) {
            closeLiveScoresPopup();
        }
    });

    // Close popup when clicking outside of it (on the overlay)
    document.addEventListener('click', (event) => {
         if (areLiveScoresOpen && liveScoresPopup && !liveScoresPopup.contains(event.target) && event.target !== liveScoresToggle && !liveScoresToggle?.contains(event.target)) {
             closeLiveScoresPopup();
         }
     });


    // 3. Initialize Observers & API Calls
    initScrollAnimations();
    loadYouTubeAPI(); // Load YouTube BG Video API if element exists
    initScrollspy(); // Initialize Scrollspy

    // --- Optional: Close mobile menu if clicking outside ---
    document.addEventListener('click', (event) => {
        if (isMenuOpen && navLinksContainer && hamburgerMenu) {
            // Check if the click is outside the nav container AND outside the hamburger button
            if (!navLinksContainer.contains(event.target) && !hamburgerMenu.contains(event.target)) {
                toggleMobileNav(true); // Force close
            }
        }
    });
    // Stop propagation on clicks inside the nav menu itself unless it's a link
    navLinksContainer?.addEventListener('click', (event) => {
        if (!event.target.closest('a')) { // Allow link clicks to bubble up
            event.stopPropagation();
        }
    });

    // --- Optional: Re-init scrollspy on resize (debounced) ---
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            console.log("Window resized, re-initializing scrollspy.");
            // Re-initialize scrollspy to update rootMargin based on potentially new viewport/header height
            initScrollspy();
        }, 250); // Debounce resize events
    });

    // --- Final Check ---
    handleScroll(); // Run scroll handler once on load to set initial header/button states

    console.log("Koozie Sports Script Initialized Successfully! (Revised Complete)");

}); // End DOMContentLoaded
