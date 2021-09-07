import fetch from "node-fetch";
import fs from "fs";
import * as d3 from "d3";
const KEY = "Yfy3ngSkJBmeAdfn8ySaLTPWw";

// Hardcoded set of ROUTES
// Get a list of STOPS
// For each STOP: get top K PREDICTIONS
// Store: list of PREDICTIONS + time of crawl.

const stops = [
  "N409",
  "N407",
  "N550",
  "N405",
  "N430",
  "N416",
  "C251",
  "N403",
  "M350",
  "M309",
  "N553",
  "C210",
  "N450",
  "M310",
  "N552",
  "N406",
  "E601",
  "N432",
  "N438",
  "N437",
  "N401",
  "N429",
  "N433",
  "M317",
  "M303",
  "N452",
  "N502",
  "N501",
  "N500",
  "M314",
  "M316",
  "N400",
  "M319",
  "M313",
  "N447",
  "M315",
  "N420",
  "N414",
  "N428",
  "N424",
  "M307",
  "C250",
  "C206",
  "C211",
  "M301",
  "C204",
  "C205",
  "S001",
  "S004",
  "S007",
  "C208",
  "S009",
  "C200",
  "T001",
  "S005",
  "T002",
  "M311",
  "M323",
  "M305",
  "M321",
];

if (false) {
  const routes = (
    await fetch(
      `https://mbus.ltp.umich.edu/bustime/api/v3/getroutes?key=${KEY}&format=json`
    ).then((res) => res.json())
  )["bustime-response"].routes;

  const directions = d3.merge(
    await Promise.all(
      routes.map((route) =>
        fetch(
          `https://mbus.ltp.umich.edu/bustime/api/v3/getdirections?key=${KEY}&format=json&rt=${route.rt}`
        )
          .then((r) => r.json())
          .then((d) => d["bustime-response"].directions)
          .then((directions) =>
            directions.map((direction) => ({ route, direction }))
          )
      )
    )
  );

  const stops = Array.from(
    new Set(
      Array.from(
        d3
          .merge(
            await Promise.all(
              directions.map((direction) =>
                fetch(
                  `https://mbus.ltp.umich.edu/bustime/api/v3/getstops?key=${KEY}&format=json&rt=${direction.route.rt}&dir=${direction.direction.id}`
                )
                  .then((r) => r.json())
                  .then((d) => d["bustime-response"].stops)
              )
            )
          )
          .map((d) => d.stpid)
      )
    )
  );
}

// Iterate through stops

async function getPredictions(stops) {
  const predictions = await fetch(
    `https://mbus.ltp.umich.edu/bustime/api/v3/getpredictions?key=${KEY}&format=json&stpid=${stops.join(
      ","
    )}`
  ).then((d) => d.json());
  return predictions["bustime-response"];
}

const predictions = [];
for (let i = 0; i < stops.length; i += stops.length / 6) {
  const chunk = stops.slice(i, i + stops.length / 6);
  predictions.push(await getPredictions(chunk));
}

const errors = d3.merge(predictions.map((d) => d.error));
const preds = d3.merge(predictions.map((d) => d.prd || []));

const output = {
  timestamp: new Date(),
  errors,
  preds,
};

fs.appendFile('scrape.jsonl', JSON.stringify(output))
