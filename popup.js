const timer = document.getElementById("timer");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const studyInput = document.getElementById("studyTime");
const breakInput = document.getElementById("breakTime");

const saveBtn = document.getElementById("saveBtn");

const settingsStatus = document.getElementById("settingsStatus");

const mode = document.getElementById("mode");
const timerStatus = document.getElementById("timerStatus");

function showStatus(message, isError = false) {

    settingsStatus.textContent = message;

    settingsStatus.style.color = isError ? "red" : "green";

    setTimeout(() => {
        settingsStatus.textContent = "";
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

startBtn.addEventListener("click", () => {

    browser.runtime.sendMessage({
        action: "start"
    });

});

pauseBtn.addEventListener("click", () => {

    browser.runtime.sendMessage({
        action: "pause"
    });

});

resetBtn.addEventListener("click", () => {

    browser.runtime.sendMessage({
        action: "reset"
    });

    updateTimerDisplay();

});

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

function formatTime(seconds) {

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

}

async function updateTimerDisplay() {

    const state = await browser.runtime.sendMessage({
        action: "getState"
    });

    timer.textContent = formatTime(state.timeLeft);

    mode.textContent =
        state.mode === "study" ? "Study" : "Break";

    switch (state.status) {

        case "running":

            timerStatus.textContent =
                state.mode === "study"
                    ? "🍅 Studying..."
                    : "☕ Break Time";

            break;

        case "paused":

            timerStatus.textContent = "⏸ Paused";

            break;

        case "ready":

            timerStatus.textContent =
                state.mode === "study"
                    ? "▶ Ready to Study"
                    : "▶ Ready for Break";

            break;

    }

}

updateTimerDisplay();
setInterval(updateTimerDisplay, 1000);