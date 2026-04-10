import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';
import PositionedCharacter from './PositionedCharacter';

const classMap = {
  bowman: Bowman,
  swordsman: Swordsman,
  magician: Magician,
  vampire: Vampire,
  undead: Undead,
  daemon: Daemon,
};

export default class GameState {
  constructor(data = {}) {
    Object.assign(this, {
      positions: data.positions || [],
      currentLevel: data.currentLevel || 1,
      currentTurn: data.currentTurn || 'player',
      score: data.score || 0,
      maxScore: data.maxScore || 0,
      selectedCellIndex: data.selectedCellIndex ?? null,
    });
  }

  static from(object = null) {
    if (!object) return new GameState();
    return new GameState(object);
  }

  toJSON() {
    return {
      positions: this.positions.map((p) => ({
        character: {
          level: p.character.level,
          attack: p.character.attack,
          defence: p.character.defence,
          health: p.character.health,
          type: p.character.type,
          moveDistance: p.character.moveDistance,
          attackDistance: p.character.attackDistance,
        },
        position: p.position,
      })),
      currentLevel: this.currentLevel,
      currentTurn: this.currentTurn,
      score: this.score,
      maxScore: this.maxScore,
      selectedCellIndex: this.selectedCellIndex,
    };
  }

  static fromJSON(json) {
    const data = JSON.parse(json);
    const positions = data.positions.map((p) => {
      const CharClass = classMap[p.character.type];
      const ch = new CharClass(p.character.level);
      Object.assign(ch, p.character);
      return new PositionedCharacter(ch, p.position);
    });
    return new GameState({ ...data, positions });
  }
}
