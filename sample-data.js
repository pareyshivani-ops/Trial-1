// Replace this object with parsed Excel/CSV data from your tracker.
window.PROJECT_DATA = {
  timelineStart: "2026-03-01",
  timelineEnd: "2026-04-30",
  tasks: [
    {
      id: 1,
      activity: "Service Request Dashboard",
      owner: "Ramesh",
      clusterLabel: 101,
      dimensionScores: [78, 65, 82, 55],
      start: "2026-03-08",
      end: "2026-03-27",
      status: "done",
      delayedDays: 0,
      originalTimeline: "27-Mar",
      revisedTimeline: "27-Mar",
      remarks: "Delivered to UAT with sign-off."
    },
    {
      id: 2,
      activity: "Development Sprint Plan",
      owner: "Neelay",
      clusterLabel: 102,
      dimensionScores: [66, 71, 74, 69],
      start: "2026-03-20",
      end: "2026-04-02",
      status: "on-track",
      delayedDays: 0,
      originalTimeline: "31-Mar",
      revisedTimeline: "02-Apr",
      remarks: "Screen-wise plan pending alignment."
    },
    {
      id: 3,
      activity: "Testing Plan & Timelines",
      owner: "Ramesh",
      clusterLabel: 203,
      dimensionScores: [43, 55, 64, 61],
      start: "2026-03-18",
      end: "2026-04-06",
      status: "delayed",
      delayedDays: 2,
      originalTimeline: "30-Mar",
      revisedTimeline: "06-Apr",
      remarks: "Contingent on development sprint plan."
    },
    {
      id: 4,
      activity: "Internal Integrations with MSD",
      owner: "Arjun",
      clusterLabel: 305,
      dimensionScores: [58, 62, 59, 73],
      start: "2026-03-24",
      end: "2026-04-10",
      status: "at-risk",
      delayedDays: 4,
      originalTimeline: "31-Mar",
      revisedTimeline: "10-Apr",
      remarks: "Dependency on external API stabilization."
    },
    {
      id: 5,
      activity: "Trading Screen Integration",
      owner: "Neelay",
      clusterLabel: 117,
      dimensionScores: [83, 88, 80, 75],
      start: "2026-03-14",
      end: "2026-03-29",
      status: "done",
      delayedDays: 0,
      originalTimeline: "29-Mar",
      revisedTimeline: "29-Mar",
      remarks: "Completed and merged."
    },
    {
      id: 6,
      activity: "Security Review",
      owner: "Arjun",
      clusterLabel: 404,
      dimensionScores: [49, 52, 47, 58],
      start: "2026-03-28",
      end: "2026-04-15",
      status: "pending",
      delayedDays: 0,
      originalTimeline: "07-Apr",
      revisedTimeline: "TBD",
      remarks: "Waiting on architecture sign-off."
    }
  ]
};
