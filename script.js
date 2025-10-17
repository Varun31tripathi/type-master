// On Start Page
if (document.getElementById("startBtn")) {
  document.getElementById("startBtn").addEventListener("click", () => {
    const mode = document.getElementById("mode").value;
    const difficulty = document.getElementById("difficulty").value;
    window.location.href = `test.html?mode=${mode}&difficulty=${difficulty}`;
  });
}

// On Test Page
if (document.getElementById("inputArea")) {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const difficulty = urlParams.get("difficulty");

  document.getElementById("modeText").textContent = mode;
  document.getElementById("difficultyText").textContent = difficulty;

  const passages = {
    easy: "The quick brown fox jumps over the lazy dog.This sentence contains every letter of the alphabet.",
    medium: "Typing fast is not just about speed but also about accuracy and rhythm.It requires practice and patience.",
    hard: "Programming challenges often teach us to type efficiently and think logically.Mastering both skills can significantly enhance productivity and problem-solving abilities."
  };

  const passageText = passages[difficulty];
  const passageEl = document.getElementById("passage");
  passageEl.innerHTML = passageText
    .split("")
    .map(ch => `<span>${ch}</span>`)
    .join("");

  const inputArea = document.getElementById("inputArea");
  const passageSpans = document.querySelectorAll("#passage span");

  let timer = 0, interval, started = false, correct = 0, total = 0, finished = false;

  function startTest() {
    started = true;
    let limit = mode === "time30" ? 30 : mode === "time60" ? 60 : 0;
    interval = setInterval(() => {
      timer++;
      document.getElementById("timer").textContent = limit ? limit - timer : timer;
      if (limit && timer >= limit) endTest();
    }, 1000);
  }

  function endTest() {
    if (finished) return; // Prevent multiple calls
    finished = true;
    clearInterval(interval);

    const wpm = document.getElementById("wpm").textContent;
    const accuracy = document.getElementById("accuracy").textContent;
    const errors = document.getElementById("errors").textContent;

    const key = `${mode}_${difficulty}_best`;
    const best = Math.max(parseInt(wpm), parseInt(localStorage.getItem(key)) || 0);
    localStorage.setItem(key, best);

    localStorage.setItem("latestResults", JSON.stringify({ wpm, accuracy, errors, best }));
    window.location.href = "results.html";
  }

  inputArea.addEventListener("input", () => {
    if (!started) startTest();

    const typed = inputArea.value.split("");
    total = typed.length;
    correct = 0;

    passageSpans.forEach((span, i) => {
      const char = typed[i];
      if (char == null) {
        span.classList.remove("correct", "incorrect");
      } else if (char === span.textContent) {
        span.classList.add("correct");
        span.classList.remove("incorrect");
        correct++;
      } else {
        span.classList.add("incorrect");
        span.classList.remove("correct");
      }
    });

    const accuracy = total ? Math.round((correct / total) * 100) : 100;
    const errors = total - correct;
    const wpm = Math.round((correct / 5) / (timer / 60 || 1));

    document.getElementById("accuracy").textContent = `${accuracy}%`;
    document.getElementById("errors").textContent = errors;
    document.getElementById("wpm").textContent = wpm;

    // ✅ Auto stop when passage is fully typed
    if (total >= passageText.length) {
      inputArea.disabled = true;
      endTest();
    }
  });

  // ✅ Clear input when reloading or retrying
  window.addEventListener("pageshow", () => {
    inputArea.value = "";
    inputArea.disabled = false;
    passageSpans.forEach(span => span.classList.remove("correct", "incorrect"));
    document.getElementById("accuracy").textContent = "100%";
    document.getElementById("errors").textContent = "0";
    document.getElementById("wpm").textContent = "0";
    document.getElementById("timer").textContent = "0";
    timer = 0;
    started = false;
    finished = false;
  });
}

// On Results Page
if (document.getElementById("finalWpm")) {
  const data = JSON.parse(localStorage.getItem("latestResults") || "{}");
  document.getElementById("finalWpm").textContent = data.wpm || 0;
  document.getElementById("finalAccuracy").textContent = data.accuracy || "0%";
  document.getElementById("finalErrors").textContent = data.errors || 0;
  document.getElementById("bestWpm").textContent = data.best || 0;

  // ✅ Proper reset when retrying
  document.getElementById("retryBtn").addEventListener("click", () => {
    localStorage.removeItem("latestResults");
    window.location.href = document.referrer; // Go back to test page
  });

  document.getElementById("homeBtn").addEventListener("click", () => {
    localStorage.removeItem("latestResults");
    window.location.href = "index.html";
  });
}
