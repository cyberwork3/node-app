/* ============================================
   NodeApp — Frontend Script
   Terminal animation, stats, scroll effects
   ============================================ */

// --- Terminal Typing Animation ---
const terminalCommands = [
    { type: 'command', text: 'node app.js' },
    { type: 'output', text: 'Server running at http://localhost:3000/', class: 'success' },
    { type: 'pause', duration: 1200 },
    { type: 'output', text: '' },
    { type: 'command', text: 'curl http://localhost:3000' },
    { type: 'output', text: '→ 200 OK', class: 'info' },
    { type: 'output', text: '"This is my first node project"', class: '' },
    { type: 'pause', duration: 1500 },
    { type: 'output', text: '' },
    { type: 'command', text: 'echo "Ready to build! 🚀"' },
    { type: 'output', text: 'Ready to build! 🚀', class: 'success' },
];

let cmdIndex = 0;
let charIndex = 0;
const typedCmd = document.getElementById('typed-cmd');
const cursorEl = document.getElementById('cursor');
const terminalBody = document.getElementById('terminal-body');

function typeNextStep() {
    if (cmdIndex >= terminalCommands.length) {
        // Loop after a delay
        setTimeout(() => {
            // Clear terminal except the first line template
            const lines = terminalBody.querySelectorAll('.terminal-line, .output-line');
            lines.forEach(l => l.remove());

            // Re-add prompt line
            const newLine = document.createElement('div');
            newLine.classList.add('terminal-line');
            newLine.innerHTML = '<span class="prompt">$</span><span class="command" id="typed-cmd"></span><span class="cursor" id="cursor">▎</span>';
            terminalBody.appendChild(newLine);

            // Update references
            const newTypedCmd = document.getElementById('typed-cmd');
            const newCursor = document.getElementById('cursor');

            cmdIndex = 0;
            charIndex = 0;

            // Restart with updated references
            startTerminalLoop(newTypedCmd, newCursor);
        }, 3000);
        return;
    }

    const step = terminalCommands[cmdIndex];

    if (step.type === 'pause') {
        cmdIndex++;
        setTimeout(typeNextStep, step.duration);
        return;
    }

    if (step.type === 'output') {
        const output = document.createElement('div');
        output.classList.add('output-line');
        if (step.class) output.classList.add(step.class);
        output.textContent = step.text;
        terminalBody.insertBefore(output, terminalBody.lastElementChild);
        cmdIndex++;
        setTimeout(typeNextStep, 400);
        return;
    }

    // type === 'command'
    if (charIndex === 0) {
        typedCmd.textContent = '';
    }

    if (charIndex < step.text.length) {
        typedCmd.textContent += step.text[charIndex];
        charIndex++;
        setTimeout(typeNextStep, 50 + Math.random() * 40);
    } else {
        // Command done typing — move it to output and prepare new prompt
        const currentLine = terminalBody.querySelector('.terminal-line:last-of-type') || typedCmd.parentElement;
        cursorEl.style.display = 'none';

        setTimeout(() => {
            // Create new prompt line
            const newLine = document.createElement('div');
            newLine.classList.add('terminal-line');
            newLine.innerHTML = '<span class="prompt">$</span><span class="command"></span><span class="cursor" style="display:inline">▎</span>';
            terminalBody.appendChild(newLine);

            // Scroll terminal
            terminalBody.scrollTop = terminalBody.scrollHeight;

            cmdIndex++;
            charIndex = 0;

            // Update active refs (keep using module-level for simplicity)
            const commands = terminalBody.querySelectorAll('.command');
            const cursors = terminalBody.querySelectorAll('.cursor');
            Object.defineProperty(window, '_activeCmd', { value: commands[commands.length - 1], writable: true, configurable: true });
            Object.defineProperty(window, '_activeCursor', { value: cursors[cursors.length - 1], writable: true, configurable: true });

            setTimeout(typeNextStep, 300);
        }, 600);
    }
}

function startTerminalLoop(cmdEl, curEl) {
    // Override module-level refs
    Object.defineProperty(window, '_typedCmd', { value: cmdEl, writable: true, configurable: true });
    Object.defineProperty(window, '_cursor', { value: curEl, writable: true, configurable: true });

    // Patch typeNextStep to use current elements
    typeNextStep();
}

// Kick off the terminal animation
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => typeNextStep(), 800);
});


// --- Navbar Scroll Effect ---
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
});


// --- Active Nav Link on Scroll ---
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
    const scrollPos = window.scrollY + 200;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveLink);


// --- Mobile Menu ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    mobileMenuBtn.classList.toggle('active');
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
    });
});


// --- Intersection Observer for Cards ---
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .stat-card').forEach(card => {
    observer.observe(card);
});


// --- Live Stats ---
const startTime = Date.now();
let requestCount = 0;

function updateUptime() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const mins = Math.floor((elapsed % 3600) / 60);
    const secs = elapsed % 60;

    let display;
    if (hours > 0) {
        display = `${hours}h ${mins}m`;
    } else if (mins > 0) {
        display = `${mins}m ${secs}s`;
    } else {
        display = `${secs}s`;
    }

    const uptimeValue = document.getElementById('uptime-value');
    if (uptimeValue) uptimeValue.textContent = display;

    // Animate ring (max out at 100% after ~60s for visual effect)
    const progress = Math.min(elapsed / 60, 1);
    const ring = document.getElementById('uptime-ring');
    if (ring) {
        ring.style.strokeDashoffset = 251.2 * (1 - progress);
        ring.style.stroke = '';
        // Apply gradient via inline style
        ring.setAttribute('stroke', `url(#ringGradDef)`);
    }
}

// Add SVG gradient def for ring
document.addEventListener('DOMContentLoaded', () => {
    const svg = document.querySelector('.stat-ring svg');
    if (svg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        grad.setAttribute('id', 'ringGradDef');
        grad.setAttribute('x1', '0%');
        grad.setAttribute('y1', '0%');
        grad.setAttribute('x2', '100%');
        grad.setAttribute('y2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#818cf8');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#c084fc');

        grad.appendChild(stop1);
        grad.appendChild(stop2);
        defs.appendChild(grad);
        svg.insertBefore(defs, svg.firstChild);
    }
});

// Simulate increasing request count
function simulateRequests() {
    requestCount += Math.floor(Math.random() * 3);
    const el = document.getElementById('request-count');
    if (el) el.textContent = requestCount;
}

// Fetch live stats from server API
async function fetchStats() {
    try {
        const res = await fetch('/api/stats');
        if (res.ok) {
            const data = await res.json();
            const memEl = document.getElementById('memory-usage');
            if (memEl) memEl.textContent = data.memoryMB;

            const reqEl = document.getElementById('request-count');
            if (reqEl) reqEl.textContent = data.requestCount;

            const respEl = document.getElementById('response-time');
            if (respEl) respEl.textContent = data.avgResponseMs < 1 ? '<1' : data.avgResponseMs;

            // Update uptime from server
            const uptimeEl = document.getElementById('uptime-value');
            if (uptimeEl && data.uptimeSeconds !== undefined) {
                const s = data.uptimeSeconds;
                const h = Math.floor(s / 3600);
                const m = Math.floor((s % 3600) / 60);
                const sec = s % 60;
                uptimeEl.textContent = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`;

                const progress = Math.min(s / 60, 1);
                const ring = document.getElementById('uptime-ring');
                if (ring) ring.style.strokeDashoffset = 251.2 * (1 - progress);
            }
        }
    } catch (e) {
        // Fallback to client-side simulation
        simulateRequests();
        const memEl = document.getElementById('memory-usage');
        if (memEl) memEl.textContent = (20 + Math.random() * 10).toFixed(1);
    }
}

setInterval(updateUptime, 1000);
setInterval(fetchStats, 2000);

// Initial calls
document.addEventListener('DOMContentLoaded', () => {
    updateUptime();
    fetchStats();
});


// --- Footer Year ---
document.getElementById('current-year').textContent = new Date().getFullYear();
