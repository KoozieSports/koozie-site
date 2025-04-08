/**
 * script.js for Koozie Sports - Enhanced
 * Handles header shrinking, mobile navigation, dark mode, drunk mode,
 * scroll animations, scrollspy navbar highlighting, dynamic quote,
 * dynamic year update, smooth scrolling, and fetching YouTube videos.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const YOUTUBE_API_KEY = 'AIzaSyDae1uS8BJ6VRxAEZtD7ZWXHEUuY7zim3M'; // PASTE YOUR YOUTUBE DATA API KEY HERE
    const YOUTUBE_CHANNEL_ID = 'UCQf5nnIl4ANXzQzftW4Vpfw'; // Koozie Sports Channel ID
    const MAX_YOUTUBE_VIDEOS = 4; // How many latest videos to show
    const SCROLLSPY_OFFSET_PERCENT = 30; // % of viewport height from top to trigger section activation

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
        { quote: `"Help me Tom Cruise! Tom Cruise, use your witchcraft on me to get the fire off me!"`, attribution: "- Ricky Bobby" }, // Kept name as attribution context is clear from quote
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
    ];

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
    // Toggles
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIconMoon = darkModeToggle ? darkModeToggle.querySelector('.fa-moon') : null;
    const darkModeIconSun = darkModeToggle ? darkModeToggle.querySelector('.fa-sun') : null;
    const darkModeTooltip = darkModeToggle ? darkModeToggle.querySelector('.tooltip-text') : null;
    const drunkModeToggle = document.getElementById('drunk-mode-toggle');
    const drunkModeTooltip = drunkModeToggle ? drunkModeToggle.querySelector('.tooltip-text') : null;
    // Dynamic Quote
    const dynamicQuoteTextEl = document.getElementById('dynamic-quote-text');
    const dynamicQuoteAttrEl = document.getElementById('dynamic-quote-attribution');
    // YouTube specific elements
    const youtubeVideosContainer = document.getElementById('youtube-video-items');
    const youtubeLoadingMessage = document.querySelector('.youtube-loading-text');
    const youtubeErrorMessage = document.getElementById('youtube-error-message');
    const youtubeFallbackMessage = document.getElementById('youtube-fallback-message');
    // Drunk mode sound (optional)
    const drunkModeSound = document.getElementById('drunk-mode-sound');


    // --- State Variables ---
    let isMenuOpen = false;
    let isDrunkMode = bodyElement.classList.contains('drunk-mode-active');
    let currentTheme = localStorage.getItem('koozieTheme') || 'light'; // Default to light


    // --- Function: Set Theme (Dark/Light) ---
    const setTheme = (theme) => {
        htmlElement.setAttribute('data-theme', theme);
        currentTheme = theme;
        localStorage.setItem('koozieTheme', theme);

        // Update toggle button state
        if (darkModeToggle && darkModeIconMoon && darkModeIconSun && darkModeTooltip) {
            const isDark = theme === 'dark';
            darkModeIconMoon.style.display = isDark ? 'none' : 'inline-block';
            darkModeIconSun.style.display = isDark ? 'inline-block' : 'none';
            const newTitle = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
            darkModeToggle.setAttribute('title', newTitle);
            darkModeTooltip.textContent = newTitle;
        }

        // Update meta theme-color (optional, browser support varies)
        const themeColorMetaLight = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: light)"]');
        const themeColorMetaDark = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]');
        if (themeColorMetaLight) themeColorMetaLight.content = theme === 'light' ? '#fdfaef' : '#1a1a1a';
        if (themeColorMetaDark) themeColorMetaDark.content = theme === 'dark' ? '#1a1a1a' : '#fdfaef';

        console.log(`Koozie Sports: Theme changed to ${theme}`);
    };

    // --- Function: Initialize Dark Mode ---
    const initDarkMode = () => {
        // 1. Check localStorage
        const savedTheme = localStorage.getItem('koozieTheme');
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            // 2. Check system preference if no saved theme
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }

        // 3. Add listener to toggle button
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                setTheme(currentTheme === 'light' ? 'dark' : 'light');
            });
        }

        // 4. Listen for system preference changes (optional)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            // Only change if no user preference is saved
            if (!localStorage.getItem('koozieTheme')) {
                 setTheme(event.matches ? 'dark' : 'light');
            }
        });
    };

    // --- Function: Update Dynamic Quote ---
    const updateDynamicQuote = () => {
        if (dynamicQuotes.length > 0 && dynamicQuoteTextEl && dynamicQuoteAttrEl) {
            const randomIndex = Math.floor(Math.random() * dynamicQuotes.length);
            const selectedItem = dynamicQuotes[randomIndex];
            dynamicQuoteTextEl.innerHTML = selectedItem.quote; // Use innerHTML if quote contains HTML like spans
            dynamicQuoteAttrEl.textContent = selectedItem.attribution;
        } else if (dynamicQuoteTextEl) {
            dynamicQuoteTextEl.textContent = "Looks like the quote machine is on a beer run...";
            if(dynamicQuoteAttrEl) dynamicQuoteAttrEl.textContent = "";
        }
    };

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

        isMenuOpen = forceClose ? false : !isMenuOpen;

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

        const newTitle = isDrunkMode ? 'Deactivate Koozie Mode' : 'Activate Koozie Mode';
        drunkModeToggle.setAttribute('title', newTitle);
        if (drunkModeTooltip) {
            drunkModeTooltip.textContent = newTitle;
        }

        const tiltElements = document.querySelectorAll('.tilt-element');
        if (isDrunkMode) {
             console.log("🍻 Koozie Sports: Koozie Mode Activated! Things might get wobbly.");
            tiltElements.forEach(el => {
                el.style.setProperty('--random-tilt', Math.random());
            });
            if (drunkModeSound) drunkModeSound.play().catch(e => console.warn("Drunk mode sound play failed:", e));
        } else {
             console.log("🍺 Koozie Sports: Koozie Mode Deactivated. Back to sober reality.");
             tiltElements.forEach(el => el.style.removeProperty('--random-tilt'));
        }

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
    const initScrollAnimations = () => {
        if (!('IntersectionObserver' in window) || scrollAnimateElements.length === 0) {
            if (scrollAnimateElements.length > 0) {
                console.warn("IntersectionObserver not supported, scroll animations disabled.");
                scrollAnimateElements.forEach(el => el.classList.add('visible'));
            }
            return;
        }

        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
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
        // Allow default behavior for empty hash or links not starting with #
        if (!targetId || targetId === '#' || !targetId.startsWith('#')) return;

        // Close mobile menu if open and a nav link inside it was clicked
        if (isMenuOpen && navLinksContainer && navLinksContainer.contains(link)) {
             toggleMobileNav(true); // Force close
        }

        if (targetId === '#page-top') {
             event.preventDefault();
             window.scrollTo({ top: 0, behavior: 'smooth' });
             // Manually activate home link if needed (scrollspy might handle it)
             // updateActiveNavLink('page-top');
             return;
        }

        try {
             const targetElement = document.querySelector(targetId);
             // Also check if the target has a corresponding data-id for scrollspy sections
             const targetDataIdElement = targetId.substring(1) ? document.querySelector(`section[data-id="${targetId.substring(1)}"]`) : null;

             if (targetElement || targetDataIdElement) {
                 event.preventDefault(); // Prevent default jump only if target exists

                 const elementToScrollTo = targetElement || targetDataIdElement;

                 elementToScrollTo.scrollIntoView({
                     behavior: 'smooth',
                     block: 'start'
                 });
                 // Update URL hash after smooth scroll (optional)
                 // setTimeout(() => { history.pushState(null, null, targetId); }, 500); // Delay slightly
             } else {
                 console.warn(`Smooth scroll target element not found for selector: ${targetId}`);
             }
        } catch (e) {
            console.error(`Error finding smooth scroll target: ${targetId}`, e);
        }
    };

     // --- Function: Update Active Nav Link Helper ---
     const updateActiveNavLink = (activeSectionId) => {
         navItems.forEach(navLink => {
             if (navLink.getAttribute('data-section') === activeSectionId) {
                 navLink.classList.add('active');
             } else {
                 navLink.classList.remove('active');
             }
         });
     };

    // --- Function: Initialize Scrollspy (Navbar Highlighting) ---
    const initScrollspy = () => {
        if (!('IntersectionObserver' in window) || sections.length === 0 || navItems.length === 0) {
            console.warn("Scrollspy prerequisites not met (IntersectionObserver, sections, or navItems).");
            return;
        }

        // Calculate rootMargin based on current header height
        // Offset ensures the section is highlighted when it's comfortably in view, not just touching the edge
        // Negative top margin pulls the trigger point *up*, positive bottom margin pushes it *down*.
        // We want to trigger slightly *before* the section hits the very top edge below the header.
        const headerHeight = mainHeader ? mainHeader.offsetHeight : 80; // Use fallback height
        // Trigger when the top of the section is between the header and X% down the viewport
        const topMargin = `-${headerHeight + 10}px`; // A bit below the header
        const bottomMargin = `-${100 - SCROLLSPY_OFFSET_PERCENT}%`; // e.g., -70% means trigger when top 30% is visible

        const observerOptions = {
            root: null, // relative to viewport
            rootMargin: `${topMargin} 0px ${bottomMargin} 0px`,
            threshold: 0 // Trigger as soon as the edge crosses the rootMargin boundary
        };

        let lastActiveSectionId = null;

        const observerCallback = (entries) => {
            let currentActiveSectionId = null;

            entries.forEach(entry => {
                const sectionId = entry.target.getAttribute('data-id');

                // Check if entry is intersecting AND is somewhat below the header
                if (entry.isIntersecting && entry.boundingClientRect.top >= headerHeight) {
                    currentActiveSectionId = sectionId;
                }
                // Special case: If scrolling up fast, the *last* non-intersecting element above the viewport might be the correct one
                 else if (!entry.isIntersecting && entry.boundingClientRect.top < headerHeight && entry.boundingClientRect.bottom > headerHeight) {
                    // If the element is currently straddling the header line (partially visible above)
                    // It *might* be the active one if nothing below it is intersecting yet
                    // This helps catch sections when scrolling up quickly
                    if (!currentActiveSectionId) { // Only set if nothing else below is active
                        currentActiveSectionId = sectionId;
                    }
                 }
            });

             // Fallback: If no section is actively intersecting in the threshold zone,
             // check which section is closest to the top below the header.
             if (!currentActiveSectionId) {
                 let minDistance = Infinity;
                 sections.forEach(section => {
                     const rect = section.getBoundingClientRect();
                     // Consider sections whose top is below the header
                     if (rect.top >= headerHeight) {
                         if (rect.top < minDistance) {
                             minDistance = rect.top;
                             currentActiveSectionId = section.getAttribute('data-id');
                         }
                     }
                     // If near the bottom, activate the last section
                     else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) { // Check if near bottom
                         const lastSection = sections[sections.length - 1];
                         currentActiveSectionId = lastSection ? lastSection.getAttribute('data-id') : null;
                     }
                 });
             }


            // Only update if the active section has changed
            if (currentActiveSectionId && currentActiveSectionId !== lastActiveSectionId) {
                updateActiveNavLink(currentActiveSectionId);
                lastActiveSectionId = currentActiveSectionId;
                // console.log("Active section:", currentActiveSectionId); // Debugging
            }
            // Handle case when scrolling back to the very top
            else if (window.scrollY < 100 && lastActiveSectionId !== 'page-top') { // Threshold near top
                 updateActiveNavLink('page-top');
                 lastActiveSectionId = 'page-top';
            }
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        sections.forEach(section => observer.observe(section));
    };

    // --- Function: Fetch Latest YouTube Videos ---
     const fetchYouTubeVideos = async () => {
        if (!youtubeVideosContainer || !YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') { // Ensure API key isn't the placeholder
             console.warn("YouTube API Key or container missing/invalid. Skipping video fetch.");
             if (youtubeLoadingMessage) youtubeLoadingMessage.style.display = 'none';
             if (youtubeErrorMessage) {
                 youtubeErrorMessage.textContent = "YouTube integration not configured.";
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
                 try { errorData = await response.json(); } catch (e) { /* Ignore parsing error */ }
                 const errorMessage = errorData?.error?.message || `API request failed: ${response.statusText} (${response.status})`;
                 console.error("YouTube API Error:", errorData || errorMessage);
                 throw new Error(errorMessage);
             }

             const data = await response.json();

             if (data.items && data.items.length > 0) {
                 if (youtubeLoadingMessage) youtubeLoadingMessage.style.display = 'none';
                 if (youtubeErrorMessage) youtubeErrorMessage.style.display = 'none';
                 if (youtubeFallbackMessage) youtubeFallbackMessage.style.display = 'none';
                 youtubeVideosContainer.innerHTML = ''; // Clear previous items

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
                 throw new Error("No videos found for this channel.");
             }

         } catch (error) {
             console.error('Failed to fetch YouTube videos:', error);
             if (youtubeLoadingMessage) youtubeLoadingMessage.style.display = 'none';
             if (youtubeErrorMessage) {
                 youtubeErrorMessage.textContent = `Could not load videos. (${error.message || 'Check console'})`;
                 youtubeErrorMessage.style.display = 'block';
             }
             if(youtubeFallbackMessage) youtubeFallbackMessage.style.display = 'block';
         }
     };


    // --- Initialize Functionality on Page Load ---

    // 0. Initialize Dark Mode (reads localStorage/system pref)
    initDarkMode();

    // 1. Check for saved drunk mode preference
    try {
        const savedDrunkMode = localStorage.getItem('koozieDrunkMode');
        // Only toggle if the saved state differs from the initial state
        if (savedDrunkMode === 'true' && !isDrunkMode) {
            toggleDrunkMode();
        } else if (savedDrunkMode === 'false' && isDrunkMode) {
            toggleDrunkMode();
        }
    } catch (e) {
         console.warn("Could not read drunk mode preference from localStorage:", e);
    }
    // Initial tooltip update for drunk mode after potentially loading from localStorage
     if (drunkModeToggle && drunkModeTooltip) {
         const initialTitle = isDrunkMode ? 'Deactivate Koozie Mode' : 'Activate Koozie Mode';
         drunkModeToggle.setAttribute('title', initialTitle);
         drunkModeTooltip.textContent = initialTitle;
     }


    // 2. Header Scroll Listener
    if (mainHeader) {
        window.addEventListener('scroll', handleHeaderScroll, { passive: true });
        handleHeaderScroll(); // Initial check
    }

    // 3. Mobile Nav Toggle Listener
    if (hamburgerMenu && navLinksContainer) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileNav();
        });
    }

    // 4. Drunk Mode Toggle Listener
    if (drunkModeToggle) {
        drunkModeToggle.addEventListener('click', toggleDrunkMode);
    }

    // 5. Update Copyright Year
    updateCopyrightYear();

    // 6. Initialize Scroll Animations
    initScrollAnimations();

    // 7. Initialize Smooth Scrolling for all internal links
    document.addEventListener('click', handleSmoothScroll);

    // 8. Update Dynamic Quote
    updateDynamicQuote();

    // 9. Fetch YouTube Videos
    fetchYouTubeVideos();

    // 10. Initialize Scrollspy (after other elements are potentially loaded/sized)
    // Use a small timeout to ensure layout is stable, especially header height
    setTimeout(initScrollspy, 100);


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
            // Allow clicks on links inside the nav to bubble up to the document
            // ONLY stop propagation if the click wasn't on an actual link
             if (!event.target.closest('a')) {
                event.stopPropagation();
             }
        });
    }

    // --- Optional: Re-calculate scrollspy margins on resize ---
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Re-initialize scrollspy to potentially update rootMargin if header height changes drastically
            // Or, more efficiently, just update the observer's rootMargin if possible (more complex)
            console.log("Window resized, re-evaluating scrollspy (optional step)");
            // initScrollspy(); // Uncomment if needed, but might be overkill
        }, 250); // Debounce resize events
    });


    console.log("Koozie Sports Script Initialized Successfully! (Enhanced)");

}); // End DOMContentLoaded
