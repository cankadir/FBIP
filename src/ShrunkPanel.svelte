
<script>
    export let active_data;
    export let table;

    let active_table;
    if (active_data){
            // Get active row from data table
            active_table = table.filter( function(row){
                return `${row['BBL']}` === active_data[0].properties.BBL;
            });
    }

</script>


<div class="right-content">

    {#if active_table}

        <div class="info-title">
            <span id='pane-title' >{active_table[0]['Text-Name']}</span>
        </div>

    {:else}

        <div class="info-title">
            <span id='pane-title' >About the Map</span>
        </div>

    {/if}

</div>

