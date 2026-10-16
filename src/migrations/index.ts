import * as migration_20261015_182900_initial from './20261015_182900_initial';
import * as migration_20261015_190000_search_indexes from './20261015_190000_search_indexes';
import * as migration_20261015_201754_obroci from './20261015_201754_obroci';
import * as migration_20261015_205954_zajednica from './20261015_205954_zajednica';
import * as migration_20261016_101612_obroci_clanci from './20261016_101612_obroci_clanci';
import * as migration_20261016_102944_izvori from './20261016_102944_izvori';
import * as migration_20261016_104017_ideje_plan from './20261016_104017_ideje_plan';
import * as migration_20261016_141611_oznake_sastav from './20261016_141611_oznake_sastav';
import * as migration_20261016_214542_urednicki_tekst from './20261016_214542_urednicki_tekst';

export const migrations = [
  {
    up: migration_20261015_182900_initial.up,
    down: migration_20261015_182900_initial.down,
    name: '20261015_182900_initial',
  },
  {
    up: migration_20261015_190000_search_indexes.up,
    down: migration_20261015_190000_search_indexes.down,
    name: '20261015_190000_search_indexes',
  },
  {
    up: migration_20261015_201754_obroci.up,
    down: migration_20261015_201754_obroci.down,
    name: '20261015_201754_obroci',
  },
  {
    up: migration_20261015_205954_zajednica.up,
    down: migration_20261015_205954_zajednica.down,
    name: '20261015_205954_zajednica',
  },
  {
    up: migration_20261016_101612_obroci_clanci.up,
    down: migration_20261016_101612_obroci_clanci.down,
    name: '20261016_101612_obroci_clanci',
  },
  {
    up: migration_20261016_102944_izvori.up,
    down: migration_20261016_102944_izvori.down,
    name: '20261016_102944_izvori',
  },
  {
    up: migration_20261016_104017_ideje_plan.up,
    down: migration_20261016_104017_ideje_plan.down,
    name: '20261016_104017_ideje_plan',
  },
  {
    up: migration_20261016_141611_oznake_sastav.up,
    down: migration_20261016_141611_oznake_sastav.down,
    name: '20261016_141611_oznake_sastav',
  },
  {
    up: migration_20261016_214542_urednicki_tekst.up,
    down: migration_20261016_214542_urednicki_tekst.down,
    name: '20261016_214542_urednicki_tekst'
  },
];
