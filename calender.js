const { createApp } = Vue;

createApp({
  data() {
    return {
      // Month state
      currentDate: new Date(),
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),

      // Filter state
      filterType: "all",

      // Sport selection
      selectedSportKey: "all",

      // Modal state
      modal: {
        title: "",
        bodyHtml: "",
      },

      // date selection state for "more" modal: { dateKey: [eventId, ...] }
      dateSelections: {},

      // currently open date key for the "more" modal
      selectedDateKey: null,

      // Cached schedule data
      // eventsByDate: { "YYYY-MM-DD": [event, event...] }
      eventsByDate: {},

      // all loaded events (flat)
      allEvents: [],

      // File lists
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

      // Map emoji buttons to a single JSON file each
      // key must match selectedSportKey
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
        const filtered = dayEvents.filter((ev) => this.filterType === "all" || ev.type === this.filterType);

        // Sort by time if present (best-effort)
        filtered.sort((a, b) => (a.time || "").localeCompare(b.time || ""));

        const MAX_TILES = 3;

        // allow per-date user selections to be prioritized into the visible slots
        const selectedIds = this.dateSelections[dateKey] || [];

        const selectedArr = filtered.filter((ev) => selectedIds.includes(ev._id));
        const others = filtered.filter((ev) => !selectedIds.includes(ev._id));
        const prioritized = [...selectedArr, ...others];

        const shown = prioritized.slice(0, MAX_TILES);
        const moreCount = Math.max(0, prioritized.length - MAX_TILES);

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

      if (key === "all") {
        await this.loadAllSchedules();
      } else {
        const btn = this.sportButtons.find((s) => s.key === key);
        if (!btn) return;
        await this.loadOneSchedule(btn.file);
      }
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
      // If the date list modal is open, hide it first so the event modal replaces it
      try {
        const dateModalEl = document.getElementById("dateModal");
        const dateModalInst = bootstrap.Modal.getInstance(dateModalEl);
        if (dateModalInst) dateModalInst.hide();
      } catch (e) {
        // ignore if bootstrap not available or modal not present
      }

      // Bootstrap modal
      this.modal.title = ev.shortLabel;

      this.modal.bodyHtml = `
        <div class="mb-2"><strong>Date:</strong> ${this.escapeHtml(ev.date)}</div>
        <div class="mb-2"><strong>Time:</strong> ${this.escapeHtml(ev.time || "TBD")}</div>
        <div class="mb-2"><strong>Opponent:</strong> ${this.escapeHtml(ev.opponent || "")}</div>
        <div class="mb-2"><strong>Home/Away:</strong> ${this.escapeHtml(ev.homeOrAway || "")}</div>
        <div class="mb-2"><strong>Location:</strong> ${this.escapeHtml(ev.location || "")}</div>
        <div class="mb-2"><strong>Level:</strong> ${this.escapeHtml(ev.level || "")}</div>
        <div class="mb-2"><strong>Event Name:</strong> ${this.escapeHtml(ev.name || "")}</div>
      `;

      const modalEl = document.getElementById("eventModal");
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    },

    escapeHtml(str) {
      return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    },

    buildShortLabel(sportName, boyOrGirl) {
      const gender = (boyOrGirl || "").toLowerCase();

      const genderMap = {
        boy: "B",
        girl: "G",
        coed: "C"
      };

      const sportMap = {
        soccer: "SOC",
        basketball: "BSK",
        wrestling: "WRST",
        football: "FB",
        baseball: "BB",
        softball: "SB",
        lacrosse: "LAX",
        track: "TRK",
        tennis: "TEN",
        swimming: "SWM",
        volleyball: "VB",
        "cross country": "XC",
        "ice hockey": "HKY",
        cheerleading: "CHR",
        "dance team": "DNC"
      };

      const g = genderMap[gender] || "";
      const s = sportMap[sportName.toLowerCase()] || sportName.slice(0, 3).toUpperCase();

      return `${g} ${s}`.trim();
    },

    flattenScheduleObject(root) {
      const result = [];

      for (const sportName of Object.keys(root)) {
        const sportNode = root[sportName] || {};

        for (const genderKey of Object.keys(sportNode)) {
          const genderNode = sportNode[genderKey] || {};

          for (const levelName of Object.keys(genderNode)) {
            const levelNode = genderNode[levelName] || {};

            for (const eventName of Object.keys(levelNode)) {
              const data = levelNode[eventName] || {};
              const date = data.date || "";
              if (!date) continue;

              const boyOrGirl = data.boyOrGirl ?? "";
              const shortLabel = this.buildShortLabel(sportName, boyOrGirl);

              result.push({
                _id: crypto.randomUUID ? crypto.randomUUID() : `${date}-${sportName}-${eventName}`,
                date,
                location: data.location ?? "",
                time: data.time ?? "",
                opponent: data.opponent ?? "",
                homeOrAway: data.homeOrAway ?? "",
                boyOrGirl,
                sport: sportName,
                level: levelName,
                name: eventName,
                type: "sports",
                shortLabel,
              });
            }
          }
        }
      }

      return result;
    },

    rebuildDateIndex(events) {
      this.eventsByDate = {};
      for (const ev of events) {
        if (!this.eventsByDate[ev.date]) this.eventsByDate[ev.date] = [];
        this.eventsByDate[ev.date].push(ev);
      }
    },

    async loadOneSchedule(file) {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`Failed to load ${file} (${res.status})`);
      const data = await res.json();

      const flat = this.flattenScheduleObject(data);
      this.allEvents = flat;
      this.rebuildDateIndex(flat);
    },

    async loadAllSchedules() {
      const fetches = this.allFiles.map(async (file) => {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Failed to load ${file} (${res.status})`);
        return res.json();
      });

      const allJson = await Promise.all(fetches);

      const flat = [];
      for (const obj of allJson) {
        flat.push(...this.flattenScheduleObject(obj));
      }

      this.allEvents = flat;
      this.rebuildDateIndex(flat);
    },

    // Open modal showing all events for a given date, allowing selection
    openDateModal(dateKey) {
      this.selectedDateKey = dateKey;
      if (!this.dateSelections[dateKey]) this.dateSelections[dateKey] = [];

      const modalEl = document.getElementById("dateModal");
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    },

    applyDateSelections() {
      const modalEl = document.getElementById("dateModal");
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
      // selections are already stored in `dateSelections` — calendar will re-render
    },
  },

  async mounted() {
    // Initial load: all sports
    try {
      await this.loadAllSchedules();
    } catch (e) {
      console.error(e);
    }
  },
}).mount("#app");
