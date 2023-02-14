

import { TopBar, Container, Text, Button } from "./src/components/elements-components";
import { Column, Padding, Row, Scaffold } from "./src/components/layout-components";
import { CanvasApp } from "./src/core/canvas-app";
import { MainAxisJustify } from "./src/core/gui/definitions/enums";

const app = new CanvasApp('canvas',
    new Scaffold({
        topBar: new TopBar({
            height: 25,
            child: new Padding({
                all: 8,
                child: new Row({
                    justify: MainAxisJustify.spaceAround,
                    children: [
                        new Button({
                            child: new Text({ text: 'Lorem Ipsum' }),
                            click: () => {console.log("click!")}
                        }),
                        new Text({ text: '2' }),
                        new Text({ text: '3' }),
                    ]
                })
            })
        }),
        body: new Container({
            child: new Padding({
                all: 20,
                child: new Column({
                    justify: MainAxisJustify.spaceAround,
                    children: [
                        new Text({
                            text: "Title",
                            style: "bold 30px Arial"
                        }),
                        new Text({ text: 'Lorem Ipsum' })
                    ]
                })
            })
        })
    })
);

app.start();