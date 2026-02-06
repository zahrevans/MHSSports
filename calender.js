const { createApp } = Vue;

createApp({
  data() {
    return {
      currentDate: new Date(),
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),

      filterType: "all",
      selectedSportKey: "all",

      modal: {
        title: "",
        bodyHtml: "",
      },

      dateSelections: {},
      selectedDateKey: null,

      eventsByDate: {},
      allEvents: [],

      allFiles: [
        "marlboro_schedule_baseball.json",
        "marlboro_schedule_basketball.json",
        "marlboro_schedule_cheerleading.json",
        "marlboro_schedule_cross_country.json",
        "marlboro_schedule_dance_team.json",
        "marlboro_schedule_football.json",
        "marlboro_schedule_ice_hockey.json",
        "marlboro_schedule_lacrosse.json",
        "marlboro_schedule_soccer.json",
        "marlboro_schedule_softball.json",
        "marlboro_schedule_swimming.json",
        "marlboro_schedule_tennis.json",
        "marlboro_schedule_track.json",
        "marlboro_schedule_volleyball.json",
        "marlboro_schedule_wrestling.json",
      ],

      sportButtons: [
        { key: "soccer", emoji: "⚽", label: "Soccer", file: "marlboro_schedule_soccer.json" },
        { key: "basketball", emoji: "🏀", label: "Basketball", file: "marlboro_schedule_basketball.json" },
        { key: "wrestling", emoji: "🤼", label: "Wrestling", file: "marlboro_schedule_wrestling.json" },
        { key: "football", emoji: "🏈", label: "Football", file: "marlboro_schedule_football.json" },
        { key: "baseball", emoji: "⚾", label: "Baseball", file: "marlboro_schedule_baseball.json" },
        { key: "softball", emoji: "🥎", label: "Softball", file: "marlboro_schedule_softball.json" },
        { key: "lacrosse", emoji: "🥍", label: "Lacrosse", file: "marlboro_schedule_lacrosse.json" },
        { key: "track", emoji: "🏃", label: "Track", file: "marlboro_schedule_track.json" },
        { key: "tennis", emoji: "🎾", label: "Tennis", file: "marlboro_schedule_tennis.json" },
        { key: "swimming", emoji: "🏊", label: "Swimming", file: "marlboro_schedule_swimming.json" },
        { key: "cross_country", emoji: "🏃‍♂️", label: "XC", file: "marlboro_schedule_cross_country.json" },
        { key: "volleyball", emoji: "🏐", label: "Volleyball", file: "marlboro_schedule_volleyball.json" },
        { key: "ice_hockey", emoji: "🏒", label: "Ice Hockey", file: "marlboro_schedule_ice_hockey.json" },
        { key: "cheerleading", emoji: "📣", label: "Cheer", file: "marlboro_schedule_cheerleading.json" },
        { key: "dance_team", emoji: "💃", label: "Dance", file: "marlboro_schedule_dance_team.json" },
      ],
    };
  },

  computed: {
    monthTitle() {
      return new Date(this.currentYear, this.currentMonth).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    },

    calendarCells() {
      const lastDate = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
      const cells = [];

      for (let day = 1; day <= lastDate; day++) {
        const dateKey = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayEvents = this.eventsByDate[dateKey] || [];

        dayEvents.sort((a, b) => (a.time || "").localeCompare(b.time || ""));

        const selectedIds = this.dateSelections[dateKey] || [];
        const prioritized = [
          ...dayEvents.filter(ev => selectedIds.includes(ev._id)),
          ...dayEvents.filter(ev => !selectedIds.includes(ev._id))
        ];

        // If there are 4 or fewer events, show them all.
        // If there are more than 4, show 3 events and reserve the 4th
        // visible slot for the "+N more" tile.
        const total = prioritized.length;
        let shown = [];
        let moreCount = 0;
        if (total <= 4) {
          shown = prioritized.slice(0, 4);
          moreCount = 0;
        } else {
          shown = prioritized.slice(0, 3); // show 3 events
          moreCount = total - 3; // +N will occupy the 4th slot
        }

        cells.push({
          dateKey,
          dayNumber: day,
          shown,
          moreCount,
        });
      }

      return cells;
    },
  },

  methods: {
    async selectSport(key) {
      this.selectedSportKey = key;
      if (key === "all") return this.loadAllSchedules();
      const btn = this.sportButtons.find(s => s.key === key);
      if (btn) return this.loadOneSchedule(btn.file);
    },

    prevMonth() {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
    },

    nextMonth() {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
    },
    openEvent(ev) {
      // Close date modal if open
      const dateModalEl = document.getElementById("dateModal");
      if (dateModalEl) {
        const dateModal = bootstrap.Modal.getInstance(dateModalEl);
        if (dateModal) dateModal.hide();
      }


      // Set event modal content
      this.modal.title = ev.sport
        ? ev.sport.toUpperCase()
        : ev.shortLabel;

      this.modal.bodyHtml = `
    <div class="mb-2"><strong>Date:</strong> ${this.escapeHtml(ev.date)}</div>
    <div class="mb-2"><strong>Time:</strong> ${this.escapeHtml(ev.time || "TBD")}</div>
    <div class="mb-2"><strong>Opponent:</strong> ${this.escapeHtml(ev.opponent || "—")}</div>
    <div class="mb-2"><strong>Home/Away:</strong> ${this.escapeHtml(ev.homeOrAway || "—")}</div>
    <div class="mb-2"><strong>Location:</strong> ${this.escapeHtml(ev.location || "—")}</div>
    <div class="mb-2"><strong>Level:</strong> ${this.escapeHtml(ev.level || "—")}</div>
    <div class="mb-2"><strong>Event:</strong> ${this.escapeHtml(ev.name || "")}</div>
  `;

      // OPEN the event modal
      const eventModalEl = document.getElementById("eventModal");
      const eventModal = new bootstrap.Modal(eventModalEl);
      eventModal.show();
    },

    escapeHtml(str) {
      return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
    },

    flattenScheduleObject(root) {
      const out = [];
      for (const sport of Object.keys(root)) {
        for (const gender of Object.keys(root[sport])) {
          for (const level of Object.keys(root[sport][gender])) {
            for (const name of Object.keys(root[sport][gender][level])) {
              const d = root[sport][gender][level][name];
              if (!d.date) continue;
              out.push({
                _id: crypto.randomUUID(),
                sport,
                boyOrGirl: d.boyOrGirl,
                level,
                name,
                date: d.date,
                time: d.time,
                opponent: d.opponent,
                location: d.location,
                homeOrAway: d.homeOrAway,
                shortLabel: this.buildShortLabel(sport, d.boyOrGirl),
              });
            }
          }
        }
      }
      return out;
    },

    buildShortLabel(sport, gender) {
      const g = gender?.toLowerCase() === "boy" ? "B" : gender?.toLowerCase() === "girl" ? "G" : "";
      return `${g} ${sport.slice(0, 3).toUpperCase()}`.trim();
    },

    rebuildDateIndex(events) {
      this.eventsByDate = {};
      events.forEach(ev => {
        if (!this.eventsByDate[ev.date]) this.eventsByDate[ev.date] = [];
        this.eventsByDate[ev.date].push(ev);
      });
    },

    async loadOneSchedule(file) {
      const data = await (await fetch(file)).json();
      const flat = this.flattenScheduleObject(data);
      this.rebuildDateIndex(flat);
    },

    async loadAllSchedules() {
      const all = await Promise.all(this.allFiles.map(f => fetch(f).then(r => r.json())));
      const flat = all.flatMap(d => this.flattenScheduleObject(d));
      this.rebuildDateIndex(flat);
    },

    openDateModal(dateKey) {
      this.selectedDateKey = dateKey;

      this.$nextTick(() => {
        const modalEl = document.getElementById("dateModal");
        if (!modalEl) return;

        const modal =
          bootstrap.Modal.getInstance(modalEl) ||
          new bootstrap.Modal(modalEl);

        modal.show();
      });
    },

    applyDateSelections() {
      bootstrap.Modal.getInstance(document.getElementById("dateModal")).hide();
    },
  },

  async mounted() {
    await this.loadAllSchedules();
  },
}).mount("#app");
