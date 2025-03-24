import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { SuiClient } from '@onelabs/sui/client';
import { Ed25519Keypair } from '@onelabs/sui/keypairs/ed25519';
import { Transaction } from '@onelabs/sui/transactions';

interface DeploymentInfo {
  packageId: string;
  publishTxDigest: string;
  deployerAddress: string;
  networkUrl: string;
  timestamp: string;
  contractName: string;
  version: string;
}

async function loadKeypair(): Promise<Ed25519Keypair> {
  const mnemonic = process.env.MNEMONIC || 'bone duck give iron cage embody tourist level belt endorse bright feature';
  return Ed25519Keypair.deriveKeypair(mnemonic);
}

async function buildContract(): Promise<void> {
  console.log('Building Move contract...');
  const contractDir = path.join(process.cwd(), 'contract');

  try {
    execSync('sui move build', {
      cwd: contractDir,
      stdio: 'inherit',
    });
    console.log('Contract built successfully!');
  } catch (error) {
    throw new Error(`Failed to build contract: ${error}`);
  }
}

async function publishContract(
  client: SuiClient,
  keypair: Ed25519Keypair,
): Promise<{ packageId: string; digest: string }> {
  console.log('Publishing contract to OneChain testnet...');

  const contractDir = path.join(process.cwd(), 'contract');
  const buildDir = path.join(contractDir, 'build', 'one_arena');

  if (!fs.existsSync(buildDir)) {
    throw new Error(`Build directory not found at ${buildDir}. Run 'sui move build' first.`);
  }

  // Read the compiled module
  const moduleDir = path.join(buildDir, 'bytecode_modules');
  if (!fs.existsSync(moduleDir)) {
    throw new Error(`Module directory not found at ${moduleDir}`);
  }

  const modules = fs
    .readdirSync(moduleDir)
    .filter((f) => f.endsWith('.mv'))
    .map((f) => fs.readFileSync(path.join(moduleDir, f)));

  if (modules.length === 0) {
    throw new Error('No compiled modules found');
  }

  // On-chain framework dependencies (standard Sui addresses)
  const dependencies = [
    '0x0000000000000000000000000000000000000000000000000000000000000001', // MoveStdlib
    '0x0000000000000000000000000000000000000000000000000000000000000002', // Sui framework
  ];

  // Create publish transaction
  const tx = new Transaction();
  tx.setSender(keypair.getPublicKey().toSuiAddress());

  const upgradeCap = tx.publish({
    modules: modules.map((m) => Array.from(m)),
    dependencies,
  });

  // Transfer upgrade cap to deployer
  tx.transferObjects([upgradeCap], keypair.getPublicKey().toSuiAddress());

  // Build transaction bytes
  const txBytes = await tx.build({ client });

  // Sign transaction
  const signatureResult = await keypair.signTransaction(txBytes);

  // Execute transaction
  const response = await client.executeTransactionBlock({
    transactionBlock: signatureResult.bytes,
    signature: signatureResult.signature,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });

  if (!response.effects?.status.status || response.effects.status.status !== 'success') {
    throw new Error(`Transaction failed: ${response.effects?.status.error}`);
  }

  // Extract package ID from events or effects
  let packageId = '';

  // Look for publish event
  if (response.events) {
    for (const event of response.events) {
      if (event.type.includes('::publish')) {
        packageId = (event.parsedJson as Record<string, string>).package;
        break;
      }
    }
  }

  // Fallback: try to extract from created objects
  if (!packageId && response.effects?.created) {
    const publishedPackage = response.effects.created.find((obj) => obj.owner === 'Immutable');
    if (publishedPackage) {
      packageId = publishedPackage.reference.objectId;
    }
  }

  if (!packageId) {
    throw new Error('Could not extract package ID from transaction');
  }

  console.log(`Package published! Package ID: ${packageId}`);

  return {
    packageId,
    digest: response.digest,
  };
}

async function saveDeploymentInfo(info: DeploymentInfo): Promise<void> {
  const outputPath = path.join(process.cwd(), 'deployment-info.json');

  fs.writeFileSync(outputPath, JSON.stringify(info, null, 2));
  console.log(`Deployment info saved to ${outputPath}`);
}

async function deploy(): Promise<void> {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-testnet.onelabs.cc:443';

  console.log('OneChain Deployment Script');
  console.log('==========================');
  console.log(`Network: ${rpcUrl}`);
  console.log();

  try {
    // Load keypair
    console.log('Loading keypair...');
    const keypair = await loadKeypair();
    const deployerAddress = keypair.getPublicKey().toSuiAddress();
    console.log(`Deployer address: ${deployerAddress}`);
    console.log();

    // Initialize client
    const client = new SuiClient({ url: rpcUrl });

    // Check network connection
    console.log('Checking network connection...');
    const chainId = await client.getChainIdentifier();
    console.log(`Connected to chain: ${chainId}`);
    console.log();

    // Build contract
    await buildContract();
    console.log();

    // Publish contract
    const { packageId, digest } = await publishContract(client, keypair);
    console.log();

    // Save deployment info
    const deploymentInfo: DeploymentInfo = {
      packageId,
      publishTxDigest: digest,
      deployerAddress,
      networkUrl: rpcUrl,
      timestamp: new Date().toISOString(),
      contractName: 'one_arena',
      version: '0.1.0',
    };

    await saveDeploymentInfo(deploymentInfo);
    console.log();

    console.log('Deployment successful!');
    console.log(`Package ID: ${packageId}`);
    console.log(`Transaction Digest: ${digest}`);
    console.log();
    console.log('Next steps:');
    console.log('1. Add NEXT_PUBLIC_PACKAGE_ID to your .env.local');
    console.log('2. Update app components to use the new package ID');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deploy();
