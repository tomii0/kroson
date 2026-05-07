function initProfileDropdown() {
    const authContainer = document.getElementById('nav-auth-container');
    const session = localStorage.getItem('kronosSession') || sessionStorage.getItem('kronosSession');

    if (session) {
        try {
            const user = JSON.parse(session);
            if (user && user.name) {
                const firstName = user.name.split(' ')[0];
                const initial = user.name.charAt(0).toUpperCase();
                const avatarContent = user.picture ?
                    `<img src="${user.picture}" alt="${user.name}">` :
                    `<span>${initial}</span>`;

                authContainer.innerHTML = `
                    <div class="profile-container" id="profileToggle">
                        <div class="profile-avatar">
                            ${avatarContent}
                        </div>
                        <div class="profile-info">
                            <span class="profile-name">${firstName}</span>
                        </div>
                        <i class="fa-solid fa-chevron-down profile-chevron"></i>
                        
                        <div class="profile-dropdown" id="profileDropdown">
                            <div class="dropdown-header">
                                <span class="dropdown-user-name">${user.name}</span>
                                <span class="dropdown-user-email">${user.email || ''}</span>
                            </div>
                            <a href="#" class="dropdown-item">
                                <i class="fa-regular fa-user"></i>
                                Profile
                            </a>
                            <a href="#" class="dropdown-item">
                                <i class="fa-solid fa-chart-line"></i>
                                Dashboard
                            </a>
                            <a href="#" class="dropdown-item">
                                <i class="fa-regular fa-envelope"></i>
                                Inbox
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item">
                                <i class="fa-solid fa-gear"></i>
                                Settings
                            </a>
                            <a href="#" class="dropdown-item">
                                <i class="fa-regular fa-file-lines"></i>
                                Reports
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="javascript:void(0)" class="dropdown-item logout-item" onclick="handleLogout()">
                                <i class="fa-solid fa-arrow-right-from-bracket"></i>
                                Logout
                            </a>
                        </div>
                    </div>
                `;

                setupDropdownEventListeners();
            }
        } catch (e) {
            console.error("Auth error", e);
        }
    }
}

function setupDropdownEventListeners() {
    const toggle = document.getElementById('profileToggle');
    const dropdown = document.getElementById('profileDropdown');

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
    }
}

function handleLogout() {
    localStorage.removeItem('kronosSession');
    sessionStorage.removeItem('kronosSession');
    window.location.reload();
}

// Call init on load
document.addEventListener('DOMContentLoaded', initProfileDropdown);
