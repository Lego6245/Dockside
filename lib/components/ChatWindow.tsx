import { observer } from 'mobx-react';
import { chatMessageStore } from '../store/chatStore';
import { ChatMessage } from './ChatMessage';
import * as React from 'react';

@observer
export class ChatWindow extends React.Component<{}, {}> {
    render() {
        
        return <div id="chatWindow">
                <span>This is a chat window.</span>
                {chatMessageStore.chatMessages.map( (message) => {
                    return <ChatMessage message={message} />
                })}
        </div>;
    }
}