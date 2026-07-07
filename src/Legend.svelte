
<script>
    import { legendItems } from './store.js';
    import HatchSwatch from './HatchSwatch.svelte';
</script>

<div class="legend">
    <div class="title"> Bushwick Inlet Park Lots</div>

    {#each legendItems as item}
        <div class="legend-item">
            {#if item.type === 'hr'}
                <div><hr></div>
            {:else if item.type === 'hatch'}
                <div class="rect">
                    <HatchSwatch />
                </div>
            {:else if item.type === 'rect'}
                <div class="rect" style="background:{item.color}"></div>
            {/if}
            <div class="legend-text">{item.label}</div>
        </div>
    {/each}

</div>

<style>

    .legend {
        position:absolute;
        bottom:15px;
        left:15px;
        display:flex;
        flex-direction:column;
        gap:10px;
        font-size: 10pt;
        width: 260px;
        z-index: 2000;
        padding: 15px;
        line-height: 10pt;
        border-radius: 8px;
        border-style: solid;
        border-color: rgb(211, 211, 211);
        background-color: white;
        border-width: 2px;
        pointer-events: none;
    }

    .legend-text{
        font-size: 10pt;
        font-weight: 400;
        margin-left: 8px;
        color:#444;
    }

    .title{
        font-size: 16pt;
        margin-bottom: 10px;
        font-weight: 700;
        color: #555;
    }

    hr{
        border: 2px dashed var(--borderOrange);
        stroke-dasharray: 3em 1em;
    }

    .legend-item{
        display: grid;
        grid-template-columns: 0.3fr 1fr;
    }

    .rect{
        position: relative;
        width:100%;
        height:100%;
        stroke-dasharray: 2em;
        z-index:2001;
    }

</style>
