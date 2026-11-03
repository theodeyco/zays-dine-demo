// Shared by every page.

const observer = new IntersectionObserver(
    function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.2 }
);

// Handy for later: fade in every element that matches a selector, one after another.
function revealAll(selector, stagger) {
    document.querySelectorAll(selector).forEach(function (item, index) {
        item.classList.add("reveal");
        if (stagger) item.style.setProperty("--d", index * stagger + "s");
        observer.observe(item);
    });
}
// Steam curtain between pages.
const curtain = document.getElementById("curtain");
const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function pagePath(path) {
    return path.replace(/index\.html$/, "").replace(/\/$/, "");
}

function clearCurtain() {
    document.documentElement.classList.remove("steam-arrive");
    if (curtain) curtain.classList.remove("on");

    try {
        sessionStorage.removeItem("steam");
    } catch (error) { }
}

if (curtain) {
    /* arriving: wait a moment so the steam is seen, then lift the curtain */
    if (document.documentElement.classList.contains("steam-arrive")) {
        setTimeout(clearCurtain, 1000);
    }

    /* coming back with the browser's back button */
    window.addEventListener("pageshow", function (event) {
        if (event.persisted) clearCurtain();
    });

    /* leaving: catch clicks on links to the other page */
    document.addEventListener("click", function (event) {
        if (calmMotion || event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const link = event.target.closest("a[href]");
        if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;

        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (pagePath(url.pathname) === pagePath(window.location.pathname)) return;

        event.preventDefault();

        try {
            sessionStorage.setItem("steam", "1");
        } catch (error) { }

        curtain.classList.add("on");

        setTimeout(function () {
            window.location.href = url.href;
        }, 450);
    });
}
/* ----- coffee cup that fills as you scroll ----- */
const cupFab = document.getElementById("cup-fab");
const docEl = document.documentElement;
let cupTicking = false;

function updateCup() {
    const max = docEl.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

    docEl.style.setProperty("--fill", p.toFixed(3));
    cupFab.classList.toggle("show", p > 0.02);
    cupFab.classList.toggle("full", p > 0.985);
    cupTicking = false;
}

if (cupFab) {
    window.addEventListener("scroll", function () {
        if (!cupTicking) {
            cupTicking = true;
            requestAnimationFrame(updateCup);
        }
    }, { passive: true });

    window.addEventListener("resize", updateCup);

    cupFab.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: calmMotion ? "auto" : "smooth" });
    });

    updateCup();
}

/* ----- prices that count up the first time they scroll into view ----- */
function formatPrice(n) {
    return "$" + n.toFixed(2);
}

function runCount(el) {
    const to = Number(el.dataset.count);
    const start = performance.now();

    function frame(now) {
        const t = Math.min(1, (now - start) / 900);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = formatPrice(to * eased);
        if (t < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

const countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        runCount(entry.target);
    });
}, { threshold: 0.6 });

function watchCounts(root) {
    if (calmMotion) return;

    root.querySelectorAll("[data-count]").forEach(function (el) {
        el.textContent = formatPrice(0);
        countObserver.observe(el);
    });
}

/* ----- title that appears letter by letter ----- */
function splitTitle(el) {
    if (!el || calmMotion) return;

    const text = el.textContent;
    const base = docEl.classList.contains("steam-arrive") ? 0.8 : 0.15;

    el.setAttribute("aria-label", text);
    el.textContent = "";

    Array.from(text).forEach(function (ch, i) {
        const span = document.createElement("span");
        span.className = "letter";
        span.setAttribute("aria-hidden", "true");
        span.textContent = ch === " " ? "\u00a0" : ch;
        span.style.animationDelay = base + i * 0.05 + "s";
        el.appendChild(span);
    });
}

splitTitle(document.querySelector(".hero h1"));
// Clock and status helpers, shared by pages.
function formatHour(h) {
    const suffix = h >= 12 && h < 24 ? "PM" : "AM";
    const n = h % 12 === 0 ? 12 : h % 12;
    return n + " " + suffix;
}

function shopClock() {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: SHOP_TZ,
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23"
    }).formatToParts(new Date());

    function num(type) {
        return Number(parts.find(function (p) { return p.type === type; }).value);
    }

    return {
        day: parts.find(function (p) { return p.type === "weekday"; }).value,
        hour: num("hour") % 24,
        minute: num("minute")
    };
}

function kitchenStatus() {
    const c = shopClock();
    const today = HOURS[c.day];
    const now = c.hour * 60 + c.minute;

    if (today && now >= today[0] * 60 && now < today[1] * 60) {
        const left = today[1] * 60 - now;
        return {
            open: true,
            text: left <= 60 ? "Kitchen closes in " + left + " min" : "Kitchen open until " + formatHour(today[1])
        };
    }

    if (today && now < today[0] * 60) {
        return { open: false, text: "Opens today at " + formatHour(today[0]) };
    }

    const start = DAYS.indexOf(c.day);
    for (let step = 1; step <= 7; step++) {
        const name = DAYS[(start + step) % 7];
        if (HOURS[name]) {
            return {
                open: false,
                text: "Closed now. Opens " + (step === 1 ? "tomorrow" : name) + " at " + formatHour(HOURS[name][0])
            };
        }
    }

    return { open: false, text: "Closed" };
}