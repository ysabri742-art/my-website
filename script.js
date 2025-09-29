const questions = [
  { text: "ما اسمك؟", options: ["أحمد", "محمود", "سارة", "غير ذلك"] },
  { text: "كم عمرك؟", options: ["أقل من 18", "18-25", "26-35", "35+"] },
  { text: "ما لونك المفضل؟", options: ["أحمر", "أزرق", "أخضر", "أسود"] },
  { text: "أين تسكن؟", options: ["القاهرة", "الإسكندرية", "المنصورة", "غير ذلك"] }
];

let currentIndex = 0;
let answers = {};
let flagged = new Set();

const container = document.getElementById("question-container");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const flagBtn = document.getElementById("flag");

function loadQuestion(index) {
  const q = questions[index];
  container.innerHTML = `
    <h3>س${index+1}: ${q.text}</h3>
    <div class="options">
      ${q.options.map((opt, i) => `
        <label>
          <input type="radio" name="q${index}" value="${opt}" 
          ${answers[index] === opt ? "checked" : ""}>
          ${opt}
        </label>
      `).join("")}
    </div>
  `;
}

function saveAnswer() {
  const selected = document.querySelector(`input[name="q${currentIndex}"]:checked`);
  if (selected) {
    answers[currentIndex] = selected.value;
  }
}

prevBtn.addEventListener("click", () => {
  saveAnswer();
  if (currentIndex > 0) {
    currentIndex--;
    loadQuestion(currentIndex);
  }
});

nextBtn.addEventListener("click", () => {
  saveAnswer();
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    loadQuestion(currentIndex);
  } else {
    alert("انتهيت من الاختبار 🎉");
    console.log("الإجابات:", answers, "المؤشرات:", flagged);
  }
});

flagBtn.addEventListener("click", () => {
  if (flagged.has(currentIndex)) {
    flagged.delete(currentIndex);
    alert("تمت إزالة الإشارة من السؤال");
  } else {
    flagged.add(currentIndex);
    alert("تم وضع إشارة على السؤال");
  }
});

loadQuestion(currentIndex);
