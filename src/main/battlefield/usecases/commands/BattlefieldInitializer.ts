import { Battlefield, type BattlefieldRepository, type TileInit } from '../../domain';

export class BattlefieldInitializer {
  constructor(readonly battlefieldRepository: BattlefieldRepository) {}

  async initialize(id: string, rows: number, cols: number, tiles: readonly TileInit[]): Promise<void> {
    const battlefield = Battlefield.initialize(id, rows, cols, tiles);
    await this.battlefieldRepository.create(battlefield);
  }

  async initializeUniform(id: string, rows: number, cols: number, terrainId: string): Promise<void> {
    const tiles: TileInit[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        tiles.push({ position: { row, col }, terrainId });
      }
    }
    await this.initialize(id, rows, cols, tiles);
  }
}
