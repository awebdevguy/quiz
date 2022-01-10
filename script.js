const quizHeader = document.querySelector('.quiz-header');
const selectEl = document.getElementById('select');
const scoreEl = document.getElementById('score');
const questionEl = document.getElementById('question');
const listEl = document.querySelector('ul');
const answersEl = document.querySelectorAll('.answer');
const submit = document.getElementById('submit');

let count = 10;
let category = '9'; // Default is General Knowledge
let quizNumber = 0;
let rightCount = 0;
let correctAnswer = '';
let data = {};
let sessionToken = '';

let url = `https://opentdb.com/api.php?amount=${count}`;

loadApp();


async function loadApp() {
  const storedCategory = localStorage.getItem('category');
  category = storedCategory ? storedCategory : '9';
  selectEl.value = category;
  sessionToken = await fetchSessionToken();
  startQuiz(url + `&category=${category}&token=${sessionToken}`);
  console.log(sessionToken);
}


async function startQuiz(url) {
  scoreEl.innerHTML = `Score: ${rightCount}/${quizNumber} Total: ${count}`;
  data = await fetchData(url);
  console.log(data);
  presentQuiz(data[0]);
}


function getSelected() {
  let selected;

  answersEl.forEach(ans => {
    if(ans.checked) {
      selected = decodeHTMLChars(ans.labels[0].innerText);
    }
  });
  return selected;
}


function submitAnswer() {
  const selected = getSelected();
  
  if(selected) {
    if(quizNumber < count) {
      presentQuiz(data[quizNumber])
    } else {
      quiz.innerHTML = 
      `
        <h2 style="padding: 5rem 0; text-align: center;" >You answered ${rightCount} of ${count} questions correctly.</h2>
        <button onclick="location.reload()">Re-Start</button>
      `;
    }
  }
}


function presentQuiz(quiz) {
  resetAnswers();
  enableList();

  const { question, correct_answer: right, incorrect_answers: wrongs } = quiz;
  const answers = wrongs;
  answers.push(right);
  const shuffled = shuffle(answers);

  questionEl.innerHTML = question
  
  answersEl.forEach((answer, idx) => {
    if(shuffled[idx] == undefined) {
      answer.labels[0].innerHTML = 'n/a';
    } else {
      answer.labels[0].innerHTML = shuffled[idx];
    }
  });
  correctAnswer = decodeHTMLChars(right);
}


async function fetchSessionToken() {
  const resp = await fetch('https://opentdb.com/api_token.php?command=request');
  const data = await resp.json();
  const {sessionToken: token} = data;
  console.log(data.token);
  console.log(sessionToken);

  return data.token;
}


async function fetchData(url) {
  const res = await fetch(url);
  const {results} = await res.json();
  return await results;
}


function handleAnswerSelection(e) {
  e.preventDefault();
  disableList();

  const targetText = e.target.labels[0].innerText.trim();

  answersEl.forEach(item => {
    const labelText = item.labels[0].innerText.trim();

    if(labelText === correctAnswer) {
      item.labels[0].style.color = 'green';
      if(targetText === correctAnswer) {
        rightCount++;
      }
    } else {
      item.labels[0].style.color = 'red';
    }
  });
  quizNumber++;
  scoreEl.innerHTML = `Score: ${rightCount}/${quizNumber} Total: ${count}`;
}


function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}


function decodeHTMLChars(str) {
  let txt = document.createElement("textarea")
  txt.innerHTML = str
  return txt.value
}


function disableList() {
  submit.classList.remove('disable');
  listEl.classList.add('disable');
}


function enableList() {
  submit.classList.add('disable');
  listEl.classList.remove('disable');
}


function resetAnswers(){
  answersEl.forEach(ans => {
    ans.checked = false;
    ans.labels[0].style.color = null;
  });
}


function chooseCategory(e) {
  e.preventDefault();
  quizNumber = 0;
  rightCount = 0;
  correctAnswer = '';
  data = {};
  category = e.target.value;
  url = `https://opentdb.com/api.php?amount=${count}&category=${category}`;
  startQuiz(url + `&token=${sessionToken}`);
  localStorage.setItem('category', category);
  console.log(category);
}


selectEl.addEventListener('change', chooseCategory);
submit.addEventListener('click', submitAnswer);

const addRadioEventListeners = () => {
  answersEl.forEach(answer => {
    answer.addEventListener('change', (e) => {
      handleAnswerSelection(e);
    });
  });
}

addRadioEventListeners();
