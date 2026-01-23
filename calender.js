document.addEventListener("DOMContentLoaded", function () {
  const calendar = document.getElementById("calendar");
  const calendarTitle = document.getElementById("calendar-title");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  const allFilterBtn = document.getElementById("all-filter");
  const sportsFilterBtn = document.getElementById("sports-filter");
  const playsFilterBtn = document.getElementById("plays-filter");
  const concertsFilterBtn = document.getElementById("concerts-filter");

  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  // Events data
  const events = {
    "2025-03-05": { name: "Basketball Playoffs", type: "sports" },
    "2025-03-12": { name: "Zach Bryan", type: "concerts" },
    "2025-03-18": { name: "Hamilton", type: "plays" },
    "2025-03-22": { name: "Boxing World Championship", type: "sports" },
    "2025-03-29": { name: "Olivia Rodrigo", type: "concerts" },

    "2025-04-07": { name: "Tennis Tournament", type: "sports" },
    "2025-04-15": { name: "Fleetwood Mac", type: "concerts" },
    "2025-04-20": { name: "The Lion King", type: "plays" },
    "2025-04-25": { name: "Track & Field Championship", type: "sports" },
    "2025-04-30": { name: "Beyoncé", type: "concerts" },

    "2025-05-04": { name: "Professional Golf Tournament", type: "sports" },
    "2025-05-11": { name: "Chris Stapleton", type: "concerts" },
    "2025-05-18": { name: "The Phantom of the Opera", type: "plays" },
    "2025-05-22": { name: "Mixed Martial Arts Finals", type: "sports" },
    "2025-05-27": { name: "Adele", type: "concerts" },
  };

  function generateCalendar(month, year, filterType = "all") {
    calendar.innerHTML = "";
    calendarTitle.textContent = new Date(year, month).toLocaleString(
      "default",
      { month: "long", year: "numeric" }
    );

    const lastDate = new Date(year, month + 1, 0).getDate();

    calendar.style.gridTemplateColumns = `repeat(7, 1fr)`;

    for (let day = 1; day <= lastDate; day++) {
      const dateKey = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      const dayDiv = document.createElement("div");
      dayDiv.classList.add("calendar-day");
      dayDiv.textContent = day;

      if (events[dateKey]) {
        const eventDiv = document.createElement("div");
        eventDiv.textContent = events[dateKey].name;
        eventDiv.classList.add("event", events[dateKey].type);

        // Apply filter
        if (filterType === "all" || filterType === events[dateKey].type) {
          dayDiv.appendChild(eventDiv);
        }
      }

      calendar.appendChild(dayDiv);
    }
  }

  prevMonthBtn.addEventListener("click", function () {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
  });

  nextMonthBtn.addEventListener("click", function () {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
  });

  allFilterBtn.addEventListener("click", function () {
    generateCalendar(currentMonth, currentYear, "all");
  });

  sportsFilterBtn.addEventListener("click", function () {
    generateCalendar(currentMonth, currentYear, "sports");
  });

  playsFilterBtn.addEventListener("click", function () {
    generateCalendar(currentMonth, currentYear, "plays");
  });

  concertsFilterBtn.addEventListener("click", function () {
    generateCalendar(currentMonth, currentYear, "concerts");
  });

  generateCalendar(currentMonth, currentYear);
});
