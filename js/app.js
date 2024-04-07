import { getRandomIntegerBetween, setHTMLTitle } from "./utils/utils.js";
import { APP_NAME, APP_VERSION } from "../properties.js";
import { QUESTIONS, ANSWERS } from "./data.js";
import { getUser, setStorage, setUser } from "./storage/storage.js";

/* ############################################################################
--------------------------------- CONSTANTES ---------------------------------
############################################################################ */
const todayCore = new Date();
//const todayCore = new Date('2024-04-07');
const todayDay = todayCore.getDay();
const todayDate = todayCore.getDate();
const todayMonth = todayCore.getMonth();
const todayYear = todayCore.getFullYear();

/* ############################################################################
---------------------------------- FONCTIONS ----------------------------------
############################################################################ */
const getDayString = (day) => {
  switch (day) {
    case 0: return 'dimanche'
    case 1: return 'lundi'
    case 2: return 'mardi'
    case 3: return 'mercredi'
    case 4: return 'jeudi'
    case 5: return 'vendredi'
    case 6: return 'samedi'
  
    default: break;
  }
}

const getMonthString = (month) => {
  switch (month) {
    case 0: return 'janvier'
    case 1: return 'février'
    case 2: return 'mars'
    case 3: return 'avril'
    case 4: return 'mai'
    case 5: return 'juin'
    case 6: return 'juillet'
    case 7: return 'août'
    case 8: return 'septembre'
    case 9: return 'octobre'
    case 10: return 'novembre'
    case 11: return 'décembre'
  
    default: break;
  }
}

const getTodayAnswer = () => {
  const todayanswer = ANSWERS.filter((e) => e.date == todayDate && e.month == todayMonth);
  return todayanswer[0];
}

/* const getRandomAnswer = () => {
  return ANSWERS[getRandomIntegerBetween(0, ANSWERS.length -1)];
} */

const getRandomWeekendSassyAnswer = () => {
  const unavailable = ANSWERS.filter((e) => e.id >= 1000 && e.id < 2000);
  return unavailable[getRandomIntegerBetween(0, unavailable.length -1)];
}

const getRandomHolidaySassyAnswer = () => {
  const unavailable = ANSWERS.filter((e) => e.id >= 2000);
  return unavailable[getRandomIntegerBetween(0, unavailable.length -1)];
}

// INTERACTIONS UTILISATEUR -------------------------------

const onQuestionClic = (questionId) => {
  const question = QUESTIONS.filter((question) => question.id == questionId)[0];

  let todayAnswer = {};

  if (isWeekend) {
    todayAnswer = getRandomWeekendSassyAnswer();
  } else if (isHoliday) {
    todayAnswer = getRandomHolidaySassyAnswer();
  } else {
    //todayAnswer = getRandomAnswer();
    todayAnswer = getTodayAnswer();
  }
  
  const CONV = document.getElementById('conv');

  CONV.innerHTML = CONV.innerHTML + `
    <div id="todayBloc" class="daily-bloc">
      <span>Aujourd'hui</span>
      ${getQuestionBloc(question)}
    </div>
  `;
  CONV.scrollTo(0, CONV.scrollHeight);

  const buttonsContainer = document.getElementById('buttons-container');
  buttonsContainer.innerHTML = `
    <div class="question-display disabled"></div>
    <button class="question-button" disabled="true">
      <img src="medias/images/font-awsome/paper-plane-solid.svg"
    </button>
  `;

  setTimeout(() => {
    const todayBloc = document.getElementById('todayBloc');
    todayBloc.innerHTML = todayBloc.innerHTML + `
      <div id="todayAnswer" class="conv-bloc answer-bloc">
        <div class="pending-round">
          <div class="pending-dot dot1"></div>
          <div class="pending-dot dot2"></div>
          <div class="pending-dot dot3"></div>
        </div>
      </div>
    `;
    CONV.scrollTo(0, CONV.scrollHeight);

    setTimeout(() => {
      const todayAnswerBloc = document.getElementById('todayAnswer');
      todayAnswerBloc.innerHTML = `<span>${todayAnswer.label}</span>`;
      CONV.scrollTo(0, CONV.scrollHeight);

      // Sauvegarde
      const USER = getUser();
      USER.previous.push({day: todayDay, date: todayDate, month: todayMonth, year: todayYear, questionId: questionId, answerId: todayAnswer.id});
      setUser(USER);
      
    }, todayAnswer.label.length * 50);
  }, 1000);
}
window.onQuestionClic = onQuestionClic;



// GÉNÉRATION DOM -----------------------------------------

const getQuestionBloc = (question) => {
  return `
    <div class="conv-bloc question-bloc">
      <span>${question.label}</span>
    </div>
  `;
}

const getAnswerBloc = (answer) => {
  return `
    <div class="conv-bloc answer-bloc">
      <span>${answer.label}</span>
    </div>
  `;
}

const getDailyBloc = (dailyReport) => {
  const question = QUESTIONS.filter((question) => question.id == dailyReport.questionId)[0];
  const answer = ANSWERS.filter((answer) => answer.id == dailyReport.answerId)[0];

  let todayString = dailyReport.date == todayDate && dailyReport.month == todayMonth ? `Aujourd'hui` : `${getDayString(dailyReport.day)} ${dailyReport.date} ${getMonthString(dailyReport.month)} ${dailyReport.year}`;

  return `
    <div class="daily-bloc">
      <span>${todayString}</span>
      ${getQuestionBloc(question)}
      ${getAnswerBloc(answer)}
    </div>
  `;
}

const getPreviousConversation = () => {
  let txt = '';
  const USER = getUser();
  USER.previous.forEach(dailyReport => {
    txt += getDailyBloc(dailyReport);
  });
  return txt;
}

const getQuestionButtonArea = () => {
  const rndQuestion = QUESTIONS[getRandomIntegerBetween(0, QUESTIONS.length -1)];
  return `
  <div class="question-display">${rndQuestion.label}</div>
  <button class="question-button" onclick="onQuestionClic(${rndQuestion.id})">
    <img src="medias/images/font-awsome/paper-plane-solid.svg"
  </button>
`;
}

/* ############################################################################
---------------------------------- EXECUTION ----------------------------------
############################################################################ */

// Auto ---------------------------------------------------
//await requestWakeLock();
setStorage();

// Manuelle -----------------------------------------------
setHTMLTitle(APP_NAME);

// Setting DOM
document.getElementById('main').innerHTML = `
  <div class="top-container">
    <img src="./medias/images/3615.webp" />
    <span>3615 Blagues</span>
  </div>
  <div id="conv" class="conv">
    ${getPreviousConversation()}
  </div>
  <div id="buttons-container" class="bottom-container">
    ${getQuestionButtonArea()}
  </div>
`;

// Scroll auto au bas de la conv
const CONV = document.getElementById('conv');
CONV.scrollTo(0, CONV.scrollHeight);
setTimeout(() => {
  CONV.style.scrollBehavior = 'smooth';
}, 10);

let hasBeenMadeToday = false;
let isWeekend = false;
let isHoliday = false;

const USER = getUser();
if (USER.previous.length != 0) {
  const lastConv = USER.previous[USER.previous.length -1];
  if (lastConv.date == todayDate && lastConv.month == todayMonth && lastConv.year == todayYear) {
    hasBeenMadeToday = true;
  }
}

if (todayDay == 6 || todayDay == 0) {
  isWeekend = true;
}

if (
  (todayDate == 1 && todayMonth == 0) // 1er janvier
  || (todayDate == 1 && todayMonth == 4) // 1er mai
  || (todayDate == 8 && todayMonth == 4) // 8 mai
  || (todayDate == 14 && todayMonth == 6) // 14 juillet
  ) {
    isHoliday = true;
}

if (hasBeenMadeToday) {
  const buttonsContainer = document.getElementById('buttons-container');
  buttonsContainer.innerHTML = `
  <div class="question-display disabled"></div>
  <button class="question-button" disabled="true">
    <img src="medias/images/font-awsome/paper-plane-solid.svg"
  </button>
  `
  //const buttons = document.getElementsByClassName('question-button');
  //for (let button of buttons) {
  //  button.setAttribute('disabled', true);
  //}
}