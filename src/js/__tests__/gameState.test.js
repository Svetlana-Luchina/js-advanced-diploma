import GameState from '../GameState';
import Bowman from '../characters/Bowman';
import PositionedCharacter from '../PositionedCharacter';

describe('GameState (состояние игры)', () => {
  test('Должен создавать пустое состояние с начальными значениями', () => {
    const state = GameState.from();
    expect(state.currentLevel).toBe(1);
    expect(state.score).toBe(0);
  });

  test('Должен корректно сериализоваться и десериализоваться', () => {
    const bowman = new Bowman(2);
    const posChar = new PositionedCharacter(bowman, 5);

    const original = new GameState({
      positions: [posChar],
      currentLevel: 3,
      currentTurn: 'computer',
      score: 100,
      maxScore: 150,
      selectedCellIndex: 5,
    });

    const json = original.toJSON();

    const restored = GameState.fromJSON(JSON.stringify(json));

    expect(restored.currentLevel).toBe(3);
    expect(restored.positions[0].position).toBe(5);
    expect(restored.positions[0].character.type).toBe('bowman');
  });
});
