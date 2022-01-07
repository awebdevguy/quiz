const quizHeader = document.querySelector('.quiz-header');
const scoreEl = document.getElementById('score');
const questionEl = document.getElementById('question');
const answersEl = document.querySelectorAll('.answer');
const submit = document.getElementById('submit');

const count = 10;
let quizNumber = 0;
let rightCount = 0;
let correctAnswer;
let data = {};

startQuiz();

async function startQuiz() {

  scoreEl.innerHTML = `Score: ${rightCount}/${quizNumber} Total: ${count}`;
  data = await fetchData();
  presentQuiz(data[0]);

  answersEl.forEach(ans => {

    ans.addEventListener('change', (e) => {
      e.preventDefault();
    
      answersEl.forEach(item => {
        if(item.labels[0].innerText.trim() === correctAnswer.trim()) {
          item.labels[0].style.color = 'green';
        }
      });
    
      if(e.target.checked) {
        if(ans.labels[0].innerText.trim() === correctAnswer.trim()) {
          ans.labels[0].style.color = 'green';
          rightCount++;
        } else {
          ans.labels[0].style.color = 'red';
        }
      }
      quizNumber++;
      scoreEl.innerHTML = `Score: ${rightCount}/${quizNumber} Total: ${count}`;
    }, false);
  });
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
        <h2>You answered ${rightCount} of ${count} answers correctly.</h2>
        <button onclick="location.reload()">Reload</button>
      `;
    }
  }
}


function presentQuiz(quiz) {

  resetAnswers();

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


async function fetchData() {

  const url = `https://opentdb.com/api.php?amount=${count}&category=18`;
  const resp = await fetch('https://opentdb.com/api_token.php?command=request');
  const token = await resp.json();
  const res = await fetch(url + `&token=${token.token}`);
  const {results} = await res.json();

  return results;
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


function resetAnswers(){
  answersEl.forEach(ans => {
    ans.checked = false;
    ans.labels[0].style.color = null;
  })
}

submit.addEventListener('click', submitAnswer);
