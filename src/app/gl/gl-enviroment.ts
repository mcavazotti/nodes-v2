
/**
 * Class that handles the WebGL canvas context and the shader compilation and usage
 */
export class GlEnviroment {
    /** Canvas HTML element */
    canvas: HTMLCanvasElement;
    /** WebGL context */
    gl: WebGL2RenderingContext;

    /** Vertices position buffer */
    private positionBuffer: WebGLBuffer;

    private vertexShaderSrc = `
    attribute vec2 aVertexPos;
    
    void main() {
        gl_Position = vec4(aVertexPos,0,1);
    }
    `;

    /** Uniforms available for fragment shader use */
    readonly uniforms: string[] = [
        "uniform vec2 uResolution;"
    ];

    /** Compiled vertex shader */
    private vertexShader: WebGLShader;
    /** Compiled fragment shader */
    private fragmentShader?: WebGLShader;
    /** Linked WebGL program */
    private program?: WebGLProgram;

    /**
     * Initialize WebGL context and buffers
     * @param canvasId Id of HTML canvas
     */
    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        let gl = this.canvas.getContext("webgl2");
        if (!gl)
            throw Error("WebGL 2 not supported in this browser");

        this.gl = gl;

        this.positionBuffer = gl.createBuffer()!;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        const positions = [
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.vertexShader = this.loadShader(this.gl.VERTEX_SHADER, this.vertexShaderSrc);

    }

    /**
     *  Compile a shader
     * 
     * @param type Shader type. It accepts `WebGLRenderingContextBase.VERTEX_SHADER` or `WebGLRenderingContextBase.FRAGMENT_SHADER`
     * @param source Source code
     * @returns Compiled WebGL shader
     */
    private loadShader(type: number, source: string): WebGLShader {
        const shader = this.gl.createShader(type)!;
        this.gl.shaderSource(shader, source);

        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            let error = Error(`An error occurred compiling the shader: ${this.gl.getShaderInfoLog(shader)}`);
            this.gl.deleteShader(shader);
            throw error;
        }

        return shader;
    }

    /**
     * Link the compile shaders into a program. This program is stored on `this.program`.
     * 
     * The previous program, if exists, is disposed.
     */
    private createProgram() {
        if (this.program)
            this.gl.deleteProgram(this.program);

        if (this.fragmentShader) {
            this.program = this.gl.createProgram()!;
            this.gl.attachShader(this.program, this.vertexShader);
            this.gl.attachShader(this.program, this.fragmentShader);
            this.gl.linkProgram(this.program);
            if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
                let error = Error(`Unable to initialize the shader program: ${this.gl.getProgramInfoLog(this.program)}`);
                delete this.program;
                throw error;
            }
        }
    }

    /**
     * Draws on canvas using linked program
     */
    render() {
        if (!this.program)
            throw Error("Program not loaded");

        this.gl.useProgram(this.program);

        let vertexPosition = this.gl.getAttribLocation(this.program, 'aVertexPos');

        let uResPosition = this.gl.getUniformLocation(this.program, "uResolution");
        this.gl.uniform2f(uResPosition, this.canvas.width!, this.canvas.height!);

        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(vertexPosition, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(vertexPosition);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    /**
     * Updates fragment shader and recompile the shader/program
     * 
     * @param fragShaderSrc New fragment shader source code
     */
    refreshProgram(fragShaderSrc: string) {
        // console.log(fragShaderSrc)
        this.fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fragShaderSrc);
        this.createProgram();
        this.render();
    }
}