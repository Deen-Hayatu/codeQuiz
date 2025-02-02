let questions = {};
let selectedCategories = [];
let currentCategoryIndex = 0;
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 60;
let timer;

const categorySelection = document.getElementById("category-selection");
const quizContent = document.getElementById("quiz-content");
const questionElement = document.getElementById("question-container");
const nextButton = document.getElementById("next-btn");
const restartButton = document.getElementById("restart-btn");
const resultElement = document.getElementById("result");
const progressBar = document.getElementById("progress");
const timerElement = document.getElementById("time");
const startButton = document.getElementById("start-btn");

// Fetch questions from JSON file
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    questions = data;
    // Initialize the quiz after loading questions
    startButton.addEventListener("click", startQuiz);
  })
  .catch(error => console.error("Error loading questions:", error));

function startQuiz() {
  selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
    .map(input => input.value);

  if (selectedCategories.length === 0) {
    alert("Please select at least one category!");
    return;
  }

  categorySelection.style.display = "none";
  quizContent.style.display = "block";
  resetQuiz();
  startTimer();
  showQuestion();
}

function resetQuiz() {
  currentCategoryIndex = 0;
  currentQuestionIndex = 0;
  score = 0;
  timeLeft = 60;
  timerElement.textContent = timeLeft;
  progressBar.style.width = "0";
  resultElement.textContent = "";
  resultElement.classList.remove("fade-in");
  nextButton.style.display = "block";
  restartButton.style.display = "none";
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      showResult();
    }
  }, 1000);
}

function updateProgressBar() {
  const totalQuestions = selectedCategories.reduce((total, category) => total + questions[category].length, 0);
  const answeredQuestions = currentQuestionIndex;
  const progress = (answeredQuestions / totalQuestions) * 100;
  progressBar.style.width = `${progress}%`;
}

function showQuestion() {
  const currentCategory = selectedCategories[currentCategoryIndex];
  const categoryQuestions = questions[currentCategory];

  if (currentQuestionIndex >= categoryQuestions.length) {
    currentCategoryIndex++;
    currentQuestionIndex = 0;
    if (currentCategoryIndex >= selectedCategories.length) {
      showResult();
      return;
    }
  }

  const currentQuestion = categoryQuestions[currentQuestionIndex];
  const questionNumber = getQuestionNumber(); // Get the global question number

  questionElement.innerHTML = `
    <p><strong>Question ${questionNumber}:</strong> ${currentQuestion.question}</p>
    <div id="options">${currentQuestion.options.map(option => `<label><input type="checkbox" value="${option}"> ${option}</label>`).join("")}</div>
    <button id="submit-answer">Submit</button>
  `;

  document.getElementById("submit-answer").addEventListener("click", () => {
    const selectedOptions = Array.from(document.querySelectorAll("#options input:checked"))
      .map(input => input.value);
    checkAnswer(selectedOptions);
  });
}

function checkAnswer(selectedOptions) {
  const currentCategory = selectedCategories[currentCategoryIndex];
  const currentQuestion = questions[currentCategory][currentQuestionIndex];

  const isCorrect = selectedOptions.length === currentQuestion.answers.length &&
    selectedOptions.every(option => currentQuestion.answers.includes(option));

  if (isCorrect) {
    score++;
  }

  currentQuestionIndex++;
  if (currentCategoryIndex >= selectedCategories.length - 1 && currentQuestionIndex >= questions[currentCategory].length) {
    showResult();
  } else {
    showQuestion();
  }
}

function showResult() {
  clearInterval(timer); // Stop the timer
  questionElement.innerHTML = "Quiz Completed!"; // Update the question container
  nextButton.style.display = "none"; // Hide the "Next Question" button
  restartButton.style.display = "block"; // Show the "Restart Quiz" button

  // Calculate total questions and percentage score
  const totalQuestions = selectedCategories.reduce((total, category) => total + questions[category].length, 0);
  const percentageScore = ((score / totalQuestions) * 100).toFixed(2);

  // Debugging: Log results to the console
  console.log(`Total Questions: ${totalQuestions}, Correct Answers: ${score}, Percentage Score: ${percentageScore}%`);

  // Populate the result element with quiz results
  resultElement.innerHTML = `
    <h3>Quiz Results:</h3>
    <p>Total Questions: ${totalQuestions}</p>
    <p>Correct Answers: ${score}</p>
    <p>Your Score: ${percentageScore}%</p>
  `;

  // Add fade-in effect
  resultElement.classList.add("fade-in");
}

function restartQuiz() {
  categorySelection.style.display = "block";
  quizContent.style.display = "none";
  resetQuiz();
}

function getQuestionNumber() {
  let totalQuestionsBefore = 0;
  for (let i = 0; i < currentCategoryIndex; i++) {
    totalQuestionsBefore += questions[selectedCategories[i]].length;
  }
  return totalQuestionsBefore + currentQuestionIndex + 1;
}

restartButton.addEventListener("click", () => {
  resetQuiz();
  startQuiz();
});