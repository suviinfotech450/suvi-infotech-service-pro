const diaryText = document.getElementById("diaryText");
const diaryDate = document.getElementById("diaryDate");
const diaryTime = document.getElementById("diaryTime");
const saveDiary = document.getElementById("saveDiary");
const diaryHistory = document.getElementById("diaryHistory");
const diarySearch = document.getElementById("diarySearch");
const micButton = document.getElementById("micButton");

let editingId = null;
let recognition = null;
let isListening = false;


/* =========================
   DATE & TIME
========================= */

function updateDateTime() {

    const now = new Date();

    const day = now.getDate();

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();

    let hours = now.getHours();

    const minutes =
        String(now.getMinutes()).padStart(2, "0");

    const ampm =
        hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours || 12;

    diaryDate.value =
        `${day}-${month}-${year}`;

    diaryTime.value =
        `${hours}:${minutes} ${ampm}`;
}

updateDateTime();

setInterval(updateDateTime, 1000);


/* =========================
   STORAGE
========================= */

function getDiaryEntries() {

    try {

        return JSON.parse(
            localStorage.getItem("suvi_daily_diary")
        ) || [];

    } catch (error) {

        console.error(
            "Diary storage error:",
            error
        );

        return [];
    }
}


function saveDiaryEntries(entries) {

    localStorage.setItem(
        "suvi_daily_diary",
        JSON.stringify(entries)
    );
}


/* =========================
   GENERATE ID
========================= */

function generateDiaryId() {

    const entries = getDiaryEntries();

    if (entries.length === 0) {

        return "DR001";
    }

    let maxNumber = 0;

    entries.forEach(entry => {

        const match =
            String(entry.id).match(/^DR(\d+)$/i);

        if (match) {

            maxNumber = Math.max(
                maxNumber,
                parseInt(match[1], 10)
            );
        }
    });

    return `DR${String(maxNumber + 1).padStart(3, "0")}`;
}


/* =========================
   SAVE DIARY
========================= */

saveDiary.addEventListener(
    "click",
    function () {

        const text =
            diaryText.value.trim();

        if (!text) {

            alert(
                "Please enter diary details."
            );

            diaryText.focus();

            return;
        }

        const entries =
            getDiaryEntries();


        /* =====================
           UPDATE EXISTING
        ===================== */

        if (editingId) {

            const index =
                entries.findIndex(
                    entry =>
                        entry.id === editingId
                );

            if (index !== -1) {

                entries[index].text =
                    text;

                entries[index].date =
                    diaryDate.value;

                entries[index].time =
                    diaryTime.value;
            }

            editingId = null;

            saveDiary.textContent =
                "SAVE";

            saveDiaryEntries(entries);

            diaryText.value = "";

            renderDiaryHistory(
                diarySearch.value
            );

            alert(
                "Diary updated successfully."
            );

            return;
        }


        /* =====================
           NEW ENTRY
        ===================== */

        const newEntry = {

            id: generateDiaryId(),

            date: diaryDate.value,

            time: diaryTime.value,

            text: text
        };

        entries.unshift(newEntry);

        saveDiaryEntries(entries);

        diaryText.value = "";

        renderDiaryHistory();

        alert(
            "Diary saved successfully."
        );
    }
);


/* =========================
   DISPLAY HISTORY
========================= */

function renderDiaryHistory(
    searchText = ""
) {

    const entries =
        getDiaryEntries();

    const search =
        searchText
            .trim()
            .toLowerCase();

    const filteredEntries =
        entries.filter(entry => {

            return (

                String(entry.text || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(entry.date || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(entry.time || "")
                    .toLowerCase()
                    .includes(search)
            );
        });


    diaryHistory.innerHTML = "";


    if (filteredEntries.length === 0) {

        diaryHistory.innerHTML = `

            <div class="diary-card">

                No diary entries found.

            </div>

        `;

        return;
    }


    filteredEntries.forEach(entry => {

        const card =
            document.createElement("div");

        card.className =
            "diary-card";


        card.innerHTML = `

            <div class="diary-card-date">

                ${escapeHtml(entry.date)}

            </div>


            <div class="diary-card-time">

                ${escapeHtml(entry.time)}

            </div>


            <div class="diary-card-text">

                ${escapeHtml(entry.text)}

            </div>


            <div class="diary-actions">


                <button
                    type="button"
                    onclick="editDiary('${entry.id}')">

                    ✏️ Edit

                </button>


                <button
                    type="button"
                    onclick="deleteDiary('${entry.id}')">

                    🗑️ Delete

                </button>


            </div>

        `;


        diaryHistory.appendChild(card);
    });
}


/* =========================
   SEARCH
========================= */

diarySearch.addEventListener(
    "input",
    function () {

        renderDiaryHistory(
            this.value
        );
    }
);


/* =========================
   EDIT
========================= */

function editDiary(id) {

    const entries =
        getDiaryEntries();


    const entry =
        entries.find(
            item => item.id === id
        );


    if (!entry) {

        return;
    }


    diaryText.value =
        entry.text || "";


    diaryDate.value =
        entry.date || "";


    diaryTime.value =
        entry.time || "";


    editingId = id;


    saveDiary.textContent =
        "UPDATE";


    diaryText.focus();


    window.scrollTo({

        top: 0,

        behavior: "smooth"
    });
}


/*
 * IMPORTANT:
 * HTML onclick can access this function
 */

window.editDiary =
    editDiary;


/* =========================
   DELETE
========================= */

function deleteDiary(id) {

    const confirmDelete =
        confirm(
            "Delete this diary entry?"
        );


    if (!confirmDelete) {

        return;
    }


    const entries =
        getDiaryEntries();


    const updatedEntries =
        entries.filter(
            entry => entry.id !== id
        );


    saveDiaryEntries(
        updatedEntries
    );


    renderDiaryHistory(
        diarySearch.value
    );


    alert(
        "Diary entry deleted successfully."
    );
}


/*
 * IMPORTANT:
 * HTML onclick can access this function
 */

window.deleteDiary =
    deleteDiary;


/* =========================
   VOICE / MICROPHONE
========================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    /*
     * Kannada - India
     */

    recognition.lang =
        "kn-IN";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.onstart =
        function () {

            isListening =
                true;

            micButton.classList.add(
                "listening"
            );
        };


    recognition.onresult =
        function (event) {

            const spokenText =
                event.results[0][0]
                    .transcript;


            if (!spokenText.trim()) {

                return;
            }


            /*
             * Add voice text to
             * existing text
             */

            if (
                diaryText.value.trim()
            ) {

                diaryText.value =
                    diaryText.value.trim() +
                    " " +
                    spokenText;

            } else {

                diaryText.value =
                    spokenText;
            }


            diaryText.focus();
        };


    recognition.onerror =
        function (event) {

            console.log(
                "Speech recognition error:",
                event.error
            );


            if (
                event.error ===
                "not-allowed"
            ) {

                alert(
                    "Microphone permission is required. Please allow microphone access in Chrome."
                );
            }


            if (
                event.error ===
                "audio-capture"
            ) {

                alert(
                    "Microphone is not available. Please check your microphone/device settings."
                );
            }
        };


    recognition.onend =
        function () {

            isListening =
                false;


            micButton.classList.remove(
                "listening"
            );
        };


    micButton.addEventListener(
        "click",
        function () {

            try {

                if (isListening) {

                    recognition.stop();

                } else {

                    recognition.start();
                }

            } catch (error) {

                console.log(
                    "Speech start error:",
                    error
                );
            }
        }
    );


} else {

    micButton.addEventListener(
        "click",
        function () {

            alert(
                "Voice input is not supported on this browser."
            );
        }
    );
}


/* =========================
   HTML SAFETY
========================= */

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}

/* =========================
   NAVIGATION
========================= */

function goBack() {
    window.history.back();
}

function goDashboard() {
    window.location.href = "dashboard.html";
}

/* Make functions available to HTML onclick */
window.goBack = goBack;
window.goDashboard = goDashboard;


/* =========================
   INITIAL LOAD
========================= */

renderDiaryHistory();