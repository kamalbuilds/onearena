import { Ed25519Keypair } from '@onelabs/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@onelabs/sui/client';

const MNEMONIC = 'bone duck give iron cage embody tourist level belt endorse bright feature';

async function main() {
  // Derive keypair from mnemonic
  const keypair = Ed25519Keypair.deriveKeypair(MNEMONIC);
  const address = keypair.getPublicKey().toSuiAddress();

  console.log('=== OneChain Wallet Setup ===');
  console.log(`Address: ${address}`);
  console.log(`Public Key: ${keypair.getPublicKey().toBase64()}`);

  // Connect to testnet
  const client = new SuiClient({ url: getFullnodeUrl('testnet') });

  // Check balance
  const balance = await client.getBalance({ owner: address });
  console.log(`\nBalance: ${Number(balance.totalBalance) / 1e9} ONE`);

  // Try faucet
  console.log('\nRequesting testnet funds...');
  {

    // Try common faucet endpoints
    const faucetUrls = [
      'https://faucet-testnet.onelabs.cc/gas',
      'https://faucet.testnet.onelabs.cc/gas',
      'https://faucet-testnet.onelabs.cc/v1/gas',
      'https://rpc-testnet.onelabs.cc/faucet',
    ];

    for (const url of faucetUrls) {
      try {
        console.log(`Trying ${url}...`);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            FixedAmountRequest: { recipient: address }
          }),
        });
        const text = await res.text();
        console.log(`Status: ${res.status}, Response: ${text.slice(0, 500)}`);
        if (res.ok) {
          console.log('Faucet success!');
          break;
        }
      } catch (err: any) {
        console.log(`  Failed: ${err.message}`);
      }
    }
  }

  // Re-check balance
  const newBalance = await client.getBalance({ owner: address });
  console.log(`\nUpdated Balance: ${Number(newBalance.totalBalance) / 1e9} ONE`);
}

main().catch(console.error);
