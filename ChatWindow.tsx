import { observer } from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { chatMessageStore } from './chatStore'

@observer
export class ChatWindow extends React.Component<{}, {}> {
    render() {
        
        return <div id="chatWindow">
                <span>This is a chat window.</span>
                {chatMessageStore.chatMessages.map( (message) => {
                    return <span>{ message.timestamp + " " + message.channel + ": " + message.text }</span>
                })}
        </div>;
    }
}

ReactDOM.render(
    <ChatWindow />, document.getElementById('windowspot')
);