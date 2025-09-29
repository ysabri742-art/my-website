function startQuickMock() {
  localStorage.setItem("mode", "quick");
  window.location.href = "quiz.html";
}

function startRealMock() {
  localStorage.setItem("mode", "real");
  localStorage.setItem("section", "1");
  window.location.href = "quiz.html";
}

