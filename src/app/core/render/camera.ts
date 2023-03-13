import { Vector2 } from "../math/vector";

export class Camera {
    private aspectRatio!: number;
    private camSpaceWidth: number;
    private camSpaceHeight!: number;
    constructor(public position: Vector2, public zoom: number, private rasterDim: Vector2) {
        this.camSpaceWidth = 10;
        this.setRasterDimention(rasterDim);
    }

    setRasterDimention(dim: Vector2) {
        this.rasterDim = dim;
        this.aspectRatio = dim.y / dim.x;
        this.camSpaceHeight = this.camSpaceWidth* this.aspectRatio;
        console.log(dim.toString())
        console.log(this.aspectRatio)
    }

    convertWorldToRaster(worldPos: Vector2): Vector2 {
        const camPos = worldPos.sub(this.position).div(new Vector2(this.camSpaceWidth * this.zoom, this.camSpaceHeight * this.zoom));
        const rasterPos = new Vector2((1 + camPos.x) * this.rasterDim.x / 2, ((1 - camPos.y) * this.rasterDim.y / 2));
        return rasterPos;
    }

    convertRasterToWorld(rasterPos: Vector2): Vector2 {
        const camPos = new Vector2(rasterPos.x * 2 / this.rasterDim.x - 1, -rasterPos.y * 2 / this.rasterDim.y + 1);
        const worldPos = camPos.mult(new Vector2(this.camSpaceWidth * this.zoom, this.camSpaceHeight * this.zoom)).add(this.position);
        return worldPos;
    }


}