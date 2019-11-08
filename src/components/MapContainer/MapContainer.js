import React from "react";
import { Map, TileLayer } from "react-leaflet";
import "./map-container.css";
import TramStop from "../TramStop/TramStop";
import Tram from "../Tram/Tram";
import Bus from "../Bus/Bus";
import BusStop from "../BusStop/BusStop";
import MarkerClusterGroup from "react-leaflet-markercluster";

export default function MapContainer({
  buses,
  busStops,
  trams,
  tramStops,
  clustering,
  onTramOpen,
  onTramStopOpen,
  onBusOpen,
  onBusStopOpen
}) {
  const initialPosition = [50.0613888889, 19.9383333333];
  const initialZoom = 13;

  function displayTramStop(tramStop) {
    return (
      <TramStop
        key={tramStop.id}
        info={tramStop}
        onMarkerOpen={onTramStopOpen}
      />
    );
  }

  function displayTram(tram) {
    return <Tram key={tram.id} info={tram} onMarkerOpen={onTramOpen} />;
  }

  function displayBusStop(busStop) {
    return (
      <BusStop key={busStop.id} info={busStop} onMarkerOpen={onBusStopOpen} />
    );
  }

  function displayBus(bus) {
    return <Bus key={bus.id} info={bus} onMarkerOpen={onBusOpen} />;
  }

  if (
    tramStops === undefined ||
    busStops === undefined ||
    trams === undefined ||
    buses === undefined
  ) {
    return null;
  }

  return (
    <Map center={initialPosition} zoom={initialZoom} maxZoom={18}>
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {clustering ? (
        <>
          <MarkerClusterGroup
            showCoverageOnHover={false}
            disableClusteringAtZoom={15}
            spiderfyOnMaxZoom={false}
          >
            {tramStops.map(stop => displayTramStop(stop))}
            {trams.map(tram => displayTram(tram))}
            {busStops.map(stop => displayBusStop(stop))}
            {buses.map(bus => displayBus(bus))}
          </MarkerClusterGroup>
        </>
      ) : (
        <>
          {tramStops.map(stop => displayTramStop(stop))}
          {trams.map(tram => displayTram(tram))}
          {busStops.map(stop => displayBusStop(stop))}
          {buses.map(bus => displayBus(bus))}
        </>
      )}
    </Map>
  );
}
