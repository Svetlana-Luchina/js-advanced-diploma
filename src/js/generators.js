/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей.
 * Количество персонажей в команде - characterCount
 * */
import Team from './Team';

export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const RandomType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const level = Math.floor(Math.random() * maxLevel) + 1;
    yield new RandomType(level);
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const generator = characterGenerator(allowedTypes, maxLevel);
  const characters = [];
  for (let i = 0; i < characterCount; i += 1) {
    characters.push(generator.next().value);
  }
  return new Team(characters);
}
