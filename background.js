let timerId = null;

let state = {
    mode: "study",      // "study" or "break"
    isRunning: false,
    timeLeft: 25 * 60,
    status: "ready"
};

function startTimer() {

    if (state.isRunning) {
        return;
    }

    state.isRunning = true;
    state.status = "running";

    timerId = setInterval(async () => {

        state.timeLeft--;

        console.log(state.timeLeft);

        if (state.timeLeft <= 0) {

            await finishSession();

        }

    }, 1000);

}

// startTimer();

browser.runtime.onMessage.addListener((message) => {

    switch (message.action) {

        case "start":
            startTimer();
            break;

        case "pause":
            pauseTimer();
            break;

        case "reset":
            resetTimer();
            break;

        case "getState":
            return Promise.resolve(state);

    }

});

function pauseTimer() {

    if (!state.isRunning) {
        return;
    }

    clearInterval(timerId);

    timerId = null;

    state.isRunning = false;
    state.status = "paused";

}

async function resetTimer() {

    pauseTimer();

    const data = await browser.storage.local.get([
        "studyTime",
        "breakTime"
    ]);

    if (state.mode === "study") {
        state.timeLeft = (data.studyTime ?? 25) * 60;
    } else {
        state.timeLeft = (data.breakTime ?? 5) * 60;
    }

    state.status = "ready";


}

async function switchSession() {

    const data = await browser.storage.local.get([
        "studyTime",
        "breakTime"
    ]);

    if (state.mode === "study") {

        state.mode = "break";
        state.timeLeft = (data.breakTime ?? 5) * 60;

    } else {

        state.mode = "study";
        state.timeLeft = (data.studyTime ?? 25) * 60;

    }

}

function showNotification(title, message) {

    browser.notifications.create({
        type: "basic",
        iconUrl: browser.runtime.getURL("icons/tomato.svg"),
        title: title,
        message: message
    });

}

const alarmSound = new Audio(
    browser.runtime.getURL("assets/sounds/the_alarm.ogg")
);

function playSound() {

    alarmSound.currentTime = 0;

    alarmSound.play().catch(error => {
        console.error("Failed to play sound:", error);
    });

}

async function finishSession() {

    clearInterval(timerId);
    timerId = null;

    state.isRunning = false;
    state.status = "ready";
    state.timeLeft = 0;

    if (state.mode === "study") {

        showNotification(
            "Study Complete!",
            "Time for a break."
        );

    } else {

        showNotification(
            "Break Complete!",
            "Ready to study?"
        );

    }

    playSound();

    await switchSession();

}

function showNotification(title, message) {

    console.log(title);

    browser.notifications.create(
        "pomodoro-notification",
        {
            type: "basic",
            iconUrl: browser.runtime.getURL("icons/tomato.svg"),
            title,
            message
        }
    );

}