const $ = id => document.getElementById(id);

let mode = "time";
let duration = 30;
let targetWords = 30;
let complexity = "medium";
let words = [];
let wordIndex = 0;
let charIndex = 0;
let correct = 0;
let errors = 0;
let typed = 0;
let remaining = 30;
let started = false;
let finished = false;
let startedAt = 0;
let timerInterval = null;

const input = $("typing-input");

function getCookie(name) {
    const cookie = document.cookie
        .split("; ")
        .find(item => item.startsWith(name + "="));

    return cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
}

function getStats() {
    const elapsed = Math.max(1, (Date.now() - startedAt) / 1000);
    const wpm = Math.round(correct / 5 / (elapsed / 60));
    const accuracy = typed ? Math.round(correct / typed * 100) : 100;

    return { wpm, accuracy };
}

function renderWords() {
    $("words").innerHTML = words.map((word, i) => {
        const letters = [...word].map((letter, j) => {
            let className = "letter";

            if (i < wordIndex || (i === wordIndex && j < charIndex)) {
                className += " " + (typedLetters[i][j] === letter ? "correct" : "incorrect");
            }

            if (i === wordIndex && j === charIndex) {
                className += " next";
            }

            return `<span class="${className}">${letter}</span>`;
        }).join("");

        return `<span class="word ${i === wordIndex ? "current" : ""}">${letters}</span>`;
    }).join("");
}

let typedLetters = [];

async function loadTest() {
    clearInterval(timerInterval);

    wordIndex = 0;
    charIndex = 0;
    correct = 0;
    errors = 0;
    typed = 0;
    started = false;
    finished = false;
    startedAt = 0;

    remaining = mode === "time" ? duration : 0;

    $("timer").textContent = mode === "time" ? remaining : targetWords;
    $("test-status").textContent = "Press any key to start";
    $("result-panel").classList.add("hidden");

    const count = mode === "time" ? 2000 : targetWords;

    const response = await fetch(
        `/words/?count=${count}&complexity=${complexity}`
    );

    const data = await response.json();

    words = data.words;
    typedLetters = words.map(() => []);

    renderWords();
    input.focus();
}

function startTest() {
    if (started) return;

    started = true;
    startedAt = Date.now();

    $("test-status").textContent = "Typing...";

    if (mode === "time") {
        timerInterval = setInterval(() => {
            remaining--;

            $("timer").textContent = remaining;

            if (remaining <= 0) {
                finishTest();
            }
        }, 1000);
    }
}

function finishTest() {
    if (finished) return;

    finished = true;
    clearInterval(timerInterval);

    const result = getStats();

    $("result-wpm").textContent = result.wpm;
    $("result-accuracy").textContent = result.accuracy + "%";
    $("result-errors").textContent = errors;

    $("result-panel").classList.remove("hidden");
    $("test-status").textContent = "Test completed";

    fetch("/save-result/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            wpm: result.wpm,
            accuracy: result.accuracy,
            errors: errors,
            mode: mode,
            complexity: complexity
        })
    });
}

function typeCharacter(key) {
    if (finished) return;

    if (!started) startTest();

    const word = words[wordIndex];

    if (key === " ") {
        if (charIndex > 0) {
            wordIndex++;
            charIndex = 0;
            renderWords();

            if (mode === "words" && wordIndex >= targetWords) {
                finishTest();
            }
        }

        return;
    }

    const expected = word[charIndex];

    typedLetters[wordIndex].push(key);
    typed++;

    if (key === expected) {
        correct++;
    } else {
        errors++;
    }

    charIndex++;

    renderWords();
}

input.addEventListener("keydown", event => {

    if (event.key === " ") {
        event.preventDefault();
        typeCharacter(" ");
        return;
    }

    if (event.key.length === 1) {
        event.preventDefault();
        typeCharacter(event.key);
    }
});

$("typing-area").addEventListener("click", () => input.focus());

document.querySelectorAll("[data-mode]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll("[data-mode]").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        mode = button.dataset.mode;

        $("time-options").classList.toggle("hidden", mode !== "time");
        $("word-options").classList.toggle("hidden", mode !== "words");
        $("custom-options").classList.toggle("hidden", mode !== "custom");

        if (mode !== "custom") loadTest();
    });
});

document.querySelectorAll("#time-options [data-value]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll("#time-options .choice").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        duration = Number(button.dataset.value);
        loadTest();
    });
});

document.querySelectorAll("#word-options [data-value]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll("#word-options .choice").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        targetWords = Number(button.dataset.value);
        loadTest();
    });
});

document.querySelectorAll("[data-complexity]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll("[data-complexity]").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        complexity = button.dataset.complexity;
        loadTest();
    });
});

$("apply-custom").addEventListener("click", () => {
    const customType = $("custom-type").value;

    if (customType === "time") {
        duration = Math.max(5, Math.min(300, Number($("custom-time").value) || 30));
        mode = "time";
    } else {
        targetWords = Math.max(5, Math.min(500, Number($("custom-words").value) || 30));
        mode = "words";
    }

    loadTest();
});

$("restart").addEventListener("click", loadTest);
$("try-again").addEventListener("click", loadTest);

$("menu-button").addEventListener("click", () => {
    $("sidebar").classList.toggle("open");
});

loadTest();