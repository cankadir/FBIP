
<script>
    import * as L from 'leaflet';
    import { count } from "./store.js";
    import { mapPanes } from "./utils.js";
    import {afterUpdate} from "svelte";

    export let geojson;

    //countValue is map object stored in the store.js
    let map;
    count.subscribe(value => {
        map = value;
    });

    //White Line Behind the dashed Border
    function styleBehind(feature) {
        return {
            color: "white",
            weight: 5,
        };
    }

    const layerBehind = L.geoJSON(geojson,{
        pane: mapPanes.borderWhite,
        style: styleBehind,
        interactive: false,
    }).addTo(map);

    //Dashed Orange Line
    function style(feature) {
        return {
            color: "var(--borderOrange)",
            weight: 4,
            dashArray: '5, 3', 
            lineCap: 'butt',
        };
    }

    const layer = L.geoJSON(geojson,{
        pane: mapPanes.borderDash,
        style: style,
        interactive: false,
    }).addTo(map);

    
    // Assign a seperate ID for park and outside elements. 
    layer.eachLayer(function (polygon) {
            polygon._path.id = "Border"            
        });

    layer.eachLayer(function (polygon) {
        polygon._path.id = "BorderBehind"
        
    });

    afterUpdate(() => {
        //Filter photos to active data
        setTimeout( function(){
           
            [].forEach.call(document.querySelectorAll('.map-labels'), function (el) {
                if( el.innerHTML === "BUSHWICK INLET&nbsp;PARK" ){
                    el.style.visibility = 'hidden';
                }else{
                    el.style.visibility = 'visible';
                }
            });

        },500)
	});
  
	
    
</script>


<slot />