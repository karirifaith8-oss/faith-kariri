/* FAITH KARIRI PORTFOLIO */

const root = document.documentElement;
const header = document.querySelector(".site-header");

/* THEME TOGGLE */

const themeToggle = document.querySelector(".theme-toggle");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

const isDark = () => {
    const saved = root.getAttribute("data-theme");
    return saved ? saved === "dark" : systemDark.matches;
};

const syncThemeButton = () => {
    if (!themeToggle) return;
    const dark = isDark();
    themeToggle.firstElementChild.textContent = dark ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
};

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const next = isDark() ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
        syncThemeButton();
    });
    systemDark.addEventListener("change", syncThemeButton);
    syncThemeButton();
}

/* MOBILE NAVIGATION */

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
    const setMenu = (open) => {
        navLinks.classList.toggle("active", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.textContent = open ? "✕" : "☰";
    };

    menuToggle.addEventListener("click", () => {
        setMenu(!navLinks.classList.contains("active"));
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navLinks.classList.contains("active")) {
            setMenu(false);
            menuToggle.focus();
        }
    });

    // Close when tapping outside the header
    document.addEventListener("click", (event) => {
        if (navLinks.classList.contains("active") && !header.contains(event.target)) setMenu(false);
    });

    // Reset if the window is widened while the menu is open
    window.matchMedia("(min-width: 701px)").addEventListener("change", (e) => {
        if (e.matches) setMenu(false);
    });
}

/* SCROLL REVEAL ANIMATIONS */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });

    revealElements.forEach(element => revealObserver.observe(element));
} else {
    revealElements.forEach(element => element.classList.add("active"));
}

/* ACTIVE NAV LINK (SCROLL SPY) */

const spyLinks = [...document.querySelectorAll('.nav-links a[href^="#"]:not(.nav-cta)')];
const spyTargets = spyLinks
    .map(link => ({ link, section: document.querySelector(link.getAttribute("href")) }))
    .filter(item => item.section);

if ("IntersectionObserver" in window && spyTargets.length) {
    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            spyTargets.forEach(({ link, section }) => {
                const current = section === entry.target;
                link.classList.toggle("current", current);
                if (current) link.setAttribute("aria-current", "true");
                else link.removeAttribute("aria-current");
            });
        });
    }, { rootMargin: "-45% 0px -50% 0px" });

    spyTargets.forEach(({ section }) => spyObserver.observe(section));
}

/* SCROLL PROGRESS, HEADER SHADOW, BACK-TO-TOP */

const progress = document.querySelector(".scroll-progress");
const toTop = document.querySelector(".to-top");
let ticking = false;

const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (toTop) toTop.hidden = y < 600;
    ticking = false;
};

window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
onScroll();

if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* CONTACT FORM (opens the visitor's email app) */

const form = document.querySelector("#contact-form");
const statusEl = document.querySelector("#form-status");
const EMAIL = "karirifaith8@gmail.com";

if (form) {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = form.elements.name.value.trim();
        const email = form.elements.email.value.trim();
        const message = form.elements.message.value.trim();

        let valid = true;
        [["name", name], ["email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email], ["message", message]]
            .forEach(([key, value]) => {
                const field = form.elements[key].closest(".field");
                field.classList.toggle("invalid", !value);
                form.elements[key].setAttribute("aria-invalid", String(!value));
                if (!value) valid = false;
            });

        if (!valid) {
            statusEl.textContent = "Please fill in your name, a valid email and a message.";
            return;
        }

        const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
        statusEl.textContent = "Opening your email app… if nothing happens, email me directly at " + EMAIL + ".";
        window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    });
}

/* COPY EMAIL */

const copyBtn = document.querySelector("#copy-email");

if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
        const original = copyBtn.textContent;
        try {
            await navigator.clipboard.writeText(EMAIL);
            copyBtn.textContent = "Copied ✓";
        } catch (e) {
            copyBtn.textContent = "Press Ctrl+C to copy";
            const range = document.createRange();
            range.selectNodeContents(document.querySelector(".contact-alt .email-address"));
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
        setTimeout(() => { copyBtn.textContent = original; }, 2200);
    });
}

/* PROJECT FILTERS */

const filterButtons = document.querySelectorAll(".filter");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        const choice = button.dataset.filter;
        filterButtons.forEach(b => b.setAttribute("aria-pressed", String(b === button)));
        projectCards.forEach(card => {
            const show = choice === "all" || card.dataset.cat === choice;
            card.hidden = !show;
            if (show) card.classList.add("active"); // make sure it is visible even if it was never scrolled into view
        });
    });
});

/* CURRENT YEAR IN FOOTER */

const yearElement = document.querySelector("#year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}
