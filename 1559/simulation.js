/**
 * simulation.js
 * 
 * Extracted simulation engine for ETC fee mechanism exploration.
 * All functions are pure (deterministic) and use seeded RNG for reproducibility.
 * 
 * Exports as CommonJS for browser compatibility.
 */

// ============================================================================
// CONSTANTS & UNITS
// ============================================================================

const GWEI_TO_ETC = 1e-9;
const M_GAS = 1_000_000;
const ERA_BLOCKS = 5_000_000;
const ERA_REDUCTION = 0.20;
const INITIAL_REWARD = 5;
const GENESIS_SUPPLY = 72_000_000;
const MAX_BASE_FEE_GWEI = 100_000;
const NUM_MINERS = 5;

// ============================================================================
// MONETARY POLICY (ECIP-1017)
// ============================================================================

function rewardForEra(era) {
  return INITIAL_REWARD * Math.pow(1 - ERA_REDUCTION, era);
}

function issuedThroughFullEras(era) {
  if (era <= 0) return 0;
  const r = 1 - ERA_REDUCTION;
  return ERA_BLOCKS * INITIAL_REWARD * ((1 - Math.pow(r, era)) / (1 - r));
}

function issuanceAtBlock(h) {
  const era = Math.floor(h / ERA_BLOCKS);
  const inEra = h % ERA_BLOCKS;
  return issuedThroughFullEras(era) + inEra * rewardForEra(era);
}

function supplyFromHeight(h) {
  return GENESIS_SUPPLY + issuanceAtBlock(h);
}

// ============================================================================
// DEMAND & BASE FEE MODEL
// ============================================================================

function safeNum(x, fallback = 0) {
  return Number.isFinite(x) ? x : fallback;
}

function updateBaseFee(prev, gasUsed, targetGas, use1559) {
  if (!use1559) return 0;
  
  const delta = gasUsed - targetGas;
  if (delta === 0) return prev;
  
  const maxChangeDen = 8;
  const amount = Math.floor(
    (Math.abs(prev) * Math.abs(delta)) / Math.max(1, targetGas) / maxChangeDen
  );
  
  let next = delta > 0 ? prev + Math.max(1, amount) : prev - Math.max(1, amount);
  
  if (next < 0) next = 0;
  if (next > MAX_BASE_FEE_GWEI) next = MAX_BASE_FEE_GWEI;
  
  return next;
}

function demandAfterPrice(baselineMgas, baseFeeGwei, priceK) {
  const factor = 1 / (1 + safeNum(baseFeeGwei / Math.max(1e-9, priceK), 0));
  return Math.max(0, baselineMgas * factor);
}

// ============================================================================
// DETERMINISTIC RNG
// ============================================================================

function makeLCG(seed) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// ============================================================================
// MINER DISTRIBUTION MODES
// ============================================================================

function pickEqualMiner(blockIndex) {
  return blockIndex % NUM_MINERS;
}

function pickWeightedMiner(rand) {
  const r = rand();
  if (r < 0.40) return 0;
  if (r < 0.70) return 1;
  if (r < 0.90) return 2;
  if (r < 0.95) return 3;
  return 4;
}

function rule110(n) {
  return (
    n === 0b111 ? 0 : n === 0b110 ? 1 : n === 0b101 ? 1 : n === 0b100 ? 0 :
    n === 0b011 ? 1 : n === 0b010 ? 1 : n === 0b001 ? 1 : 0
  );
}

function makeRule110Picker(seed) {
  const rand = makeLCG(seed);
  const N = 32;
  
  let state = Array.from({ length: N }, () => (rand() < 0.5 ? 1 : 0));
  
  const churn = Array.from({ length: NUM_MINERS }, (_, m) => ({
    phase: Math.floor(rand() * 200),
    period: 400 + m * 37,
    window: 40 + m * 7,
  }));
  
  let t = 0;
  
  const active = (m) => {
    const { phase, period, window } = churn[m];
    const x = (t + phase) % period;
    return !(x < window);
  };
  
  return () => {
    const next = new Array(N);
    for (let i = 0; i < N; i++) {
      const L = state[(i - 1 + N) % N];
      const C = state[i];
      const R = state[(i + 1) % N];
      next[i] = rule110((L << 2) | (C << 1) | R);
    }
    state = next;
    
    let h = 0;
    for (let i = 0; i < N; i++) {
      h = (h * 131 + state[i]) >>> 0;
    }
    let idx = h % NUM_MINERS;
    
    if (!active(idx)) {
      for (let k = 0; k < NUM_MINERS; k++) {
        idx = (idx + 1) % NUM_MINERS;
        if (active(idx)) break;
      }
    }
    
    t += 1;
    return idx;
  };
}

function makeMinerPicker(mode, rngSeed) {
  if (mode === "equal") {
    return (blockIndex) => pickEqualMiner(blockIndex);
  }
  
  if (mode === "weighted") {
    const rand = makeLCG(rngSeed);
    return () => pickWeightedMiner(rand);
  }
  
  if (mode === "automaton") {
    const picker = makeRule110Picker(rngSeed);
    return () => picker();
  }
  
  throw new Error(`Unknown miner mode: ${mode}`);
}

// ============================================================================
// ℓ-SMOOTHING BUFFER
// ============================================================================

function pushPayForward(buffer, amount, ellWindow) {
  if (ellWindow > 0 && amount > 0) {
    buffer.push({ amount: amount / ellWindow, blocksRemaining: ellWindow });
  }
}

function collectPayForward(buffer) {
  let collected = 0;
  
  for (let k = 0; k < buffer.length; k++) {
    if (buffer[k].blocksRemaining > 0) {
      collected += buffer[k].amount;
      buffer[k].blocksRemaining -= 1;
    }
  }
  
  for (let k = buffer.length - 1; k >= 0; k--) {
    if (buffer[k].blocksRemaining <= 0) {
      buffer.splice(k, 1);
    }
  }
  
  return collected;
}

// ============================================================================
// CORE BLOCK-BY-BLOCK SIMULATOR
// ============================================================================

function simulateBlock(state, params, blockIndex, pickMiner, payForwardBuffer) {
  const {
    scenario,
    targetBlockSize,
    demandLevel,
    priceK,
    tipsGwei,
    use1559,
  } = params;

  const jitter = Math.sin(blockIndex / 3) * 3 + Math.sin(blockIndex / 7) * 2;

  const priced = demandAfterPrice(
    Math.max(0, demandLevel + jitter),
    state.baseFee,
    priceK
  );

  const maxBlockSize = use1559 ? targetBlockSize * 2 : targetBlockSize;
  const blockSizeGas = Math.min(priced, maxBlockSize) * M_GAS;

  const era = Math.floor(state.blockHeight / ERA_BLOCKS);
  const emission = rewardForEra(era);

  const baseFeeRevenue = use1559
    ? safeNum(state.baseFee * blockSizeGas * GWEI_TO_ETC)
    : 0;
  const tipRevenue = safeNum(tipsGwei * blockSizeGas * GWEI_TO_ETC);

  const burned = baseFeeRevenue * scenario.burnFraction;
  const toContract = baseFeeRevenue * scenario.contractFraction;
  const toPayForward = baseFeeRevenue * scenario.payForwardFraction;

  pushPayForward(payForwardBuffer, toPayForward, scenario.ellWindow);
  const payForwardReceived = collectPayForward(payForwardBuffer);

  const immediateBaseFeeToMiner = baseFeeRevenue - burned - toContract - toPayForward;
  const minerRevenue = emission + immediateBaseFeeToMiner + tipRevenue + payForwardReceived;

  const minerIndex = pickMiner(blockIndex);

  const baseFeeNext = updateBaseFee(
    state.baseFee,
    blockSizeGas,
    targetBlockSize * M_GAS,
    use1559
  );

  const supplyDelta = emission - burned;

  return {
    blockHeight: state.blockHeight,
    blockSizeGas,
    baseFee: state.baseFee,
    emission,
    baseFeeRevenue,
    tipRevenue,
    burned,
    toContract,
    toPayForward,
    payForwardReceived,
    minerRevenue,
    minerIndex,
    baseFeeNext,
    supplyDelta,
  };
}

function runSimulation(params) {
  const {
    startingBlockHeight,
    startingSupply,
    numBlocks,
    scenario,
    minerMode,
    rngSeed,
    use1559,
    initialBaseFee,
  } = params;

  const state = {
    baseFee: use1559 ? initialBaseFee : 0,
    totalSupply: startingSupply,
    blockHeight: startingBlockHeight,
  };

  const payForwardBuffer = [];
  const pickMiner = makeMinerPicker(minerMode, rngSeed);

  const minerRev = new Array(NUM_MINERS).fill(0);
  const minerBlocks = new Array(NUM_MINERS).fill(0);

  const blocks = [];

  for (let i = 0; i < numBlocks; i++) {
    const block = simulateBlock(state, params, i, pickMiner, payForwardBuffer);

    blocks.push(block);

    minerRev[block.minerIndex] += block.minerRevenue;
    minerBlocks[block.minerIndex] += 1;

    state.baseFee = block.baseFeeNext;
    state.totalSupply += block.supplyDelta;
    state.blockHeight += 1;
  }

  const minerStats = minerRev.map((rev, i) => ({
    miner: i + 1,
    blocksWon: minerBlocks[i],
    totalRevenue: rev,
    avgRevenuePerWonBlock: minerBlocks[i] > 0 ? rev / minerBlocks[i] : 0,
  }));

  return { blocks, minerStats, finalState: state };
}

function summarizeSimulation(blocks, startingSupply, minerStats) {
  const n = blocks.length;

  if (n === 0) {
    return {
      simulatedBlocks: 0,
      totalEmitted: 0,
      totalBurned: 0,
      totalToContract: 0,
      totalMinerRevenue: 0,
      totalBaseFeeRevenue: 0,
      avgBaseFee: 0,
      avgBaseFeeRevenue: 0,
      finalSupply: startingSupply,
      netSupplyChange: 0,
      avgBlockReward: 0,
      avgBaseFeeToMiner: 0,
      avgTips: 0,
      avgPayForward: 0,
      avgMinerRevenue: 0,
      perMiner: minerStats,
    };
  }

  let sumEmission = 0;
  let sumBurned = 0;
  let sumToContract = 0;
  let sumMinerRevenue = 0;
  let sumTips = 0;
  let sumImmediateBaseFeeToMiner = 0;
  let sumBaseFeeRevenue = 0;
  let sumPayForwardReceived = 0;
  let sumBaseFeePrice = 0;

  for (let i = 0; i < n; i++) {
    const b = blocks[i];
    sumEmission += b.emission;
    sumBurned += b.burned;
    sumToContract += b.toContract;
    sumMinerRevenue += b.minerRevenue;
    sumTips += b.tipRevenue;
    sumImmediateBaseFeeToMiner += b.baseFeeRevenue - b.burned - b.toContract - b.toPayForward;
    sumBaseFeeRevenue += b.baseFeeRevenue;
    sumPayForwardReceived += b.payForwardReceived;
    sumBaseFeePrice += b.baseFee;
  }

  const finalSupply = startingSupply + sumEmission - sumBurned;

  return {
    simulatedBlocks: n,
    totalEmitted: sumEmission,
    totalBurned: sumBurned,
    totalToContract: sumToContract,
    totalMinerRevenue: sumMinerRevenue,
    totalBaseFeeRevenue: sumBaseFeeRevenue,
    avgBaseFee: sumBaseFeePrice / n,
    avgBaseFeeRevenue: sumBaseFeeRevenue / n,
    finalSupply,
    netSupplyChange: finalSupply - startingSupply,
    avgBlockReward: sumEmission / n,
    avgBaseFeeToMiner: sumImmediateBaseFeeToMiner / n,
    avgTips: sumTips / n,
    avgPayForward: sumPayForwardReceived / n,
    avgMinerRevenue: sumMinerRevenue / n,
    perMiner: minerStats,
  };
}

function simulate(params) {
  const { blocks, minerStats } = runSimulation(params);
  return summarizeSimulation(blocks, params.startingSupply, minerStats);
}

// ============================================================================
// COMMONJS EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GWEI_TO_ETC,
    M_GAS,
    ERA_BLOCKS,
    ERA_REDUCTION,
    INITIAL_REWARD,
    GENESIS_SUPPLY,
    MAX_BASE_FEE_GWEI,
    NUM_MINERS,
    rewardForEra,
    issuedThroughFullEras,
    issuanceAtBlock,
    supplyFromHeight,
    safeNum,
    updateBaseFee,
    demandAfterPrice,
    makeLCG,
    pickEqualMiner,
    pickWeightedMiner,
    rule110,
    makeRule110Picker,
    makeMinerPicker,
    pushPayForward,
    collectPayForward,
    simulateBlock,
    runSimulation,
    summarizeSimulation,
    simulate,
  };
}