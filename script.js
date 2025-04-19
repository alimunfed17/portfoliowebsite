// Theme Toggle Button
const button = document.getElementById('theme-toggle');
const themes = ['light', 'dark', 'system'];
let current = 0;

function applyTheme(theme) {
    document.documentElement.classList.remove('light', 'dark');

    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
    } else {
        document.documentElement.classList.add(theme);
    }

    button.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    localStorage.setItem('theme', theme);
}

button.addEventListener('click', () => {
    current = (current + 1) % themes.length;
    applyTheme(themes[current]);
});

(function () {
    const savedTheme = localStorage.getItem('theme') || 'system';
    current = themes.indexOf(savedTheme);
    applyTheme(savedTheme);
})();


// GitHub Repositories Fetch
const username = 'alimunfed17';

fetch(`https://api.github.com/users/${username}/repos`)
    .then(response => response.json())
    .then(repos => {
        const container = document.getElementById('projects');
        repos
            .filter(repo => !repo.fork)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .forEach(repo => {
                const div = document.createElement('div');
                div.className = 'repo';
                div.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No Description'}</p>
                    <a href='${repo.html_url}' target='_blank'>View on GitHub</a>
                `;
                container.appendChild(div);
            });     
})
.catch(error => {
    console.error('Error fetching repos:', error);
});


// Time Tracking Feature with Nav Display
document.addEventListener('DOMContentLoaded', () => {
    // Create timer element in nav
    const navUl = document.querySelector('nav ul');
    const timerLi = document.createElement('li');
    const timerSpan = document.createElement('span');
    timerSpan.id = 'timer-display';
    timerSpan.textContent = '00:00:00';
    timerSpan.style.fontFamily = 'monospace';
    timerLi.appendChild(timerSpan);
    navUl.appendChild(timerLi);

    // Initialize time tracking
    let startTime = Date.now();
    let pausedTime = 0;
    let isActive = true;
    let sessionTime = 0;
    
    // Get time from storage if available
    const storedTime = localStorage.getItem('portfolioTimeSpent');
    let totalTimeSpent = storedTime ? parseInt(storedTime, 10) : 0;
    
    // Format the time in HH:MM:SS format
    function formatTimeForDisplay(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        
        return `${hours}:${minutes}:${seconds}`;
    }
    
    // Format time for the alert message
    function formatTimeForMessage(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        let result = '';
        if (hours > 0) result += `${hours} hour${hours !== 1 ? 's' : ''} `;
        if (minutes > 0) result += `${minutes} minute${minutes !== 1 ? 's' : ''} `;
        if (seconds > 0 || (hours === 0 && minutes === 0)) result += `${seconds} second${seconds !== 1 ? 's' : ''}`;
        
        return result.trim();
    }
    
    // Update timer display
    function updateTimerDisplay() {
        if (isActive) {
            sessionTime = Date.now() - startTime;
        }
        const displayTime = formatTimeForDisplay(totalTimeSpent + sessionTime);
        document.getElementById('timer-display').textContent = displayTime;
    }
    
    // Update the timer display every second
    const displayInterval = setInterval(updateTimerDisplay, 1000);
    
    // Update the stored time every 5 seconds
    const timeUpdateInterval = setInterval(() => {
        if (isActive) {
            sessionTime = Date.now() - startTime;
            localStorage.setItem('portfolioTimeSpent', totalTimeSpent + sessionTime);
        }
    }, 5000);
    
    // Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            // Pause the timer when tab is hidden
            sessionTime = Date.now() - startTime;
            totalTimeSpent += sessionTime;
            localStorage.setItem('portfolioTimeSpent', totalTimeSpent);
            isActive = false;
        } else {
            // Resume the timer when tab is visible again
            startTime = Date.now();
            isActive = true;
        }
    });
    
    // Show alert when the user is about to leave
    window.addEventListener('beforeunload', (e) => {
        // Calculate final time
        let finalTime = totalTimeSpent;
        if (isActive) {
            finalTime += (Date.now() - startTime);
        }
        
        // Create message
        const message = `You've spent ${formatTimeForMessage(finalTime)} on Munfed Ali's portfolio!`;
        
        // Standard way of showing a confirmation dialog before unload
        e.preventDefault();
        e.returnValue = message;
        return message;
    });
});