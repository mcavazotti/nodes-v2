import { BaseNode } from "../base-node";
import { getNodeIdFromSocketId } from "./code-gen-helpers";

export interface CompileDataProviderFunc {
    (): { nodes: Map<string, BaseNode>, root: BaseNode, uniforms: string[] };
}

export interface CompilationDoneFunc {
    (code: string): void;
}

interface CompilationData {
    definitions: Map<string, string>;
    visitedNode: Set<string>;
    visiting: Set<string>;
    mainCode: string;
}

export class NodeCompiler {
    private static instance: NodeCompiler;

    public beautifyCode = false;

    static getInstance() {
        if (!this.instance) this.instance = new NodeCompiler();
        return this.instance;
    }

    private processCompileRequest?: CompileDataProviderFunc;
    private compilationDone?: CompilationDoneFunc;

    private constructor() {
    }

    setCompileRequestListener(func: CompileDataProviderFunc) {
        this.processCompileRequest = func;
    }

    setCompilationDoneListener(func: CompilationDoneFunc) {
        this.compilationDone = func;
    }

    compile() {
        if (!this.processCompileRequest) return;
        const compileData = this.processCompileRequest();
        const fragShaderCode = this.compileShader(compileData.nodes, compileData.root, compileData.uniforms);

        if (this.compilationDone) this.compilationDone(fragShaderCode);
    }

    compileShader(nodes: Map<string, BaseNode>, root: BaseNode, uniforms: string[]): string {
        let data: CompilationData = {
            definitions: new Map(),
            visitedNode: new Set(),
            visiting: new Set(),
            mainCode: ""
        };
        this.transverseNodes(root, nodes, data);
        let finalCode = "precision mediump float;\n";

        for (const uniform of uniforms) {
            finalCode += uniform;
            finalCode += "\n";
        }

        for (const definition of data.definitions.values()) {
            finalCode += definition;
            finalCode += "\n";
        }

        finalCode += "void main() {\n" +
            `${data.mainCode}` +
            "}";

        if (this.beautifyCode) {
            let bracketCounter = 0;
            finalCode = finalCode.split('\n').map(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.includes('}')) bracketCounter--;
                const identedLine = '\t'.repeat(bracketCounter) + trimmedLine + '\n';
                if (trimmedLine.includes('{')) bracketCounter++;
                return identedLine;
            }).join('');
        }
        // console.log(finalCode)
        return finalCode;
    }

    transverseNodes(node: BaseNode, nodes: Map<string, BaseNode>, compilationData: CompilationData) {
        // console.log(node.label)
        if (compilationData.visitedNode.has(node.uId))
            return;

        if (compilationData.visiting.has(node.uId))
            throw Error("Cycle detected");

        compilationData.visiting.add(node.uId);

        for (const input of node.input) {
            if (input.connection)
                this.transverseNodes(nodes.get(getNodeIdFromSocketId(input.connection[0]))!, nodes, compilationData);
        }

        for (const definition of node.definitions()) {
            if (!compilationData.definitions.has(definition[0])) {
                compilationData.definitions.set(definition[0], definition[1]);
            }
        }

        compilationData.visiting.delete(node.uId);
        compilationData.visitedNode.add(node.uId);
        compilationData.mainCode += node.code();
    }

}