// Authentication Module
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        this.apiUrl = 'http://localhost:5000/api';
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form-element');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('register-form-element');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const button = document.querySelector('#login-form-element .auth-btn');

        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            this.setLoadingState(button, true);

            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                showNotification('Login successful!', 'success');
                setTimeout(() => {
                    this.showChatApp();
                }, 1000);
            } else {
                showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            this.setLoadingState(button, false);
        }
    }

    async handleRegister() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const button = document.querySelector('#register-form-element .auth-btn');

        if (!username || !email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (username.length < 3) {
            showNotification('Username must be at least 3 characters', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            this.setLoadingState(button, true);

            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                showNotification('Registration successful!', 'success');
                setTimeout(() => {
                    this.showChatApp();
                }, 1000);
            } else {
                showNotification(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            this.setLoadingState(button, false);
        }
    }

    async logout() {
        try {
            if (this.token) {
                await fetch(`${this.apiUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Disconnect socket
            if (window.chatApp && window.chatApp.socket) {
                window.chatApp.socket.disconnect();
            }
            
            this.showAuthScreen();
            showNotification('Logged out successfully', 'info');
        }
    }

    async checkAuth() {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (!savedToken || !savedUser) {
            this.showAuthScreen();
            return false;
        }

        try {
            this.token = savedToken;
            this.user = JSON.parse(savedUser);

            // Verify token is still valid
            const response = await fetch(`${this.apiUrl}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                localStorage.setItem('user', JSON.stringify(this.user));
                this.showChatApp();
                return true;
            } else {
                // Token is invalid
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            this.logout();
            return false;
        }
    }

    setLoadingState(button, loading) {
        const span = button.querySelector('span');
        const icon = button.querySelector('i');

        if (loading) {
            button.disabled = true;
            span.textContent = 'Please wait...';
            icon.className = 'fas fa-spinner fa-spin';
        } else {
            button.disabled = false;
            span.textContent = button.id.includes('login') ? 'Sign In' : 'Create Account';
            icon.className = 'fas fa-arrow-right';
        }
    }

    showAuthScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('chat-app').classList.add('hidden');
    }

    showChatApp() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('chat-app').classList.remove('hidden');

        // Initialize chat app
        if (window.chatApp) {
            window.chatApp.initialize();
        }
    }

    getAuthHeader() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getCurrentUser() {
        return this.user;
    }
}

// UI Functions for Auth
function showLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
}

function showRegister() {
    document.getElementById('register-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentNode.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        button.className = 'fas fa-eye';
    }
}

// Initialize auth manager
window.authManager = new AuthManager();