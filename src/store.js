import { writable } from "svelte/store";

let map = {}
export const count = writable(map);
export const active = writable("");

// Set by Geojson.svelte so App can reset selection on home click
export const mapActions = {
    resetSelection: function () {}
};

export const mapLabels = [
    { lat: 40.7216, lon: -73.9624, label: "Marsha&nbsp;P. Johnson State&nbsp;Park" },
    { lat: 40.72430238, lon: -73.95974738, label: "Bayside" },
    { lat: 40.7233, lon: -73.9599, label: "50&nbsp;Kent" },
    { lat: 40.72589720, lon: -73.9612948, label: "Monitor&nbsp;Museum" },
    { lat: 40.72586, lon: -73.9591, label: "40&nbsp;Quay" },
    { lat: 40.72525, lon: -73.9581, label: "Motiva" },
    { lat: 40.72331325, lon: -73.96132996, label: "CitiStorage South" },
    { lat: 40.72234, lon: -73.9616, label: "86&nbsp;Kent" },
    { lat: 40.7235, lon: -73.961, label: "BUSHWICK INLET&nbsp;PARK" },
    { lat: 40.72406, lon: -73.9611, label: "CitiStorage North" },
];

export const legendItems = [
    { type: 'hr', label: 'Bushwick Inlet Park Boundary' },
    { type: 'hatch', label: 'NYC Parks Dept. Land - undeveloped' },
    { type: 'rect', color: 'var(--parkColor)', label: 'NYC Parks Dept. Land - open to the public' },
    { type: 'rect', color: 'var(--stateColor)', label: 'Other Adjacent Waterfront Sites' },
];