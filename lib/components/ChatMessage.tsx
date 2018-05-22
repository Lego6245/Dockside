import * as React from 'react';
import { ChatLine } from '../store/chatStore';

let styles = require('./ChatMessage.scss');

export interface ChatMessageProps {
    message: ChatLine
}

export class ChatMessage extends React.Component<ChatMessageProps, {}> {
    render() {
        let { message } = this.props;
        return <div className={styles.messageLine}>
            { message.timestamp + " " + message.channel + ": " + message.text }
        </div>
    }
}