import BucklerCharFrame from "./BucklerCharFrame";

type BucklerCharAsset = {
  frames: Record<string, BucklerCharFrame>;
  animations: Record<string, string[]>;
  meta: {
    app: string;
    version: string;
    image: string;
    format: string;
    size: {
      w: number;
      h: number;
    };
    scale: string;
    smartupdate: string;
  };
}

export default BucklerCharAsset;
