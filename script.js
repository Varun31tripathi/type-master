// Handle navigation and game logic

// On Home Page
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
    easy: "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
    medium: "Typing fast is not just about speed but also about accuracy and rhythm. It requires practice and patience.",
    hard: "Programming challenges often teach us to type efficiently and think logically. Mastering both skills can significantly enhance productivity and problem-solving abilities."
  };

  document.getElementById("passage").textContent = passages[difficulty];

  const inputArea = document.getElementById("inputArea");
  let timer = 0, interval, started = false, correct = 0, total = 0;

  function startTest() {
    started = true;
    let limit = mode === "time30" ? 30 : mode === "time60" ? 60 : 0;
    interval = setInterval(() => {
      timer++;
      document.getElementById("timer").textContent = limit ? limit - timer : timer;
      if (limit && timer >= limit) endTest();
    }, 1000);
  }

  inputArea.addEventListener("input", () => {
    if (!started) startTest();
    const passage = passages[difficulty];
    total = inputArea.value.length;
    correct = 0;
    for (let i = 0; i < total; i++) {
      if (inputArea.value[i] === passage[i]) correct++;
    }
    const accuracy = total ? Math.round((correct / total) * 100) : 100;
    const errors = total - correct;
    const wpm = Math.round((correct / 5) / (timer / 60 || 1));

    document.getElementById("accuracy").textContent = `${accuracy}%`;
    document.getElementById("errors").textContent = errors;
    document.getElementById("wpm").textContent = wpm;

    if (mode.startsWith("words") && total >= 250) endTest();
  });

  function endTest() {
    clearInterval(interval);
    const wpm = document.getElementById("wpm").textContent;
    const accuracy = document.getElementById("accuracy").textContent;
    const errors = document.getElementById("errors").textContent;

    const key = `${mode}_${difficulty}_best`;
    const best = Math.max(wpm, localStorage.getItem(key) || 0);
    localStorage.setItem(key, best);

    localStorage.setItem("latestResults", JSON.stringify({ wpm, accuracy, errors, best }));
    window.location.href = "results.html";
  }
}

// On Results Page
if (document.getElementById("finalWpm")) {
  const data = JSON.parse(localStorage.getItem("latestResults") || "{}");
  document.getElementById("finalWpm").textContent = data.wpm || 0;
  document.getElementById("finalAccuracy").textContent = data.accuracy || "0%";
  document.getElementById("finalErrors").textContent = data.errors || 0;
  document.getElementById("bestWpm").textContent = data.best || 0;

  document.getElementById("retryBtn").addEventListener("click", () => {
    history.back();
  });
  document.getElementById("homeBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });
}
