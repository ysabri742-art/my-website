let mode = localStorage.getItem("mode");
let section = parseInt(localStorage.getItem("section") || "1");
let totalSections = 5;
let questionsPerSection = 24;
let currentIndex = 0;
let timeLeft = 25 * 60;

let questions = Array.from({ length: questionsPerSection }, (_, i) => ({
  text: `السؤال رقم ${i + 1} في القسم ${section}`,
  answer: null,
  marked: false
}));

function updateQuestion() {
  const q = questions[currentIndex];
  document.getElementById("section-title").textContent = `القسم ${section}`;
  document.getElementById("question-text").textContent = q.text;

  let answersHTML = "";
  ["A", "B", "C", "D"].forEach(opt => {
    answersHTML += `<label><input type="radio" name="answer" value="${opt}" ${q.answer === opt ? "checked" : ""}> ${opt}</label><br>`;
  });
  document.getElementById("answers").innerHTML = answersHTML;
}

function saveAnswer() {
  const selected = document.querySelector("input[name='answer']:checked");
  questions[currentIndex].answer = selected ? selected.value : null;
}

function nextQuestion() {
  saveAnswer();
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    updateQuestion();
  }
}

function prevQuestion() {
  saveAnswer();
  if (currentIndex > 0) {
    currentIndex--;
    updateQuestion();
  }
}

function markQuestion() {
  questions[currentIndex].marked = true;
  alert("⭐ تم وضع علامة مرجعية");
}

function reviewSection() {
  saveAnswer();
  let html = `<h2>مراجعة القسم ${section}</h2><ul>`;
  questions.forEach((q, i) => {
    let status = q.answer ? "✅ مجاب" : "❌ غير مجاب";
    if (q.marked) status += " ⭐ مرجعي";
    html += `<li>سؤال ${i + 1}: ${status} <button onclick="goTo(${i})">🔁</button></li>`;
  });
  html += `</ul>
    <button onclick="goTo(0)">🔙 العودة لأول سؤال</button>
    <button onclick="chooseQuestion()">🔍 العودة لسؤال محدد</button>
    <button onclick="endSection()">✅ إنهاء القسم</button>`;
  document.body.innerHTML = html;
}

function goTo(index) {
  currentIndex = index;
  location.reload();
}

function chooseQuestion() {
  let num = prompt("أدخل رقم السؤال:");
  if (num && !isNaN(num) && num >= 1 && num <= questions.length) {
    goTo(parseInt(num) - 1);
  }
}

function endSection() {
  if (mode === "real" && section < totalSections) {
    localStorage.setItem("section", section + 1);
    location.reload();
  } else {
    alert("✅ تم إنهاء الاختبار بالكامل");
    localStorage.clear();
    window.location.href = "index.html";
  }
}

setInterval(() => {
  if (timeLeft > 0) {
    timeLeft--;
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    document.getElementById("timer").textContent = `الوقت المتبقي: ${min}:${sec < 10 ? "0" + sec : sec}`;
  } else {
    reviewSection();
  }
}, 1000);

updateQuestion();
