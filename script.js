
async function getNextDate() {
    // find latest date from database
    const resDate = await fetch("/api/getFirstEmptyWeekday", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

    });
    const resJSON = await resDate.json();
    const rowDate = resJSON[0];
    const lastDate = rowDate.datePlayed;

    
    const date = new Date(lastDate + "T00:00:00"); // avoid timezone issues

    do {
        date.setDate(date.getDate() + 1);
    } while (date.getDay() === 0 || date.getDay() === 6); // 0=Sun, 6=Sat

    return date.toISOString().split("T")[0];
}

function getISOWeekAndYear() {

    // split string into yyyy mm dd, then create new date
    // set date to Thursday of week
    // find the first day of the year
    // find weekNo based on count from first Thursday

    const dateUTC = new Date();
    const dateLocal = dateUTC.toLocaleString('en-ca');

    const a = dateLocal.split(/\D/);
    const date = new Date(a[0], a[1]-1, a[2]);

    const currentDay = date.getDay();
    const currentYear = date.getFullYear();
    const tempDay = (currentDay + 6) % 7;
    date.setDate(date.getDate() - tempDay + 3);

    const yearStart = new Date(currentYear, 0, 1);
    
    const currentWeek = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    const currentDate = dateLocal.split(',')[0];

    // this line used for testing; comment out everything above and uncomment below
    // let currentDate = '2026-07-06', currentWeek = 28, currentDay = 1, currentYear = 2026;
    return { currentDate, currentWeek, currentDay, currentYear };
}

function displayScores(scoreArray) {

    statusDiv.innerHTML = "";

    const table = document.createElement("table");
    table.className = "scoresTable";

    // Header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["Username", "Final", "Score", "Letters"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement("tbody");

    scoreArray.forEach(player => {

        if (player.username === "admin") {
           return;
        }
        
        const row = document.createElement("tr");

        // Username
        let td = document.createElement("td");
        td.textContent = player.username;
        row.appendChild(td);

        // Final Score
        td = document.createElement("td");
        if (player.finalScore === null) {
            // td.style.backgroundColor = "black";
        } else {
            td.textContent = player.finalScore;
        }
        row.appendChild(td);

        // Score
        td = document.createElement("td");
        if (player.finalScore === null) {
            td.textContent = player.score;
        } 
        row.appendChild(td);

        // Letters (only for players still playing)
        td = document.createElement("td");

        if (player.finalScore === null) {

            const letters = [];

            for (let i = 0; i <= 15; i++) {
                if (player[`letter${i}Revealed`] === 1) {
                    letters.push(i + 1); // Display 1-16 instead of 0-15
                }
            }

            td.textContent = letters.join(", ");
        }

        row.appendChild(td);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    statusDiv.appendChild(table);
}

// main script begins here
// on page load
window.addEventListener("load", async() => {
    
    const loginModal = document.getElementById("loginModal");
    const loginBtn = document.getElementById("loginBtn");
    const logout = document.getElementById("logout");
    const username = localStorage.getItem("nymname");
    const playerId = localStorage.getItem("nymId");
    const titleDiv = document.getElementById("titleDiv"); 
    const outerDiv = document.getElementById("outerDiv");
    const puzzleForm = document.getElementById("puzzleForm");
    const statusDiv = document.getElementById("statusDiv");

    // show login screen if user not logged in
    if(!username) {
        loginModal.style.display = "block";
        return;

    } else {
        titleDiv.textContent = "nymbleTool";

        // create input form
        const dateLabel = document.createElement("label");
        dateLabel.htmlFor = "datePlayed";
        dateLabel.textContent = "Date";
        puzzleForm.appendChild(dateLabel);
        puzzleForm.appendChild(document.createElement("br"));

        const dateInput = document.createElement("input");
        dateInput.type = "text";
        dateInput.id = "datePlayed";
        const nextDate = await getNextDate();
        dateInput.value = nextDate;
        puzzleForm.appendChild(dateInput);
        puzzleForm.appendChild(document.createElement("br"));
        puzzleForm.appendChild(document.createElement("br"));

        const wordLabel = document.createElement("label");
        wordLabel.htmlFor = "word";
        wordLabel.textContent = "Word";
        puzzleForm.appendChild(wordLabel);
        puzzleForm.appendChild(document.createElement("br"));

        const wordInput = document.createElement("input");
        wordInput.type = "text";
        wordInput.id = "word";
        puzzleForm.appendChild(wordInput);
        puzzleForm.appendChild(document.createElement("br"));
        puzzleForm.appendChild(document.createElement("br"));

        wordInput.addEventListener("input", () => {
            wordInput.value = wordInput.value.toUpperCase();
        });

        const clue0Label = document.createElement("label");
        clue0Label.htmlFor = "clue0";
        clue0Label.textContent = "Clue 1";
        puzzleForm.appendChild(clue0Label);
        puzzleForm.appendChild(document.createElement("br"));

        const clue0Input = document.createElement("textarea");
        clue0Input.id = "clue0";
        clue0Input.rows = 2;
        puzzleForm.appendChild(clue0Input);
        puzzleForm.appendChild(document.createElement("br"));
        puzzleForm.appendChild(document.createElement("br"));

        const clue1Label = document.createElement("label");
        clue1Label.htmlFor = "clue1";
        clue1Label.textContent = "Clue 2";
        puzzleForm.appendChild(clue1Label);
        puzzleForm.appendChild(document.createElement("br"));

        const clue1Input = document.createElement("textarea");
        clue1Input.id = "clue1";
        clue1Input.rows = 2;
        puzzleForm.appendChild(clue1Input);
        puzzleForm.appendChild(document.createElement("br"));
        puzzleForm.appendChild(document.createElement("br"));

        const submitBtn = document.createElement("button");
        submitBtn.id = "submitBtn";
        submitBtn.className = "button";
        submitBtn.textContent = "Submit";
        puzzleForm.appendChild(submitBtn);

        // submit button
        submitBtn.addEventListener("click", async () => {
            submitBtn.disabled = true;
            const puzzle = {
                datePlayed: document.getElementById("datePlayed").value,
                word: document.getElementById("word").value.trim(),
                clue0: document.getElementById("clue0").value.trim(),
                clue1: document.getElementById("clue1").value.trim()
            };

            // basic validation
            if (!puzzle.datePlayed || !puzzle.word || !puzzle.clue0 || !puzzle.clue1) {
                alert("Please complete all fields.");
                return;
            }

            try {
                const response = await fetch("/api/writePuzzle.js", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(puzzle)
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Puzzle saved!");
                    const nextNextDate = await getNextDate();
                    dateInput.value = nextNextDate;
                    wordInput.value = "";
                    clue0Input.value = "";
                    clue1Input.value = "";
                    submitBtn.disabled = false;
                } else {
                    alert(result.error || "Error saving puzzle.");
                }
            } catch (err) {
                console.error(err);
                alert("Unable to connect to the server.");
            }
        });

        // status div - display all data from current day's scores
        const { currentDate, currentWeek, currentDay, currentYear } = getISOWeekAndYear();
        const resScore = await fetch("/api/getTodaysScore", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ currentDate })
        });

        const scoreArray = await resScore.json();

        displayScores(scoreArray);


        // logout button
        const logoutBtn = document.createElement("button");
        logoutBtn.classList = "button";
        logoutBtn.innerHTML = "Logout";
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem('nymname');
            localStorage.removeItem('nymId');
            location.reload();
        });
        logout.appendChild(logoutBtn);
    }; 
});

// splash screen fadeaway
window.addEventListener("load", () => {
    setTimeout(() => {
        const splash = document.getElementById("splash");
        splash.style.opacity = "0";

        setTimeout(() => {
            splash.style.display = "none";
            page.style.display = "block";
        }, 500);
    }, 3000);
});

// on 'login' button click
loginBtn.addEventListener("click", async () => {
    const inputEmail = document.getElementById("inputEmail").value;
    const inputPassword = document.getElementById("inputPassword").value;

    // call the backend js
    const loginRes = await fetch("/api/loginLogic", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ inputEmail, inputPassword })
    });

    // process the returned data
    const data = await loginRes.json();
    if (!loginRes.ok) {
        document.getElementById("loginError").textContent = data.error;
        return;
    }
    
    // save the date in local storage and reload page
    localStorage.setItem("nymname", data.user.username);
    localStorage.setItem("nymId", data.user.playerId);
    document.getElementById("loginModal").style.display = "none";
    location.reload();
});