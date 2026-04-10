import GameController from '../GameController';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Vampire from '../characters/Vampire';

describe('Дальность движения и атаки персонажей', () => {
  let gameCtrl;
  let mockGamePlay;
  let mockStateService;

  beforeEach(() => {
    mockGamePlay = {
      drawUi: jest.fn(),
      redrawPositions: jest.fn(),
      addCellEnterListener: jest.fn(),
      addCellLeaveListener: jest.fn(),
      addCellClickListener: jest.fn(),
      selectCell: jest.fn(),
      deselectCell: jest.fn(),
      setCursor: jest.fn(),
      showCellTooltip: jest.fn(),
      hideCellTooltip: jest.fn(),
      showDamage: jest.fn().mockResolvedValue(),
    };
    mockStateService = {};
    gameCtrl = new GameController(mockGamePlay, mockStateService);
    gameCtrl.positions = [];
  });

  describe('Дальность хода', () => {
    test('Лучник (Bowman) должен ходить на 2 клетки', () => {
      const bowman = new Bowman(1);
      const fromIndex = 27;
      gameCtrl.positions.push({ position: fromIndex, character: bowman });

      const moveCells = gameCtrl.getMoveCells(bowman, fromIndex);

      expect(moveCells.length).toBeGreaterThan(0);

      const farCell = fromIndex + 3 * 8;
      expect(moveCells).not.toContain(farCell);
    });

    test('Мечник должен ходить на 4 клетки', () => {
      const swordsman = new Swordsman(1);
      const fromIndex = 27;
      gameCtrl.positions.push({ position: fromIndex, character: swordsman });

      const moveCells = gameCtrl.getMoveCells(swordsman, fromIndex);

      const cellDistance4 = fromIndex + 4;
      expect(moveCells).toContain(cellDistance4);
    });

    test('Маг должен ходить только на 1 клетку', () => {
      const magician = new Magician(1);
      const fromIndex = 27;
      gameCtrl.positions.push({ position: fromIndex, character: magician });

      const moveCells = gameCtrl.getMoveCells(magician, fromIndex);

      expect(moveCells.length).toBeLessThanOrEqual(8);

      const cellDistance2 = fromIndex + 2;
      expect(moveCells).not.toContain(cellDistance2);
    });
  });

  describe('Дальность атаки', () => {
    test('Атаковать можно только врагов, а не своих', () => {
      const bowman = new Bowman(1);
      const fromIndex = 27;
      const enemyPos = 28;
      const enemy = new Vampire(1);

      gameCtrl.positions.push({ position: fromIndex, character: bowman });
      gameCtrl.positions.push({ position: enemyPos, character: enemy });

      const attackCells = gameCtrl.getAttackCells(bowman, fromIndex);

      expect(attackCells).toContain(enemyPos);

      expect(attackCells).not.toContain(26);
    });
  });

  describe('Запрет движения', () => {
    test('Нельзя перейти на клетку, занятую другим персонажем', () => {
      const swordsman = new Swordsman(1);
      const fromIndex = 27;
      const friendPos = 28;
      const friend = new Bowman(1);

      gameCtrl.positions.push({ position: fromIndex, character: swordsman });
      gameCtrl.positions.push({ position: friendPos, character: friend });

      const moveCells = gameCtrl.getMoveCells(swordsman, fromIndex);

      expect(moveCells).not.toContain(friendPos);
    });
  });
});
