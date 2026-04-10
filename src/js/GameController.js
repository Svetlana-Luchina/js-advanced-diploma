import GamePlay from './GamePlay';
import cursors from './cursors';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';
import { generateTeam } from './generators';
import { formatCharacterInfo } from './utils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.positions = [];
    this.currentTurn = 'player';
    this.selectedCellIndex = null;
    this.currentActionCells = { move: [], attack: [] };
    this.currentLevel = 1;
    this.themesList = ['prairie', 'desert', 'arctic', 'mountain'];
    this.score = 0;
    this.maxScore = 0;
    this.isGameActive = true;
    this.loadMaxScore();
  }

  init() {
    const initialTheme = this.themesList[this.currentLevel - 1];
    this.gamePlay.drawUi(initialTheme);
    this.generateAndPlaceTeams();
    this.gamePlay.redrawPositions(this.positions);
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
  }

  loadMaxScore() {
    try {
      const saved = this.stateService.load();
      if (saved && typeof saved.maxScore === 'number') {
        this.maxScore = saved.maxScore;
      }
    } catch (e) {
      this.maxScore = 0;
    }
  }

  saveMaxScore() {
    this.stateService.save({ maxScore: this.maxScore });
  }

  addScore(points) {
    this.score += points;
    if (this.score > this.maxScore) {
      this.maxScore = this.score;
      this.saveMaxScore();
    }
  }

  onNewGame() {
    this.currentLevel = 1;
    this.currentTurn = 'player';
    this.selectedCellIndex = null;
    this.currentActionCells = { move: [], attack: [] };
    this.score = 0;
    this.isGameActive = true;
    this.loadMaxScore();
    const initialTheme = this.themesList[0];
    this.gamePlay.drawUi(initialTheme);
    this.generateAndPlaceTeams();
    this.gamePlay.redrawPositions(this.positions);
    this.clearSelected();
    this.gamePlay.setCursor(cursors.auto);
  }

  onSaveGame() {
    this.saveGame();
  }

  onLoadGame() {
    this.loadGame();
  }

  saveGame() {
    const state = new GameState({
      positions: this.positions,
      currentLevel: this.currentLevel,
      currentTurn: this.currentTurn,
      score: this.score,
      maxScore: this.maxScore,
      selectedCellIndex: this.selectedCellIndex,
    });
    this.stateService.save(state.toJSON());
    GamePlay.showMessage('Игра сохранена');
  }

  loadGame() {
    try {
      const loaded = this.stateService.load();
      if (!loaded) throw new Error('Нет сохранения');
      const state = GameState.fromJSON(JSON.stringify(loaded));
      this.positions = state.positions;
      this.currentLevel = state.currentLevel;
      this.currentTurn = state.currentTurn;
      this.score = state.score;
      this.maxScore = state.maxScore;
      this.selectedCellIndex = state.selectedCellIndex;
      this.isGameActive = true;
      const theme = this.themesList[this.currentLevel - 1];
      this.gamePlay.drawUi(theme);
      this.gamePlay.redrawPositions(this.positions);
      if (this.selectedCellIndex !== null) {
        this.gamePlay.selectCell(this.selectedCellIndex, 'yellow');
        this.updateActionCells();
      } else {
        this.clearSelected();
      }
      GamePlay.showMessage('Игра загружена');
    } catch (e) {
      GamePlay.showError('Не удалось загрузить сохранение');
    }
  }

  generateAndPlaceTeams() {
    const playerTypes = [Bowman, Swordsman, Magician];
    const enemyTypes = [Vampire, Undead, Daemon];
    const maxLevel = this.currentLevel;
    const teamSize = 4;
    const playerTeam = generateTeam(playerTypes, maxLevel, teamSize);
    const enemyTeam = generateTeam(enemyTypes, maxLevel, teamSize);
    const playerPositions = this.getRandomUniquePositions(
      this.getColumnPositions([0, 1]),
      teamSize,
    );
    const enemyPositions = this.getRandomUniquePositions(
      this.getColumnPositions([6, 7]),
      teamSize,
    );
    this.positions = [];
    playerTeam.toArray().forEach((character, idx) => {
      this.positions.push(new PositionedCharacter(character, playerPositions[idx]));
    });
    enemyTeam.toArray().forEach((character, idx) => {
      this.positions.push(new PositionedCharacter(character, enemyPositions[idx]));
    });
  }

  getColumnPositions(columns) {
    const positions = [];
    for (let row = 0; row < 8; row += 1) {
      for (const col of columns) {
        positions.push(row * 8 + col);
      }
    }
    return positions;
  }

  getRandomUniquePositions(availablePositions, count) {
    const shuffled = [...availablePositions];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }

  getCharacterByPosition(index) {
    const positioned = this.positions.find((pos) => pos.position === index);
    return positioned ? positioned.character : null;
  }

  isPlayerCharacter(character) {
    const playerTypes = ['bowman', 'swordsman', 'magician'];
    return character && playerTypes.includes(character.type);
  }

  clearSelected() {
    if (this.selectedCellIndex !== null) {
      this.gamePlay.deselectCell(this.selectedCellIndex);
      this.selectedCellIndex = null;
      this.currentActionCells = { move: [], attack: [] };
      this.gamePlay.setCursor(cursors.auto);
    }
  }

  getCellsInRange(fromIndex, radius) {
    const boardSize = 8;
    const fromRow = Math.floor(fromIndex / boardSize);
    const fromCol = fromIndex % boardSize;
    const cells = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];
    for (const [dx, dy] of directions) {
      for (let step = 1; step <= radius; step += 1) {
        const row = fromRow + dx * step;
        const col = fromCol + dy * step;
        if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) break;
        cells.push(row * boardSize + col);
      }
    }
    return cells;
  }

  getMoveCells(character, fromIndex) {
    const rangeCells = this.getCellsInRange(fromIndex, character.moveDistance);
    return rangeCells.filter((cellIndex) => this.getCharacterByPosition(cellIndex) === null);
  }

  getAttackCells(character, fromIndex) {
    const rangeCells = this.getCellsInRange(fromIndex, character.attackDistance);
    return rangeCells.filter((cellIndex) => {
      const target = this.getCharacterByPosition(cellIndex);
      return target !== null && !this.isPlayerCharacter(target);
    });
  }

  updateActionCells() {
    if (this.selectedCellIndex === null) {
      this.currentActionCells = { move: [], attack: [] };
      return;
    }
    const character = this.getCharacterByPosition(this.selectedCellIndex);
    if (!character) {
      this.clearSelected();
      return;
    }
    this.currentActionCells.move = this.getMoveCells(character, this.selectedCellIndex);
    this.currentActionCells.attack = this.getAttackCells(character, this.selectedCellIndex);
  }

  getActionType(cellIndex) {
    if (this.selectedCellIndex === null) return null;
    const character = this.getCharacterByPosition(cellIndex);
    if (character && this.isPlayerCharacter(character) && cellIndex !== this.selectedCellIndex) {
      return 'select';
    }
    if (this.currentActionCells.move.includes(cellIndex)) return 'move';
    if (this.currentActionCells.attack.includes(cellIndex)) return 'attack';
    return 'invalid';
  }

  async performAction(cellIndex, actionType) {
    switch (actionType) {
      case 'select':
        this.clearSelected();
        this.selectedCellIndex = cellIndex;
        this.gamePlay.selectCell(cellIndex, 'yellow');
        this.updateActionCells();
        break;
      case 'move':
        this.moveCharacter(this.selectedCellIndex, cellIndex);
        this.clearSelected();
        this.endTurn();
        break;
      case 'attack':
        await this.attackCharacter(this.selectedCellIndex, cellIndex);
        this.clearSelected();
        this.endTurn();
        break;
      default:
        GamePlay.showError('Недопустимое действие');
    }
  }

  moveCharacter(fromIndex, toIndex) {
    const posIndex = this.positions.findIndex((pos) => pos.position === fromIndex);
    if (posIndex === -1) return;
    const { character } = this.positions[posIndex];
    this.positions[posIndex] = new PositionedCharacter(character, toIndex);
    this.gamePlay.redrawPositions(this.positions);
  }

  async attackCharacter(attackerIndex, targetIndex) {
    const attacker = this.getCharacterByPosition(attackerIndex);
    const target = this.getCharacterByPosition(targetIndex);
    if (!attacker || !target) return;
    const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
    target.health -= damage;
    await this.gamePlay.showDamage(targetIndex, Math.floor(damage));
    if (target.health <= 0) {
      const targetPosIndex = this.positions.findIndex((pos) => pos.position === targetIndex);
      if (targetPosIndex !== -1) {
        if (!this.isPlayerCharacter(target)) this.addScore(10);
        this.positions.splice(targetPosIndex, 1);
      }
      this.gamePlay.redrawPositions(this.positions);
      this.checkGameOver();
    } else {
      this.gamePlay.redrawPositions(this.positions);
    }
  }

  // Логика компьютера
  getComputerPositions() {
    return this.positions.filter((pos) => !this.isPlayerCharacter(pos.character));
  }

  getPlayerPositions() {
    return this.positions.filter((pos) => this.isPlayerCharacter(pos.character));
  }

  getDistance(cellA, cellB) {
    const boardSize = 8;
    const rowA = Math.floor(cellA / boardSize);
    const colA = cellA % boardSize;
    const rowB = Math.floor(cellB / boardSize);
    const colB = cellB % boardSize;
    return Math.max(Math.abs(rowA - rowB), Math.abs(colA - colB));
  }

  getDistanceToClosestPlayer(computerIndex) {
    const playerPositions = this.getPlayerPositions();
    if (playerPositions.length === 0) return Infinity;
    let minDist = Infinity;
    for (const player of playerPositions) {
      const dist = this.getDistance(computerIndex, player.position);
      if (dist < minDist) minDist = dist;
    }
    return minDist;
  }

  findClosestPlayer(computerIndex) {
    const playerPositions = this.getPlayerPositions();
    if (playerPositions.length === 0) return null;
    let minDist = Infinity;
    let closest = null;
    for (const player of playerPositions) {
      const dist = this.getDistance(computerIndex, player.position);
      if (dist < minDist) {
        minDist = dist;
        closest = player;
      }
    }
    return closest;
  }

  getBestMoveCell(character, fromIndex, targetIndex) {
    const moveCells = this.getMoveCells(character, fromIndex);
    if (moveCells.length === 0) return null;
    let bestCell = null;
    let bestDist = Infinity;
    for (const cell of moveCells) {
      const dist = this.getDistance(cell, targetIndex);
      if (dist < bestDist) {
        bestDist = dist;
        bestCell = cell;
      }
    }
    return bestCell;
  }

  findBestComputerAttack() {
    const computerPositions = this.getComputerPositions();
    computerPositions.sort((a, b) => {
      const distA = this.getDistanceToClosestPlayer(a.position);
      const distB = this.getDistanceToClosestPlayer(b.position);
      return distA - distB;
    });
    for (const computer of computerPositions) {
      const attackCells = this.getAttackCellsForCharacter(computer.character, computer.position);
      if (attackCells.length > 0) {
        return { attackerIndex: computer.position, targetIndex: attackCells[0] };
      }
    }
    return null;
  }

  getAttackCellsForCharacter(character, fromIndex) {
    const rangeCells = this.getCellsInRange(fromIndex, character.attackDistance);
    return rangeCells.filter((cellIndex) => {
      const target = this.getCharacterByPosition(cellIndex);
      return target !== null && this.isPlayerCharacter(target);
    });
  }

  findComputerMove() {
    const computerPositions = this.getComputerPositions();
    if (computerPositions.length === 0) return null;
    for (const computer of computerPositions) {
      const closestPlayer = this.findClosestPlayer(computer.position);
      if (closestPlayer) {
        const bestMove = this.getBestMoveCell(
          computer.character,
          computer.position,
          closestPlayer.position,
        );
        if (bestMove !== null) {
          return { fromIndex: computer.position, toIndex: bestMove };
        }
      }
    }
    return null;
  }

  async computerTurn() {
    if (!this.isGameActive) return;
    this.gamePlay.setCursor(cursors.notallowed);
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    const attack = this.findBestComputerAttack();
    if (attack) {
      await this.attackCharacter(attack.attackerIndex, attack.targetIndex);
    } else {
      const move = this.findComputerMove();
      if (move) this.moveCharacter(move.fromIndex, move.toIndex);
    }
    if (this.isGameActive && this.currentTurn !== null) {
      this.currentTurn = 'player';
      this.gamePlay.setCursor(cursors.auto);
      this.clearSelected();
    }
  }

  endTurn() {
    this.currentTurn = 'computer';
    this.computerTurn();
  }

  checkGameOver() {
    const playerAlive = this.positions.some((pos) => this.isPlayerCharacter(pos.character));
    const enemyAlive = this.positions.some((pos) => !this.isPlayerCharacter(pos.character));
    if (!playerAlive) {
      GamePlay.showError('Вы проиграли!');
      this.isGameActive = false;
      this.currentTurn = null;
      this.gamePlay.setCursor(cursors.notallowed);
      return true;
    }
    if (!enemyAlive) {
      if (this.currentLevel === 4) {
        GamePlay.showMessage(`Поздравляем! Вы победили! Ваш счёт: ${this.score}`);
        this.isGameActive = false;
        this.currentTurn = null;
        this.gamePlay.setCursor(cursors.notallowed);
        return true;
      }
      this.nextLevel();
      return true;
    }
    return false;
  }

  async nextLevel() {
    this.currentLevel += 1;
    const newTheme = this.themesList[this.currentLevel - 1];
    this.gamePlay.drawUi(newTheme);
    const playerPositions = this.positions.filter((pos) => this.isPlayerCharacter(pos.character));
    for (const pos of playerPositions) {
      try {
        pos.character.levelUp();
      } catch (e) {
        // ignore ошибки levelUp для мёртвых персонажей
      }
    }
    const enemyTypes = [Vampire, Undead, Daemon];
    const maxLevel = this.currentLevel;
    const teamSize = 4;
    const enemyTeam = generateTeam(enemyTypes, maxLevel, teamSize);
    const enemyPositions = this.getRandomUniquePositions(
      this.getColumnPositions([6, 7]),
      teamSize,
    );
    this.positions = this.positions.filter((pos) => this.isPlayerCharacter(pos.character));
    enemyTeam.toArray().forEach((character, idx) => {
      this.positions.push(new PositionedCharacter(character, enemyPositions[idx]));
    });
    this.gamePlay.redrawPositions(this.positions);
    this.clearSelected();
    this.currentTurn = 'player';
  }

  onCellEnter(index) {
    if (!this.isGameActive) return;
    const character = this.getCharacterByPosition(index);
    if (this.selectedCellIndex !== null) {
      const action = this.getActionType(index);
      switch (action) {
        case 'select':
          this.gamePlay.setCursor(cursors.pointer);
          break;
        case 'move':
          this.gamePlay.setCursor(cursors.pointer);
          this.gamePlay.selectCell(index, 'green');
          break;
        case 'attack':
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
          break;
        default:
          this.gamePlay.setCursor(cursors.notallowed);
          this.gamePlay.deselectCell(index);
      }
    } else if (character) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.showCellTooltip(formatCharacterInfo(character), index);
    } else {
      this.gamePlay.setCursor(cursors.auto);
    }
  }

  onCellLeave(index) {
    if (!this.isGameActive) return;
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.deselectCell(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  onCellClick(index) {
    if (!this.isGameActive) {
      GamePlay.showError('Игра окончена. Нажмите New Game');
      return;
    }
    if (this.currentTurn !== 'player') {
      GamePlay.showError('Сейчас ход компьютера');
      return;
    }
    if (this.selectedCellIndex === null) {
      const character = this.getCharacterByPosition(index);
      if (!character) {
        GamePlay.showError('Нет персонажа');
        return;
      }
      if (!this.isPlayerCharacter(character)) {
        GamePlay.showError('Это не ваш персонаж');
        return;
      }
      this.clearSelected();
      this.selectedCellIndex = index;
      this.gamePlay.selectCell(index, 'yellow');
      this.updateActionCells();
      return;
    }
    const action = this.getActionType(index);
    this.performAction(index, action);
  }
}
