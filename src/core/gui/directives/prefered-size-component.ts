import { Vector2 } from "../../math/vector";
import { AbstractComponent } from "../abstract-component";

export abstract class PreferedSizeComponent extends AbstractComponent {
abstract preferedSize(): Vector2;
}