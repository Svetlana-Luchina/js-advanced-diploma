import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

jest.mock('../GamePlay');
jest.mock('../GameStateService');

describe('GameController: сохранение и загрузка игры', () => {
  let gamePlay;
  let stateService;
  let controller;

  beforeEach(() => {
    gamePlay = new GamePlay();
    stateService = new GameStateService(localStorage);
    controller = new GameController(gamePlay, stateService);
    controller.init();
  });

  test('При нажатии Save Game должен вызываться stateService.save', () => {
    controller.onSaveGame();
    expect(stateService.save).toHaveBeenCalled();
  });

  test('При ошибке загрузки должно показываться сообщение об ошибке', () => {
    stateService.load.mockImplementation(() => {
      throw new Error('No save');
    });
    controller.onLoadGame();
    expect(GamePlay.showError).toHaveBeenCalledWith('Не удалось загрузить сохранение');
  });

  test('При успешной загрузке состояние игры восстанавливается и поле перерисовывается', () => {
    const mockState = {
      positions: [],
      currentLevel: 2,
      currentTurn: 'player',
      score: 50,
      maxScore: 100,
      selectedCellIndex: null,
    };
    stateService.load.mockReturnValue(mockState);

    controller.onLoadGame();

    expect(controller.currentLevel).toBe(2);
    expect(controller.score).toBe(50);
    expect(gamePlay.drawUi).toHaveBeenCalledWith('desert');
  });
});
