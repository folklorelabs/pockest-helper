import BucklerCharFrame from "./BucklerCharFrame";

type BucklerCharAsset = {
  image: string;
  size: number;
  attack: BucklerCharFrame[];
  down: BucklerCharFrame[];
  idle: BucklerCharFrame[];
  win: BucklerCharFrame[];
}

export default BucklerCharAsset;
