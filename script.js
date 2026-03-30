const ownerSelect = document.getElementById("ownerSelect");
const viewSelect = document.getElementById("viewSelect");
const ganttSection = document.getElementById("ganttSection");
const statusSection = document.getElementById("statusSection");
const ganttLegend = document.getElementById("ganttLegend");
const ganttChart = document.getElementById("ganttChart");
const tooltip = document.getElementById("ganttTooltip");
const delayBody = document.querySelector("#delayTable tbody");
const pendingBody = document.querySelector("#pendingTable tbody");
const statusCards = document.getElementById("statusCards");
const dataFile = document.getElementById("dataFile");

let appData = structuredClone(window.PROJECT_DATA);

const statusColor = {
  done: "#00a84f",
  delayed: "#cc2a2a",
  "on-track": "#1f4c95",
  "at-risk": "#f4c531",
  pending: "#858ea2"
};

function daysBetween(a, b) {
  const ms = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b) - new Date(a)) / ms);
}

function getOwners() {
  return [...new Set(appData.tasks.map((task) => task.owner))];
}

function getSelectedOwners() {
  const values = [...ownerSelect.selectedOptions].map((opt) => opt.value);
  if (!values.length || values.includes("All Owners")) return [];
  return values;
}

function getFilteredTasks() {
  const selectedOwners = getSelectedOwners();
  if (!selectedOwners.length) return appData.tasks;
  return appData.tasks.filter((task) => selectedOwners.includes(task.owner));
}

function populateOwnerOptions() {
  const selected = new Set(getSelectedOwners());
  ownerSelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "All Owners";
  allOption.textContent = "All Owners";
  allOption.selected = !selected.size;
  ownerSelect.appendChild(allOption);

  getOwners().forEach((owner) => {
    const option = document.createElement("option");
    option.value = owner;
    option.textContent = owner;
    option.selected = selected.has(owner);
    ownerSelect.appendChild(option);
  });
}

function buildOwnerClusterRows(tasks) {
  const grouped = new Map();

  tasks.forEach((task) => {
    if (!grouped.has(task.owner)) grouped.set(task.owner, new Map());
    const clusters = grouped.get(task.owner);

    if (!clusters.has(task.clusterLabel)) {
      clusters.set(task.clusterLabel, {
        owner: task.owner,
        clusterLabel: task.clusterLabel,
        start: task.start,
        end: task.end,
        dimensionScores: [...task.dimensionScores],
        statuses: [task.status],
        taskCount: 1
      });
      return;
    }

    const cluster = clusters.get(task.clusterLabel);
    cluster.start = task.start < cluster.start ? task.start : cluster.start;
    cluster.end = task.end > cluster.end ? task.end : cluster.end;
    cluster.taskCount += 1;
    cluster.statuses.push(task.status);

    // Fixed 4 dimensions: show averaged dimensions per owner->cluster.
    cluster.dimensionScores = cluster.dimensionScores.map(
      (score, idx) => (score * (cluster.taskCount - 1) + (task.dimensionScores[idx] ?? 0)) / cluster.taskCount
    );
  });

  return [...grouped.entries()].flatMap(([owner, clusters]) => {
    const ownerHeader = { type: "owner", owner };
    const clusterRows = [...clusters.values()]
      .sort((a, b) => Number(a.clusterLabel) - Number(b.clusterLabel))
      .map((cluster) => ({
        type: "cluster",
        ...cluster,
        status: deriveClusterStatus(cluster.statuses)
      }));
    return [ownerHeader, ...clusterRows];
  });
}

function deriveClusterStatus(statuses) {
  if (statuses.includes("at-risk")) return "at-risk";
  if (statuses.includes("delayed")) return "delayed";
  if (statuses.includes("pending")) return "pending";
  if (statuses.includes("on-track")) return "on-track";
  return "done";
}

function renderLegend(tasks) {
  const statuses = [...new Set(tasks.map((task) => task.status))];
  ganttLegend.innerHTML = statuses
    .map(
      (status) => `
      <div class="legend-item">
        <span class="legend-swatch" style="background:${statusColor[status] || "#8794af"}"></span>
        <span>${status}</span>
      </div>
    `
    )
    .join("");
}

function renderGantt(tasks) {
  const start = appData.timelineStart;
  const end = appData.timelineEnd;
  const totalDays = Math.max(1, daysBetween(start, end));
  const rows = buildOwnerClusterRows(tasks);

  const grid = document.createElement("div");
  grid.className = "gantt-grid";

  rows.forEach((rowItem) => {
    const row = document.createElement("div");
    row.className = "gantt-row";

    if (rowItem.type === "owner") {
      row.classList.add("owner-header-row");
      row.innerHTML = `
        <div class="gantt-label owner-header">${rowItem.owner}</div>
        <div class="gantt-track owner-divider"></div>
      `;
      grid.appendChild(row);
      return;
    }

    const label = document.createElement("div");
    label.className = "gantt-label";
    label.textContent = `↳ Cluster ${rowItem.clusterLabel} (${rowItem.taskCount} task${rowItem.taskCount > 1 ? "s" : ""})`;

    const track = document.createElement("div");
    track.className = "gantt-track";

    const leftPct = (daysBetween(start, rowItem.start) / totalDays) * 100;
    const widthPct = (daysBetween(rowItem.start, rowItem.end) / totalDays) * 100;

    const bar = document.createElement("div");
    bar.className = "gantt-bar";
    bar.style.left = `${Math.max(0, leftPct)}%`;
    bar.style.width = `${Math.max(3, widthPct)}%`;
    bar.style.background = statusColor[rowItem.status] || "#8794af";
    bar.tabIndex = 0;
    bar.setAttribute("aria-label", `Owner ${rowItem.owner} cluster ${rowItem.clusterLabel}`);

    const showDetails = () => {
      tooltip.classList.remove("hidden");
      tooltip.innerHTML = `<strong>${rowItem.owner} → Cluster ${rowItem.clusterLabel}</strong><br>
      Dimension 1: ${rowItem.dimensionScores[0].toFixed(1)} | Dimension 2: ${rowItem.dimensionScores[1].toFixed(1)} | Dimension 3: ${rowItem.dimensionScores[2].toFixed(1)}`;
    };

    bar.addEventListener("mouseenter", showDetails);
    bar.addEventListener("click", showDetails);
    bar.addEventListener("focus", showDetails);

    track.appendChild(bar);
    row.append(label, track);
    grid.appendChild(row);
  });

  const axis = document.createElement("div");
  axis.className = "gantt-axis";
  const spacer = document.createElement("div");
  const ticks = document.createElement("div");
  ticks.className = "axis-ticks";

  const tickLabels = [];
  for (let i = 0; i <= 6; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + Math.floor((totalDays / 6) * i));
    tickLabels.push(d.toISOString().slice(5, 10));
  }
  ticks.style.setProperty("--ticks", tickLabels.length);
  tickLabels.forEach((labelText) => {
    const el = document.createElement("span");
    el.textContent = labelText;
    ticks.appendChild(el);
  });

  axis.append(spacer, ticks);
  ganttChart.innerHTML = "";
  ganttChart.append(grid, axis);
}

function buildStatusCards(tasks) {
  const delayed = tasks.filter((t) => t.status === "delayed").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const onTrack = tasks.filter((t) => t.status === "on-track").length;
  const atRisk = tasks.filter((t) => t.status === "at-risk").length;

  const cards = [
    ["Total Activities", tasks.length, "track"],
    ["Done", done, "done"],
    ["Delayed", delayed, "delay"],
    ["On-Track", onTrack, "track"],
    ["At-Risk", atRisk, "risk"]
  ];

  statusCards.innerHTML = cards
    .map(
      ([title, value, cls]) => `
        <article class="status-card">
          <h4>${title}</h4>
          <div class="value ${cls}">${value}</div>
        </article>
      `
    )
    .join("");
}

function emptyRow(colspan = 6) {
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.colSpan = colspan;
  td.className = "empty";
  td.textContent = "No matching records for selected owner filter.";
  tr.appendChild(td);
  return tr;
}

function renderTables(tasks) {
  delayBody.innerHTML = "";
  pendingBody.innerHTML = "";

  const delayedTasks = tasks.filter((t) => t.status === "delayed" || t.status === "at-risk");
  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "on-track");

  if (!delayedTasks.length) {
    delayBody.appendChild(emptyRow());
  } else {
    delayedTasks.forEach((task, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${task.activity}</td>
        <td>${task.owner}</td>
        <td>${task.originalTimeline}</td>
        <td>${task.revisedTimeline}</td>
        <td>${task.remarks}</td>
      `;
      delayBody.appendChild(tr);
    });
  }

  if (!pendingTasks.length) {
    pendingBody.appendChild(emptyRow(5));
  } else {
    pendingTasks.forEach((task, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${task.activity}</td>
        <td>${task.owner}</td>
        <td>${task.revisedTimeline}</td>
        <td>${task.remarks}</td>
      `;
      pendingBody.appendChild(tr);
    });
  }
}

function applyViewFilter() {
  const view = viewSelect.value;
  ganttSection.style.display = view === "status" ? "none" : "block";
  statusSection.style.display = view === "gantt" ? "none" : "block";
}

function renderAll() {
  const tasks = getFilteredTasks();
  renderLegend(tasks);
  renderGantt(tasks);
  buildStatusCards(tasks);
  renderTables(tasks);
  applyViewFilter();
}

function parseCsvToTasks(csvText) {
  const [headerRow, ...rows] = csvText.trim().split("\n");
  const headers = headerRow.split(",").map((h) => h.trim());
  return rows
    .map((row, idx) => {
      const cols = row.split(",");
      const item = Object.fromEntries(headers.map((h, i) => [h, (cols[i] || "").trim()]));

      return {
        id: Number(item.id || idx + 1),
        activity: item.activity,
        owner: item.owner,
        clusterLabel: Number(item.clusterLabel || 0),
        dimensionScores: [
          Number(item.dimension1 || 0),
          Number(item.dimension2 || 0),
          Number(item.dimension3 || 0),
          Number(item.dimension4 || 0)
        ],
        start: item.start,
        end: item.end,
        status: item.status,
        delayedDays: Number(item.delayedDays || 0),
        originalTimeline: item.originalTimeline || "-",
        revisedTimeline: item.revisedTimeline || "-",
        remarks: item.remarks || ""
      };
    })
    .filter((t) => t.activity && t.owner && t.start && t.end);
}

ownerSelect.addEventListener("change", () => {
  const selected = getSelectedOwners();
  const allOption = ownerSelect.querySelector('option[value="All Owners"]');

  if (!selected.length) {
    allOption.selected = true;
  } else {
    allOption.selected = false;
  }

  renderAll();
});
viewSelect.addEventListener("change", applyViewFilter);

dataFile.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  const tasks = parseCsvToTasks(text);
  if (!tasks.length) {
    alert("Could not parse CSV. Please match the template headers in script.js.");
    return;
  }

  appData.tasks = tasks;
  appData.timelineStart = tasks.reduce((min, t) => (t.start < min ? t.start : min), tasks[0].start);
  appData.timelineEnd = tasks.reduce((max, t) => (t.end > max ? t.end : max), tasks[0].end);

  populateOwnerOptions();
  renderAll();
});

populateOwnerOptions();
renderAll();
