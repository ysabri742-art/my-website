document.addEventListener("DOMContentLoaded", () => {
  const questions = [
    { question: "ما اسمك؟", options: ["أحمد", "محمد", "يوسف", "علي"], answer: 2 },
    { question: "كم عمرك؟", options: ["18", "20", "21", "25"], answer: 2 },
    { question: "أين تعيش؟", options: ["القاهرة", "الرياض", "دبي", "الدوحة"], answer: 0 }
  ];

  let currentQuestion = 0;
  let answers = {};
  let score = 0;
  let timer = 60;
  let interval;

  function loadQuestion() {
    const quizDiv = document.getElementById("quiz");
    const q = questions[currentQuestion];

    quizDiv.innerHTML = `
      <h2>${q.question}</h2>
      ${q.options.map((opt, i) => `
        <label>
          <input type="radio" name="q${currentQuestion}" value="${i}" ${answers[currentQuestion] == i ? "checked" : ""}>
          ${opt}
        </label><br>
      `).join("")}
    `;
  }

  function startTimer() {
    interval = setInterval(() => {
      timer--;
      document.getElementById("timer").innerText = `الوقت المتبقي: ${timer} ثانية`;
      if (timer <= 0) {
        clearInterval(interval);
        submitQuiz();
      }
    }, 1000);
  }

  function saveAnswer() {
    const selected = document.querySelector(`input[name="q${currentQuestion}"]:checked`);
    if (selected) {
      answers[currentQuestion] = parseInt(selected.value);
    }
  }

  function submitQuiz() {
    saveAnswer();
    clearInterval(interval);

    score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) score++;
    });

    document.getElementById("quiz").innerHTML = `
      <h2>انتهى الاختبار</h2>
      <p>نتيجتك: ${score} من ${questions.length}</p>
    `;

    // إرسال النتيجة لجوجل شيت
    fetch("https://script.google.com/macros/s/AKfycbx022lpkaJWjcP6quXFuGk_NQ5v8kEopy4YBvAPKojWUwdue4ttApB3iuqg-iK7NQlE/exec", {
      method: "POST",
      body: JSON.stringify({
        name: "يوسف",
        score: score,
        total: questions.length,
        date: new Date().toLocaleString()
      }),
      headers: { "Content-Type": "application/json" }
    }).then(res => res.text())
      .then(data => console.log("تم الحفظ:", data))
      .catch(err => console.error("خطأ:", err));
  }

  // ربط الأزرار بعد تحميل الصفحة
  document.getElementById("next").addEventListener("click", () => {
    saveAnswer();
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      loadQuestion();
    }
  });

  document.getElementById("prev").addEventListener("click", () => {
    saveAnswer();
    if (currentQuestion > 0) {
      currentQuestion--;
      loadQuestion();
    }
  });

  document.getElementById("submit").addEventListener("click", submitQuiz);

  // أول سؤال + مؤقت
  loadQuestion();
  startTimer();
});
