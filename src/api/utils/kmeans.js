const { cleanPulses, decodeMorse2HumanDichotomy } = require('./convertion');
const { arrayStrictEqual } = require('./arrays');
const { SEPARATEPULSES } = require('../../constants/regexes');
const logger = require('../../config/logger');
const {
  DIT, DAH, INTRASEP, CHARSEP, WORDSEP,
} = require('../../constants/morse');

function calculateDistance(pulses) {
  return pulses.reduce((acc, cur) => {
    const len = cur.length;
    if (acc[len]) acc[len] += 1;
    else acc[len] = 1;

    return acc;
  }, {});
}

function getClusters(keys) {
  const cluster1 = {
    loc: keys[0],
  };
  const cluster2 = {
    loc: (keys[keys.length - 1] + keys[0]) / 2,
  };
  const cluster3 = {
    loc: keys[keys.length - 1],
  };

  return [cluster1, cluster2, cluster3];
}

function calculateBestCluster(clusters, key, distances) {
  const init = {
    cluster: null,
    loc: Number.MAX_SAFE_INTEGER,
  };

  const { cluster } = clusters.reduce((acc, cur) => {
    const distance = Math.abs(cur.loc - key);

    return distance < acc.loc ? { cluster: cur, loc: distance } : acc;
  }, init);

  cluster.points = [];
  const limit = distances[key];
  cluster.points.push(...Array(limit).fill(key));

  // Broke reference. TODO Enhance this, it is awful.
  return JSON.parse(JSON.stringify(cluster));
}

function reduceTocluster(acc, cur) {
  const v = cur.loc;
  const el = acc.find((r) => r && r.loc === v);
  if (el) {
    el.points.push(...cur.points);
  } else {
    acc.push({ loc: cur.loc, points: cur.points });
  }
  return acc;
}

function assignToCluster(clusters, keys, distances) {
  const clustersClone = JSON.parse(JSON.stringify(clusters));
  return keys
    .map((k) => calculateBestCluster(clustersClone, k, distances))
    .reduce(reduceTocluster, []);
}

function checkIfConverge(oldClusters, newClusters) {
  const oldPoints = oldClusters.map((oc) => oc.points);
  const newPoints = newClusters.map((nc) => nc.points);
  const result = oldPoints.filter((p, idx) => arrayStrictEqual(p, newPoints[idx]));
  return result.length === newPoints.length;
}

/**
 * Calculate the average (aka mean) of an array of numbers.
 * @param {Array<number>} numbers
 * @return {number}
 */
const average = (numbers) => numbers.reduce((sum, val) => sum + val, 0) / numbers.length;

function recalculateCentroid(clusters) {
  const cls = JSON.parse(JSON.stringify(clusters));

  return cls.map((c) => {
    const avg = average(c.points);
    return {
      loc: avg,
      points: [...c.points],
    };
  });
}

function calculateTimeUnits(clusters) {
  const cls = JSON.parse(JSON.stringify(clusters));
  const timeUnits = [];
  timeUnits[0] = cls[0].loc;
  timeUnits[1] = cls[1].loc;
  timeUnits[2] = cls[2].loc;

  return timeUnits;
}

function getConfig(clusters, keys, distances) {
  let isConverged = false;
  let assignedClusters;
  while (!isConverged) {
    const recalculatedClusters = recalculateCentroid(clusters);
    assignedClusters = assignToCluster(recalculatedClusters, keys, distances);
    isConverged = checkIfConverge(recalculatedClusters, assignedClusters);
  }

  const timeUnits = calculateTimeUnits(assignedClusters);

  return {
    timeUnits,
    clusters: assignedClusters,
  };
}

function calculateThresholds(timeUnits) {
  return [(timeUnits[0] + timeUnits[1]) / 2, (timeUnits[1] + timeUnits[2]) / 2];
}

function getElement(pulse, threshold1to3, threshold3to7) {
  const pulseType = pulse[0];
  const pulseLen = pulse.length;

  if (pulseType === '1') {
    if (pulseLen <= threshold1to3) return DIT;
    return DAH;
  }
  if (pulseLen >= threshold1to3 && pulseLen < threshold3to7) return CHARSEP;
  if (pulseLen >= threshold3to7) return WORDSEP;
  return INTRASEP;
}

function setupClusters(distances) {
  const keys = Object.keys(distances).map(parseFloat);
  const keysLen = keys.length;
  const timeUnits = [];

  if (keysLen === 1 || keysLen === 2) {
    const k0 = keys[0];
    timeUnits[0] = k0;
    timeUnits[1] = k0 * 3;
    timeUnits[2] = k0 * 7;

    return { timeUnits };
  }

  const clusters = getClusters(keys);
  return getConfig(clusters, keys, distances);
}

function decodeBits2MorseKM(bits) {
  const pulsesRaw = bits.match(SEPARATEPULSES);
  const pulses = cleanPulses(pulsesRaw);
  const distances = calculateDistance(pulses);

  const clusters = setupClusters(distances);
  const [threshold1to3, threshold3to7] = calculateThresholds(clusters.timeUnits);

  const morse = pulses.map((p) => getElement(p, threshold1to3, threshold3to7)).join('');

  logger.info('MORSE: ', morse);
  return morse;
}

console.log(
  decodeMorse2HumanDichotomy(
    decodeBits2MorseKM(
      '1100110011001100000011111100111111001111110000001100111111001100110000001100111111000000111111001111110000001100000011001111110011001100000011001100000000000000',
    ),
  ),
);
