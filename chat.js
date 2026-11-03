// Chat assistant. Everything it knows comes from data.js (SHOP, HOURS, MENU, SPECIALS).
// It uses helpers from common.js, so common.js must load first.

const chat = document.getElementById("chat");
const chatToggle = document.getElementById("chat-toggle");
const chatClose = document.getElementById("chat-close");
const chatLog = document.getElementById("chat-log");
const chatChips = document.getElementById("chat-chips");
const chatForm = document.getElementById("chat-form");
const chatText = document.getElementById("chat-text");
const soundBtn = document.getElementById("chat-sound");

let soundOn = true;
let audioCtx = null;
let greeted = false;

/* ---------- sound (made in code, no files) ---------- */
function tone(from, to, seconds, volume) {
    if (!soundOn) return;
    try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();

        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(from, t);
        osc.frequency.exponentialRampToValueAtTime(to, t + seconds * 0.9);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(volume, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + seconds + 0.05);
    } catch (error) { }
}

function whoop() { tone(300, 1100, 0.3, 0.12); }
function blip() { tone(700, 900, 0.1, 0.06); }

/* ---------- paper plane ---------- */
function flyPlane(source) {
    if (calmMotion) return;

    const rect = source.getBoundingClientRect();
    const plane = document.createElement("span");
    plane.className = "plane";
    plane.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l18-8-8 18-2-8-8-2z"/></svg>';
    plane.style.left = rect.left + rect.width / 2 - 14 + "px";
    plane.style.top = rect.top + rect.height / 2 - 14 + "px";

    document.body.appendChild(plane);
    setTimeout(function () { plane.remove(); }, 1100);
}

/* ---------- messages ---------- */
function addMessage(text, who) {
    const bubble = document.createElement("div");
    bubble.className = "msg " + who;
    bubble.textContent = text;
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function showTyping() {
    const dots = document.createElement("div");
    dots.className = "typing";
    dots.innerHTML = "<span></span><span></span><span></span>";
    chatLog.appendChild(dots);
    chatLog.scrollTop = chatLog.scrollHeight;
    return dots;
}

function botReply(text) {
    const dots = showTyping();
    const delay = 600 + Math.min(text.length * 12, 900);

    setTimeout(function () {
        dots.remove();
        addMessage(text, "bot");
        blip();
    }, delay);
}

/* ---------- knowledge helpers ---------- */
function usd(n) {
    return "$" + n.toFixed(2);
}

function categoryNames() {
    return Array.from(new Set(MENU.map(function (d) { return d.category; })));
}

function dayHours(day) {
    const h = HOURS[day];
    return h
        ? "On " + day + " we're open " + formatHour(h[0]) + " to " + formatHour(h[1]) + "."
        : "We're closed on " + day + ".";
}

function priceRanges() {
    return categoryNames().map(function (cat) {
        const prices = MENU.filter(function (d) { return d.category === cat; }).map(function (d) { return d.price; });
        return cat + ": " + usd(Math.min.apply(null, prices)) + " to " + usd(Math.max.apply(null, prices));
    }).join("\n");
}

function categoryOf(q) {
    return categoryNames().find(function (cat) {
        const keys = (typeof CATEGORY_KEYS !== "undefined" && CATEGORY_KEYS[cat]) || [cat.toLowerCase()];
        return keys.some(function (key) { return q.includes(key); });
    });
}

const FILLER = ["and", "the", "with", "for", "you", "your", "have", "what", "how", "much", "does", "cost", "price", "who", "any", "are", "can", "get"];

function findDishes(q) {
    const qWords = q.split(" ").filter(function (w) { return w.length > 2; });
    let best = 0;
    let found = [];

    MENU.forEach(function (d) {
        const nameWords = d.name.toLowerCase().split(/[^a-z]+/).filter(function (w) {
            return w.length > 2 && !FILLER.includes(w);
        });

        const hits = nameWords.filter(function (w) {
            return qWords.some(function (x) { return x === w || x === w + "s" || x + "s" === w; });
        }).length;

        if (hits > best) {
            best = hits;
            found = [d];
        } else if (hits === best && hits > 0) {
            found.push(d);
        }
    });

    return found;
}

function extractParty(q) {
    const m = q.match(/(?:for|party of|group of)\s+(\d{1,2})\b/) || q.match(/\b(\d{1,2})\s*(?:people|persons|guests|ppl|of us|pax)\b/);
    const n = m ? parseInt(m[1], 10) : 0;
    return n >= 1 && n <= 12 ? n : 0;
}

function todaysSpecial() {
    const day = shopClock().day;
    const plan = SPECIALS[day];
    const dish = plan && MENU.find(function (d) { return d.name === plan.dish; });
    return dish ? { dish: dish, plan: plan, day: day } : null;
}

function goToBooking(party) {
    setTimeout(function () {
        setChat(false);

        const target = document.getElementById("contact");

        if (!target) {
            const link = document.createElement("a");
            link.href = "index.html#contact";
            document.body.appendChild(link);
            link.click();
            link.remove();
            return;
        }

        if (party && typeof setParty === "function") setParty(party, true);

        target.scrollIntoView({ behavior: calmMotion ? "auto" : "smooth" });
        setTimeout(function () {
            const name = document.getElementById("name");
            if (name) name.focus({ preventScroll: true });
        }, 800);
    }, 1800);
}

function goToMenu() {
    setTimeout(function () {
        setChat(false);

        if (document.getElementById("menu-grid")) return;

        const link = document.createElement("a");
        link.href = "menu.html";
        document.body.appendChild(link);
        link.click();
        link.remove();
    }, 1600);
}

/* ---------- the brain ---------- */
function getAnswer(text) {
    const q = text.toLowerCase().replace(/[^a-z0-9$&+\-' ]/g, " ").replace(/\s+/g, " ").trim();
    const words = q.split(" ");

    const has = function (list) { return list.some(function (k) { return q.includes(k); }); };
    const hasWord = function (list) { return list.some(function (k) { return words.includes(k); }); };

    const fallback = "I'm not sure about that one. Please call us at " + SHOP.phone + " and we'll help.";

    if (!q) return { text: fallback };

    if (hasWord(["thanks", "thank", "thx", "ty"])) {
        return { text: "You're welcome! Anything else I can help with?" };
    }

    if (words.length <= 4 && (hasWord(["hi", "hello", "hey", "yo", "hola", "sup"]) || has(["good morning", "good afternoon", "good evening"]))) {
        return { text: "Hello! Ask me about the menu, hours, or reservations." };
    }

    if (hasWord(["human", "person", "bot", "robot", "ai", "staff", "owner", "manager"])) {
        return { text: "I'm an automated assistant, not a person. For anything I can't answer, call " + SHOP.phone + "." };
    }

    if (has(["cancel", "resched", "change my", "move my"])) {
        return { text: "To change or cancel a reservation, reply to your confirmation email or call " + SHOP.phone + "." };
    }

    /* safety first: never guess about allergies or diets */
    if (has(["allerg", "gluten", "nut ", "nuts", "peanut", "vegan", "dairy", "lactose", "celiac", "coeliac", "halal", "kosher", "intoleran", "shellfish"])) {
        return {
            text: "I can't confirm allergy or dietary details, and getting that wrong could be serious. Please tell our staff about any allergy when you reserve or order, or call " + SHOP.phone + "."
        };
    }

    if (has(["reserv", "book", "table"]) || hasWord(["booking"])) {
        const party = extractParty(q);
        return {
            text: party
                ? "Great! I'll take you to the reservation form with a party of " + party + ". Pick a date and a time, and we'll confirm shortly."
                : "Sure! I'll take you to the reservation form. Pick your party size, a date and a time, and we'll confirm shortly.",
            action: function () { goToBooking(party); }
        };
    }

    if (has(["walk-in", "walk in", "walkin"])) {
        return { text: "Walk-ins are welcome, and reservations are preferred at busy times. Say \"book a table\" and I'll take you to the form." };
    }

    if (has(["special", "recommend", "suggest", "popular", "favorite", "favourite", "best"])) {
        const s = todaysSpecial();
        if (s) {
            return { text: "Today's special is the " + s.dish.name + " at " + usd(s.plan.deal) + " (usually " + usd(s.dish.price) + "). " + s.dish.desc };
        }
        return { text: "Ask me about any dish, or open the Menu page to browse." };
    }

    if (has(["menu"])) {
        if (has(["open", "show", "see", "view", "go to", "take me"])) {
            return { text: "Taking you to the menu.", action: goToMenu };
        }
        return { text: "Our menu has " + categoryNames().join(", ") + ".\n" + priceRanges() + "\nAsk about any dish, or say \"show menu\"." };
    }

    if (has(["vegetarian", "veggie"]) || hasWord(["spicy", "spice", "hot"]) && has(["spicy", "spice"])) {
        const tag = has(["spicy", "spice"]) ? "spicy" : "vegetarian";
        const list = MENU.filter(function (d) { return d.tags.includes(tag); });
        return {
            text: "Dishes marked " + tag + " on our menu:\n" + list.map(function (d) { return d.name + " (" + usd(d.price) + ")"; }).join("\n") +
                "\nFor allergies, please ask our staff."
        };
    }

    const dayAsked = DAYS.find(function (d) { return q.includes(d.toLowerCase()); });
    if (dayAsked && !has(["price", "cost", "how much"])) return { text: dayHours(dayAsked) };

    if (hasWord(["tomorrow"])) {
        return { text: dayHours(DAYS[(DAYS.indexOf(shopClock().day) + 1) % 7]) };
    }

    if (hasWord(["weekend"])) {
        return { text: dayHours("Saturday") + "\n" + dayHours("Sunday") };
    }

    if (has(["open", "clos", "hour", "kitchen"]) || hasWord(["today", "now"])) {
        return { text: kitchenStatus().text + ".\n" + SHOP.hoursText };
    }

    if (has(["where", "address", "locat", "direction", "find you"])) {
        return { text: SHOP.name + " is at " + SHOP.address + ". The Hours and Location section has a Get Directions button." };
    }

    if (has(["parking", "wifi", "wi-fi", "dog", "pet", "kids", "highchair", "high chair", "outdoor", "patio", "delivery", "takeout", "take out", "takeaway"])) {
        return { text: "I don't have that detail. Please call us at " + SHOP.phone + "." };
    }

    if (has(["phone", "call", "number", "email", "contact"])) {
        return { text: "You can call " + SHOP.phone + " or email " + SHOP.email + "." };
    }

    const dishes = findDishes(q);

    if (dishes.length) {
        if (has(["ingredient", "what's in", "whats in", "made of", "made with", "contain"])) {
            return {
                text: dishes.map(function (d) { return d.name + ": " + d.details; }).join("\n") +
                    "\nFor allergies, please confirm with our staff."
            };
        }

        return {
            text: dishes.map(function (d) {
                return d.name + " is " + usd(d.price) + ". " + d.desc + (d.tags.length ? " Marked " + d.tags.join(", ") + " on our menu." : "");
            }).join("\n")
        };
    }

    const cat = categoryOf(q);
    if (cat) {
        const list = MENU.filter(function (d) { return d.category === cat; });
        return { text: cat + ":\n" + list.map(function (d) { return d.name + " (" + usd(d.price) + ")"; }).join("\n") };
    }

    if (has(["price", "cost", "how much", "charge", "$"])) {
        return { text: "Here's the price range by category:\n" + priceRanges() + "\nAsk about a specific dish for its exact price." };
    }

    return { text: fallback };
}

function ask(question) {
    addMessage(question, "me");
    const result = getAnswer(question);
    botReply(result.text);
    if (result.action) result.action();
}

/* ---------- open, close, sound, buttons ---------- */
function setChat(open) {
    chat.classList.toggle("open", open);
    chat.setAttribute("aria-hidden", String(!open));
    chatToggle.setAttribute("aria-expanded", String(open));

    if (open && !greeted) {
        greeted = true;
        setTimeout(function () {
            botReply("Hi! I'm the " + SHOP.name + " virtual assistant. Ask me about the menu, hours, or reservations.");
        }, 350);
    }
}

chatToggle.addEventListener("click", function () {
    setChat(!chat.classList.contains("open"));
});

chatClose.addEventListener("click", function () {
    setChat(false);
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setChat(false);
});

soundBtn.addEventListener("click", function () {
    soundOn = !soundOn;
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    soundBtn.textContent = soundOn ? "Sound on" : "Sound off";
});

["Menu", "Today's special", "Hours", "Reserve a table"].forEach(function (label, index) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = label;
    chip.style.animationDelay = index * 0.08 + "s";

    chip.addEventListener("click", function () {
        whoop();
        flyPlane(chip);
        ask(label);
    });

    chatChips.appendChild(chip);
});

chatForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = chatText.value.trim();
    if (!text) return;

    const sendButton = chatForm.querySelector("button");
    chatText.value = "";

    sendButton.classList.add("fire");
    setTimeout(function () { sendButton.classList.remove("fire"); }, 400);

    whoop();
    flyPlane(sendButton);
    ask(text);
});