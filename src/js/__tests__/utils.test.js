import { calcTileType, formatCharacterInfo } from '../utils';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';

describe('Функция calcTileType – определение типа ячейки', () => {
  const boardSize = 8;

  test('Индекс 0 – верхний левый угол', () => {
    expect(calcTileType(0, boardSize)).toBe('top-left');
  });

  test('Индекс 7 – верхний правый угол', () => {
    expect(calcTileType(7, boardSize)).toBe('top-right');
  });

  test('Индекс 56 – нижний левый угол', () => {
    expect(calcTileType(56, boardSize)).toBe('bottom-left');
  });

  test('Индекс 63 – нижний правый угол', () => {
    expect(calcTileType(63, boardSize)).toBe('bottom-right');
  });

  test('Индекс 3 – верхняя граница', () => {
    expect(calcTileType(3, boardSize)).toBe('top');
  });

  test('Индекс 59 – нижняя граница', () => {
    expect(calcTileType(59, boardSize)).toBe('bottom');
  });

  test('Индекс 8 – левая граница', () => {
    expect(calcTileType(8, boardSize)).toBe('left');
  });

  test('Индекс 15 – правая граница', () => {
    expect(calcTileType(15, boardSize)).toBe('right');
  });

  test('Индекс 27 – центральная область', () => {
    expect(calcTileType(27, boardSize)).toBe('center');
  });
});

describe('Функция formatCharacterInfo – вывод характеристик персонажа', () => {
  test('Должна корректно форматировать характеристики любого персонажа', () => {
    const character = new Bowman(2);
    character.attack = 25;
    character.defence = 25;
    character.health = 80;
    const expected = '🎖2 ⚔25 🛡25 ❤80';
    expect(formatCharacterInfo(character)).toBe(expected);
  });

  test('Для персонажа 1-го уровня со стандартными характеристиками', () => {
    const character = new Bowman(1);
    const expected = '🎖1 ⚔25 🛡25 ❤50';
    expect(formatCharacterInfo(character)).toBe(expected);
  });

  test('Работает для любого класса-наследника', () => {
    const character = new Swordsman(3);
    character.attack = 40;
    character.defence = 10;
    character.health = 100;
    const expected = '🎖3 ⚔40 🛡10 ❤100';
    expect(formatCharacterInfo(character)).toBe(expected);
  });
});
