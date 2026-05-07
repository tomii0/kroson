/**
 * KRONOS SYSTEM LOGGER
 * Tracks User Activity, Logins, and Studio Access
 */

const KronosLogger = {
    log(activity, status = 'SUCCESS') {
        const user = JSON.parse(localStorage.getItem('kronosUser'));
        if (!user) return;

        const logs = JSON.parse(localStorage.getItem('kronosInboxLogs') || '[]');
        
        const newLog = {
            id: 'LOG-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            userName: user.name || 'Unknown',
            email: user.email,
            activity: activity,
            status: status,
            timestamp: new Date().toISOString(),
            device: this.getDeviceInfo(),
            browser: this.getBrowserInfo(),
            sessionID: localStorage.getItem('kronosSession') || 'SES-' + Date.now()
        };

        logs.push(newLog);
        // Keep only last 100 logs
        if (logs.length > 100) logs.shift();
        
        localStorage.setItem('kronosInboxLogs', JSON.stringify(logs));
        console.log(`[KRONOS LOG]: ${activity} | ${status}`);
    },

    getDeviceInfo() {
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) return 'Mobile Device';
        if (/tablet/i.test(ua)) return 'Tablet Device';
        return 'Desktop Workstation';
    },

    getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        return 'Modern Browser';
    },

    // Specific triggers
    logLogin() {
        this.log('Mainframe Authentication', 'AUTHORIZED');
    },

    logPageVisit(pageName) {
        this.log(`Visited ${pageName} Section`, 'VIEWED');
    },

    logAppAccess(appName) {
        this.log(`Launched ${appName}`, 'ACTIVE');
    },

    logStudioAccess() {
        this.log('Studio Environment Access', 'CONNECTED');
    }
};

// Auto-log page visits if not on index
if (window.location.pathname.includes('.html')) {
    const page = window.location.pathname.split('/').pop().replace('.html', '').toUpperCase();
    if (page !== 'INBOX') {
        setTimeout(() => KronosLogger.logPageVisit(page), 1000);
    }
}
