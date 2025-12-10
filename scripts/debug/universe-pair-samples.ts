export type Dex = 'ENOSYS' | 'SPARKDEX';

export type PairSample = {
  label: string; // e.g. "WFLR/FXRP"
  token0Symbol: string;
  token1Symbol: string;
  pools: {
    dex: Dex;
    address: string;
  }[];
};

// Canonical pair samples for Universe tests/debugging
export const UNIVERSE_PAIR_SAMPLES: PairSample[] = [
  {
    label: 'WFLR/FXRP',
    token0Symbol: 'WFLR',
    token1Symbol: 'FXRP',
    pools: [
      { dex: 'SPARKDEX', address: '0x589689984a06e4640593edec64e415c415940c7f' },
      { dex: 'ENOSYS', address: '0xb4CB11a84CFbd8F6336Dc9417aC45c1F8E5B59E7' },
    ],
  },
  {
    label: 'WFLR/USDT0',
    token0Symbol: 'WFLR',
    token1Symbol: 'USDT0',
    pools: [
      { dex: 'SPARKDEX', address: '0x63873f0d7165689022feef1b77428df357b33dcf' },
      { dex: 'ENOSYS', address: '0x3C2a7B76795E58829FAAa034486D417dd0155162' },
    ],
  },
  {
    label: 'FXRP/USDT0',
    token0Symbol: 'FXRP',
    token1Symbol: 'USDT0',
    pools: [
      { dex: 'SPARKDEX', address: '0x88D46717b16619B37fa2DfD2F038DEFB4459F1F7' },
      { dex: 'ENOSYS', address: '0x686f53F0950Ef193C887527eC027E6A574A4DbE1' },
    ],
  },
  {
    label: 'SFLR/WFLR',
    token0Symbol: 'SFLR',
    token1Symbol: 'WFLR',
    pools: [
      { dex: 'SPARKDEX', address: '0xc9baba3f36ccaa54675deecc327ec7eaa48cb97d' },
      { dex: 'ENOSYS', address: '0x25B4f3930934F0A3CbB885C624EcEe75a2917144' },
    ],
  },
];
