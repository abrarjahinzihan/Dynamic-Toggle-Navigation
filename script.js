/**
 * ============================================================================
 * NexusNav - Dynamic Toggle Navigation Engine
 * 
 * Core Architectural Capabilities:
 *  - Event Engine (click, scroll, keydown, resize, mouseenter, mouseleave)
 *  - Hardware-Accelerated Transitions (GPU transforms, staggered delays)
 *  - Adaptive Responsive Layout (hamburger morph, drawer, mobile-desktop parity)
 *  - Synchronized DOM State (ARIA updates, scrollspy, dynamic coordinates)
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. DOM Element References
  // --------------------------------------------------------------------------
  const DOM = {
    html: document.documentElement,
    body: document.body,
    header: document.getElementById('site-header'),
    navbar: document.getElementById('navbar'),

    // Desktop Nav & Pill Indicator
    navLinksWrapper: document.getElementById('nav-links-wrapper'),
    navPill: document.getElementById('nav-active-pill'),
    desktopLinks: document.querySelectorAll('#nav-desktop-links .nav-link'),
    dropdownItem: document.getElementById('nav-dropdown-item'),
    dropdownBtn: document.getElementById('dropdown-btn'),
    dropdownMenu: document.getElementById('desktop-dropdown-menu'),

    // Mobile Hamburger & Drawer
    hamburgerBtn: document.getElementById('hamburger-btn'),
    mobileDrawer: document.getElementById('mobile-drawer'),
    drawerCloseBtn: document.getElementById('drawer-close-btn'),
    navBackdrop: document.getElementById('nav-backdrop'),
    drawerLinks: document.querySelectorAll('.drawer-link, .drawer-sublink'),
    mobileAccordionBtn: document.getElementById('mobile-accordion-btn'),
    mobileAccordionItem: document.querySelector('.drawer-accordion'),

    // Action Controls
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    layoutToggleBtn: document.getElementById('layout-toggle-btn'),
    mobileThemePill: document.getElementById('mobile-theme-pill'),

    // Hero Quick Controls
    heroToggleDrawerBtn: document.getElementById('hero-toggle-drawer-btn'),
    quickToggleNav: document.getElementById('quick-toggle-nav'),
    quickMenuStatus: document.getElementById('quick-menu-status'),
    quickToggleLayout: document.getElementById('quick-toggle-layout'),
    quickLayoutStatus: document.getElementById('quick-layout-status'),
    quickToggleTheme: document.getElementById('quick-toggle-theme'),
    quickThemeStatus: document.getElementById('quick-theme-status'),
    quickScrollFeatures: document.getElementById('quick-scroll-features'),

    // Sandbox / Playground Inspector
    eventLogStream: document.getElementById('event-log-stream'),
    clearConsoleBtn: document.getElementById('clear-console-btn'),
    stateDrawerOpen: document.getElementById('state-drawer-open'),
    stateAriaExpanded: document.getElementById('state-aria-expanded'),
    stateActiveLink: document.getElementById('state-active-link'),
    stateScrolled: document.getElementById('state-scrolled'),
    stateTheme: document.getElementById('state-theme'),
    liveStateBadge: document.getElementById('live-state-badge'),

    // Interactive Test Buttons
    btnSimulateMobile: document.getElementById('btn-simulate-mobile'),
    btnToggleDropdownSim: document.getElementById('btn-toggle-dropdown-sim'),
    btnCycleNavSim: document.getElementById('btn-cycle-nav-sim'),
    testMorphBtn: document.getElementById('test-morph-btn'),
    interactiveHamburgerPreview: document.getElementById('interactive-hamburger-preview'),
    footerTestDrawer: document.getElementById('footer-test-drawer'),

    // Page Sections for Scrollspy
    sections: document.querySelectorAll('section[id], header[id]')
  };

  // State Management
  const STATE = {
    isDrawerOpen: false,
    isDropdownOpen: false,
    isScrolled: false,
    theme: localStorage.getItem('nexus_nav_theme') || 'dark',
    activeSectionId: 'home',
    isFullWidth: false,
    activeLinkElement: null
  };

  // --------------------------------------------------------------------------
  // 2. Real-Time Event Logger (Playground Console)
  // --------------------------------------------------------------------------
  /**
   * Logs an interactive event to the on-page inspector terminal
   * @param {string} type - Event type (e.g. 'click', 'scroll', 'key', 'mutation')
   * @param {string} badgeClass - CSS class for badge
   * @param {string} message - Description of the DOM or transition event
   */
  function logEvent(type, badgeClass, message) {
    if (!DOM.eventLogStream) return;

    const timeString = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <span class="log-time">[${timeString}]</span>
      <span class="log-badge ${badgeClass}">${type}</span>
      <span class="log-msg">${message}</span>
    `;

    DOM.eventLogStream.appendChild(entry);
    DOM.eventLogStream.scrollTop = DOM.eventLogStream.scrollHeight;

    // Prune old logs if exceeding 60 entries to keep DOM lean
    while (DOM.eventLogStream.children.length > 60) {
      DOM.eventLogStream.removeChild(DOM.eventLogStream.firstChild);
    }
  }

  /**
   * Updates state monitor indicators in the playground
   */
  function updateStateMonitor() {
    if (DOM.stateDrawerOpen) DOM.stateDrawerOpen.textContent = String(STATE.isDrawerOpen);
    if (DOM.stateAriaExpanded) DOM.stateAriaExpanded.textContent = String(STATE.isDrawerOpen);
    if (DOM.stateActiveLink) DOM.stateActiveLink.textContent = STATE.activeSectionId;
    if (DOM.stateScrolled) DOM.stateScrolled.textContent = String(STATE.isScrolled);
    if (DOM.stateTheme) DOM.stateTheme.textContent = STATE.theme;
    if (DOM.quickMenuStatus) DOM.quickMenuStatus.textContent = STATE.isDrawerOpen ? 'Open' : 'Closed';
    if (DOM.quickLayoutStatus) DOM.quickLayoutStatus.textContent = STATE.isFullWidth ? 'Full-Width' : 'Floating';
    if (DOM.quickThemeStatus) DOM.quickThemeStatus.textContent = STATE.theme.charAt(0).toUpperCase() + STATE.theme.slice(1);
    if (DOM.liveStateBadge) {
      DOM.liveStateBadge.textContent = `Navbar: ${STATE.isScrolled ? 'Scrolled (Compact)' : 'Default'}`;
    }
  }

  // --------------------------------------------------------------------------
  // 3. Mobile Hamburger & Drawer Toggle Logic
  // --------------------------------------------------------------------------
  /**
   * Toggles the mobile navigation drawer open or closed
   * @param {boolean} [forceState] - Optional explicit boolean state
   */
  function toggleMobileDrawer(forceState) {
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !STATE.isDrawerOpen;
    STATE.isDrawerOpen = shouldOpen;

    if (shouldOpen) {
      openMobileDrawer();
    } else {
      closeMobileDrawer();
    }

    updateStateMonitor();
  }

  function openMobileDrawer() {
    STATE.isDrawerOpen = true;

    // 1. Hamburger button animation & ARIA
    DOM.hamburgerBtn.classList.add('is-active');
    DOM.hamburgerBtn.setAttribute('aria-expanded', 'true');

    // 2. Drawer slide-in & backdrop blur
    DOM.mobileDrawer.classList.add('is-open');
    DOM.mobileDrawer.setAttribute('aria-hidden', 'false');
    DOM.navBackdrop.classList.add('is-open');

    // 3. Lock background scroll
    DOM.body.classList.add('lock-scroll');

    logEvent('click', 'badge-click', 'Hamburger toggled -> Drawer OPENED, aria-expanded=true');
  }

  function closeMobileDrawer() {
    STATE.isDrawerOpen = false;

    // 1. Hamburger button animation & ARIA
    DOM.hamburgerBtn.classList.remove('is-active');
    DOM.hamburgerBtn.setAttribute('aria-expanded', 'false');

    // 2. Drawer slide-out & backdrop
    DOM.mobileDrawer.classList.remove('is-open');
    DOM.mobileDrawer.setAttribute('aria-hidden', 'true');
    DOM.navBackdrop.classList.remove('is-open');

    // 3. Unlock background scroll
    DOM.body.classList.remove('lock-scroll');

    logEvent('click', 'badge-click', 'Hamburger toggled -> Drawer CLOSED, aria-expanded=false');
  }

  /**
   * Toggles mobile accordion submenu
   */
  function toggleMobileAccordion() {
    if (!DOM.mobileAccordionItem) return;
    const isExpanded = DOM.mobileAccordionItem.classList.toggle('is-expanded');
    DOM.mobileAccordionBtn.setAttribute('aria-expanded', String(isExpanded));
    logEvent('click', 'badge-click', `Mobile accordion submenu toggled: ${isExpanded ? 'Expanded' : 'Collapsed'}`);
  }

  // --------------------------------------------------------------------------
  // 4. Desktop Sliding Pill Indicator & Nav Link Hover
  // --------------------------------------------------------------------------
  /**
   * Smoothly slides the active pill indicator behind the target nav link
   * @param {HTMLElement} targetLink - The link element to slide to
   * @param {boolean} [isHover=false] - Whether this move is triggered by hover
   */
  function movePillTo(targetLink, isHover = false) {
    if (!DOM.navPill || !DOM.navLinksWrapper || !targetLink) return;

    const wrapperRect = DOM.navLinksWrapper.getBoundingClientRect();
    const linkRect = targetLink.getBoundingClientRect();

    const leftOffset = linkRect.left - wrapperRect.left;
    const width = linkRect.width;

    // Apply transform and width to hardware-accelerated indicator
    DOM.navPill.style.transform = `translateY(-50%) translateX(${leftOffset}px)`;
    DOM.navPill.style.width = `${width}px`;
    DOM.navPill.style.opacity = '1';

    if (isHover) {
      DOM.navPill.style.background = 'linear-gradient(135deg, rgba(0, 242, 254, 0.22), rgba(79, 172, 254, 0.25))';
    } else {
      DOM.navPill.style.background = 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(79, 172, 254, 0.18))';
    }
  }

  /**
   * Resets the sliding pill indicator to the currently active section link
   */
  function resetPillToActive() {
    const currentActive = document.querySelector('#nav-desktop-links .nav-link.active');
    if (currentActive) {
      movePillTo(currentActive, false);
    } else {
      if (DOM.navPill) DOM.navPill.style.opacity = '0';
    }
  }

  /**
   * Sets the active navigation link across desktop and mobile
   * @param {string} sectionId - Target section ID (without #)
   */
  function setActiveNavigation(sectionId) {
    STATE.activeSectionId = sectionId;

    // Desktop link update
    DOM.desktopLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}`) {
        link.classList.add('active');
        STATE.activeLinkElement = link;
        movePillTo(link, false);
      } else {
        link.classList.remove('active');
      }
    });

    // Mobile link update
    DOM.drawerLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    updateStateMonitor();
  }

  // --------------------------------------------------------------------------
  // 5. Desktop Dropdown Menu Toggle Logic
  // --------------------------------------------------------------------------
  function toggleDesktopDropdown(forceState) {
    if (!DOM.dropdownItem || !DOM.dropdownBtn) return;
    const shouldOpen = typeof forceState === 'boolean'
      ? forceState
      : !DOM.dropdownItem.classList.contains('is-open');

    STATE.isDropdownOpen = shouldOpen;

    if (shouldOpen) {
      DOM.dropdownItem.classList.add('is-open');
      DOM.dropdownBtn.setAttribute('aria-expanded', 'true');
      logEvent('click', 'badge-click', 'Desktop dropdown menu OPENED (aria-expanded=true)');
    } else {
      DOM.dropdownItem.classList.remove('is-open');
      DOM.dropdownBtn.setAttribute('aria-expanded', 'false');
      logEvent('click', 'badge-click', 'Desktop dropdown menu CLOSED (aria-expanded=false)');
    }
  }

  // --------------------------------------------------------------------------
  // 6. Scrollspy & Sticky Navbar Compacting
  // --------------------------------------------------------------------------
  let isScrollThrottled = false;

  function handleWindowScroll() {
    if (isScrollThrottled) return;
    isScrollThrottled = true;

    requestAnimationFrame(() => {
      const scrollY = window.scrollY || window.pageYOffset;

      // Sticky Header Compacting threshold (50px)
      const shouldBeScrolled = scrollY > 50;
      if (shouldBeScrolled !== STATE.isScrolled) {
        STATE.isScrolled = shouldBeScrolled;
        if (shouldBeScrolled) {
          DOM.header.classList.add('scrolled');
          logEvent('scroll', 'badge-scroll', `Header compact state ACTIVATED (scrollY: ${Math.round(scrollY)}px)`);
        } else {
          DOM.header.classList.remove('scrolled');
          logEvent('scroll', 'badge-scroll', 'Header returned to top island state');
        }
        updateStateMonitor();
      }

      // Scrollspy calculation: Find section currently in viewport
      const scrollThreshold = scrollY + 200;
      let currentSectionId = '';

      DOM.sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollThreshold >= top && scrollThreshold < top + height) {
          currentSectionId = section.getAttribute('id');
        }
      });

      if (currentSectionId && currentSectionId !== STATE.activeSectionId) {
        setActiveNavigation(currentSectionId);
        logEvent('scroll', 'badge-scroll', `Scrollspy detected section: #${currentSectionId}`);
      }

      isScrollThrottled = false;
    });
  }

  // --------------------------------------------------------------------------
  // 7. Theme Switching (Dark & Light Mode)
  // --------------------------------------------------------------------------
  /**
   * Applies the chosen theme to the DOM and saves preference
   * @param {string} theme - 'dark' | 'light'
   */
  function applyTheme(theme) {
    STATE.theme = theme;
    DOM.html.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      DOM.html.classList.add('dark');
    } else {
      DOM.html.classList.remove('dark');
    }
    localStorage.setItem('nexus_nav_theme', theme);

    // Update mobile pill UI
    if (DOM.mobileThemePill) {
      const options = DOM.mobileThemePill.querySelectorAll('.pill-option');
      options.forEach(opt => {
        if (opt.getAttribute('data-theme-val') === theme) {
          opt.classList.add('active');
        } else {
          opt.classList.remove('active');
        }
      });
    }

    // Update button accessibility title & label
    if (DOM.themeToggleBtn) {
      const isDark = theme === 'dark';
      DOM.themeToggleBtn.setAttribute('title', isDark ? 'Switch to Light mode' : 'Switch to Dark mode');
      DOM.themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to Light mode' : 'Switch to Dark mode');
    }

    logEvent('mutation', 'badge-mutation', `Theme updated to: ${theme.toUpperCase()}`);
    updateStateMonitor();
  }

  function toggleTheme() {
    const newTheme = STATE.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  // --------------------------------------------------------------------------
  // 8. Navbar Layout Style Toggle (Floating Island vs Full-Width)
  // --------------------------------------------------------------------------
  function toggleNavbarLayout() {
    STATE.isFullWidth = !STATE.isFullWidth;
    if (STATE.isFullWidth) {
      DOM.header.classList.add('full-width');
      logEvent('mutation', 'badge-mutation', 'Navbar layout changed to: FULL-WIDTH');
    } else {
      DOM.header.classList.remove('full-width');
      logEvent('mutation', 'badge-mutation', 'Navbar layout changed to: FLOATING ISLAND');
    }
    updateStateMonitor();
  }

  // --------------------------------------------------------------------------
  // 9. Event Listeners Setup
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // 1. Mobile Hamburger Toggle
    if (DOM.hamburgerBtn) {
      DOM.hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileDrawer();
      });
    }

    // 2. Mobile Drawer Close Button
    if (DOM.drawerCloseBtn) {
      DOM.drawerCloseBtn.addEventListener('click', () => {
        closeMobileDrawer();
      });
    }

    // 3. Backdrop Click -> Close Drawer
    if (DOM.navBackdrop) {
      DOM.navBackdrop.addEventListener('click', () => {
        closeMobileDrawer();
        logEvent('click', 'badge-click', 'Backdrop clicked -> Closed mobile drawer');
      });
    }

    // 4. Mobile Drawer Links -> Auto-close drawer upon navigation
    DOM.drawerLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href')?.replace('#', '');
        if (targetId) {
          setActiveNavigation(targetId);
        }
        closeMobileDrawer();
        logEvent('click', 'badge-click', `Navigated via drawer to #${targetId}`);
      });
    });

    // 5. Mobile Accordion Toggle
    if (DOM.mobileAccordionBtn) {
      DOM.mobileAccordionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileAccordion();
      });
    }

    // 6. Desktop Nav Links Hover & Click (Sliding Pill Dynamics)
    DOM.desktopLinks.forEach(link => {
      // Hover event: slide pill smoothly to hovered element
      link.addEventListener('mouseenter', () => {
        movePillTo(link, true);
      });

      // Click event: update active state
      link.addEventListener('click', (e) => {
        // If clicking regular link
        const targetId = link.getAttribute('href')?.replace('#', '');
        if (targetId) {
          setActiveNavigation(targetId);
          logEvent('click', 'badge-click', `Desktop link clicked: #${targetId}`);
        }
      });
    });

    // Leave desktop nav container -> reset pill back to active item
    if (DOM.navLinksWrapper) {
      DOM.navLinksWrapper.addEventListener('mouseleave', () => {
        resetPillToActive();
      });
    }

    // 7. Desktop Dropdown Menu Click & Outside Click
    if (DOM.dropdownBtn) {
      DOM.dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDesktopDropdown();
      });
    }

    document.addEventListener('click', (e) => {
      if (DOM.dropdownItem && !DOM.dropdownItem.contains(e.target)) {
        if (DOM.dropdownItem.classList.contains('is-open')) {
          toggleDesktopDropdown(false);
        }
      }
    });

    // 8. Keyboard Accessibility (Escape Key to close drawer & dropdown)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        if (STATE.isDrawerOpen) {
          closeMobileDrawer();
          logEvent('key', 'badge-key', 'Keyboard [ESC] pressed -> Closed mobile drawer');
        }
        if (STATE.isDropdownOpen) {
          toggleDesktopDropdown(false);
          logEvent('key', 'badge-key', 'Keyboard [ESC] pressed -> Closed desktop dropdown');
        }
      }
    });

    // 9. Window Resize Handling
    window.addEventListener('resize', () => {
      // If viewport expands to desktop (> 768px), auto close mobile drawer
      if (window.innerWidth > 768 && STATE.isDrawerOpen) {
        closeMobileDrawer();
        logEvent('resize', 'badge-info', 'Window resized to desktop -> Auto-closed mobile drawer');
      }
      // Re-align pill to active item after resize
      resetPillToActive();
    });

    // 10. Window Scroll Listener (Throttled Scrollspy & Sticky Header)
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    // 11. Theme Switchers
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    if (DOM.mobileThemePill) {
      DOM.mobileThemePill.addEventListener('click', (e) => {
        const option = e.target.closest('.pill-option');
        if (option) {
          const chosenTheme = option.getAttribute('data-theme-val');
          applyTheme(chosenTheme);
        }
      });
    }

    // 12. Layout Toggle
    if (DOM.layoutToggleBtn) {
      DOM.layoutToggleBtn.addEventListener('click', toggleNavbarLayout);
    }

    // 13. Hero & Quick Interactive Controls
    if (DOM.heroToggleDrawerBtn) {
      DOM.heroToggleDrawerBtn.addEventListener('click', () => toggleMobileDrawer(true));
    }
    if (DOM.quickToggleNav) {
      DOM.quickToggleNav.addEventListener('click', () => toggleMobileDrawer());
    }
    if (DOM.quickToggleLayout) {
      DOM.quickToggleLayout.addEventListener('click', toggleNavbarLayout);
    }
    if (DOM.quickToggleTheme) {
      DOM.quickToggleTheme.addEventListener('click', toggleTheme);
    }
    if (DOM.quickScrollFeatures) {
      DOM.quickScrollFeatures.addEventListener('click', () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        logEvent('click', 'badge-click', 'Triggered smooth scroll to #features');
      });
    }

    // 14. Terminal Clear Console Button
    if (DOM.clearConsoleBtn) {
      DOM.clearConsoleBtn.addEventListener('click', () => {
        if (DOM.eventLogStream) {
          DOM.eventLogStream.innerHTML = `
            <div class="log-entry log-system">
              <span class="log-time">[Cleared]</span>
              <span class="log-badge badge-info">Console</span>
              <span class="log-msg">Log cleared by user. Event tracking continuing...</span>
            </div>
          `;
        }
      });
    }

    // 15. Sandbox Simulator Buttons
    if (DOM.btnSimulateMobile) {
      DOM.btnSimulateMobile.addEventListener('click', () => toggleMobileDrawer(true));
    }
    if (DOM.btnToggleDropdownSim) {
      DOM.btnToggleDropdownSim.addEventListener('click', () => toggleDesktopDropdown());
    }
    if (DOM.btnCycleNavSim) {
      const sectionKeys = ['home', 'features', 'playground', 'architecture', 'contact'];
      DOM.btnCycleNavSim.addEventListener('click', () => {
        const currentIndex = sectionKeys.indexOf(STATE.activeSectionId);
        const nextIndex = (currentIndex + 1) % sectionKeys.length;
        const nextSection = sectionKeys[nextIndex];
        setActiveNavigation(nextSection);
        document.getElementById(nextSection)?.scrollIntoView({ behavior: 'smooth' });
        logEvent('click', 'badge-click', `Cycled active navigation to: #${nextSection}`);
      });
    }

    // 16. Feature Card Hamburger Morph Preview Test
    if (DOM.testMorphBtn && DOM.interactiveHamburgerPreview) {
      DOM.testMorphBtn.addEventListener('click', () => {
        const isMorphed = DOM.interactiveHamburgerPreview.classList.toggle('morphed');
        DOM.testMorphBtn.textContent = isMorphed ? 'Reset to Hamburger' : 'Morph to X (Close)';
        logEvent('click', 'badge-click', `Simulated hamburger morph: ${isMorphed ? 'X Form' : 'Bars Form'}`);
      });
    }

    // 17. Footer Test Drawer
    if (DOM.footerTestDrawer) {
      DOM.footerTestDrawer.addEventListener('click', () => toggleMobileDrawer(true));
    }
  }

  // --------------------------------------------------------------------------
  // 10. Initialization
  // --------------------------------------------------------------------------
  function init() {
    // 1. Apply saved theme preference
    applyTheme(STATE.theme);

    // 2. Set up initial active nav link and indicator pill
    setActiveNavigation('home');

    // 3. Register all event listeners
    setupEventListeners();

    // 4. Initial layout calculation for pill
    window.setTimeout(() => {
      resetPillToActive();
      handleWindowScroll();
      updateStateMonitor();
    }, 150);

    logEvent('info', 'badge-info', 'NexusNav system loaded successfully. All listeners bound.');
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
