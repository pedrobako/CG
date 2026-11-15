// ==================================================
// CONSTANTES GLOBAIS
// ==================================================

// ==================================================
// CORES
// ==================================================
const WHITE = [1.0, 1.0, 1.0];
const BLACK = [0.0, 0.0, 0.0];
const BLUE = [0.0, 0.0, 1.0];
const YELLOW = [1.0, 1.0, 0.0];
const GREEN = [0.0, 1.0, 0.0];
const RED = [1.0, 0.0, 0.0];
const PINK = [1.0, 0.0, 1.0];

// ====================================================================
// ÍNDICES DE REFERÊNCIA PARA OS TIPOS DE LUZES
// ====================================================================
const SUN_LIGHT = 0;
const AMBIENT_LIGHT = 1;
const FIRST_HEADLIGHT = 2;

// ==================================================
// CICLOS AMBIENTAIS
// ==================================================
const DAY = 0;
const DUSK = 1;
const SNOW = 2;
const FOG = 3;
const NIGHT = 4;
const DAWN = 5;

// ==================================================
// DIMENSÕES DA PISTA
// ==================================================
const TRACK_WIDTH = 4.0;
const TRACK_LENGHT = 200.0;
const TRACK_LEFT_LIMIT = -TRACK_WIDTH / 2;
const TRACK_RIGHT_LIMIT = TRACK_WIDTH / 2;
const RACE_TRACK_TILE_LENGTH = 2.0;
//O carro pode estar em 3 posições na pista
// 1 lado esquerdo
// 2 centro
// 3 lado direito
const POS_LEFT = 1;
const POS_CENTER = 2;
const POS_RIGHT = 3;
const RIGHT_LIMIT_POS_LEFT = TRACK_LEFT_LIMIT + TRACK_WIDTH / 3;
const RIGHT_LIMIT_POS_CENTER = TRACK_LEFT_LIMIT + 2 * TRACK_WIDTH / 3;
const LEFT_LIMIT_POS_CENTER = RIGHT_LIMIT_POS_LEFT;
const LEFT_LIMIT_POS_RIGHT = RIGHT_LIMIT_POS_CENTER;

// ==================================================
// INDICADOR DE ULTRAPASSAGENS
// ==================================================
const NOT_OVERTAKEN = 0;
const OVERTAKEN = 1;