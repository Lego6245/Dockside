import { ipcMain } from 'electron';
import { EventEmitter } from 'events';
import * as child_process from 'child_process';

type IncomingBridgeMessage = {
    Type: 'PirateInfo' | 'Error',
    Data: any
};

type OutgoingBridgeMessage = {
    Action: 'send' | 'getPirateInfo',
    Data?: string
};

const PATH_TO_EXECUTABLE = `${__dirname}/resources/win/quartermaster.exe`;

class BridgeController extends EventEmitter {
    child: child_process.ChildProcess;

    constructor() {
        super();
    }

    startProcess() {
        this.child = child_process.spawn(PATH_TO_EXECUTABLE);
        this.child.stdout.on('data', this.handleChildStdout.bind(this));
        this.child.on('exit', this.handleChildExit.bind(this));
        this.attachIpcListeners();
    }

    attachIpcListeners() {
        ipcMain.on('SEND_MESSAGE_TO_CLIENT', this.sendMessage.bind(this));
        ipcMain.on('GET_PIRATE_INFO', this.getPirateInfo.bind(this));
    }

    handleChildExit() {
        console.log('Child process exited');
    }

    handleChildStdout(output: string|Buffer) {
        let data: any;
        let message: IncomingBridgeMessage = JSON.parse(output.toString());
        switch (message.Type) {
            case "PirateInfo":
                data = JSON.parse(message.Data);
                this.emit('pirateInfo', data);
                break;
            case "Error":
                data = message.Data;
                console.log(`Child Process Error: ${data}`);
                break;
            default:
                break;
        }
    }

    getPirateInfo(event: Electron.Event) {
        const payload: OutgoingBridgeMessage = {
            Action: 'getPirateInfo'
        };
        this.stringifyAndSend(payload);
        this.once('pirateInfo', (pirateInfo: BasicPirateInfo) => {
            event.sender.send('GET_PIRATE_INFO', pirateInfo);
        });
    }

    sendMessage(event: Electron.Event, message: string) {
        const payload: OutgoingBridgeMessage = {
            Action: 'send',
            Data: message
        };
        this.stringifyAndSend(payload);
    }

    stringifyAndSend(message: OutgoingBridgeMessage) {
        const payload: string = JSON.stringify(message);
        this.child.stdin.write(payload + '\n');
    }
}

export const bridgeController = new BridgeController();
