import { ipcRenderer } from 'electron';
import { YoWebParser } from './parser/yowebParser';
import * as fs from 'fs'
import * as readline from 'readline';
import { ChatLine, chatMessageStore } from './store/chatStore';
import { ChatWindow } from './components/ChatWindow';
import { PirateInfo } from './components/PirateInfo';
import * as ReactDOM from 'react-dom';
import * as React from 'react';

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const divElement = document.getElementById("chatspot");

const TIMESTAMP_REGEX = /\[[0-9]{2}\:[0-9]{2}\:[0-9]{2}\]/;

let currentByte = 0;

let readingFile = false;

let skillGetter: YoWebParser = null;

// Example use of Bridge API
ipcRenderer.send('GET_PIRATE_INFO')
ipcRenderer.on('GET_PIRATE_INFO', (_, pirateInfo: BasicPirateInfo) => {
    ReactDOM.render(
        React.createElement(PirateInfo, pirateInfo), document.getElementById('pirateinfo')
    );
});

function parseChatLine(line: string): ChatLine {
    let chatLine = <ChatLine>{};

    if (!skillGetter) {
        skillGetter = new YoWebParser('obsidian');
    }

    // get timestamp
    const time = TIMESTAMP_REGEX.exec(line);
    if (time) {
        chatLine.timestamp = time[0];
    }

    line = line.replace(TIMESTAMP_REGEX, "").trim();
    
    // try to obtain channel and user information;
    let lineClone = line.replace(/\".*\"/, "").trim();
    // if we found a matching pair of quotes, we're probably not a system line
    if (lineClone != line) {
        chatLine.text = /\".*\"/.exec(line)[0];
        const pieces = lineClone.split(' ');
        chatLine.user = pieces[0];
        skillGetter.getPirateSkillInfo(pieces[0]).then( (value) => {
            console.log(value);
        });
        if (pieces.length > 2) {
            chatLine.channel = pieces.splice(1, pieces.length - 2
                ).map((word: string) => { return word[0].toUpperCase() + word.substr(1);
                }).join(' ');
        } else {
            chatLine.channel = 'Local';
        }
    } else {
        chatLine.text = line;
        chatLine.channel = 'System';
    }

    return chatLine;
}

if (divElement) {
    divElement.addEventListener("drop", function listner(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (currentByte == 0 && evt.dataTransfer.files && evt.dataTransfer.files.length > 0) {
            let file = evt.dataTransfer.files[0]
            currentByte = file.size;
            fs.watch(file.path, (eventType, filename) => {
                if(!readingFile) {
                    readingFile = true;
                    let masterStream = fs.createReadStream(file.path, { start: currentByte});

                    let readStream = readline.createInterface({
                        input: masterStream
                    });

                
                    readStream.on('line', (line) => {
                        if (line && /\S/.test(line)) {
                            const parsedLine = parseChatLine(line);
                            chatMessageStore.addChatLine(parsedLine);
                        }
                    }).on('close', () => {
                        console.log('closed');
                        readingFile = false;
                        currentByte = currentByte + masterStream.bytesRead;
                    });
                }
            });
        }
    });

    divElement.addEventListener('dragover', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        evt.dataTransfer.dropEffect = currentByte == 0 ? 'link' : 'none';
    });

    document.addEventListener('dragover', (evt) => {
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'none';
    });
}

ReactDOM.render(
    React.createElement(ChatWindow), document.getElementById('windowspot')
);