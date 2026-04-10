import Character from '../Character';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Vampire from '../characters/Vampire';
import Undead from '../characters/Undead';
import Daemon from '../characters/Daemon';
import { characterGenerator, generateTeam } from '../generators';
import Team from '../Team';

describe('Базовый класс Character', () => {
  test('Должен выбрасывать ошибку при прямом создании экземпляра', () => {
    expect(() => new Character(1)).toThrow('Cannot instantiate Character directly');
  });

  test('Не должен выбрасывать ошибку при создании экземпляра наследника', () => {
    expect(() => new Bowman(1)).not.toThrow();
  });
});

describe('Классы персонажей (уровень 1)', () => {
  test('Bowman (лучник) – правильные характеристики', () => {
    const bowman = new Bowman(1);
    expect(bowman.level).toBe(1);
    expect(bowman.attack).toBe(25);
    expect(bowman.defence).toBe(25);
    expect(bowman.health).toBe(50);
    expect(bowman.type).toBe('bowman');
  });

  test('Swordsman (мечник) – правильные характеристики', () => {
    const swordsman = new Swordsman(1);
    expect(swordsman.attack).toBe(40);
    expect(swordsman.defence).toBe(10);
    expect(swordsman.type).toBe('swordsman');
  });

  test('Magician (маг) – правильные характеристики', () => {
    const magician = new Magician(1);
    expect(magician.attack).toBe(10);
    expect(magician.defence).toBe(40);
    expect(magician.type).toBe('magician');
  });

  test('Vampire (вампир) – правильные характеристики', () => {
    const vampire = new Vampire(1);
    expect(vampire.attack).toBe(25);
    expect(vampire.defence).toBe(25);
    expect(vampire.type).toBe('vampire');
  });

  test('Undead (нежить) – правильные характеристики', () => {
    const undead = new Undead(1);
    expect(undead.attack).toBe(40);
    expect(undead.defence).toBe(10);
    expect(undead.type).toBe('undead');
  });

  test('Daemon (демон) – правильные характеристики', () => {
    const daemon = new Daemon(1);
    expect(daemon.attack).toBe(10);
    expect(daemon.defence).toBe(10);
    expect(daemon.type).toBe('daemon');
  });
});

describe('Генератор случайных персонажей (characterGenerator)', () => {
  const types = [Bowman, Swordsman];
  const maxLevel = 2;

  test('Генерирует бесконечное количество персонажей только из разрешённых типов', () => {
    const gen = characterGenerator(types, maxLevel);
    const results = new Set();
    for (let i = 0; i < 100; i++) {
      const char = gen.next().value;
      expect(char instanceof Bowman || char instanceof Swordsman).toBe(true);
      results.add(char.constructor);
    }
    expect(results.size).toBe(2);
  });

  test('Генерирует персонажей с уровнем от 1 до maxLevel включительно', () => {
    const gen = characterGenerator(types, maxLevel);
    for (let i = 0; i < 50; i++) {
      const char = gen.next().value;
      expect(char.level).toBeGreaterThanOrEqual(1);
      expect(char.level).toBeLessThanOrEqual(maxLevel);
    }
  });
});

describe('Формирование команды (generateTeam)', () => {
  const types = [Bowman, Magician];
  const maxLevel = 3;
  const count = 4;

  test('Возвращает экземпляр Team с правильным количеством персонажей', () => {
    const team = generateTeam(types, maxLevel, count);
    expect(team).toBeInstanceOf(Team);
    expect(team.characters.length).toBe(count);
  });

  test('Все персонажи команды имеют уровень в заданном диапазоне', () => {
    const team = generateTeam(types, maxLevel, count);
    team.characters.forEach((char) => {
      expect(char.level).toBeGreaterThanOrEqual(1);
      expect(char.level).toBeLessThanOrEqual(maxLevel);
    });
  });

  test('Все персонажи команды принадлежат одному из разрешённых типов', () => {
    const team = generateTeam(types, maxLevel, count);
    team.characters.forEach((char) => {
      const isAllowed = types.some((t) => char instanceof t);
      expect(isAllowed).toBe(true);
    });
  });
});
