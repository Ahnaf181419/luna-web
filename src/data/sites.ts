import type { SiteDossier } from '../types';

export const SITES: SiteDossier[] = [
  {
    id: 'TRANQPIT1',
    name: 'Mare Tranquillitatis Pit (MTP)',
    lat: 8.33,
    lon: 33.22,
    dtmResolution: '0.8 m/px',
    geologicalUnit: 'Mare',
    candidateCount: 14,
    primaryAnchor: true,
    description: 'The sole radar-evidenced lava tube conduit on the Moon today. Vertical collapse skylight with subsurface lateral opening evidenced by Mini-RF and radar sounding echoes.'
  },
  {
    id: 'MARIUS',
    name: 'Marius Hills Volcanic Complex',
    lat: 14.09,
    lon: 303.23, // ~ -56.77°W
    dtmResolution: '1.0 m/px',
    geologicalUnit: 'Mare',
    candidateCount: 42,
    description: 'Prominent sinuous rille complex featuring the deep Marius Hills Pit skylight and multiple collinear surface subsidence sags without impact ejecta.'
  },
  {
    id: 'INGENIIPIT',
    name: 'Mare Ingenii Farside Basin',
    lat: -35.95,
    lon: 166.06,
    dtmResolution: '1.2 m/px',
    geologicalUnit: 'Mare',
    candidateCount: 38,
    description: 'Farside lunar swirl environment. Deep irregular pit collapse within ancient mare basalt deposits, exhibiting prominent talus ramp geometry.'
  },
  {
    id: 'PHILOLAUS',
    name: 'Philolaus Polar Crater',
    lat: 72.10,
    lon: 327.50, // ~ -32.5°W
    dtmResolution: '1.5 m/px',
    geologicalUnit: 'Polar',
    candidateCount: 19,
    description: 'High-latitude polar pit complex. Deep shadows suggest permanent cold-trap thermal stability and possible volatile preservation within subsurface entryways.'
  },
  {
    id: 'FECUNPIT',
    name: 'Mare Fecunditatis Depressions',
    lat: -0.92,
    lon: 48.66,
    dtmResolution: '1.0 m/px',
    geologicalUnit: 'Mare',
    candidateCount: 12,
    description: 'Equatorial low-slope basalt sheets displaying subtle collinear collapse troughs and chain depressions with visual inspection backlog pending.'
  },
  {
    id: 'TYCHOPK',
    name: 'Tycho Central Peak Impact Melt',
    lat: -43.31,
    lon: 348.64,
    dtmResolution: '1.8 m/px',
    geologicalUnit: 'Impact Melt',
    candidateCount: 8,
    description: 'Highland impact melt ponds exhibiting drainage channels and hollow flow features formed by rapid cooling of impact melt sheets.'
  },
  {
    id: 'HYGINUS',
    name: 'Rima Hyginus Volcanic Graben',
    lat: 7.77,
    lon: 6.27,
    dtmResolution: '1.1 m/px',
    geologicalUnit: 'Mare',
    candidateCount: 26,
    description: 'Prominent linear graben interrupted by rimless collapse pits formed by internal explosive gas venting or magma withdrawal along fault planes.'
  },
  {
    id: 'HADLEY',
    name: 'Rima Hadley (Apollo 15)',
    lat: 25.80,
    lon: 3.65,
    dtmResolution: '0.9 m/px',
    geologicalUnit: 'Mare',
    candidateCount: 31,
    description: 'Historic meandering sinuous rille flanking the Apennine Mountain front. High-resolution DTM models reveal subtle terrace overhangs.'
  }
];
