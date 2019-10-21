const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));

const router = express.Router();
const MARINE_URL = `https://services.marinetraffic.com/api/portcalls/v:4/${MARINE_KEY}/portid:863/protocol:json/`;
const PRISM_URL = 'https://lb.prod2.cluster.prism.ai/api/graphql';


getQuery = (beginAt, endAt) => {
  return (`
    query {
      prism(accountId: "10000412", prismId: "10001840") {
        events(first: 0, last: 100, beginDt: "${beginAt + "T00:00:00Z"}", endDt: "${endAt + "T00:00:00Z"}") {
          edges {
            node {
              feedId
              begin
              end
              objects(first: 0, last: 1) {
                edges {
                  node {
                    snapshots(first:0, last: 1) {
                      edges{
                        node {
                          url
                        }
                      }
                    }
                    tags {
                      confidence
                      tag {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `
  )
}


buildShipInfo = (prism_response) => {
  return prism_response.data.data.prism.events.edges.map(el => ({
    feedId: el.node.feedId,
    snapshot: el.node.objects.edges[0].node.snapshots.edges[0].node.url,
    timespan: {
      min: Date.parse(el.node.begin) - (11 * 60 * 1000),
      max: Date.parse(el.node.begin) + (11 * 60 * 1000),
    }
  }));
}

matchData = (marine_data, prism_data) => {
  var matched_data = [];
  console.log(marine_data);
  marine_data.forEach(marine_ship => {
    let ship_date = Date.parse(marine_ship[3] + "+00:00");
    const ships_info = buildShipInfo(prism_data);
    ships_info.forEach(prism_ship => {
      if (prism_ship.timespan.min < ship_date && ship_date < prism_ship.timespan.max) {
        const SEVEN_HOURS_MS = 7 * 60 * 60 * 1000
        let time = new Date(ship_date + SEVEN_HOURS_MS).toLocaleString();
        if (!matched_data.find(elem => elem.time == time)) {
          matched_data.push({
            name: marine_ship[1],
            time: time,
            snapshot: prism_ship.snapshot,
            description: marine_ship[6],
          }
          );
        }
      }
    });
  });
  return matched_data;
}


router.get('/ships', (req, res) => {
  const beginAt = req.query.fromDate;
  const endAt = req.query.toDate;
  const query = getQuery(beginAt, endAt);
  axios({
    method: 'POST',
    data: {
      query: query
    },
    headers: {
      Authorization: `JWT ${JWT}`
    },
    url: PRISM_URL
  }).then((prism_response) => {
    axios.get(`${MARINE_URL}/fromdate:${beginAt}/todate:${endAt}`)
      .then((marine_response) => {
        const matched_data = matchData(marine_response.data, prism_response);
        res.send(matched_data);
      }).catch((err) => {
        console.log(err)
        res.status(500).send("external API error", { error: err });
      });
  }).catch((err) => {
    console.log(err)
    res.status(500).send("external API error", { error: err });
  });
});

app.use('/api', router)

app.listen(6357, () => console.log('started server on port = 6357'));