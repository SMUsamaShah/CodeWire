import { InputBox } from '../InputBox/InputBox.js'
import { colorMap } from '../ColorMap/colorMap.js'
import { setLocationOfNode } from '../setLocationOfNode/setLocationOfNode.js';
let placeLocation = function (location) {
    //"this" is stage
    return {
        x: (location.x - this.x()) / this.scaleX(),
        y: (location.y - this.y()) / this.scaleY()
    };
}
export var Nodes = {
    countNodes: 0,
    getExecPin: function (inType, helper, layer) {
        // let pointsExecIn = [0, 0, -14, -7, -14, 7];
        // let pointsExecOut = []
        let pin = new Konva.Line({
            points: [0, 0, -14, -7, -14, 7],
            stroke: 'white',
            strokeWidth: 1,
            closed: true,
            helper: helper,
            name: 'pin',
            offsetX: (inType) ? -14 : 0,
            pinType: (inType) ? 'exec-in' : 'exec-out',
            pinDataType: null,
            fill: '',
        });
        pin.on("mouseenter", () => {
            pin.strokeWidth(3);
            layer.draw();
        });
        pin.on("mouseleave", () => {
            pin.strokeWidth(1);
            layer.draw();
        });
        pin.on("wireremoved", (e) => {
            if (e.isPinEmpty) {
                pin.fill('transparent');
            }
        });
        pin.on("wireconnected", (e) => {
            pin.fill("white");
        });
        pin.on("wiringstart", (e) => {
            pin.fill("white");
            layer.draw();
        });
        return pin;
    },
    getRectBlock: function (height, width) {
        let rect = new Konva.Rect({
            height: height,
            width: width,
            fill: colorMap['MainBox'],
            opacity: 0.8,
            cornerRadius: 5,
            shadowColor: 'black',
            shadowBlur: 15,
            shadowOffset: { x: 15, y: 15 },
            shadowOpacity: 0.5,
            // strokeWidth: [10, 10, 110, 0],
        });
        return rect;
    },
    getInputPin: function (inType, helper, type, layer) {
        let pin = new Konva.Circle({
            radius: 7,
            stroke: colorMap[type],
            strokeWidth: 1,
            name: 'pin',
            pinType: (inType) ? 'inp' : 'outp',
            pinDataType: type,
            offsetX: (inType) ? -7 : 7,
            helper: helper,
            fill: '',
        });
        pin.on("mouseenter", () => {
            pin.strokeWidth(3);
            layer.draw();
        });
        pin.on("mouseleave", () => {
            pin.strokeWidth(1);
            layer.draw();
        });
        pin.on("wireremoved", (e) => {
            if (e.isPinEmpty) {
                pin.fill('transparent');
            }
        });
        pin.on("wireconnected", (e) => {
            pin.fill(`${colorMap[type]}`);
        });
        pin.on("wiringstart", (e) => {
            pin.fill(`${colorMap[type]}`);
            layer.draw();
        });
        return pin;
    },
    // getOutputPin: function(){
    //     let pin = new Konva.Circle({
    //         radius: 7,
    //         stroke: 'yellow',
    //         strokeWidth: '2',
    //         name: 'pin',
    //         pinType: 'outp',
    //     });
    //     return pin;
    // },
    getLabel: function (text, size, width) {
        let rect = new Konva.Rect({
            width: width,
            height: size + 3,
            fill: colorMap['MainLabelBox'],
            cornerRadius: [5, 5, 0, 0],
        });
        let label = new Konva.Text({
            text: text,
            fontSize: size - 5,
            fontFamily: 'Verdana',
            fill: colorMap['MainLabel'],
            width: width,
            // height: size + 3,
            y: 2,
            align: 'left',
            padding: 3,
            // padding: 10
        });
        return { bg: rect, text: label };
    },
    getPinCounts: function (nodeDescription) {
        let inputPinCounts = 0;
        let outputPinCounts = 0;
        if (nodeDescription.execIn)
            inputPinCounts++;
        if (nodeDescription.inputs) {
            inputPinCounts += Object.keys(nodeDescription.inputs).length;
        }

        //For outputs
        if (nodeDescription.execOut) {
            outputPinCounts += Object.keys(nodeDescription.execOut).length;
        }
        if (nodeDescription.outputs) {
            outputPinCounts += Object.keys(nodeDescription.outputs).length;

        }
        return Math.max(inputPinCounts, outputPinCounts);
    },
    // getEditableTextBox: function (type, stage, index) {
    //     let rect = new Konva.Rect({
    //         width: (type == 'Boolean') ? 14 : 50,
    //         height: 14,
    //         stroke: colorMap[type],
    //         strokeWidth: 1,
    //     });
    //     return rect;
    // },
    getInputLabel: function (labelText, type) {
        let text = new Konva.Text({
            width: 40,
            height: 14,
            text: labelText,
            fontSize: 11,
            fontFamily: 'Verdana',
            fill: colorMap[type],
        });
        // text.off()
        return text;
    },
    getExecOutTitle: function (labelText) {
        let text = new Konva.Text({
            width: 60,
            height: 14,
            fontSize: 11,
            text: labelText,
            fontFamily: 'Verdana',
            fill: "white",
        });
        return text;
    },
    optimizeDrag: function (grp, stage, layer) {
        let dragLayer = stage.findOne('#dragLayer');
        let wireLayer = stage.findOne('#wireLayer');
        grp.on('dragstart', () => {
            grp.moveTo(dragLayer);
            for (let each of grp.customClass.execInPins) {
                for (let aWire of each.wire) {
                    aWire.moveTo(dragLayer);
                }
            }
            for (let each of grp.customClass.execOutPins) {
                if (each.wire)
                    each.wire.moveTo(dragLayer);
            }
            for (let each of grp.customClass.inputPins) {
                if (each.wire)
                    each.wire.moveTo(dragLayer);
            }
            for (let each of grp.customClass.outputPins) {
                for (let aWire of each.wire) {
                    aWire.moveTo(dragLayer);
                }
            }
            wireLayer.draw();
            dragLayer.draw();
            layer.draw();
            // try {
            //     if (layer.hasChildren())
            //         layer.cache();
            //     if (wireLayer.hasChildren())
            //         wireLayer.cache();
            // }
            // catch (err) {

            // }
        })
        grp.on('dragend', () => {
            grp.moveTo(layer);
            for (let each of grp.customClass.execInPins) {
                for (let aWire of each.wire) {
                    aWire.moveTo(wireLayer);
                }
            }
            for (let each of grp.customClass.execOutPins) {
                if (each.wire)
                    each.wire.moveTo(wireLayer);
            }
            for (let each of grp.customClass.inputPins) {
                if (each.wire)
                    each.wire.moveTo(wireLayer);
            }
            for (let each of grp.customClass.outputPins) {
                for (let aWire of each.wire) {
                    aWire.moveTo(wireLayer);
                }
            }
            // layer.clearCache();
            // wireLayer.clearCache();
            wireLayer.draw();
            dragLayer.draw();
            layer.draw();
        });
    },
    getBorderRect: function (height, width) {
        let rect = new Konva.Rect({
            height: height,
            width: width,
            fill: 'transparent',
            stroke: '#dbd8e3',
            strokeWidth: 0,
            cornerRadius: 5,
            name: 'borderbox',
        });
        rect.off('click mouseover mouseenter mouseleave');
        return rect;
    },
    ProgramNode: class {
        constructor(nodeDescription, location, layer, stage) {



            this.grp = new Konva.Group({
                draggable: true,
                name: "aProgramNodeGroup",
            });
            if (nodeDescription.nodeTitle == 'Begin') {
                this.grp.id('Begin');
            }
            this.grp.customClass = this;
            // this.grp.on('dblclick', (e) => {
            //     console.table(e.currentTarget.customClass);
            // })
            this.nodeDescription = nodeDescription;
            let relativePosition = placeLocation.bind(stage);
            let maxOfPinsOnEitherSide = Nodes.getPinCounts(nodeDescription);
            let height = maxOfPinsOnEitherSide * 50 + 15;
            let width = nodeDescription.colums * 15;
            this.grp.position(relativePosition(location));
            let rect = Nodes.getRectBlock(height, width);
            this.grp.add(rect);
            let borderRect = Nodes.getBorderRect(height, width);
            let titleLabel = Nodes.getLabel(nodeDescription.nodeTitle, 20, width);
            this.grp.add(titleLabel.bg);
            this.grp.add(titleLabel.text);
            this.grp.add(borderRect);

            this.grp.on("mouseover", (e) => {
                // console.log(e);
                // if(shape == this.grp)
                borderRect.strokeWidth(1);
                layer.draw();
            });
            this.grp.on("mouseleave", (e) => {
                // rect.opacity(0.9);
                // rect.shadowOffset({ x: 15, y: 15 });
                // this.grp.scale(1);
                // this.grp.filters([]);
                borderRect.strokeWidth(0);
                layer.draw();
            });
            this.grp.on('mousedown', (e) => {
                rect.shadowBlur(25);
                // rect.shadowOffset({ x: 25, y: 25 });
                layer.draw();
            })
            this.grp.on('mouseup', (e) => {
                rect.shadowBlur(15);
                // rect.shadowOffset({ x: 15, y: 15 });
                layer.draw();
            })
            /****/

            Nodes.optimizeDrag(this.grp, stage, layer);

            /****/
            // titleLabel.offsetX(titleLabel.width() / 2);
            let inputPinsPlaced = 0, outputPinsPlaced = 0;
            this.execInPins = [];
            if (nodeDescription.execIn == true) {
                let execInPin = Nodes.getExecPin(true, 'exec-in-0', layer);
                execInPin.position({ x: 7, y: 44 });
                if (nodeDescription.pinExecInId == null) {
                    execInPin.id(`${execInPin._id}`);
                }
                else {
                    execInPin.id(nodeDescription.pinExecInId);
                }
                this.nodeDescription.pinExecInId = execInPin.id();
                this.grp.add(execInPin);
                let tmp = {
                    thisNode: execInPin,
                    wire: [],
                }
                this.execInPins.push(tmp);
                inputPinsPlaced = 1;
            }

            let X = nodeDescription.nodeTitle.split(" ");
            this.type = {
                isGetSet: (X[0] == 'Get' || X[0] == 'Set'),
                typeOfNode: nodeDescription.nodeTitle,
            }
            this.execOutPins = [];
            if (nodeDescription.execOut) {
                Object.keys(nodeDescription.execOut).forEach((value, index) => {
                    let execOutPin = Nodes.getExecPin(false, `exec-out-${index}`, layer);
                    execOutPin.position({ x: width - 7, y: 44 + index * 39 });
                    if (nodeDescription.execOut[value].pinExecOutId == null) {
                        execOutPin.id(`${execOutPin._id}`);
                    }
                    else {
                        execOutPin.id(nodeDescription.execOut[value].pinExecOutId);
                    }
                    this.nodeDescription.execOut[value].pinExecOutId = execOutPin.id();
                    this.grp.add(execOutPin);
                    if (nodeDescription.execOut[value].execOutTitle) {
                        let exLabel = Nodes.getExecOutTitle(nodeDescription.execOut[value].execOutTitle);
                        exLabel.position({ x: width - 84, y: 44 + index * 39 - 4 });
                        this.grp.add(exLabel);
                    }
                    let tmp = {
                        thisNode: execOutPin,
                        wire: null,
                        title: value.execOutTitle,
                    }
                    this.execOutPins.push(tmp);
                    outputPinsPlaced++;
                });
            }
            this.inputPins = [];
            if (nodeDescription.inputs) {
                Object.keys(nodeDescription.inputs).forEach((value, index) => {
                    let inputPin = Nodes.getInputPin(true, `inp-${index}`, nodeDescription.inputs[value].dataType, layer);
                    inputPin.position({ x: 7, y: 44 + 39 * inputPinsPlaced });
                    if (nodeDescription.inputs[value].pinInId == null) {
                        inputPin.id(`${inputPin._id}`);
                    }
                    else {
                        inputPin.id(nodeDescription.inputs[value].pinInId);
                    }
                    this.nodeDescription.inputs[value].pinInId = inputPin.id();
                    // iprect.position({ x: 28, y: 44 + 39 * inputPinsPlaced - 2 });
                    let iprect = null;
                    let iplabel = Nodes.getInputLabel(nodeDescription.inputs[value].inputTitle, nodeDescription.inputs[value].dataType);
                    iplabel.position({ x: 28, y: 44 + 39 * inputPinsPlaced - 4 });
                    if (nodeDescription.inputs[value].isInputBoxRequired !== false) {
                        // console.log(nodeDescription.inputs, this.nodeDescription.inputs);
                        iprect = new InputBox(stage, layer, nodeDescription.inputs[value].dataType, this.grp, { x: 28, y: 44 + 39 * inputPinsPlaced - 2 }, colorMap, inputPin, iplabel, inputPinsPlaced, nodeDescription.inputs[value], this.nodeDescription.inputs[value]);
                        iplabel.position({ x: 28, y: 44 + 39 * inputPinsPlaced - 14 });
                    }
                    this.grp.add(iplabel);
                    this.grp.add(inputPin);
                    // this.grp.add(iprect);
                    let tmp = {
                        thisNode: inputPin,
                        wire: null,
                        textBox: iprect,
                        value: null,
                        title: value.inputTitle,
                    }
                    this.inputPins.push(tmp);
                    inputPinsPlaced++;
                });
            }
            this.outputPins = [];
            if (nodeDescription.outputs) {
                Object.keys(nodeDescription.outputs).forEach((value, index) => {
                    let outputPin = Nodes.getInputPin(false, `out-${index}`, nodeDescription.outputs[value].dataType, layer);
                    outputPin.position({ x: width - 7, y: 44 + 39 * outputPinsPlaced });
                    if (nodeDescription.outputs[value].pinOutId == null) {
                        outputPin.id(`${outputPin._id}`);
                    }
                    else {
                        outputPin.id(nodeDescription.outputs[value].pinOutId);
                    }
                    nodeDescription.outputs[value].pinOutId = outputPin.id();
                    this.grp.add(outputPin);
                    let outLabel = Nodes.getInputLabel(nodeDescription.outputs[value].outputTitle, nodeDescription.outputs[value].dataType);
                    outLabel.position({ x: width - 65, y: 44 + 39 * outputPinsPlaced - 4 })
                    this.grp.add(outLabel);
                    let tmp = {
                        wire: [],
                        value: null,
                        title: value.outputTitle,
                    }
                    this.outputPins.push(tmp);
                    outputPinsPlaced++;
                })
            };
            // this.grp.cache();
            layer.add(this.grp);
            layer.draw();
            layer.draw();
            // console.log(JSON.parse(JSON.stringify(this.grp)));
        }
    },





    CreateNode: function (type, location, layer, stage, isGetSet, dataType, defValue) {
        let nodeDescription = {};
        if (type == 'Begin') {
            nodeDescription.nodeTitle = 'Begin';
            nodeDescription.execIn = false;
            nodeDescription.pinExecInId = null,
                nodeDescription.execOut = {
                    execOut0: {
                        execOutTitle: null,
                        pinExecOutId: null,
                    }
                };
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'Print') {
            nodeDescription.nodeTitle = 'Print';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null,
                nodeDescription.execOut = {
                    execOut0: {
                        execOutTitle: null,
                        pinExecOutId: null,
                    },
                }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Value',
                    dataType: 'Data',
                    defValue: "'hello'",
                    pinInId: null,
                }
            }
            nodeDescription.rows = 3;
            nodeDescription.colums = 12;
        }
        if (type == 'Branch') {
            nodeDescription.nodeTitle = 'Branch';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null,
                nodeDescription.execOut = {
                    execOut0: {
                        execOutTitle: '       True',
                        pinExecOutId: null,
                    },
                    execOut1: {
                        execOutTitle: '       False',
                        pinExecOutId: null,
                    },
                }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Bool',
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                }
            }
            nodeDescription.rows = 3;
            nodeDescription.colums = 12;
        }
        if (type == 'Add') {
            nodeDescription.nodeTitle = 'Add';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'Modulo') {
            nodeDescription.nodeTitle = 'Modulo';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 2,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'Subtract') {
            nodeDescription.nodeTitle = 'Subtract';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'Multiply') {
            nodeDescription.nodeTitle = 'Multiply';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'Divide') {
            nodeDescription.nodeTitle = 'Divide';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'Power') {
            nodeDescription.nodeTitle = 'Power';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 2,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 2,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'Ceil') {
            nodeDescription.nodeTitle = 'Ceil';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'Floor') {
            nodeDescription.nodeTitle = 'Floor';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }

        if (type == 'While') {
            nodeDescription.nodeTitle = 'While';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Bool',
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
            }
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Loop Body',
                    pinExecOutId: null,
                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,

                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }

        if (type == 'OR') {
            nodeDescription.nodeTitle = 'OR';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'AND') {
            nodeDescription.nodeTitle = 'AND';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'XOR') {
            nodeDescription.nodeTitle = 'XOR';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Boolean',
                    defValue: true,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'bXOR') {
            nodeDescription.nodeTitle = 'bXOR';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'bOR') {
            nodeDescription.nodeTitle = 'bOR';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'bAND') {
            nodeDescription.nodeTitle = 'bAND';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'bXOR') {
            nodeDescription.nodeTitle = 'XOR';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'bNEG') {
            nodeDescription.nodeTitle = 'bNEG';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Value',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == "Swap") {
            nodeDescription.nodeTitle = 'Swap';
            nodeDescription.execIn = true,
                nodeDescription.pinExecInId = null;
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    isInputBoxRequired: false,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    isInputBoxRequired: false,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: 'ValueA',
                    dataType: 'Data',
                    pinOutId: null,
                },
                output1: {
                    outputTitle: 'ValueB',
                    dataType: 'Data',
                    pinOutId: null,

                }
            }
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                },
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == "Equals") {
            nodeDescription.nodeTitle = 'Equals';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,

                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Data',
                    defValue: 0,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == "LessEq") {
            nodeDescription.nodeTitle = 'LessEq';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == "Less") {
            nodeDescription.nodeTitle = 'Less';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == "Greater") {
            nodeDescription.nodeTitle = 'Greater';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == "GreaterEq") {
            nodeDescription.nodeTitle = 'GreaterEq';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'ValueA',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'ValueB',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'NEG') {
            nodeDescription.nodeTitle = 'NEG';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Value',
                    dataType: 'Boolean',
                    defValue: false,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (isGetSet == "Set") {
            let defaultValueByType = {
                "Number": 0,
                "Boolean": true,
                "String": "'hello'",
                "Array": [],
            }
            nodeDescription.nodeTitle = type;
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Value',
                    dataType: dataType,
                    defValue: defaultValueByType[dataType],
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Value',
                    dataType: dataType,
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (isGetSet == "Get") {
            nodeDescription.nodeTitle = type;
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Value',
                    dataType: dataType,
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'Random') {
            nodeDescription.nodeTitle = 'Random';
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Rand',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'For') {
            nodeDescription.nodeTitle = 'For';
            nodeDescription.pinExecInId = null;
            nodeDescription.execIn = true;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: 'Loop Body',
                    pinExecOutId: null,
                },
                execOut1: {
                    execOutTitle: 'Completed',
                    pinExecOutId: null,
                }
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'From',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'To(Ex)',
                    dataType: 'Number',
                    defValue: 10,
                    pinInId: null,
                },
                input2: {
                    inputTitle: 'Incr',
                    dataType: 'Number',
                    defValue: 1,
                    pinInId: null,
                }
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Index',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == "Break") {
            nodeDescription.nodeTitle = 'Break';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'Length') {
            nodeDescription.nodeTitle = 'Length';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Array',
                    dataType: 'Array',
                    isInputBoxRequired: false,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Value',
                    dataType: 'Number',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'isEmpty') {
            nodeDescription.nodeTitle = 'isEmpty';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Array',
                    dataType: 'Array',
                    isInputBoxRequired: false,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Result',
                    dataType: 'Boolean',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'Front') {
            nodeDescription.nodeTitle = 'Front';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Array',
                    dataType: 'Array',
                    isInputBoxRequired: false,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Front',
                    dataType: 'Data',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'Sort(Numbers)') {
            nodeDescription.nodeTitle = 'Sort(Numbers)';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Array',
                    dataType: 'Array',
                    isInputBoxRequired: false,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'Incre',
                    dataType: 'Boolean',
                    pinInId: null,
                    defValue: true,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Array',
                    dataType: 'Array',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 12;
        }
        if (type == 'Back') {
            nodeDescription.nodeTitle = 'Back';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Array',
                    dataType: 'Array',
                    isInputBoxRequired: false,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Back',
                    dataType: 'Data',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'GetByPos') {
            nodeDescription.nodeTitle = 'GetByPos';
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Pos',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'Array',
                    dataType: 'Array',
                    isInputBoxRequired: false,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Value',
                    dataType: 'Data',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'SetByPos') {
            nodeDescription.nodeTitle = 'SetByPos';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Pos',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'Value',
                    dataType: 'Data',
                    defValue: 1,
                    pinInId: null,

                },
                input2: {
                    inputTitle: 'Array',
                    dataType: 'Array',
                    isInputBoxRequired: false,
                    pinInId: null,

                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Value',
                    dataType: 'Data',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 4;
            nodeDescription.colums = 10;
        }
        if (type == 'Insert') {
            nodeDescription.nodeTitle = 'Insert';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Pos',
                    dataType: 'Number',
                    defValue: 0,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'Value',
                    dataType: 'Data',
                    defValue: 1,
                    pinInId: null,
                },
                input2: {
                    inputTitle: 'Array',
                    dataType: 'Array',
                    isInputBoxRequired: false,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Array',
                    dataType: 'Array',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 4;
            nodeDescription.colums = 10;
        }
        if (type == 'PushBack') {
            nodeDescription.nodeTitle = 'PushBack';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Value',
                    dataType: 'Data',
                    defValue: 1,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'Array',
                    dataType: 'Array',
                    isInputBoxRequired: false,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Array',
                    dataType: 'Array',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'PushFront') {
            nodeDescription.nodeTitle = 'PushFront';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Value',
                    dataType: 'Data',
                    defValue: 1,
                    pinInId: null,
                },
                input1: {
                    inputTitle: 'Array',
                    dataType: 'Array',
                    isInputBoxRequired: false,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Array',
                    dataType: 'Array',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'PopBack') {
            nodeDescription.nodeTitle = 'PopBack';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Array',
                    dataType: 'Array',
                    isInputBoxRequired: false,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Array',
                    dataType: 'Array',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        if (type == 'PopFront') {
            nodeDescription.nodeTitle = 'PopFront';
            nodeDescription.execIn = true;
            nodeDescription.pinExecInId = null;
            nodeDescription.execOut = {
                execOut0: {
                    execOutTitle: null,
                    pinExecOutId: null,
                },
            }
            nodeDescription.inputs = {
                input0: {
                    inputTitle: 'Array',
                    dataType: 'Array',
                    isInputBoxRequired: false,
                    pinInId: null,
                },
            }
            nodeDescription.outputs = {
                output0: {
                    outputTitle: ' Array',
                    dataType: 'Array',
                    pinOutId: null,
                }
            }
            nodeDescription.rows = 2;
            nodeDescription.colums = 10;
        }
        new this.ProgramNode(nodeDescription, location, layer, stage);
    }


}



/*

//required json
{
    type: string,
    id: num,
    inputs:{
        count: integer,
        execIn1:{
            name: "",
            wire: KonvaWire else null
        }
        ip1: {
            dataType: string,
            default: num/str etc,
            value: num/str etc,
            name: ""
            wire: Konva.Line else null if no wire
        }
    }
    outputs:{
        count: integer,
        execOut1:{
            name: "",
            wire: KonvaWire else null
        }
        out1: {
            dataType: string,
            default: num/str etc,
            value: num/str etc,
            name: ""
            wire: Konva.Line else null if no wire
        }
    }

}


*/