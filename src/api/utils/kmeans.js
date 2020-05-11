const { arrayStrictEqual } = require('./arrays');
const { SEPARATEPULSES, TRIMZEROS } = require('../../constants/regexes');
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

// Arbitrary 3 clusters.
function getClusters(keys) {
  const cluster1 = {
    centroid: keys[0],
  };
  const cluster2 = {
    centroid: (keys[keys.length - 1] + keys[0]) / 2,
  };
  const cluster3 = {
    centroid: keys[keys.length - 1],
  };

  return [cluster1, cluster2, cluster3];
}

function calculateBestCluster(clusters, key, distances) {
  const init = {
    cluster: null,
    centroid: Number.MAX_SAFE_INTEGER,
  };

  const { cluster } = clusters.reduce((acc, cur) => {
    const distance = Math.abs(cur.centroid - key);

    return distance < acc.centroid ? { cluster: cur, centroid: distance } : acc;
  }, init);

  cluster.points = [];
  const limit = distances[key];
  cluster.points.push(...Array(limit).fill(key));

  // Broke reference. TODO Enhance this, it is awful.
  return JSON.parse(JSON.stringify(cluster));
}

function reduceTocluster(acc, cur) {
  const v = cur.centroid;
  const el = acc.find((r) => r && r.centroid === v);
  if (el) {
    el.points.push(...cur.points);
  } else {
    acc.push({ centroid: cur.centroid, points: cur.points });
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
      centroid: avg,
      points: [...c.points],
    };
  });
}

function calculateTimeUnits(clusters) {
  const cls = JSON.parse(JSON.stringify(clusters));
  const timeUnits = [cls[0].centroid, cls[1].centroid, cls[2].centroid];

  return timeUnits;
}

function getConfig(clusters, keys, distances) {
  const clustersClone = JSON.parse(JSON.stringify(clusters));
  let isConverged = false;
  let assignedClusters = assignToCluster(clustersClone, keys, distances);

  while (!isConverged) {
    const recalculatedClusters = recalculateCentroid(assignedClusters);
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
  const threshold1to3 = Math.round(((timeUnits[0] + timeUnits[1]) / 2) * 1.1);
  const threshold3to7 = (timeUnits[1] + timeUnits[2]) / 2;

  return [threshold1to3, threshold3to7];
}

function getElement(pulse, threshold1to3, threshold3to7) {
  const pulseType = pulse[0];
  const pulseLen = pulse.length;

  if (pulseType === '1') {
    if (pulseLen < threshold1to3) return DIT;
    return DAH;
  }
  if (pulseLen >= threshold1to3 && pulseLen < threshold3to7) return CHARSEP;
  if (pulseLen >= threshold3to7) return WORDSEP;
  return INTRASEP;
}

function setupKMeansClusters(distances) {
  const keys = Object.keys(distances).map(parseFloat);
  const keysLen = keys.length;

  if (keysLen === 1 || keysLen === 2) {
    const k0 = keys[0];
    const timeUnits = [k0, k0 * 3, k0 * 7];

    return { timeUnits };
  }

  const clusters = getClusters(keys);
  return getConfig(clusters, keys, distances);
}

function decodeBits2MorseKM(bits) {
  logger.info('BITS: ', bits);
  const pulses = bits.replace(TRIMZEROS, '').match(SEPARATEPULSES);
  const distances = calculateDistance(pulses);

  const clusters = setupKMeansClusters(distances);
  const [threshold1to3, threshold3to7] = calculateThresholds(clusters.timeUnits);

  const morse = pulses.map((p) => getElement(p, threshold1to3, threshold3to7)).join('');

  logger.info('MORSE: ', morse);
  return morse;
}

module.exports = {
  assignToCluster,
  average,
  calculateBestCluster,
  calculateDistance,
  calculateThresholds,
  calculateTimeUnits,
  checkIfConverge,
  decodeBits2MorseKM,
  getClusters,
  getConfig,
  getElement,
  recalculateCentroid,
  reduceTocluster,
  setupKMeansClusters,
};
