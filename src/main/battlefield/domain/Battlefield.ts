import { type Position } from '../../battleUnit/domain';

const DEFAULT_TERRAIN_ID = 'plains';

export type Tile = {
  position: Position;
  terrainId: string;
  occupyingBattleUnitId: string | null;
};

export type TileInit = {
  position: Position;
  terrainId: string;
};

function tileKey(position: Position): string {
  return `${position.row},${position.col}`;
}

export class Battlefield {
  readonly #id: string;
  readonly #rows: number;
  readonly #cols: number;
  readonly #tiles: Map<string, Tile>;

  private constructor(id: string, rows: number, cols: number, tiles: Map<string, Tile>) {
    this.#id = id;
    this.#rows = rows;
    this.#cols = cols;
    this.#tiles = tiles;
  }

  public static initialize(id: string, rows: number, cols: number, tiles: readonly TileInit[]): Battlefield {
    const tileMap = new Map<string, Tile>();
    for (const tile of tiles) {
      tileMap.set(tileKey(tile.position), {
        position: tile.position,
        terrainId: tile.terrainId,
        occupyingBattleUnitId: null,
      });
    }
    return new Battlefield(id, rows, cols, tileMap);
  }

  #tileAt(position: Position): Tile {
    const key = tileKey(position);
    let tile = this.#tiles.get(key);
    if (!tile) {
      tile = { position, terrainId: DEFAULT_TERRAIN_ID, occupyingBattleUnitId: null };
      this.#tiles.set(key, tile);
    }
    return tile;
  }

  public occupy(position: Position, battleUnitId: string): void {
    this.#tileAt(position).occupyingBattleUnitId = battleUnitId;
  }

  public vacate(position: Position): void {
    this.#tileAt(position).occupyingBattleUnitId = null;
  }

  public moveOccupant(from: Position, to: Position, battleUnitId: string): void {
    this.vacate(from);
    this.occupy(to, battleUnitId);
  }

  public isVacant(position: Position): boolean {
    const tile = this.#tiles.get(tileKey(position));
    return !tile || tile.occupyingBattleUnitId === null;
  }

  public get id(): string {
    return this.#id;
  }

  public toDto(): BattlefieldDTO {
    return {
      id: this.#id,
      rows: this.#rows,
      cols: this.#cols,
      tiles: [...this.#tiles.values()].map((tile) => ({ ...tile })),
    };
  }
}

export type BattlefieldDTO = {
  id: string;
  rows: number;
  cols: number;
  tiles: Tile[];
};
