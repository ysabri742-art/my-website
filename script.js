/* app.js
   نسخة جاهزة للعمل محليًا. الأسئلة مولدة تلقائياً (تقدر تستبدلها بقائمة الأسئلة الحقيقية).
   حفظ إجابات في localStorage لكل جلسة/قسم.
*/

(() => {
  // CONFIG
  const SECTION_TIME_SEC = 25 * 60; // 25 دقيقة
  const QUESTIONS_PER_SECTION = 24;
  const SECTIONS_IN_REAL = 5;

  // Sample question generator (يمكن استبدالها بمصفوفة حقيقية)
  function makeQuestion(section, idx) {
    return {
      id: `s${section}_q${idx+1}`,
      text: `سؤال ${idx+1} من القسم ${section}`,
      options: [
        `اختيار A - ${idx+1}`,
        `اختيار B - ${idx+1}`,
        `اختيار C - ${idx+1}`,
        `اختيار D - ${idx+1}`
      ],
      answer: Math.floor(Math.random()*4) // random correct (للتجربة فقط)
    };
  }

  // Full data for real exam (5 sections)
  const realExamData = [];
  for (let s=1; s<=SECTIONS_IN_REAL; s++){
    const sec = [];
    for (let i=0;i<QUESTIONS_PER_SECTION;i++){
      sec.push(makeQuestion(s,i));
    }
    realExamData.push(sec);
  }
  // Quick exam uses only first section
  const quickExamData = realExamData[0];

  // State
  let mode = null; // 'quick' or 'real'
  let currentSection = 1;
  let sectionQuestions = []; // array of questions for current section
  let sectionAnswers = [];   // answers indexes or null
  let sectionFlags = [];     // booleans
  let currentIndex = 0;
  let timerSec = SECTION_TIME_SEC;
  let timerInterval = null;

  // Elements
  const startScreen = document.getElementById('startScreen');
  const quizScreen = document.getElementById('quizScreen');
  const reviewScreen = document.getElementById('reviewScreen');
  const summaryScreen = document.getElementById('summaryScreen');

  const modeLabel = document.getElementById('modeLabel');
  const sectionLabel = document.getElementById('sectionLabel');
  const qCounter = document.getElementById('qCounter');
  const questionText = document.getElementById('questionText');
  const optionsWrap = document.getElementById('options');
  const timerText = document.getElementById('timerText');
  const timerBarFill = document.getElementById('timerBarFill');
  const flagBtn = document.getElementById('flagBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const reviewGrid = document.getElementById('reviewGrid');
  const reviewSectionNum = document.getElementById('reviewSectionNum');
  const backToFirst = document.getElementById('backToFirst');
  const finishSectionBtn = document.getElementById('finishSectionBtn');

  const summaryContent = document.getElementById('summaryContent');
  const restartBtn = document.getElementById('restartBtn');

  // Start buttons
  document.getElementById('quickChoice').addEventListener('click', () => startMode('quick'));
  document.getElementById('realChoice').addEventListener('click', () => startMode('real'));

  // keyboard accessibility
  document.getElementById('quickChoice').addEventListener('keydown', e => { if(e.key==='Enter') startMode('quick'); });
  document.getElementById('realChoice').addEventListener('keydown', e => { if(e.key==='Enter') startMode('real'); });

  // init start
  function startMode(m){
    mode = m;
    currentSection = 1;
    saveSessionMeta();
    loadSection();
    showView('quiz');
  }

  function loadSection(){
    // prepare questions for this section
    if(mode === 'quick'){
      sectionQuestions = quickExamData.slice(0, QUESTIONS_PER_SECTION); // ensure 24
    } else {
      sectionQuestions = realExamData[currentSection-1].slice();
    }
    // restore answers/flags from localStorage if present
    const key = storageKey();
    const persisted = JSON.parse(localStorage.getItem(key) || '{}');
    sectionAnswers = persisted.answers || Array(sectionQuestions.length).fill(null);
    sectionFlags = persisted.flags || Array(sectionQuestions.length).fill(false);
    currentIndex = persisted.index || 0;
    timerSec = persisted.remaining || SECTION_TIME_SEC;

    updateHeader();
    loadQuestion();
    startTimer();
  }

  function storageKey(){
    return `sim_${mode}_s${currentSection}`;
  }

  function saveSessionMeta(){
    localStorage.setItem('sim_mode', mode);
    localStorage.setItem('sim_section', currentSection);
  }

  function persistSection(){
    const key = storageKey();
    localStorage.setItem(key, JSON.stringify({
      answers: sectionAnswers,
      flags: sectionFlags,
      index: currentIndex,
      remaining: timerSec
    }));
  }

  function updateHeader(){
    modeLabel.textContent = (mode==='quick') ? 'اختبار سريع' : 'اختبار واقعي';
    sectionLabel.textContent = `القسم ${currentSection}`;
    qCounter.textContent = `سؤال ${currentIndex+1} / ${sectionQuestions.length}`;
  }

  function loadQuestion(){
    const q = sectionQuestions[currentIndex];
    questionText.textContent = q.text;
    // build options
    optionsWrap.innerHTML = '';
    q.options.forEach((opt, i) => {
      const id = `opt_${i}`;
      const label = document.createElement('label');
      label.innerHTML = `<input type="radio" name="opt" value="${i}" ${sectionAnswers[currentIndex]===i? 'checked':''}> ${opt}`;
      label.addEventListener('click', () => {
        sectionAnswers[currentIndex] = i;
        persistSection();
        updateHeader();
      });
      optionsWrap.appendChild(label);
    });
    // reflect flag state
    flagBtn.textContent = sectionFlags[currentIndex] ? '🚩' : '🚩';
    updateHeader();
  }

  function startTimer(){
    stopTimer();
    renderTimer();
    timerInterval = setInterval(() => {
      timerSec--;
      renderTimer();
      if(timerSec <= 0){
        stopTimer();
        // auto-show review for this section
        showReview();
      }
      persistSection();
    }, 1000);
  }

  function renderTimer(){
    // display mm:ss and bar
    const m = Math.floor(timerSec/60).toString().padStart(2,'0');
    const s = (timerSec%60).toString().padStart(2,'0');
    timerText.textContent = `${m}:${s}`;
    const percent = Math.max(0, (timerSec/SECTION_TIME_SEC)*100);
    timerBarFill.style.width = percent + '%';
  }

  function stopTimer(){
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  // Buttons
  prevBtn.addEventListener('click', () => {
    saveAnswerFromInputs();
    if(currentIndex>0){ currentIndex--; loadQuestion(); persistSection(); }
  });

  nextBtn.addEventListener('click', () => {
    saveAnswerFromInputs();
    if(currentIndex < sectionQuestions.length-1){ currentIndex++; loadQuestion(); persistSection(); }
    else {
      // last question -> open review
      showReview();
    }
  });

  flagBtn.addEventListener('click', () => {
    sectionFlags[currentIndex] = !sectionFlags[currentIndex];
    persistSection();
    loadQuestion();
    alert(sectionFlags[currentIndex] ? 'تم وضع علامة لهذا السؤال' : 'تم إزالة العلامة');
  });

  function saveAnswerFromInputs(){
    const sel = document.querySelector('input[name="opt"]:checked');
    if(sel) sectionAnswers[currentIndex] = parseInt(sel.value);
    persistSection();
  }

  // REVIEW
  function showReview(){
    stopTimer();
    // switch views
    showView('review');
    reviewSectionNum.textContent = currentSection;
    // build grid
    reviewGrid.innerHTML = '';
    sectionQuestions.forEach((q,i) => {
      const div = document.createElement('div');
      div.className = 'review-item';
      const answered = sectionAnswers[i] !== null;
      if(sectionFlags[i]) div.classList.add('flagged');
      else if(answered) div.classList.add('answered');
      else div.classList.add('unanswered');
      div.textContent = i+1;
      div.addEventListener('click', () => {
        // go to this question
        currentIndex = i;
        showView('quiz');
        loadQuestion();
        startTimer();
      });
      reviewGrid.appendChild(div);
    });
  }

  backToFirst.addEventListener('click', () => {
    currentIndex = 0;
    showView('quiz');
    loadQuestion();
    startTimer();
  });

  finishSectionBtn.addEventListener('click', () => {
    // mark this section complete and go to next or show final summary
    persistSection();
    // compute section score (optional)
    const secScore = computeSectionScore();
    // Save section result into aggregate
    saveSectionResult(currentSection, secScore);

    if(mode==='real'){
      if(currentSection < SECTIONS_IN_REAL){
        currentSection++;
        saveSessionMeta();
        loadSection();
        showView('quiz');
      } else {
        // finished all sections
        showFinalSummary();
      }
    } else {
      // quick -> done
      showFinalSummary();
    }
  });

  // Summary
  function computeSectionScore(){
    let score = 0;
    sectionQuestions.forEach((q,i) => {
      if(sectionAnswers[i] === q.answer) score++;
    });
    return score;
  }

  function saveSectionResult(sectionNum, score){
    const allKey = `sim_results_${mode}`;
    const stored = JSON.parse(localStorage.getItem(allKey) || '{}');
    stored[`section_${sectionNum}`] = {
      score, total: sectionQuestions.length,
      date: new Date().toLocaleString()
    };
    localStorage.setItem(allKey, JSON.stringify(stored));
  }

  function showFinalSummary(){
    showView('summary');
    const allKey = `sim_results_${mode}`;
    const stored = JSON.parse(localStorage.getItem(allKey) || '{}');
    // also include current section if not yet saved for quick
    if(mode==='quick'){
      stored[`section_${currentSection}`] = { score: computeSectionScore(), total: sectionQuestions.length, date: new Date().toLocaleString() };
      localStorage.setItem(allKey, JSON.stringify(stored));
    }
    // Build summary HTML
    let html = `<div><strong>وضع الاختبار:</strong> ${mode==='quick' ? 'سريع' : 'واقعي'}</div>`;
    html += `<ul>`;
    let totalAll = 0, correctAll = 0;
    for(let s=1; s<= (mode==='quick' ? 1 : SECTIONS_IN_REAL); s++){
      const key = `section_${s}`;
      const v = stored[key];
      if(v){
        html += `<li>القسم ${s}: ${v.score} / ${v.total} — ${v.date}</li>`;
        correctAll += v.score;
        totalAll += v.total;
      } else {
        html += `<li>القسم ${s}: لم يتم أداءه</li>`;
      }
    }
    html += `</ul>`;
    if(totalAll>0){
      html += `<p><strong>المجموع الكلي:</strong> ${correctAll} من ${totalAll}</p>`;
    }
    summaryContent.innerHTML = html;
  }

  // helper: switch view
  function showView(name){
    startScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    reviewScreen.classList.add('hidden');
    summaryScreen.classList.add('hidden');
    if(name==='start') startScreen.classList.remove('hidden');
    if(name==='quiz') quizScreen.classList.remove('hidden');
    if(name==='review') reviewScreen.classList.remove('hidden');
    if(name==='summary') summaryScreen.classList.remove('hidden');
  }

  // restart
  restartBtn.addEventListener('click', () => {
    // clear session storage optionally
    localStorage.removeItem('sim_mode');
    localStorage.removeItem('sim_section');
    // do not remove results by default
    showView('start');
  });

  // On load: if there's an existing mode in localStorage restore to continue
  (function initFromSession(){
    const savedMode = localStorage.getItem('sim_mode');
    const savedSection = parseInt(localStorage.getItem('sim_section')||'1',10);
    if(savedMode){
      mode = savedMode;
      currentSection = savedSection || 1;
      loadSection();
      showView('quiz');
    } else {
      showView('start');
    }
  })();

})();
