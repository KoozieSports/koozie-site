/**
 * script.js for Koozie Sports - Enhanced & Revised
 * Handles header shrinking, mobile navigation, dark mode, drunk mode,
 * scroll animations, scrollspy navbar highlighting, dynamic quote,
 * dynamic year update, smooth scrolling, YouTube integration,
 * scroll progress bar, live scores toggle, back-to-top button, etc.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const YOUTUBE_BG_VIDEO_ID = 'ERWsGzRMOEw'; // Background video ID
    const SCROLLSPY_OFFSET_PERCENT = 35; // % of viewport height from top to trigger section activation (Adjust for better feel)
    const BACK_TO_TOP_THRESHOLD = 300; // Pixels scrolled before Back-to-Top button appears
    const DRUNK_MODE_SHAKE_INTERVAL = 15000; // Approx. interval (ms) for random screen shake check
    const DRUNK_MODE_SHAKE_PROBABILITY = 0.3; // Probability (0-1) of shake occurring during check
    const DRUNK_MODE_SHAKE_DURATION = 300; // Duration (ms) of the screen shake animation

    // --- YouTube Data API Config (NEEDS TO BE SET) ---
    // IMPORTANT: Replace with your actual YouTube API Key and Channel ID
    // It's recommended to handle API keys securely, not hardcoding directly here in public code.
    const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // <<<< REPLACE THIS
    const YOUTUBE_CHANNEL_ID = 'YOUR_YOUTUBE_CHANNEL_ID'; // <<<< REPLACE THIS
    const MAX_YOUTUBE_VIDEOS = 6; // Number of videos to fetch

    // --- Cache DOM Elements ---
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const mainHeader = document.getElementById('main-header');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinksContainer = document.getElementById('nav-links');
    const navItems = navLinksContainer ? navLinksContainer.querySelectorAll('.nav-item[data-section]') : [];
    const sections = document.querySelectorAll('section[data-id]');
    const currentYearSpan = document.getElementById('current-year');
    const scrollAnimateElements = document.querySelectorAll('.animate-on-scroll');
    const youtubePlayerEl = document.getElementById('youtube-player');
    const scrollProgressBar = document.getElementById('scroll-progress-bar'); // New
    const backToTopButton = document.querySelector('.back-to-top'); // New

    // Toggles & Related Elements
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIconMoon = darkModeToggle ? darkModeToggle.querySelector('.fa-moon') : null;
    const darkModeIconSun = darkModeToggle ? darkModeToggle.querySelector('.fa-sun') : null;
    const darkModeTooltip = darkModeToggle ? darkModeToggle.querySelector('.tooltip-text') : null;

    const liveScoresToggle = document.getElementById('live-scores-toggle'); // New
    const liveScoresSection = document.getElementById('live-scores'); // New (the whole section)
    const liveScoresTooltip = liveScoresToggle ? liveScoresToggle.querySelector('.tooltip-text') : null; // New

    const drunkModeToggle = document.getElementById('drunk-mode-toggle');
    const drunkModeTooltip = drunkModeToggle ? drunkModeToggle.querySelector('.tooltip-text') : null;
    const drunkModeSound = document.getElementById('drunk-mode-sound');
    const bubbleOverlay = document.getElementById('bubble-overlay');

    // Dynamic Quote
    const dynamicQuoteTextEl = document.getElementById('dynamic-quote-text');
    const dynamicQuoteAttrEl = document.getElementById('dynamic-quote-attribution');

    // YouTube Video List specific elements (if API is used)
    const youtubeVideosContainer = document.getElementById('youtube-video-items');
    const youtubeLoadingMessage = document.querySelector('.youtube-loading-text');
    const youtubeErrorMessage = document.getElementById('youtube-error-message');
    const youtubeFallbackMessage = document.getElementById('youtube-fallback-message');


    // --- State Variables ---
    let isMenuOpen = false;
    let isDrunkMode = bodyElement.classList.contains('drunk-mode-active'); // Initial state from HTML/CSS potentially
    let areLiveScoresVisible = bodyElement.classList.contains('live-scores-visible'); // Initial state
    let currentTheme = localStorage.getItem('koozieTheme') || 'light'; // Default to light
    let ytPlayer; // YouTube Background Player instance
    let drunkModeInterval = null; // Interval ID for drunk mode effects
    let lastActiveSectionId = null; // For scrollspy optimization


    // --- Dynamic Content Definitions ---
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
    // Global function called by YouTube API
    window.onYouTubeIframeAPIReady = function() {
        if (youtubePlayerEl && !ytPlayer) { // Prevent re-initialization
            console.log("YouTube API Ready. Creating background player...");
            try {
                ytPlayer = new YT.Player('youtube-player', {
                    height: '360', // These dimensions don't matter much as CSS handles sizing
                    width: '640',
                    videoId: YOUTUBE_BG_VIDEO_ID,
                    playerVars: {
                        'autoplay': 1, 'mute': 1, 'loop': 1, 'playlist': YOUTUBE_BG_VIDEO_ID, // Required for loop
                        'controls': 0, 'showinfo': 0, 'modestbranding': 1, 'playsinline': 1,
                        'fs': 0, 'iv_load_policy': 3, 'rel': 0, 'origin': window.location.origin // Helps prevent some errors
                    },
                    events: { 'onReady': onPlayerReady, 'onError': onPlayerError }
                });
            } catch (e) {
                console.error("Failed to create YouTube player:", e);
            }
        } else if (!youtubePlayerEl) {
            console.warn("YouTube player element (#youtube-player) not found. Cannot initialize background video.");
        }
    }

    function onPlayerReady(event) {
        console.log("YouTube Background Player Ready.");
        event.target.playVideo();
        event.target.mute(); // Ensure muted
    }

    function onPlayerError(event) {
        console.error("YouTube Background Player Error:", event.data);
        // Maybe hide the player wrapper or show a static background as fallback
        if (youtubePlayerEl && youtubePlayerEl.parentElement) {
             youtubePlayerEl.parentElement.style.backgroundColor = '#1a2a4a'; // Fallback bg color
        }
    }

    function loadYouTubeAPI() {
        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
            console.log("Loading YouTube IFrame API...");
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
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
        try {
            localStorage.setItem('koozieTheme', theme);
        } catch (e) { console.warn("Could not save theme preference to localStorage:", e); }

        // Update toggle button state
        if (darkModeToggle && darkModeIconMoon && darkModeIconSun && darkModeTooltip) {
            const isDark = theme === 'dark';
            darkModeIconMoon.style.display = isDark ? 'none' : 'inline-block';
            darkModeIconSun.style.display = isDark ? 'inline-block' : 'none';
            const newTitle = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
            darkModeToggle.setAttribute('title', newTitle);
            darkModeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            darkModeTooltip.textContent = newTitle;
        }

        // Update meta theme-color
        const themeColorMetaLight = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: light)"]');
        const themeColorMetaDark = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]');
        if (themeColorMetaLight) themeColorMetaLight.content = theme === 'light' ? '#fdfaef' : '#1a1a1a';
        if (themeColorMetaDark) themeColorMetaDark.content = theme === 'dark' ? '#1a1a1a' : '#fdfaef';

        console.log(`Koozie Sports: Theme changed to ${theme}`);
    };

    // --- Function: Initialize Dark Mode ---
    const initDarkMode = () => {
        let initialTheme = 'light';
        try {
            const savedTheme = localStorage.getItem('koozieTheme');
            if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
                initialTheme = savedTheme;
            } else {
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
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                setTheme(currentTheme === 'light' ? 'dark' : 'light');
            });
        }

        // Listen for system preference changes (only affects if no user pref saved)
        try {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
                if (!localStorage.getItem('koozieTheme')) {
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
            dynamicQuoteTextEl.innerHTML = selectedItem.quote; // Use innerHTML for potential formatting
            dynamicQuoteAttrEl.textContent = ` - ${selectedItem.attribution}`; // Add dash
        } else if (dynamicQuoteTextEl) {
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
            const scrollThreshold = 50;
            if (scrollPosition > scrollThreshold) {
                mainHeader.classList.add('scrolled');
                bodyElement.classList.add('header-scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
                bodyElement.classList.remove('header-scrolled');
            }
        }

        // 2. Scroll Progress Bar
        if (scrollProgressBar && (scrollHeight > clientHeight)) { // Avoid division by zero
            const scrollPercentage = (scrollPosition / (scrollHeight - clientHeight)) * 100;
            scrollProgressBar.style.width = `${Math.min(scrollPercentage, 100)}%`; // Cap at 100%
        } else if (scrollProgressBar) {
             scrollProgressBar.style.width = '0%'; // Reset if not scrollable
        }


        // 3. Back to Top Button Visibility
        if (backToTopButton) {
            if (scrollPosition > BACK_TO_TOP_THRESHOLD) {
                backToTopButton.style.opacity = '1';
                backToTopButton.style.visibility = 'visible';
            } else {
                backToTopButton.style.opacity = '0';
                backToTopButton.style.visibility = 'hidden';
            }
        }
    };

    // --- Function: Toggle Mobile Navigation ---
    const toggleMobileNav = (forceClose = false) => {
        if (!navLinksContainer || !hamburgerMenu) return;

        isMenuOpen = forceClose ? false : !isMenuOpen;

        navLinksContainer.classList.toggle('nav-open', isMenuOpen);
        hamburgerMenu.setAttribute('aria-expanded', String(isMenuOpen)); // Use string true/false
        bodyElement.classList.toggle('body-menu-open', isMenuOpen);

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
         if (Math.random() < DRUNK_MODE_SHAKE_PROBABILITY) {
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
                el.style.setProperty('--random-tilt', Math.random());
            });
            if (drunkModeSound) {
                 drunkModeSound.play().catch(e => console.warn("Drunk mode sound play failed:", e));
            }
            if(bubbleOverlay) bubbleOverlay.style.display = 'block'; // Ensure overlay element exists for CSS anim

            // Start random shake interval
            if (drunkModeInterval) clearInterval(drunkModeInterval); // Clear existing interval if any
            drunkModeInterval = setInterval(triggerScreenShake, DRUNK_MODE_SHAKE_INTERVAL);

        } else {
            console.log("🍺 Koozie Sports: Koozie Mode Deactivated. Back to sober reality.");
            tiltElements.forEach(el => el.style.removeProperty('--random-tilt'));
            bodyElement.classList.remove('screen-shake'); // Ensure shake class is removed
            if (drunkModeInterval) clearInterval(drunkModeInterval); // Stop interval
            drunkModeInterval = null;
             if(bubbleOverlay) bubbleOverlay.style.display = 'none'; // Hide overlay element
        }

        try {
            localStorage.setItem('koozieDrunkMode', String(isDrunkMode));
        } catch (e) {
            console.warn("Could not save drunk mode preference to localStorage:", e);
        }
    };


    // --- Function: Toggle Live Scores Visibility ---
    const toggleLiveScores = () => {
        if (!bodyElement || !liveScoresToggle || !liveScoresSection) return;

        areLiveScoresVisible = !areLiveScoresVisible;
        bodyElement.classList.toggle('live-scores-visible', areLiveScoresVisible);
        liveScoresToggle.setAttribute('aria-pressed', String(areLiveScoresVisible));

        const newTitle = areLiveScoresVisible ? 'Hide Live Scores' : 'Show Live Scores';
        liveScoresToggle.setAttribute('title', newTitle);
        if (liveScoresTooltip) liveScoresTooltip.textContent = newTitle;

        console.log(`Koozie Sports: Live scores ${areLiveScoresVisible ? 'shown' : 'hidden'}`);

        try {
             localStorage.setItem('koozieLiveScoresVisible', String(areLiveScoresVisible));
        } catch (e) {
            console.warn("Could not save live scores visibility preference to localStorage:", e);
        }
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
                scrollAnimateElements.forEach(el => el.classList.add('visible')); // Show all if no observer
            }
            return;
        }

        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
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
        if (!targetId || targetId === '#' || !targetId.startsWith('#')) return;

        // Close mobile menu if open and a nav link inside it was clicked
        if (isMenuOpen && navLinksContainer && navLinksContainer.contains(link)) {
            toggleMobileNav(true); // Force close
        }

        // Handle Back to Top separately for clarity
        if (targetId === '#page-top') {
             event.preventDefault();
             window.scrollTo({ top: 0, behavior: 'smooth' });
             // Manually activate home link if needed and reset URL hash
             if (history.pushState) history.pushState(null, null, ' ');
             updateActiveNavLink('page-top'); // Ensure home is active immediately
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

                // Optionally update URL hash after scroll (can interfere with scrollspy sometimes)
                // Use setTimeout to allow scroll to finish before updating hash
                // setTimeout(() => {
                //    if (history.pushState) {
                //        history.pushState(null, null, targetId);
                //    }
                // }, 600); // Adjust delay as needed

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
         if (!activeSectionId) return; // Don't do anything if no section ID provided

         navItems.forEach(navLink => {
             if (navLink.getAttribute('data-section') === activeSectionId) {
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
        if (!('IntersectionObserver' in window) || sections.length === 0 || navItems.length === 0) {
            console.warn("Scrollspy prerequisites not met (IntersectionObserver, sections, or navItems).");
            // Activate 'page-top' by default if nothing else works
            updateActiveNavLink('page-top');
            return;
        }

        // rootMargin calculation:
        // top: Negative value pulls the trigger line UP. We set it slightly below the shrunk header height.
        // bottom: Negative percentage pushes the trigger line UP from the bottom.
        // -${100 - SCROLLSPY_OFFSET_PERCENT}% means the section top must pass the point
        // that is SCROLLSPY_OFFSET_PERCENT down from the top of the viewport to be considered active.
        // Example: Offset 35%. Top margin is below header. Bottom margin is -65%.
        // The section becomes active when its top edge is between (header height) and 35% down the viewport.
        const headerCurrentHeight = mainHeader ? mainHeader.offsetHeight : 80; // Use current height or fallback
        const topMargin = `-${headerCurrentHeight + 10}px`; // Trigger point starts just below the header
        const bottomMargin = `-${100 - SCROLLSPY_OFFSET_PERCENT}%`;

        const observerOptions = {
            root: null, // relative to viewport
            rootMargin: `${topMargin} 0px ${bottomMargin} 0px`,
            threshold: 0 // Trigger as soon as any part enters/leaves the intersection defined by rootMargin
        };

        const observerCallback = (entries) => {
            let bestVisibleSectionId = null;

            entries.forEach(entry => {
                const sectionId = entry.target.getAttribute('data-id');
                // Check if the section is intersecting within our defined margins
                if (entry.isIntersecting) {
                    bestVisibleSectionId = sectionId;
                    // No need to break, the last intersecting one processed will usually be the lowest on screen
                }
            });

             // Fallback 1: If no section is actively intersecting in the threshold zone,
             // check which section is closest to the top trigger point (below the header).
             if (!bestVisibleSectionId) {
                 let minDistance = Infinity;
                 let closestSectionId = null;
                 sections.forEach(section => {
                     const rect = section.getBoundingClientRect();
                     const distance = rect.top - (headerCurrentHeight + 10); // Distance from the top trigger point
                     // Consider sections whose top is below the header trigger point
                     if (distance >= 0 && distance < minDistance) {
                         minDistance = distance;
                         closestSectionId = section.getAttribute('data-id');
                     }
                 });
                 if (closestSectionId) bestVisibleSectionId = closestSectionId;
             }

             // Fallback 2: Handle scrolling back to the very top
             if (window.scrollY < headerCurrentHeight) { // If scroll position is above header height
                  bestVisibleSectionId = 'page-top';
             }
             // Fallback 3: Handle being at the very bottom of the page
             else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) { // Check if near bottom
                 const lastSection = sections[sections.length - 1];
                 if (lastSection) bestVisibleSectionId = lastSection.getAttribute('data-id');
             }


            // Only update if the active section has truly changed
            if (bestVisibleSectionId && bestVisibleSectionId !== lastActiveSectionId) {
                // console.log("Scrollspy updating active link to:", bestVisibleSectionId); // Debugging
                updateActiveNavLink(bestVisibleSectionId);
            } else if (!bestVisibleSectionId && lastActiveSectionId) {
                 // If nothing is deemed active, maybe keep the last one or default to home?
                 // For now, do nothing, keeping the last active link highlighted.
                 // console.log("Scrollspy: No best section found, keeping:", lastActiveSectionId); // Debugging
            }
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        sections.forEach(section => observer.observe(section));

        // Initial check in case the page loads scrolled somewhere
        handleScroll(); // Ensure header height is correct for margin calc
        // Manually trigger observer callback logic once after setup
        observerCallback(observer.takeRecords());
    };


    // --- Function: Fetch Latest YouTube Videos (Data API) ---
     const fetchYouTubeVideos = async () => {
        // Check if the container exists AND if API details are provided and NOT placeholders
        const apiKeyValid = YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'YOUR_YOUTUBE_API_KEY';
        const channelIdValid = YOUTUBE_CHANNEL_ID && YOUTUBE_CHANNEL_ID !== 'YOUR_YOUTUBE_CHANNEL_ID';

        if (!youtubeVideosContainer) {
             // console.log("YouTube video container not found, skipping API fetch.");
             return; // Silently exit if container isn't on the page
        }
        if (!apiKeyValid || !channelIdValid) {
             console.warn("YouTube API Key or Channel ID missing/invalid. Skipping video fetch. Please configure these in script.js.");
             if (youtubeLoadingMessage) youtubeLoadingMessage.style.display = 'none';
             if (youtubeErrorMessage) {
                 youtubeErrorMessage.textContent = "YouTube video feed not configured.";
                 youtubeErrorMessage.style.display = 'block';
             }
             if (youtubeFallbackMessage) youtubeFallbackMessage.style.display = 'block'; // Show fallback link
             return;
         }

         // If config is valid, proceed with fetch
         if (youtubeLoadingMessage) youtubeLoadingMessage.style.display = 'block'; // Show loading
         if (youtubeErrorMessage) youtubeErrorMessage.style.display = 'none';
         if (youtubeFallbackMessage) youtubeFallbackMessage.style.display = 'none';

         const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&maxResults=${MAX_YOUTUBE_VIDEOS}&order=date&type=video&key=${YOUTUBE_API_KEY}`;

         try {
             const response = await fetch(apiUrl);
             if (!response.ok) {
                 let errorData = {};
                 try { errorData = await response.json(); } catch (e) { /* Ignore parsing error */ }
                 const errorMessage = errorData?.error?.message || `API Request Failed: ${response.statusText} (${response.status})`;
                 console.error("YouTube API Error Response:", errorData);
                 throw new Error(errorMessage);
             }

             const data = await response.json();

             if (data.items && data.items.length > 0) {
                 if (youtubeLoadingMessage) youtubeLoadingMessage.style.display = 'none';
                 youtubeVideosContainer.innerHTML = ''; // Clear previous items/loading

                 data.items.forEach(item => {
                     if (item.id?.videoId && item.snippet) { // Basic validation
                         const videoId = item.id.videoId;
                         const title = item.snippet.title;
                         // Prefer medium or high quality thumbnail if available
                         const thumbnailUrl = item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url;
                         const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

                         if (thumbnailUrl) { // Only add if thumbnail exists
                             const videoElement = document.createElement('div');
                             videoElement.classList.add('youtube-video-item', 'card-item', 'animate-on-scroll'); // Add card styles if desired
                             videoElement.innerHTML = `
                                 <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" title="${title}">
                                     <img src="${thumbnailUrl}" alt="${title}" loading="lazy" class="card-image">
                                 </a>
                                 <div class="post-content"> <!-- Wrap text content -->
                                     <p>${title}</p>
                                 </div>
                             `;
                             youtubeVideosContainer.appendChild(videoElement);
                         }
                     }
                 });
                 // Re-initialize scroll animations if new elements were added
                 initScrollAnimations();
             } else {
                 console.warn("No videos found for the specified YouTube channel.");
                 if (youtubeLoadingMessage) youtubeLoadingMessage.textContent = "No recent videos found.";
                 // Keep loading message displayed, or switch to fallback
                 // if(youtubeFallbackMessage) youtubeFallbackMessage.style.display = 'block';
             }

         } catch (error) {
             console.error('Failed to fetch YouTube videos:', error);
             if (youtubeLoadingMessage) youtubeLoadingMessage.style.display = 'none';
             if (youtubeErrorMessage) {
                 youtubeErrorMessage.textContent = `Could not load videos. Error: ${error.message || 'Check console for details.'}`;
                 youtubeErrorMessage.style.display = 'block';
             }
             if(youtubeFallbackMessage) youtubeFallbackMessage.style.display = 'block'; // Show fallback link on error
         }
     };

    // --- Function: Initialize Stored Preferences ---
    const initPreferences = () => {
         // Drunk Mode
         try {
             const savedDrunkMode = localStorage.getItem('koozieDrunkMode') === 'true';
             if (savedDrunkMode !== isDrunkMode) { // Only toggle if different from initial state
                 toggleDrunkMode();
             } else { // Ensure button state matches initial state even if not toggled
                 if (drunkModeToggle) drunkModeToggle.setAttribute('aria-pressed', String(isDrunkMode));
                 const initialTitle = isDrunkMode ? 'Deactivate Koozie Mode' : 'Activate Koozie Mode';
                 if (drunkModeToggle) drunkModeToggle.setAttribute('title', initialTitle);
                 if (drunkModeTooltip) drunkModeTooltip.textContent = initialTitle;
             }
         } catch (e) { console.warn("Could not read drunk mode preference from localStorage:", e); }

         // Live Scores Visibility
          try {
             const savedScoresVisible = localStorage.getItem('koozieLiveScoresVisible') === 'true';
              if (savedScoresVisible !== areLiveScoresVisible) { // Only toggle if different
                  toggleLiveScores();
              } else { // Ensure button state matches initial state
                  if (liveScoresToggle) liveScoresToggle.setAttribute('aria-pressed', String(areLiveScoresVisible));
                  const initialTitle = areLiveScoresVisible ? 'Hide Live Scores' : 'Show Live Scores';
                  if (liveScoresToggle) liveScoresToggle.setAttribute('title', initialTitle);
                  if (liveScoresTooltip) liveScoresTooltip.textContent = initialTitle;
              }
          } catch (e) { console.warn("Could not read live scores visibility preference from localStorage:", e); }
    };


    // --- Initialize Functionality on Page Load ---

    // 1. Core Functionality
    initDarkMode(); // Must run first to set theme variables
    initPreferences(); // Load stored drunk mode/live scores states
    updateCopyrightYear();
    updateDynamicQuote();

    // 2. Event Listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleSmoothScroll); // Handles all internal links

    if (hamburgerMenu && navLinksContainer) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from closing menu immediately
            toggleMobileNav();
        });
    }

    if (drunkModeToggle) {
        drunkModeToggle.addEventListener('click', toggleDrunkMode);
    }

     if (liveScoresToggle) { // Add listener for the new toggle
         liveScoresToggle.addEventListener('click', toggleLiveScores);
     }

    // 3. Initialize Observers & API Calls
    initScrollAnimations();
    // Fetch YouTube video list (will check for valid config internally)
    // Removing Elfsight widgets would typically happen in HTML if switching to API
    // fetchYouTubeVideos(); // Uncomment this if API key/channel ID are set

    // Load YouTube API for Background Video
    if (document.getElementById('hero-section') && youtubePlayerEl) {
        loadYouTubeAPI();
    }

    // Initialize Scrollspy slightly later to ensure layout stability
    setTimeout(initScrollspy, 200); // Increased delay slightly


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
    if (navLinksContainer) {
        navLinksContainer.addEventListener('click', (event) => {
            if (!event.target.closest('a')) { // Allow link clicks to bubble up (for smooth scroll)
                event.stopPropagation();
            }
        });
    }

    // --- Optional: Re-init scrollspy on resize (debounced) ---
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            console.log("Window resized, re-initializing scrollspy.");
            // Re-initialize scrollspy to update rootMargin based on potentially new header height
            initScrollspy();
        }, 250); // Debounce resize events
    });

    // --- Final Check ---
    handleScroll(); // Run scroll handler once on load to set initial states

    console.log("Koozie Sports Script Initialized Successfully! (Revised)");

}); // End DOMContentLoaded
