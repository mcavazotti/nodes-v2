import { Vector3, Vector4 } from "../math/vector";

class ColorRGB extends Vector3 {
    constructor(r: number, g: number, b: number);
    constructor(hex: string);
    constructor(r?: number | string, g?: number, b?: number) {
        let hex;
        if (typeof r === "string")
            hex = r;
        if (hex) {
            hex = standardizeColor(hex);
            if (hex[0] == '#')
                hex = hex.slice(1);
            r = parseInt(hex.slice(0, 2), 16) / 255;
            g = parseInt(hex.slice(2, 4), 16) / 255;
            b = parseInt(hex.slice(4, 6), 16) / 255;
        }
        super(r as number, g, b);
    }

    get r(): number {
        return this.x;
    }
    set r(r: number) {
        this.x = r;
    }

    get g(): number {
        return this.y;
    }
    set g(g: number) {
        this.y = g;
    }

    get b(): number {
        return this.z;
    }
    set b(b: number) {
        this.z = b;
    }

    toHex(htmlFormat: boolean = true): string {
        return `${htmlFormat ? '#' : ''}${Math.round(this.r * 255).toString(16).padStart(2, '0')}${Math.round(this.g * 255).toString(16).padStart(2, '0')}${Math.round(this.b * 255).toString(16).padStart(2, '0')}`.toUpperCase();
    }

    toJSON(): string {
        return this.toHex(true);
    }
}

class ColorRGBA extends Vector4 {
    constructor(r: number, g: number, b: number, a: number);
    constructor(hex: string);
    constructor(r?: number | string, g?: number, b?: number, a?: number) {
        let hex;
        if (typeof r === "string")
            hex = r;
        if (hex) {
            hex = standardizeColor(hex);
            if (hex[0] == '#')
                hex = hex.slice(1);
            r = parseInt(hex.slice(0, 2), 16) / 255;
            g = parseInt(hex.slice(2, 4), 16) / 255;
            b = parseInt(hex.slice(4, 6), 16) / 255;
            a = parseInt(hex.slice(6, 8), 16) / 255;

            if (isNaN(a)) {
                a = 1.0;
            }
        }
        super(r as number, g, b, a);
    }

    get r(): number {
        return this.x;
    }
    set r(r: number) {
        this.x = r;
    }

    get g(): number {
        return this.y;
    }
    set g(g: number) {
        this.y = g;
    }

    get b(): number {
        return this.z;
    }
    set b(b: number) {
        this.z = b;
    }

    get a(): number {
        return this.w;
    }
    set a(a: number) {
        this.w = a;
    }

    toHex(htmlFormat: boolean = true): string {
        return `${htmlFormat ? '#' : ''}${Math.round(this.r * 255).toString(16).padStart(2, '0')}${Math.round(this.g * 255).toString(16).padStart(2, '0')}${Math.round(this.b * 255).toString(16).padStart(2, '0')}`.toUpperCase();
    }

    toJSON() {
        return this.toHex(true);
    }

}

// from https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes/47355187#47355187
function standardizeColor(str: string) {
    var ctx = document.createElement('canvas').getContext('2d')!;
    ctx.fillStyle = str;
    return ctx.fillStyle;
}

export { ColorRGB, ColorRGBA }