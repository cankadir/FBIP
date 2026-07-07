import * as L from 'leaflet';

export const undevelopedOwner = 'bip-undevelopped';
export const hatchBgColor = '#82C444';
export const hatchLineColor = '#274200';
export const hatchStrokeColor = '#ffffff';
const crossHatchPatternId = 'bip-crosshatch';
const crossHatchSelectedPatternId = 'bip-crosshatch-selected';

// Bottom → top: parcels, hatch, border white, border dash, selected outline
export const mapPanes = {
    parcels: 'fbip-parcels',
    hatch: 'fbip-hatch',
    borderWhite: 'fbip-border-white',
    borderDash: 'fbip-border-dash',
    selected: 'fbip-selected',
};

export function isUndevelopedOwner(owner) {
    return owner === undevelopedOwner;
}

export function enforceMapLayerOrder(map) {
    if (!map) return;
    var order = [
        mapPanes.parcels,
        mapPanes.hatch,
        mapPanes.borderWhite,
        mapPanes.borderDash,
        mapPanes.selected,
    ];
    order.forEach(function (name, i) {
        var pane = map.getPane(name);
        if (pane) pane.style.zIndex = 410 + (i * 10);
    });
}

export function setupMapPanes(map) {
    if (!map || map._fbipPanesReady) return;

    [mapPanes.parcels, mapPanes.hatch, mapPanes.borderWhite, mapPanes.borderDash, mapPanes.selected]
        .forEach(function (name) {
            if (!map.getPane(name)) map.createPane(name);
        });

    enforceMapLayerOrder(map);
    map._fbipPanesReady = true;
}

function getPaneSvg(map, paneName) {
    var pane = paneName ? map.getPane(paneName) : map.getPanes().overlayPane;
    if (!pane) return null;
    return pane.querySelector('svg');
}

export function getColor(d) {
    return d === "other" ? "var(--stateColor)" :
        d === "bip"  ? "var(--parkColor)" :
        d === undevelopedOwner  ? "var(--parkColor)" :
        d === ""  ? "FFFFFF" :
                    '#FFFFFF';
}

export const selectColor = '#5BBA02';

export function getSelectedFillColor() {
    return selectColor;
}

export function getParcelStyle(owner) {
    var parcelStyle = {
        fillColor: getColor(owner),
        color: lineColor(owner),
        fillOpacity: 0.9,
        weight: lineWeight(owner),
        opacity: 0.9,
    };

    if (isUndevelopedOwner(owner)) {
        parcelStyle.weight = 0;
        parcelStyle.opacity = 0;
        parcelStyle.color = 'transparent';
    }

    return parcelStyle;
}

export function lineColor(d) {
    return d === "other" ? "white" :
        d === "bip"  ? "white" :
        d === undevelopedOwner  ? "white" :
        d === ""  ? "black" :
                    '#000000';
}

export function lineWeight(d) {
    return d === "other" ? 0.8 :
        d === "bip"  ? 0.8 :
        d === undevelopedOwner  ? 0.8 :
        d === ""  ? .5 :
                    .5;
}

export function normalizeBbl(bbl) {
    if (bbl == null || bbl === '') return '';
    return String(bbl).replace(/\.0+$/, '');
}

export function getUndevelopedBbls(table) {
    if (!table || !table.length) return [];
    return table
        .filter(function (row) { return row['Owner'] === undevelopedOwner; })
        .map(function (row) { return normalizeBbl(row['BBL']); })
        .filter(Boolean);
}

export function getGeojsonFeatures(geojson) {
    if (!geojson) return [];
    return Array.isArray(geojson) ? geojson : (geojson.features || []);
}

export function getUndevelopedFeatures(geojson, table) {
    var undevelopedBbls = getUndevelopedBbls(table);
    if (!undevelopedBbls.length) return [];

    return getGeojsonFeatures(geojson).filter(function (feature) {
        var featureBbl = normalizeBbl(feature.properties && feature.properties.BBL);
        return undevelopedBbls.indexOf(featureBbl) !== -1;
    });
}

function createCrossHatchPattern(id, bgColor) {
    var pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');

    pattern.setAttribute('id', id);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', '10');
    pattern.setAttribute('height', '10');
    pattern.setAttribute('patternTransform', 'rotate(0 5 5) scale(0.8)');

    var bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '10');
    bg.setAttribute('height', '10');
    bg.setAttribute('fill', bgColor);
    pattern.appendChild(bg);

    var lines = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lines.setAttribute('x1', '-10');
    lines.setAttribute('y1', '5');
    lines.setAttribute('x2', '20');
    lines.setAttribute('y2', '5');
    lines.setAttribute('stroke', hatchLineColor);
    lines.setAttribute('stroke-width', '1.5');
    lines.setAttribute('stroke-opacity', '0.7');
    lines.setAttribute('stroke-linecap', 'butt');
    pattern.appendChild(lines);

    return pattern;
}

export function addCrossHatchPattern(map, paneName) {
    if (!map || map._bipCrossHatchPatternAdded) return true;

    var svg = getPaneSvg(map, paneName || mapPanes.hatch);
    if (!svg) return false;

    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.appendChild(createCrossHatchPattern(crossHatchPatternId, hatchBgColor));
    defs.appendChild(createCrossHatchPattern(crossHatchSelectedPatternId, selectColor));
    svg.insertBefore(defs, svg.firstChild);
    map._bipCrossHatchPatternAdded = true;
    return true;
}

export function applyHatchFill(layer, selected) {
    if (!layer._path) return;

    var patternId = selected ? crossHatchSelectedPatternId : crossHatchPatternId;
    layer._path.setAttribute('fill', 'url(#' + patternId + ')');
    layer._path.setAttribute('stroke', hatchStrokeColor);
    layer._path.setAttribute('stroke-width', '0.8');
    layer._path.setAttribute('stroke-opacity', '0.9');
    layer._path.style.pointerEvents = 'none';
}

export function getHatchOverlayStyle() {
    return {
        stroke: true,
        color: '#ffffff',
        weight: 0.8,
        opacity: 0.9,
        fillOpacity: 1,
        interactive: false,
    };
}

export function addLabel2(map, lat, lon, label) {
    var myIcon = L.divIcon({
        className: 'map-labels',
        html: label
    });
    L.marker([lat, lon], { icon: myIcon }).addTo(map);
}
