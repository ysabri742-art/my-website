const questions = [
  { q: "ما اسمك؟", options: ["يوسف", "أحمد", "محمود", "ليان"], answer: 0 },
  { q: "عمرك كام؟", options: ["18", "21", "25", "30"], answer: 1 },
  { q: "ما لون السماء؟", options: ["أزرق", "أحمر", "أصفر", "أخضر"], answer: 0 }
];

let currentQuestion = 0;
let answers = [];
let score = 0;
let timer;
let timeLeft = 60; // ثانية

const questionContainer = document.getElementById("question-container");
const optionsContainer = document.getElementById("options");
const timeDisplay = document.getElementById("time");

function loadQuestion() {
  let q = questions[currentQuestion];
  questionContainer.textContent = q.q;
  optionsContainer.innerHTML = "";

  q.options.forEach((opt, i) => {
    let btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(i);
    optionsContainer.appendChild(btn);
  });
}

function selectAnswer(i) {
  answers[currentQuestion] = i;
}

document.getElementById("next").onclick = () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    loadQuestion();
  } else {
    finishExam();
  }
};

document.getElementById("prev").onclick = () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
};

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    let min = Math.floor(timeLeft / 60);
    let sec = timeLeft % 60;
    timeDisplay.textContent = `${min}:${sec.toString().padStart(2, "0")}`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      finishExam();
    }
  }, 1000);
}

function finishExam() {
  clearInterval(timer);
  score = answers.filter((a, i) => a === questions[i].answer).length;

  // ✅ هنا بنبعت النتيجة للـ Google Sheet
  fetch("https://script.google.com/macros/s/AKfycbx022lpkaJWjcP6quXFuGk_NQ5v8kEopy4YBvAPKojWUwdue4ttApB3iuqg-iK7NQlE/exec", {
    method: "POST",
    body: JSON.stringify({ name: "Yousef", age: "21", score: score }),
    headers: { "Content-Type": "application/json" }
  })
  .then(r => r.text())
  .then(msg => {
    alert(`انتهى الاختبار!\nدرجتك: ${score}/${questions.length}\n${msg}`);
  })
  .catch(err => console.error(err));
}

// بدء الامتحان
loadQuestion();
startTimer();
