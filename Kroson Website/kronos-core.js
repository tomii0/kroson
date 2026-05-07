/**
 * KRONOS CORE SYSTEM
 * Handles Authentication, Navigation, and UI State
 */

const KronosCore = {
    // Configuration
    config: {
        protectedPages: ['start_page.html', 'dashboard.html', 'profile.html', 'inbox.html', 'settings.html', 'reports.html'],
        authPage: 'auth.html',
        homePage: 'start_page.html'
    },

    init() {
        this.handleAuthGuard();
        this.initProfileDropdown();
        this.setupPageTransitions();
        this.markActiveMenuItem();
    },

    // ── AUTH SYSTEM ──
    getSession() {
        return JSON.parse(localStorage.getItem('KRONOS_SESSION') || sessionStorage.getItem('KRONOS_SESSION') || 'null');
    },

    handleAuthGuard() {
        const session = this.getSession();
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (this.config.protectedPages.includes(currentPage) && !session) {
            window.location.href = this.config.authPage + '?redirect=' + currentPage;
        }
    },

    logout() {
        localStorage.removeItem('KRONOS_SESSION');
        sessionStorage.removeItem('KRONOS_SESSION');
        localStorage.removeItem('kronosUser'); // legacy cleanup
        
        document.body.classList.add('page-exit');
        setTimeout(() => {
            window.location.href = this.config.homePage;
        }, 400);
    },

    // ── UI COMPONENTS ──
    initProfileDropdown() {
        const authContainer = document.getElementById('nav-auth-container');
        if (!authContainer) return;

        const session = this.getSession();
        
        if (session) {
            const userName = session.username || 'User';
            const firstName = userName.split(' ')[0];
            const initial = userName.charAt(0).toUpperCase();
            const avatarContent = session.picture ? 
                `<img src="${session.picture}" alt="${userName}">` : 
                `<span>${initial}</span>`;

            authContainer.innerHTML = `
                <div class="profile-container" id="profileToggle">
                    <div class="profile-avatar">${avatarContent}</div>
                    <div class="profile-info">
                        <span class="profile-name">${firstName}</span>
                    </div>
                    <i class="fa-solid fa-chevron-down profile-chevron"></i>
                    
                    <div class="profile-dropdown" id="profileDropdown">
                        <div class="dropdown-header">
                            <span class="dropdown-user-name">${session.username || 'KRONOS User'}</span>
                            <span class="dropdown-user-email">${session.email || ''}</span>
                        </div>
                        <a href="profile.html" class="dropdown-item">
                            <i class="fa-regular fa-user"></i>
                            Profile
                        </a>
                        <a href="dashboard.html" class="dropdown-item">
                            <i class="fa-solid fa-chart-line"></i>
                            Dashboard
                        </a>
                        <a href="inbox.html" class="dropdown-item">
                            <i class="fa-regular fa-envelope"></i>
                            Inbox
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="settings.html" class="dropdown-item">
                            <i class="fa-solid fa-gear"></i>
                            Settings
                        </a>
                        <a href="reports.html" class="dropdown-item">
                            <i class="fa-regular fa-file-lines"></i>
                            Reports
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="javascript:void(0)" class="dropdown-item logout-item" id="logoutBtn">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                            Logout
                        </a>
                    </div>
                </div>
            `;

            this.setupDropdownEvents();
        }
    },

    setupDropdownEvents() {
        const toggle = document.getElementById('profileToggle');
        const dropdown = document.getElementById('profileDropdown');
        const logoutBtn = document.getElementById('logoutBtn');

        if (toggle && dropdown) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggle.classList.toggle('active');
                dropdown.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!toggle.contains(e.target)) {
                    toggle.classList.remove('active');
                    dropdown.classList.remove('active');
                }
            });

            // Close on Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    toggle.classList.remove('active');
                    dropdown.classList.remove('active');
                }
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    },

    // ── NAVIGATION & TRANSITIONS ──
    setupPageTransitions() {
        // Handle all internal links for smooth transitions
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button');
            if (!target) return;

            let href = target.getAttribute('href');
            
            // Check for dynamic location changes via onclick
            if (!href && target.hasAttribute('onclick')) {
                const match = target.getAttribute('onclick').match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
                if (match) href = match[1];
            }

            if (href && !href.startsWith('#') && !href.startsWith('javascript:') && 
                target.getAttribute('target') !== '_blank' && !e.ctrlKey && !e.metaKey) {
                
                e.preventDefault();
                document.body.classList.add('page-exit');
                
                // Show loader if it takes too long
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            }
        });

        // Hide loading overlay on page load
        window.addEventListener('load', () => {
            const loader = document.querySelector('.page-loading-overlay');
            if (loader) {
                loader.classList.add('hidden');
                setTimeout(() => loader.remove(), 500);
            }
        });
    },

    markActiveMenuItem() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.dropdown-item, .nav-links a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            }
        });
    }
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => KronosCore.init());
