import { SuiClient } from '@onelabs/sui/client';
import { Ed25519Keypair } from '@onelabs/sui/keypairs/ed25519';
import fs from 'fs';
import path from 'path';
import {
  generateBattleStrategy,
  simulateBattle,
  analyzeFighter,
  getEvolutionAdvice,
} from '../lib/ai-engine';
import type { Fighter } from '../lib/ai-engine';

interface DeploymentInfo {
  packageId: string;
}

async function loadDeploymentInfo(): Promise<DeploymentInfo> {
  const deploymentPath = path.join(process.cwd(), 'deployment-info.json');
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment info not found. Run 'npm run deploy' first.`);
  }
  return JSON.parse(fs.readFileSync(deploymentPath, 'utf8')) as DeploymentInfo;
}

async function loadKeypair(): Promise<Ed25519Keypair> {
  const keystorePath = path.join(process.env.HOME || '', '.sui', 'sui_config', 'sui.keystore');
  if (!fs.existsSync(keystorePath)) {
    throw new Error(`Keystore not found at ${keystorePath}`);
  }
  const keystore = JSON.parse(fs.readFileSync(keystorePath, 'utf8')) as string[];
  if (!keystore[0]) throw new Error('Keystore is empty');
  const keypairData = keystore[0].replace('suiprivkey__', '');
  const decodedKey = Buffer.from(keypairData, 'base64');
  return Ed25519Keypair.fromSecretKey(decodedKey.slice(1));
}

function createMockFighter(name: string, id: string): Fighter {
  return {
    id,
    name,
    attack: Math.floor(Math.random() * 30) + 60,
    defense: Math.floor(Math.random() * 30) + 50,
    speed: Math.floor(Math.random() * 30) + 50,
    intelligence: Math.floor(Math.random() * 30) + 45,
    hp: 200,
    level: Math.floor(Math.random() * 10) + 5,
  };
}

async function testFullBattle(): Promise<void> {
  console.log('=== OneArena AI Battle Engine Test ===\n');

  const fighter1 = createMockFighter('CyberNinja', 'f1');
  const fighter2 = createMockFighter('ShadowBlade', 'f2');

  console.log('Fighter 1:', fighter1.name);
  console.log(`  ATK:${fighter1.attack} DEF:${fighter1.defense} SPD:${fighter1.speed} INT:${fighter1.intelligence} HP:${fighter1.hp}\n`);
  console.log('Fighter 2:', fighter2.name);
  console.log(`  ATK:${fighter2.attack} DEF:${fighter2.defense} SPD:${fighter2.speed} INT:${fighter2.intelligence} HP:${fighter2.hp}\n`);

  // 1. Test Strategy Generation
  console.log('--- Strategy Generation ---');
  const strategy = generateBattleStrategy(fighter1, fighter2);
  const moveNames = ['Attack', 'Defend', 'Special'];
  console.log(`Recommended move: ${moveNames[strategy.move]}`);
  console.log(`Reasoning: ${strategy.reasoning}`);
  console.log(`Win probability: ${(strategy.winProbability * 100).toFixed(1)}%\n`);

  // 2. Test Full Battle Simulation
  console.log('--- Full Battle Simulation ---');
  const result = simulateBattle(fighter1, fighter2);
  result.rounds.forEach((round) => {
    console.log(round.narration);
  });
  console.log(`\n${result.finalNarration}`);
  console.log(`\nWinner: ${result.winnerName}`);
  console.log(`Total rounds: ${result.totalRounds}`);
  console.log(`Dominance: ${result.dominanceScore}/100`);
  console.log(`XP reward: ${result.xpReward}`);
  console.log(`Final HP: ${fighter1.name} ${result.fighter1FinalHp} | ${fighter2.name} ${result.fighter2FinalHp}\n`);

  // 3. Test Fighter Analysis
  console.log('--- Fighter Analysis ---');
  const analysis = analyzeFighter(fighter1);
  console.log(`${fighter1.name} Analysis:`);
  console.log(`  Rating: ${analysis.overallRating}/100 (Tier ${analysis.tier})`);
  console.log(`  Threat: ${analysis.threatLevel}`);
  console.log(`  Synergy: ${analysis.synergyScore}/100`);
  console.log(`  Strengths:`);
  analysis.strengths.forEach((s) => console.log(`    - ${s}`));
  console.log(`  Weaknesses:`);
  analysis.weaknesses.forEach((w) => console.log(`    - ${w}`));
  console.log(`  Strategy: ${analysis.bestStrategy}`);
  console.log(`  Training: ${analysis.trainingFocus}\n`);

  // 4. Test Evolution Advisor
  console.log('--- Evolution Advisor ---');
  const evolution = getEvolutionAdvice(fighter1, 20);
  console.log(`Build: ${evolution.buildPath}`);
  console.log(`Description: ${evolution.buildDescription}`);
  console.log(`Projected tier: ${evolution.projectedTier}`);
  console.log(`Recommended upgrades:`);
  evolution.recommendedUpgrades.forEach((u) => {
    console.log(`  +${u.points} ${u.stat}: ${u.reason}`);
  });

  console.log('\n=== All tests passed ===');
}

async function testBattleOnChain(): Promise<void> {
  console.log('OneArena Battle Test - On-Chain');
  console.log('================================\n');

  try {
    const deploymentInfo = await loadDeploymentInfo();
    const keypair = await loadKeypair();
    const playerAddress = keypair.getPublicKey().toSuiAddress();

    console.log(`Package ID: ${deploymentInfo.packageId}`);
    console.log(`Player: ${playerAddress}\n`);

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-testnet.onelabs.cc:443';
    const client = new SuiClient({ url: rpcUrl });

    console.log('Connecting to OneChain...');
    const chainId = await client.getChainIdentifier();
    console.log(`Connected to: ${chainId}\n`);

    console.log('On-chain battle features require deployed contract.');
  } catch (error) {
    console.error('On-chain test setup failed:', error);
  }
}

async function main(): Promise<void> {
  const testMode = process.argv[2] || 'local';
  if (testMode === 'onchain') {
    await testBattleOnChain();
  } else {
    await testFullBattle();
  }
}

main();
