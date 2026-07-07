<script>

    import { count } from "./store.js";
    import L from "leaflet";

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    let map;
    count.subscribe(value => {
        map = value;
    });

    function homeclick(){
        map.setView([40.723, -73.961],17);
        dispatch('homebutton');
    }

</script>


<div class="homebutton" on:click={homeclick}>
    <span class="fa fa-home symbol-home" aria-hidden="true"></span>
</div>


<style>
    .homebutton{
        z-index: 800;
        height: 30px;
        width: 30px;
        position: absolute;
        top:85px;
        left:10px;
        background-color: white;
        text-align: center;
        border-radius: 4px;
        border:2px solid rgba(0,0,0,0.2);
        cursor: pointer;
        -webkit-background-clip: padding-box;
        background-clip: padding-box;
    }

    span{
        width:25px;
        height:auto;
        margin:0 auto;
        margin-top: 8px;
    }
</style>