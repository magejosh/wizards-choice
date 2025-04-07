declare module 'threejs-dice' {
  import * as THREE from 'three';
  
  interface DiceBoxOptions {
    scene: THREE.Scene;
    dimensions: { w: number; h: number };
    scale?: number;
    throwForce?: number;
    gravity?: number;
    camera: THREE.Camera;
  }
  
  interface DieParams {
    type: string;
    backColor: string;
    fontColor: string;
    value: number;
    xFactor?: number;
    zFactor?: number;
  }
  
  export class DiceBox {
    constructor(options: DiceBoxOptions);
    update(): void;
    roll(diceParams: DieParams[]): void;
    onRollComplete: () => void;
  }
} 