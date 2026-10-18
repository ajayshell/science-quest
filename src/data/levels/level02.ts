import type { LevelDef } from './types.ts';

export const level02: LevelDef = {
  id: 'w1-build-atom',
  number: 2,
  world: 1,
  title: 'Build an Atom',
  summary: 'Drag protons, neutrons, and electrons to build neutral atoms from hydrogen through neon.',
  how: 'Drop protons and neutrons on the nucleus. Drop electrons on the shells. You can also tap a particle to add one. Then press Check.',
  parSeconds: 150,
  speedMs: 28000,
  cardIds: ['H', 'C', 'Ne'],
  kind: 'atom',
  challenges: [
    {
      symbol: 'H',
      massNumber: 1,
      hint: 'Hydrogen-1 has 1 proton, 0 neutrons, and 1 electron. Mass number 1 means there is no neutron.',
    },
    {
      symbol: 'He',
      massNumber: 4,
      hint: 'Helium-4 has 2 protons, 2 neutrons, and 2 electrons. The first shell holds both electrons.',
    },
    {
      symbol: 'C',
      massNumber: 12,
      hint: 'Carbon-12 has 6 protons, 6 neutrons, and 6 electrons. Neutrons = 12 − 6.',
    },
    {
      symbol: 'O',
      massNumber: 16,
      hint: 'Oxygen-16 has 8 protons, 8 neutrons, and 8 electrons.',
    },
    {
      symbol: 'Ne',
      massNumber: 20,
      hint: 'Neon-20 has 10 protons, 10 neutrons, and 10 electrons. The shells fill 2, then 8.',
    },
  ],
};
