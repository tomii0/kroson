const ReportsSystem = {
    reports: [],
    deleteTargetId: null,

    init() {
        this.loadReports();
        this.renderReports();
        this.setupEventListeners();
    },

    loadReports() {
        const saved = localStorage.getItem('KRONOS_REPORTS_DB');
        if (saved) {
            this.reports = JSON.parse(saved);
        } else {
            this.reports = [];
            this.saveReports();
        }
    },

    saveReports() {
        localStorage.setItem('KRONOS_REPORTS_DB', JSON.stringify(this.reports));
    },

    setupEventListeners() {
        const genBtn = document.getElementById('generateReportBtn');
        if (genBtn) genBtn.addEventListener('click', () => this.showCreateModal());

        // Delegate Report Card clicks
        document.getElementById('reportGrid').addEventListener('click', (e) => {
            const id = e.target.closest('[data-id]')?.getAttribute('data-id');
            if (!id) return;

            if (e.target.classList.contains('btn-view')) {
                e.preventDefault();
                this.viewReport(id);
            } else if (e.target.closest('.btn-delete')) {
                e.preventDefault();
                this.showConfirmDelete(id);
            }
        });

        // Modal Close Buttons
        document.querySelectorAll('.btn-close, .btn-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Form Submission
        const reportForm = document.getElementById('reportForm');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitReport();
            });
        }

        // Confirm Delete
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.executeDelete());
        }

        // Close on backdrop
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeAllModals();
            });
        });
    },

    showCreateModal() {
        document.getElementById('reportForm').reset();
        document.getElementById('createReportModal').classList.add('active');
    },

    showConfirmDelete(id) {
        this.deleteTargetId = id;
        document.getElementById('confirmDeleteModal').classList.add('active');
    },

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    },

    async submitReport() {
        const title = document.getElementById('reportTitle').value.trim();
        const content = document.getElementById('reportContent').value.trim();
        const category = document.getElementById('reportCategory').value;

        if (!title || !content) {
            this.showToast('Please fill in all required fields.', 'error');
            return;
        }

        const submitBtn = document.querySelector('#reportForm .btn-generate');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            await new Promise(r => setTimeout(r, 1000));

            const session = JSON.parse(localStorage.getItem('KRONOS_SESSION') || sessionStorage.getItem('KRONOS_SESSION') || '{}');

            const newReport = {
                id: Date.now(),
                title,
                content,
                category,
                username: session.username || 'Anonymous',
                email: session.email || 'N/A',
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                status: 'Pending',
                type: 'report'
            };

            this.reports.unshift(newReport);
            this.saveReports();
            this.renderReports();
            this.closeAllModals();
            this.showToast('Report submitted to Mainframe! 🚀', 'success');

            // Trigger Email Notification
            this.showToast('Sending report to admin...', 'info');
            console.log('Sending report to corebillionairee@gmail.com...', newReport);
            // Simulated EmailJS delivery
            setTimeout(() => {
                this.showToast('Email sent to corebillionairee@gmail.com', 'success');
            }, 2000);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Report';
        }
    },

    async executeDelete() {
        if (!this.deleteTargetId) return;
        
        const btn = document.getElementById('confirmDeleteBtn');
        btn.disabled = true;
        btn.innerHTML = 'Deleting...';

        try {
            await new Promise(r => setTimeout(r, 600));
            this.reports = this.reports.filter(r => r.id != this.deleteTargetId);
            this.saveReports();
            this.renderReports();
            this.closeAllModals();
            this.showToast('Report deleted successfully.', 'info');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Yes, Delete';
            this.deleteTargetId = null;
        }
    },

    renderReports() {
        const grid = document.getElementById('reportGrid');
        if (!grid) return;

        grid.innerHTML = this.reports.map(report => {
            let color = '#6384ff';
            let bg = '#f0f4ff';
            let icon = 'fa-shapes';

            if (report.category === 'Bugs') { 
                color = '#ef4444'; 
                bg = 'rgba(239, 68, 68, 0.1)'; 
                icon = 'fa-bug';
            } else if (report.category === 'Account Issues') {
                color = '#f59e0b';
                bg = 'rgba(245, 158, 11, 0.1)';
                icon = 'fa-user-gear';
            } else if (report.category === 'Feedback') {
                color = '#10b981';
                bg = 'rgba(16, 185, 129, 0.1)';
                icon = 'fa-comment-dots';
            }

            return `
                <div class="report-card fade-in-up" data-id="${report.id}">
                    <button class="btn-delete" title="Delete Report"><i class="fas fa-trash-alt"></i></button>
                    <div class="icon-box" style="background: ${bg}; color: ${color};"><i class="fa-solid ${icon}"></i></div>
                    <div class="date">${report.date} • ${report.category}</div>
                    <div class="title">${report.title}</div>
                    <a href="#" class="btn-view">View Report</a>
                </div>
            `;
        }).join('');
    },

    viewReport(id) {
        // Always pull fresh from localStorage so inbox replies are synced
        const allReports = JSON.parse(localStorage.getItem('KRONOS_REPORTS_DB') || '[]');
        const report = allReports.find(r => r.id == id);
        if (!report) return;

        let badgeBg = 'rgba(99, 132, 255, 0.1)';
        let badgeColor = '#6384ff';
        let mainIcon = 'fa-shapes';

        if (report.category === 'Bugs') {
            badgeBg = 'rgba(239, 68, 68, 0.1)'; badgeColor = '#ef4444'; mainIcon = 'fa-bug';
        } else if (report.category === 'Account Issues') {
            badgeBg = 'rgba(245, 158, 11, 0.1)'; badgeColor = '#f59e0b'; mainIcon = 'fa-user-gear';
        } else if (report.category === 'Feedback') {
            badgeBg = 'rgba(16, 185, 129, 0.1)'; badgeColor = '#10b981'; mainIcon = 'fa-comment-dots';
        }

        const statusColors = { Pending: '#f59e0b', Reviewing: '#3b82f6', Resolved: '#10b981' };
        const statusBgs   = { Pending: '#fff8eb', Reviewing: '#eff6ff', Resolved: '#ecfdf5' };
        const statusColor = statusColors[report.status] || '#f59e0b';
        const statusBg    = statusBgs[report.status]    || '#fff8eb';

        const replies = report.replies || [];
        const repliesHTML = replies.length
            ? replies.map(rep => `
                <div style="
                    background: rgba(59,130,246,0.04);
                    border: 1px solid rgba(59,130,246,0.18);
                    border-left: 4px solid #3b82f6;
                    border-radius: 16px;
                    padding: 18px 20px;
                    margin-bottom: 12px;
                    box-shadow: 0 4px 16px rgba(59,130,246,0.06);
                ">
                    <div style="font-size: 11px; font-weight: 800; color: #3b82f6; letter-spacing: 0.5px; margin-bottom: 8px;">
                        <i class="fas fa-shield-halved" style="margin-right:6px;"></i>SYSTEM ADMINISTRATOR
                    </div>
                    <div style="font-size: 14px; line-height: 1.65; color: #334155; white-space: pre-wrap;">${rep.text}</div>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 10px;">${rep.time}</div>
                </div>
            `).join('')
            : `<div style="
                    text-align: center;
                    padding: 30px 20px;
                    background: #f8fafc;
                    border-radius: 16px;
                    border: 1px dashed #e2e8f0;
                    color: #94a3b8;
                    font-size: 14px;
                    font-weight: 600;
               ">
                    <i class="fas fa-inbox" style="font-size: 28px; margin-bottom: 10px; display: block; color: #cbd5e1;"></i>
                    No admin reply yet.
               </div>`;

        const modal = document.getElementById('reportModal');
        const modalContent = document.getElementById('modalContent');

        modalContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; padding-right: 50px;">
                    <span class="badge" style="background: ${badgeBg}; color: ${badgeColor};">
                        <i class="fa-solid ${mainIcon}" style="margin-right:5px;"></i>${report.category}
                    </span>
                    <span style="background: ${statusBg}; color: ${statusColor}; padding: 5px 14px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                        ${report.status || 'Pending'}
                    </span>
                </div>
                <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a;">${report.title}</h2>
                <div style="display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 12px; font-weight: 600;">
                    <i class="fas fa-clock"></i>
                    <span>${report.date}${report.time ? ' at ' + report.time : ''}</span>
                </div>
            </div>

            <div style="background: #f8fafc; border-radius: 18px; padding: 20px; margin-bottom: 25px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #475569; white-space: pre-wrap;">${report.content}</p>
            </div>

            <!-- Admin Reply Section -->
            <div id="replySection" style="overflow: hidden; transition: all 0.4s ease;">
                <div style="
                    display: flex; align-items: center; gap: 10px;
                    padding: 16px 20px;
                    background: linear-gradient(135deg, rgba(59,130,246,0.05), rgba(37,99,235,0.08));
                    border: 1px solid rgba(59,130,246,0.15);
                    border-radius: 20px;
                    margin-bottom: 18px;
                ">
                    <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-reply" style="color: #fff; font-size: 14px;"></i>
                    </div>
                    <div>
                        <div style="font-size: 13px; font-weight: 800; color: #0f172a;">Admin Correspondence</div>
                        <div style="font-size: 11px; color: #64748b;">${replies.length} ${replies.length === 1 ? 'reply' : 'replies'} from KRONOS team</div>
                    </div>
                </div>
                ${repliesHTML}
            </div>

            <div style="margin-top: 25px; display: flex; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 22px;">
                <button class="btn-cancel" style="flex: 1; background: #f1f5f9; color: #475569; border: none; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; font-size: 14px; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">Close</button>
            </div>
        `;

        modal.classList.add('active');
        modalContent.querySelector('.btn-cancel').addEventListener('click', () => this.closeAllModals());
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle')}"></i><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
        return container;
    }
};

document.addEventListener('DOMContentLoaded', () => ReportsSystem.init());
