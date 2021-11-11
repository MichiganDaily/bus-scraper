import fetch from "node-fetch";
import fs from "fs";
import * as d3 from "d3";
const KEY = "Yfy3ngSkJBmeAdfn8ySaLTPWw";

// Hardcoded set of ROUTES
// Get a list of STOPS
// For each STOP: get top K PREDICTIONS
// Store: list of PREDICTIONS + time of crawl.
const stops = [
  "N411",
  "N410",
  "N408",
  "M303",
  "C250",
  "M350",
  "M309",
  "N550",
  "M301",
  "N409",
  "N407",
  "N450",
  "M310",
  "N551",
  "C211",
  "N552",
  "M319",
  "N404",
  "M305",
  "S001",
  "N406",
  "S004",
  "N501",
  "N500",
  "S006",
  "N432",
  "N434",
  "S007",
  "C208",
  "S009",
  "M313",
  "C200",
  "M315",
  "S003",
  "M307",
  "M317",
  "N403",
  "S002",
  "C203",
  "N402",
  "N452",
  "N502",
  "S005",
  "S008",
  "C201",
  "M314",
  "N553",
  "C202",
  "S010",
  "M316",
  "N400",
  "C207",
  "C251",
  "C206",
  "C210",
  "C204",
  "C205",
  "E606",
  "E601",
  "M312",
  "N443",
  "N446",
  "N440",
  "N447",
  "N444",
  "E612",
  "E605",
  "M324",
  "M322",
  "E604",
  "E607",
  "N401",
  "E608",
  "E609",
  "E611",
  "E610",
  "N405",
  "E600",
  "N429",
  "E603",
  "N442",
  "N441",
  "NCRC_NIB",
  "N445",
  "N418",
  "N422",
  "N430",
  "N438",
  "N428",
  "N416",
  "N420",
  "N414",
  "N426",
  "N435",
  "N436",
  "N437",
  "N424",
  "N451",
  "N431",
  "M304",
  "N433",
  "M302",
  "N421",
  "N412",
  "N417",
  "N415",
  "N419",
  "N413",
  "M311",
  "M323",
  "M321",
];

if (true) {
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
  console.log(JSON.stringify(stops));
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

fs.appendFile("scrape.jsonl", JSON.stringify(output), (err) => {
  if (err) console.log(err);
});
