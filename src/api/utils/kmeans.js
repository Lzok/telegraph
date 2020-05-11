const { arrayStrictEqual } = require('./arrays');
const { SEPARATEPULSES, TRIMZEROS } = require('../../constants/regexes');
const {
  DIT, DAH, INTRASEP, CHARSEP, WORDSEP,
} = require('../../constants/morse');

/**
 * Calculate the distance of the pulses.
 *
 * @param {string[]} pulses - An array of pulses of 0s and 1s like ['000', '111', '00']
 * @return {Object} Retuns an object containing key=pulse lengh and value=quantity of pulses
 *                    with the key lenght
 */
function calculateDistance(pulses) {
  return pulses.reduce((acc, cur) => {
    const len = cur.length;
    if (acc[len]) acc[len] += 1;
    else acc[len] = 1;

    return acc;
  }, {});
}

/**
 * @typedef {Object} InitCluster
 * @property {number} centroid - Centroid value
 */

/**
 * Return the initialized clusters (3).
 *
 * @param {number[]} keys - An array of pulses of 0s and 1s like ['000', '111', '00']
 * @return {InitCluster[]}
 */
function getClusters(keys) {
  const cluster1 = {
    centroid: keys[0],
  };
  const cluster2 = {
    centroid: Math.round((keys[keys.length - 1] + keys[0]) / 2),
  };
  const cluster3 = {
    centroid: keys[keys.length - 1],
  };

  return [cluster1, cluster2, cluster3];
}

/**
 * @typedef {Object} Cluster
 * @property {number} centroid - Centroid value
 * @property {number[]} points - Points associated with the cluster
 */

/**
 * Calculate the best cluster for the given value (key) and associate
 * the points to that cluster.
 *
 * @param {Cluster[]} clusters - Array of clusters.
 * @param {number} key - Value to be associated with a cluster.
 * @param {Object} distances - Calculated distances of the pulses.
 * @return {Cluster} cluster - Returns the nearest cluster to the key with the points associated.
 */
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

/**
 * Receive the array of clusters and keys to be associated with the nearest
 * clusters.
 *
 * @param {Cluster[]} clusters - Array of clusters.
 * @param {number[]} keys - Values to be associated with its nearest cluster.
 * @param {Object} distances - Calculated distances of the pulses.
 * @return {Cluster[]} clusters - Returns the clusters with the associated keys and points.
 */
function assignToCluster(clusters, keys, distances) {
  const clustersClone = JSON.parse(JSON.stringify(clusters));
  return keys
    .map((k) => calculateBestCluster(clustersClone, k, distances))
    .reduce(reduceTocluster, []);
}

/**
 * Check if two arrays of clusters are equals or not.
 *
 * @param {Cluster[]} oldClusters - Array of clusters.
 * @param {Cluster[]} newClusters - Array of clusters.
 * @return {boolean} Return true if the oldClusters and newClusters are equals.
 */
function checkIfConverge(oldClusters, newClusters) {
  const oldPoints = oldClusters.map((oc) => oc.points);
  const newPoints = newClusters.map((nc) => nc.points);
  const result = oldPoints.filter((p, idx) => arrayStrictEqual(p, newPoints[idx]));

  // Assume if the lengths are the same is because the clusters did not change. So they converged.
  return result.length === newPoints.length;
}

/**
 * Calculate the average (aka mean) of an array of numbers.
 * @param {Array<number>} numbers
 * @return {number}
 */
const average = (numbers) => numbers.reduce((sum, val) => sum + val, 0) / numbers.length;

/**
 * Recalculate the centroid of the clusters and update them.
 *
 * @param {Cluster[]} clusters - Array of clusters.
 * @return {Cluster[]} Return the clusters with the updated centroids.
 */
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

/**
 * Given an array of clusters, calculate the timeUnits.
 *
 * @param {Cluster[]} clusters - Array of clusters.
 * @return {number[]} Return the array of timeUnits
 */
function calculateTimeUnits(clusters) {
  const cls = JSON.parse(JSON.stringify(clusters));
  const timeUnits = [
    Math.round(cls[0].centroid),
    Math.round(cls[1].centroid),
    Math.round(cls[2].centroid + 1),
  ];

  return timeUnits;
}

/**
 * @typedef {Object} Config
 * @property {Clusters[]} clusters - Array of clusters
 * @property {number[]} timeUnits - timeUnits for the clusters.
 */

/**
 * Calculate the necessary values to make the config to be used later.
 *
 * @param {Cluster[]} clusters - Array of clusters.
 * @param {number[]} keys - Values to be associated with its nearest cluster.
 * @param {Object} distances - Calculated distances of the pulses.
 * @return {Config} config - Return the config.
 */
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

/**
 * Given the timeUnits, calculate the thresholds.
 *
 * @param {number[]} timeUnits
 * @return {number[]} Return the calculated thresholds
 */
function calculateThresholds(timeUnits) {
  const threshold1to3 = Math.round(((timeUnits[0] + timeUnits[1]) / 2) * 1.1);
  const threshold3to7 = Math.round(((timeUnits[1] + timeUnits[2]) / 2) * 0.94);

  return [threshold1to3, threshold3to7];
}

/**
 * Based on the pulse and the thresholds, return the correspond element in morse.
 *
 * @param {string} pulse - A pulse e.g '1111'
 * @param {number} threshold1to3 - Threshold between duration 1 to 3.
 * @param {number} threshold3to7 - Threshold between duration 3 to 7
 * @return {string} The corresponding morse element -> .|-| |   |.
 */
function getElement(pulse, threshold1to3, threshold3to7) {
  const pulseType = pulse[0];
  const pulseLen = pulse.length;

  if (pulseType === '1') {
    if (pulseLen < threshold1to3) return DIT;
    return DAH;
  }
  if (pulseLen >= threshold1to3 && pulseLen <= threshold3to7) return CHARSEP;
  if (pulseLen > threshold3to7) return WORDSEP;
  return INTRASEP;
}

/**
 * Setup the clusters and return the configs
 *
 * @param {Object} distances - Calculated distances of the pulses.
 * @return {Config}
 */
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

/**
 * Given a string of bits, translates it into morse code.
 * The bits may be in perfect or imperfect timing
 *
 * @param {string} bits - String of bits
 * @return {string} string in morse
 */
function decodeBits2MorseKM(bits) {
  const pulses = bits.replace(TRIMZEROS, '').match(SEPARATEPULSES);
  const distances = calculateDistance(pulses);
  const clusters = setupKMeansClusters(distances);
  const [threshold1to3, threshold3to7] = calculateThresholds(clusters.timeUnits);

  const morse = pulses.map((p) => getElement(p, threshold1to3, threshold3to7)).join('');
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
