<script>
  import L from "leaflet";
  import { onMount } from "svelte";
  import { count } from "./store.js";
  import { setupMapPanes } from "./utils.js";
  
  let mapContainer;

  let map = L.map(L.DomUtil.create("div"), {
    center: [40.723, -73.961],
    zoom: 17,
  });

  setupMapPanes(map);

  //set map to store. It needs to be accessed from other objects
  count.set(map)

  let tileURL = 'https://api.mapbox.com/styles/v1/eichners/ckrkvjuaq9ovv17o7o8xaf6fh/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZWljaG5lcnMiLCJhIjoiY2lrZzVneDI4MDAyZ3VkbTZmYWlyejUzayJ9.vEGckM-D3AjV4jXmdibXyw'

  L.tileLayer(tileURL, {
    maxZoom: 19,
    minZoom: 16,
    attribution:'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
  }).addTo(map);

  onMount(() => {
    //For Resize Updates
    mapContainer.appendChild(map.getContainer());
    map.getContainer().style.width = "100%";
    map.getContainer().style.height = "100%";
    map.invalidateSize();
  });

</script>

<style>
  .map {
    height: 100%;
    width: 100%;
  }

</style>

<div class="map" bind:this="{mapContainer}">
  <slot></slot>
</div>