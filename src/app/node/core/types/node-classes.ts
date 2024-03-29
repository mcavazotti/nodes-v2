export enum NodeClass {
    input = "input",
    transform = "transform",
    mathOp = "mathOp",
    output = "output"
}

export enum NodeId {
    // input
    coordinates = "coordinates",
    // output
    output = "output",
    // transform
    separate = "separate",
    combine = "combine",
    // math
    scalarMath = "scalarMath",
    vectorMath = "vectorMath",
}