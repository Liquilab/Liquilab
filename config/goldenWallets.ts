export interface GoldenWallet {
  label: string;
  address: string;
  description?: string;
}

export const GOLDEN_WALLETS: GoldenWallet[] = [
  {
    label: 'Pro Account',
    address: '0x57d294d815968f0efa722f1e8094da65402cd951',
    description: 'Pro subscription tier test wallet',
  },
  {
    label: 'Premium Account',
    address: '0x88ef07c79443efdf569c6e22aa21501d1702a8f7',
    description: 'Premium subscription tier test wallet',
  },
  {
    label: 'Whale Alpha',
    address: '0x7a8f9b2c1e4d6a3f8e9c2b1a7d4e6f3a8b9c2d1e',
    description: 'Large LP portfolio example',
  },
];




