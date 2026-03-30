# Trial-1

Minimal local website (HTML/CSS/Vanilla JS) to visualize project tracker data with:

1. **Multi-owner filtered** Gantt chart with **Owner → Cluster hierarchy** and hover/click cluster details.
2. Owner-filtered status + commentary tables.

## Run locally

Open `index.html` in a browser.

## Data options

- Default demo data is in `sample-data.js` (`window.PROJECT_DATA`).
- Optional: import CSV from the UI with this header row:

```csv
id,activity,owner,clusterLabel,dimension1,dimension2,dimension3,dimension4,start,end,status,delayedDays,originalTimeline,revisedTimeline,remarks
```

## Confirmed assumptions (from latest feedback)

- Owner selector is **multi-select**.
- Gantt visualization is grouped as **Owner → Cluster**.
- Dimension scores are numeric and fixed to **4 dimensions**.
- Status set is fixed: `done`, `delayed`, `on-track`, `at-risk`, `pending`.
- Excel workflow remains **Excel → CSV** import for minimal stack.
