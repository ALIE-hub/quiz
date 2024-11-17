const app = document.getElementById("app");
const createQuizBtn = document.getElementById("createQuizBtn");
const takeQuizBtn = document.getElementById("takeQuizBtn");
const viewQuizzesBtn = document.createElement("button");
viewQuizzesBtn.textContent = "View Quizzes";

// Local Storage Key
const QUIZZES_KEY = "quizzes";

// Utility function to save data in localStorage
function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Utility function to get data from localStorage
function getFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Function to render the quiz creation form
function renderQuizCreator() {
    app.innerHTML = `
        <h2>Create a Quiz</h2>
        <form id="quizForm">
            <label for="quizTitle">Quiz Title</label>
            <input type="text" id="quizTitle" placeholder="Enter quiz title" required>

            <div id="questionsContainer">
                <div class="question" id="question-1">
                    <label for="question1">Question 1</label>
                    <input type="text" id="question1" placeholder="Enter question" required>
                    <label for="options1">Options (comma separated)</label>
                    <input type="text" id="options1" placeholder="Enter options with comma" required>
                    <label for="answer1">Correct Answer</label>
                    <input type="text" id="answer1" placeholder="Enter correct answer" required>
                    <button type="button" class="delete-btn delete-question" data-index="1">Delete Question</button>
                </div>
            </div>
            
            <button type="button" id="addQuestionBtn">Add Question</button>
            <button type="submit" class="btn">Save Quiz</button>
        </form>
    `;

    document.getElementById("addQuestionBtn").addEventListener("click", addQuestionField);
    document.getElementById("quizForm").addEventListener("submit", saveQuiz);

    // Add delete functionality for initial question
    document.querySelectorAll(".delete-question").forEach(btn => {
        btn.addEventListener("click", deleteQuestion);
    });
}

// Function to add more question fields
function addQuestionField() {
    const questionsContainer = document.getElementById("questionsContainer");
    const questionCount = questionsContainer.children.length + 1;

    const newQuestionHTML = `
        <div class="question" id="question-${questionCount}">
            <label for="question${questionCount}">Question ${questionCount}</label>
            <input type="text" id="question${questionCount}" placeholder="Enter question" required>
            <label for="options${questionCount}">Options (comma separated)</label>
            <input type="text" id="options${questionCount}" placeholder="Enter options" required>
            <label for="answer${questionCount}">Correct Answer</label>
            <input type="text" id="answer${questionCount}" placeholder="Enter correct answer" required>
            <button type="button" class="delete-btn delete-question" data-index="${questionCount}">Delete Question</button>
        </div>
    `;

    questionsContainer.insertAdjacentHTML("beforeend", newQuestionHTML);

    // Add event listener for delete button
    document.querySelector(`#question-${questionCount} .delete-question`).addEventListener("click", deleteQuestion);
}

// Function to delete a question
function deleteQuestion(event) {
    const questionIndex = event.target.dataset.index;
    const questionElement = document.getElementById(`question-${questionIndex}`);
    if (questionElement) {
        questionElement.remove();
    }
}

// Function to save quiz
function saveQuiz(event) {
    event.preventDefault();

    const title = document.getElementById("quizTitle").value;
    const questions = Array.from(document.querySelectorAll("#questionsContainer .question")).map((questionDiv, index) => {
        return {
            question: questionDiv.querySelector(`#question${index + 1}`).value,
            options: questionDiv.querySelector(`#options${index + 1}`).value.split(","),
            answer: questionDiv.querySelector(`#answer${index + 1}`).value
        };
    });

    const quizzes = getFromLocalStorage(QUIZZES_KEY);
    const quizId = quizzes.length + 1;
    quizzes.push({ id: quizId, title, questions });
    saveToLocalStorage(QUIZZES_KEY, quizzes);

    alert("Quiz saved! Share this link: " + location.href + "?quizId=" + quizId);
    renderHomePage();
}

// Function to render the quiz-taker view
function renderQuizTaker(quizId) {
    const quizzes = getFromLocalStorage(QUIZZES_KEY);
    const quiz = quizzes.find(q => q.id == quizId);

    if (!quiz) {
        app.innerHTML = `<h2>Quiz Not Found</h2>`;
        return;
    }

    app.innerHTML = `<h2>${quiz.title}</h2>`;
    quiz.questions.forEach((question, index) => {
        app.innerHTML += `
            <div class="quiz">
                <h3>${index + 1}. ${question.question}</h3>
                <ul>
                    ${question.options.map(option => `<li><input type="radio" name="q${index}" value="${option}"> ${option}</li>`).join("")}
                </ul>
            </div>
        `;
    });

    app.innerHTML += `<button id="submitQuiz">Submit</button>`;
    document.getElementById("submitQuiz").addEventListener("click", () => calculateScore(quiz));
}

// Function to calculate the quiz score
function calculateScore(quiz) {
    let score = 0;

    quiz.questions.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
        if (selectedOption && selectedOption.value === question.answer) {
            score++;
        }
    });

    alert(`You scored ${score} out of ${quiz.questions.length}`);
}

// Function to render the home page
function renderHomePage() {
    app.innerHTML = `
        <h2>Welcome to Quiz Maker</h2>
        <p>Create and share quizzes, or take a quiz!</p>
    `;
}

// Function to render the quiz list with delete option
function renderQuizList() {
    const quizzes = getFromLocalStorage(QUIZZES_KEY);

    if (quizzes.length === 0) {
        app.innerHTML = `<h2>No Quizzes Available</h2>`;
        return;
    }

    app.innerHTML = `<h2>Saved Quizzes</h2><ul id="quizList"></ul>`;

    const quizList = document.getElementById("quizList");

    quizzes.forEach(quiz => {
        const quizItem = document.createElement("li");
        quizItem.innerHTML = `
            <strong>${quiz.title}</strong>
            <button class="delete-btn delete-quiz" data-id="${quiz.id}">Delete</button>
            <button class="take-quiz" data-id="${quiz.id}">Take Quiz</button>
        `;
        quizList.appendChild(quizItem);
    });

    // Add event listeners for delete and take buttons
    document.querySelectorAll(".delete-quiz").forEach(btn => {
        btn.addEventListener("click", deleteQuiz);
    });

    document.querySelectorAll(".take-quiz").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const quizId = e.target.dataset.id;
            renderQuizTaker(quizId);
        });
    });
}

// Function to delete a quiz
function deleteQuiz(event) {
    const quizId = event.target.dataset.id;
    let quizzes = getFromLocalStorage(QUIZZES_KEY);

    // Filter out the quiz to be deleted
    quizzes = quizzes.filter(quiz => quiz.id != quizId);

    // Save updated quizzes back to local storage
    saveToLocalStorage(QUIZZES_KEY, quizzes);

    alert("Quiz deleted successfully!");

    // Re-render the quiz list
    renderQuizList();
}

// Event listeners for buttons
createQuizBtn.addEventListener("click", renderQuizCreator);
takeQuizBtn.addEventListener("click", () => {
    const quizId = prompt("Enter the Quiz ID:");
    renderQuizTaker(quizId);
});
viewQuizzesBtn.addEventListener("click", renderQuizList);

document.querySelector("nav").appendChild(viewQuizzesBtn);

// Check for shared quiz link
const urlParams = new URLSearchParams(location.search);
const sharedQuizId = urlParams.get("quizId");
if (sharedQuizId) {
    renderQuizTaker(sharedQuizId);
} else {
    renderHomePage();
}
