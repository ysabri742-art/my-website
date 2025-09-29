// أسئلة تجريبية
const sampleQuestions = [
  { q: "ما اسمك؟", options: ["أحمد", "محمد", "ليلى", "سارة"] },
  { q: "كم عمرك؟", options: ["15", "20", "25", "30"] },
  { q: "ما لونك المفضل؟", options: ["أحمر", "أزرق", "أخضر", "أصفر"] },
  { q: "أين تسكن؟", options: ["القاهرة", "الإسكندرية", "المنصورة", "أسوان"] },
  { q: "ما هو حيوانك المفضل؟", options: ["قط", "كلب", "أسد", "نمر"] }
];

let examType = "";
let currentQuestion = 0;
let questions = [];
let answers = [];
let flags = [];
let timer;
let timeLeft;
let currentSection = 1;

// بدء الامتحان
function startExam(type) {
  examType = type;
  document.getElementById("home").classList.add("hidden");
  document.getElementById("exam").classList.remove("hidden");

  if (type === "fast") {
    questions = generateQuestions(24);
    timeLeft = 25 * 60;
  } else {
    questions = generateQuestions(120);
    timeLeft = 25 * 60;
  }

  answers = new Array(questions.length).fill(null);
  flags = new Array(questions.length).fill(false);

  showQuestion();
  startTimer();
}

// توليد أسئلة عشوائية
function generateQuestions(num) {
  let q = [];
  for (let i = 0; i < num; i++) {
    let random = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
    q.push(random);
  }
  return q;
}

// عرض السؤال
function showQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("question").innerText = `س${currentQuestion+1}: ${q.q}`;
  
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => answers[currentQuestion] = opt;
    optionsDiv.appendChild(btn);
  });
}

// التنقل بين الأسئلة
function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion();
  } else {
    showReview();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion();
  }
}

// وضع علامة مرجعية
function toggleFlag() {
  flags[currentQuestion] = !flags[currentQuestion];
  alert(flags[currentQuestion] ? "🚩 تمت إضافة علامة" : "❌ تمت إزالة العلامة");
}

// شاشة المراجعة
function showReview() {
  document.getElementById("exam").classList.add("hidden");
  document.getElementById("review").classList.remove("hidden");

  let reviewDiv = document.getElementById("review-list");
  reviewDiv.innerHTML = "";

  questions.forEach((_, i) => {
    let status = answers[i] ? "✅ تمت الإجابة" : "❌ لم تتم الإجابة";
    if (flags[i]) status += " 🚩";
    let btn = document.createElement("button");
    btn.innerText = `س${i+1}: ${status}`;
    btn.onclick = () => goToQuestion(i);
    reviewDiv.appendChild(btn);
  });
}

function goToFirst() {
  currentQuestion = 0;
  backToExam();
}

function goToQuestion(i) {
  currentQuestion = i;
  backToExam();
}

function backToExam() {
  document.getElementById("review").classList.add("hidden");
  document.getElementById("exam").classList.remove("hidden");
  showQuestion();
}

// إنهاء القسم
function endSection() {
  if (examType === "real" && currentSection < 5) {
    alert(`✅ تم إنهاء القسم ${currentSection}`);
    currentSection++;
    questions = generateQuestions(24);
    answers = new Array(24).fill(null);
    flags = new Array(24).fill(false);
    currentQuestion = 0;
    timeLeft = 25 * 60;
    startTimer();
    backToExam();
  } else {
    alert("🎉 انتهى الامتحان بالكامل");
    location.reload();
  }
}

// العداد الزمني
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    document.getElementById("timer").innerText = `⏳ ${minutes}:${seconds < 10 ? "0"+seconds : seconds}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      showReview();
    }
    timeLeft--;
  }, 1000);
}
