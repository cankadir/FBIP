
<script>
    import * as L from 'leaflet';
    import { count, mapLabels, mapActions } from "./store.js";
    import {
        addLabel2,
        getUndevelopedFeatures, addCrossHatchPattern, applyHatchFill, getHatchOverlayStyle,
        mapPanes, isUndevelopedOwner, enforceMapLayerOrder,
        getParcelStyle, getSelectedFillColor, normalizeBbl,
    } from "./utils.js";

    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    export let geojson;
    export let table = [];

    let hatchLayer;
    let previousActiveLayer;
    let previousHatchLayer;
    let activeOutlineLayer;

    let map;
    count.subscribe(value => {
        map = value;
    });

    function findHatchLayer(feature) {
        if (!hatchLayer) return null;

        var bbl = normalizeBbl(feature.properties && feature.properties.BBL);
        var match = null;

        hatchLayer.eachLayer(function (layer) {
            var layerBbl = normalizeBbl(layer.feature.properties && layer.feature.properties.BBL);
            if (layerBbl === bbl) match = layer;
        });

        return match;
    }

    function clearSelection() {
        if (previousActiveLayer && previousActiveLayer._savedStyle) {
            previousActiveLayer.setStyle(previousActiveLayer._savedStyle);
            previousActiveLayer._savedStyle = null;
        }
        previousActiveLayer = null;

        if (previousHatchLayer) {
            applyHatchFill(previousHatchLayer, false);
            previousHatchLayer = null;
        }

        if (activeOutlineLayer) {
            map.removeLayer(activeOutlineLayer);
            activeOutlineLayer = null;
        }

        enforceMapLayerOrder(map);
    }

    function activePolygon(e) {
        map.setView(e.target.getBounds().getCenter(), 17);

        clearSelection();

        var owner = e.target.feature.properties.Owner;
        var layer = e.target;

        layer._savedStyle = getParcelStyle(owner);
        layer.setStyle({
            fillColor: getSelectedFillColor(),
            fillOpacity: 0.9,
        });
        previousActiveLayer = layer;

        if (isUndevelopedOwner(owner)) {
            previousHatchLayer = findHatchLayer(layer.feature);
            if (previousHatchLayer) applyHatchFill(previousHatchLayer, true);
        }

        // Orange outline only (no fill) in selected pane — above hatch and borders
        activeOutlineLayer = L.geoJSON(e.target.feature, {
            pane: mapPanes.selected,
            interactive: false,
            style: {
                stroke: true,
                color: '#F4B303',
                weight: 4,
                opacity: 1,
                fill: false,
                fillOpacity: 0,
            },
        }).addTo(map);

        enforceMapLayerOrder(map);

        dispatch('message', {
            active: e.target
        });
    }

    function style(feature) {
        return getParcelStyle(feature.properties.Owner);
    }

    function onEachFeature(feature, layer) {
        if (feature.properties.Owner) {
            layer.openTooltip();
            layer.on({
                click: activePolygon,
            });
        }
    }

    const layer = L.geoJSON(geojson, {
        pane: mapPanes.parcels,
        style: style,
        onEachFeature: onEachFeature,
    }).addTo(map);

    var undevelopedFeatures = getUndevelopedFeatures(geojson, table);

    if (undevelopedFeatures.length > 0) {
        hatchLayer = L.geoJSON({
            type: 'FeatureCollection',
            features: undevelopedFeatures,
        }, {
            pane: mapPanes.hatch,
            style: getHatchOverlayStyle,
            interactive: false,
        }).addTo(map);

        hatchLayer.eachLayer(function (polygon) {
            applyHatchFill(polygon);
        });

        addCrossHatchPattern(map, mapPanes.hatch);
    }

    layer.eachLayer(function (polygon) {
        let owner = polygon.feature.properties.Owner;
        let bbl = normalizeBbl(polygon.feature.properties.BBL);

        if (!owner || owner === '') {
            polygon._path.id = String(polygon.feature.properties.Block) + String(polygon.feature.properties.Lot) + ' outside';
        } else {
            polygon._path.id = bbl + ' bip';
        }
    });

    mapActions.resetSelection = clearSelection;
    enforceMapLayerOrder(map);

    mapLabels.forEach(({ lat, lon, label }) => addLabel2(map, lat, lon, label));

    map.on('zoomend', function () {
        var zoomLevel = map.getZoom();
        if (zoomLevel < 17) {
            [].forEach.call(document.querySelectorAll('.map-labels'), function (el) {
                if (el.innerHTML !== 'BUSHWICK INLET&nbsp;PARK') {
                    el.style.visibility = 'hidden';
                } else {
                    el.style.visibility = 'visible';
                }
            });
        } else {
            [].forEach.call(document.querySelectorAll('.map-labels'), function (el) {
                if (el.innerHTML !== 'BUSHWICK INLET&nbsp;PARK') {
                    el.style.visibility = 'visible';
                } else {
                    el.style.visibility = 'hidden';
                }
            });
        }
    });

</script>


<slot />
