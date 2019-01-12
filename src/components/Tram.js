import React, { Component } from 'react';
import './tram.css';
import { Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { ClipLoader } from 'react-spinners';
import { LocalTime, ChronoUnit } from 'js-joda';

const tramIcon = new L.Icon({
    iconUrl: '/img/tram.svg',
    iconRetinaUrl: '/img/tram.svg',
    iconSize: [25, 25],
});

export default class Tram extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showPath: false,
        };
        this.normalizeCoords = this.normalizeCoords.bind(this);
        this.displayPath = this.displayPath.bind(this);
        this.showPopup = this.showPopup.bind(this);
        this.hidePopup = this.hidePopup.bind(this);
        this.getWaypoints = this.getWaypoints.bind(this);
        this.getStops = this.getStops.bind(this);
        this.getDelay = this.getDelay.bind(this);
    }

    getWaypoints() {
        fetch('http://localhost:8080/pathInfo/vehicle/' + this.props.info.id)
            .then(response => response.json())
            .then(path => {
                path = path.paths[0];
                let wayPoints = path.wayPoints.map(obj => this.normalizeCoords(obj));
                path.wayPoints = wayPoints;
                this.setState({ path: path })
            });
    }

    getStops() {
        fetch('http://localhost:8080/tripInfo/tripPassages/' + this.props.info.tripId)
            .then(response => response.json())
            .then(obj => {
                let stops = [...new Set(obj.actual)]; // because some stops were duplicated

                this.setState({
                    stops: stops,
                    nextStop: stops[0].stop.shortName,
                });
            });
    }

    getDelay() {
        fetch('http://localhost:8080/passageInfo/stops/' + this.state.nextStop)
            .then(response => response.json())
            .then(passages => {

                let passage = passages.actual.filter(passage => (passage.vehicleId == this.props.info.id))[0];

                if (passage != null) {

                    let actualTime = LocalTime.parse(passage.actualTime);
                    let plannedTime = LocalTime.parse(passage.plannedTime);

                    let delay = plannedTime.until(actualTime, ChronoUnit.MINUTES);
                    this.setState({ delay: delay })
                }
            });
    }

    displayPath() {
        if (this.state.path == undefined || this.state.stops == undefined) {
            return '';
        }
        if (this.state.showPath) {
            return <Polyline positions={this.state.path.wayPoints} color={this.state.path.color} />;
        }
        return '';
    }

    showPopup() {
        this.setState({ showPath: true });
        this.getWaypoints();
        this.getStops();
        if (this.state.nextStop != undefined) {
            this.getDelay();
        }
        setInterval(() => {
            this.getStops();
            if (this.state.nextStop != undefined) {
                this.getDelay();
            }
        }, 10000);
    }

    hidePopup() {
        this.setState({ showPath: false });
    }

    displayStop(stop) {
        return <li key={stop.stop.id}>{stop.stop_seq_num}. {stop.stop.name}</li>;
    }

    normalizeCoords(obj) {
        if (obj.lat !== undefined && obj.lon !== undefined) {
            obj.lat /= (1000.0 * 3600.0);
            obj.lon /= (1000.0 * 3600.0);
        }
        return obj;
    }

    render() {

        if (this.state.path == undefined || this.state.stops == undefined) {
            return (
                <Marker key={this.props.info.id} position={[this.props.info.latitude, this.props.info.longitude]} icon={tramIcon} onClick={this.showPopup}>
                    <Popup>
                        <ClipLoader />
                    </Popup>
                </Marker>
            );
        }

        let delay = 'obliczam...';

        if (this.state.delay != undefined) {
            delay = this.state.delay;

            if (delay > 0) {
                delay = <span className="delay-text">{delay} min</span>;
            }
            else {
                delay = <span className="nodelay-text">brak</span>;
            }
        }

        return (
            <>
                <Marker key={this.props.info.id} position={[this.props.info.latitude, this.props.info.longitude]} icon={tramIcon} onClick={this.showPopup}>
                    <Popup onClose={this.hidePopup}>
                        <h2 className="tram-name">{this.props.info.name}</h2>
                        Opóźnienie: {delay}<br />
                        Kolejne przystanki:
                        <ul className="stops-list">
                            {this.state.stops.map(stop => this.displayStop(stop))}
                        </ul>
                    </Popup>
                </Marker>
                {this.displayPath()}
            </>
        );
    }
}