// Main Application Entry Point

class TelegramChatApp {
    constructor() {
        this.initialized = false;
        this.loadingScreen = document.getElementById('loading-screen');
        this.authScreen = document.getElementById('auth-screen');
        this.chatApp = document.getElementById('chat-app');
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Telegram Chat App...');
            
            // Show loading screen
            this.showLoading();
            
            // Initialize services
            await this.initializeServices();
            
            // Check authentication state
            await this.checkAuthState();
            
            this.initialized = true;
            console.log('App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    async initializeServices() {
        // Services are already initialized via their respective modules
        // This method can be used for any additional setup
        
        // Set up error handlers
        this.setupErrorHandlers();
        
        // Set up connection monitoring
        this.setupConnectionMonitoring();
        
        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Set up visibility change handling
        this.setupVisibilityHandling();
    }

    async checkAuthState() {
        if (window.authManager) {
            const isAuthenticated = await window.authManager.checkAuth();
            
            if (isAuthenticated) {
                console.log('User is authenticated');
                // Auth manager will handle showing the chat app
            } else {
                console.log('User is not authenticated');
                // Auth manager will handle showing the auth screen
            }
        } else {
            throw new Error('Auth manager not initialized');
        }
    }

    setupErrorHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleError(event.error);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason);
        });
    }

    setupConnectionMonitoring() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            console.log('Connection restored');
            showNotification('Connection restored', 'success');
            
            // Reconnect socket if needed
            if (window.chatApp && window.chatApp.socket && !window.chatApp.socket.connected) {
                window.chatApp.connectSocket();
            }
        });

        window.addEventListener('offline', () => {
            console.log('Connection lost');
            showNotification('Connection lost. Some features may not work.', 'warning');
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K - Open new chat modal
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (window.authManager && window.authManager.isAuthenticated()) {
                    showNewChatModal();
                }
            }

            // Ctrl/Cmd + , - Open settings
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                if (window.authManager && window.authManager.isAuthenticated()) {
                    showSettings();
                }
            }

            // Ctrl/Cmd + D - Toggle dark mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                toggleTheme();
            }

            // Ctrl/Cmd + L - Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden
                console.log('Page hidden');
            } else {
                // Page is visible
                console.log('Page visible');
                
                // Reconnect socket if needed and user is authenticated
                if (window.authManager && window.authManager.isAuthenticated()) {
                    if (window.chatApp && window.chatApp.socket && !window.chatApp.socket.connected) {
                        window.chatApp.connectSocket();
                    }
                }
            }
        });
    }

    handleError(error) {
        // Don't show notifications for every error to avoid spam
        if (error && typeof error === 'object') {
            if (error.message && error.message.includes('Network')) {
                // Network errors are handled by connection monitoring
                return;
            }
            
            if (error.message && error.message.includes('fetch')) {
                // Fetch errors might be temporary
                console.log('Fetch error detected, might be temporary');
                return;
            }
        }
        
        // For other errors, show a generic message
        if (this.initialized) {
            showNotification('An unexpected error occurred', 'error');
        }
    }

    showLoading() {
        this.loadingScreen.classList.remove('hidden');
        this.authScreen.classList.add('hidden');
        this.chatApp.classList.add('hidden');
    }

    showError(message) {
        this.hideLoading();
        showNotification(message, 'error', 0); // Persistent error
    }

    hideLoading() {
        this.loadingScreen.classList.add('hidden');
    }

    // Method to restart the app (useful for error recovery)
    async restart() {
        console.log('Restarting application...');
        
        this.showLoading();
        
        try {
            // Clear any existing state
            if (window.chatApp && window.chatApp.socket) {
                window.chatApp.socket.disconnect();
            }
            
            // Re-initialize
            await this.init();
        } catch (error) {
            console.error('Failed to restart app:', error);
            this.showError('Failed to restart the application. Please refresh the page.');
        }
    }

    // Method to get app info
    getInfo() {
        return {
            initialized: this.initialized,
            authenticated: window.authManager ? window.authManager.isAuthenticated() : false,
            connected: window.chatApp && window.chatApp.socket ? window.chatApp.socket.connected : false,
            theme: localStorage.getItem('theme') || 'light',
            version: '1.0.0'
        };
    }

    // Method to enable debug mode
    enableDebug() {
        window.DEBUG_MODE = true;
        console.log('Debug mode enabled');
        
        // Add debug info to window
        window.appDebug = {
            info: () => this.getInfo(),
            restart: () => this.restart(),
            clearStorage: () => {
                localStorage.clear();
                sessionStorage.clear();
                location.reload();
            },
            testNotification: (type = 'info') => {
                showNotification(`Test ${type} notification`, type);
            },
            checkSocket: () => {
                if (window.chatApp && window.chatApp.socket) {
                    console.log('Socket status:', {
                        connected: window.chatApp.socket.connected,
                        id: window.chatApp.socket.id
                    });
                } else {
                    console.log('No socket available');
                }
            }
        };
        
        showNotification('Debug mode enabled. Check console for debug functions.', 'info');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure all modules are loaded
    setTimeout(() => {
        window.telegramApp = new TelegramChatApp();
        
        // Enable debug mode in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Development mode detected. Type "telegramApp.enableDebug()" to enable debug features.');
        }
    }, 100);
});

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            // Uncomment when service worker is implemented
            // const registration = await navigator.serviceWorker.register('/sw.js');
            // console.log('Service Worker registered:', registration);
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    });
}

// Handle app installation (PWA)
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('App can be installed');
    // Store the event for later use
    window.deferredPrompt = e;
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const perfData = performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
        
        if (loadTime > 3000) {
            console.warn('Page load time is high. Consider optimizing assets.');
        }
    });
}

// Export for global access
window.TelegramChatApp = TelegramChatApp;