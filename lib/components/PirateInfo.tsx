import * as React from 'react';

export class PirateInfo extends React.Component<BasicPirateInfo, {}> {
    render() {
        let { pirate, ocean } = this.props;
        return <div>
            Basic Pirate Info:
            <div>
                Pirate: {pirate} Ocean: {ocean}
            </div>
        </div>;
    }
}