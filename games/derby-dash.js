(function () {
  var HORSES = [
    { name: "Copper",   emoji: "🐎" },
    { name: "Midnight", emoji: "🐴" },
    { name: "Blaze",    emoji: "🐎" },
    { name: "Ghost",    emoji: "🐴" },
    { name: "Ember",    emoji: "🐎" }
  ];

  var track = document.getElementById("track");
  var startBtn = document.getElementById("startBtn");
  var resetBtn = document.getElementById("resetBtn");
  var status = document.getElementById("status");

  var laneEls = [];
  var raceInterval = null;
  var positions = [];
  var finished = false;

  var FINISH_PCT = 100; // percent of usable lane width

  function buildTrack() {
    var existing = track.querySelectorAll(".lane");
    existing.forEach(function (el) { el.remove(); });

    laneEls = HORSES.map(function (h, i) {
      var lane = document.createElement("div");
      lane.className = "lane";

      var label = document.createElement("span");
      label.className = "lane-label";
      label.textContent = i + 1;
      lane.appendChild(label);

      var horse = document.createElement("span");
      horse.className = "horse";
      horse.textContent = h.emoji;
      // Dynamic left-position is set via JS during the race; this is
      // required for the per-frame animation and can't be expressed
      // as a static CSS class without one class per pixel position.
      horse.style.left = "4px";
      lane.appendChild(horse);

      track.appendChild(lane);
      return horse;
    });
  }

  function resetRace() {
    clearInterval(raceInterval);
    raceInterval = null;
    finished = false;
    positions = HORSES.map(function () { return 0; });
    laneEls.forEach(function (el) {
      el.classList.remove("winner");
      el.style.left = "4px";
    });
    status.textContent = "";
    startBtn.disabled = false;
    resetBtn.disabled = true;
  }

  function laneMaxPx(laneEl) {
    return laneEl.parentElement.clientWidth - 44; // account for horse width + finish gutter
  }

  function startRace() {
    if (raceInterval) return;
    finished = false;
    positions = HORSES.map(function () { return 0; });
    laneEls.forEach(function (el) {
      el.classList.remove("winner");
      el.style.left = "4px";
    });
    status.textContent = "They're off!";
    startBtn.disabled = true;
    resetBtn.disabled = false;

    raceInterval = setInterval(function () {
      if (finished) return;

      var winnerIdx = -1;

      positions = positions.map(function (pos, i) {
        var step = Math.random() * 3.2 + 0.6; // randomized speed
        var next = Math.min(pos + step, FINISH_PCT);
        var laneEl = laneEls[i];
        var maxPx = laneMaxPx(laneEl);
        laneEl.style.left = (4 + (next / FINISH_PCT) * maxPx) + "px";
        if (next >= FINISH_PCT && winnerIdx === -1) winnerIdx = i;
        return next;
      });

      if (winnerIdx !== -1) {
        finished = true;
        clearInterval(raceInterval);
        raceInterval = null;
        laneEls[winnerIdx].classList.add("winner");
        status.textContent = HORSES[winnerIdx].name + " wins the race!";
        startBtn.disabled = false;
        resetBtn.disabled = false;
      }
    }, 90);
  }

  startBtn.addEventListener("click", startRace);
  resetBtn.addEventListener("click", resetRace);

  buildTrack();
  resetRace();
})();
