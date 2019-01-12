import React, { Component } from 'react';
import './stop.css';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { LocalTime, ChronoUnit } from 'js-joda';
import { ClipLoader } from 'react-spinners';

const stopIcon = new L.Icon({
    iconUrl: '/img/stop.svg',
    iconRetinaUrl: '/img/stop.svg',
    iconSize: [20, 20],
});

export default class Stop extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.displayPassage = this.displayPassage.bind(this);
        this.getPassages = this.getPassages.bind(this);
        this.showPopup = this.showPopup.bind(this);
    }

    componentDidMount() {

    }

    getPassages() {
        fetch('https://cracow-trams.herokuapp.com/passageInfo/stops/' + this.props.info.shortName)
            .then(response => response.json())
            .then(passages => {
                passages = passages.actual;
                passages = passages.filter((passage) => (passage.status = 'PREDICTED' && passage.actualTime !== null && passage.actualTime !== undefined && passage.plannedTime !== null && passage.plannedTime !== undefined));
                this.setState({ passages: passages })
            });
    }

    displayPassage(passage) {
        let actualTime = LocalTime.parse(passage.actualTime);
        let plannedTime = LocalTime.parse(passage.plannedTime);

        let delay = plannedTime.until(actualTime, ChronoUnit.MINUTES);

        return (
            <li key={passage.passageid}><div className="passage-number">{passage.patternText}</div> w kierunku {passage.direction} o {passage.plannedTime} <span className="delay-text">{delay > 0 ? `(+${delay}min)` : ''}</span></li>
        );
    }

    showPopup() {
        this.getPassages();
        setInterval(() => this.getPassages(), 60000);

    }

    render() {

        if (this.state.passages == undefined) {
            return (
                <Marker position={[this.props.info.latitude, this.props.info.longitude]} icon={stopIcon} onClick={this.showPopup}>
                    <Popup>
                        <ClipLoader />
                    </Popup>
                </Marker>
            );
        }
            return (
                <Marker position={[this.props.info.latitude, this.props.info.longitude]} icon={stopIcon} onClick={this.showPopup}>
                    <Popup className="stop-popup">
                        <h2 className="stop-name">{this.props.info.name}</h2>
                        Planowe odjazdy:
                        <ul className="passages-list">
                            {this.state.passages.map(passage => this.displayPassage(passage))}
                        </ul>
                    </Popup>
                </Marker>
            );
    }

}