const timer = document.getElementById("timer");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const studyInput = document.getElementById("studyTime");
const breakInput = document.getElementById("breakTime");

const saveBtn = document.getElementById("saveBtn");

const status = document.getElementById("status");

function showStatus(message, isError = false) {

    status.textContent = message;

    status.style.color = isError ? "red" : "green";

    setTimeout(() => {
        status.textContent = "";
    }, 2000);

}

async function loadSettings() {

    const data = await browser.storage.local.get([
        "studyTime",
        "breakTime"
    ]);

    studyInput.value = data.studyTime ?? 25;
    breakInput.value = data.breakTime ?? 5;
}

// startBtn.addEventListener("click", () => {
//     alert("Start clicked!");
// });

// pauseBtn.addEventListener("click", () => {
//     alert("Pause clicked!");
// });

// resetBtn.addEventListener("click", () => {
//     alert("Reset clicked!");
// });

saveBtn.addEventListener("click", async () => {

    const studyTime = validateTime(studyInput.value);
    const breakTime = validateTime(breakInput.value);

    if (studyTime === null || breakTime === null) {
        showStatus("Enter a value between 1 and 180.", true);
        return;
    }

    await browser.storage.local.set({
        studyTime: studyTime,
        breakTime: breakTime
    });

    showStatus("Settings saved!");
});

function validateTime(value) {

    const number = Number(value);

    if (!Number.isInteger(number)) {
        return null;
    }

    if (number < 1) {
        return null;
    }

    if (number > 180) {
        return null;
    }

    return number;
}

loadSettings();