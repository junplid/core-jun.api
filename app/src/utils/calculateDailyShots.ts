export type PropsShootingSpeed = {
  numberShots: number;
  timeBetweenShots: number;
  timeRest: number;
};

const DAY_SECONDS = 86_400;

/**
 * Calcula o número de tiros que podem ser feitos em um dia.
 *
 * @param {PropsShootingSpeed} props - Objeto contendo as propriedades necessárias.
 * @returns {number} - Número total de tiros possíveis em um dia.
 */
export function calculateDailyShots({
  numberShots,
  timeBetweenShots,
  timeRest,
}: PropsShootingSpeed): number {
  if (numberShots <= 0) return 0; // evita entradas sem sentido

  // tempo de um ciclo (rajada + descanso)
  const cycleTime =
    (numberShots > 1 ? (numberShots - 1) * timeBetweenShots : 0) + timeRest;

  if (cycleTime <= 0) return 0;

  const fullCycles = Math.floor(DAY_SECONDS / cycleTime); // rajadas completas
  const remaining = DAY_SECONDS - fullCycles * cycleTime;

  // só existe “tiro extra” se houver mais de 1 tiro/rajada E intervalo >0
  const extraShots =
    numberShots > 1 && timeBetweenShots > 0
      ? Math.floor(remaining / timeBetweenShots)
      : 0;

  return fullCycles * numberShots + extraShots;
}
