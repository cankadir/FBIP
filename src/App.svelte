<script>
	import LeafletMap from './Map.svelte'
	import ButtonHome from './Button_Home.svelte'
	import ButtonLayer from './Button_Layer.svelte'
	import {onMount} from 'svelte'
	import GeoJson from './Geojson.svelte';
	import GeoJsonBorder from './GeojsonBorder.svelte';
	import InfoPanel from './InfoPanel.svelte';
	import Legend from './Legend.svelte';
	import LegendSmall from './Legend_Small.svelte';
	import ShrunkPanel from './ShrunkPanel.svelte';
	import { normalizeBbl } from './utils.js';
	import { mapActions } from './store.js';

	//Retrieve Data from Github Repo
	// const url_lots = "https://raw.githubusercontent.com/PrattSAVI/FBIP/main/public/data/BIP_FinalLots.geojson";
	const url_lots = "https://raw.githubusercontent.com/cankadir/FBIP/refs/heads/2606-updates/public/data/260626_BIP_updatedLots.geojson";
	const url_border = "https://raw.githubusercontent.com/cankadir/FBIP/refs/heads/2606-updates/public/data/BIP_lines_4326.geojson";

	let active_data;

	//This gets filled with loadaed data to highlight
	let data = {
		bip:[],
		border:[],
	}
	let table = [];

	//Load Data
	let spreadsheetId = '1us5-06-JBfrqcsxBDfNWbMPZeMXbD6-dTSy_rqsmhP8'
	let sheet = 'Details'
	const endpoint = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&tq&sheet=${sheet}`;

	onMount(async () => {
		
		// Lots geojon geometry
		const res = await fetch( url_lots );
		let data_lots = await res.json();
		let temp = data_lots.features;

		// Details from Google Sheets
		const response = await fetch(endpoint);
		const textData = await response.text();
		const jsonData = JSON.parse( textData.substring(47).slice(0, -2) );
		let data_table = jsonData['table'];

		// Create JS Object from Google Sheet
		data_table['rows'].forEach(el => {
			let values = [];
			let keys = [];
			for(let i=0;i<13;i++){
				let c = data_table['cols'][i]['label']
				let v = (el['c'][i] != null) ? el['c'][i]['v'] : null;

				values.push( v );
				keys.push( c )
			}

			var result = {};
			keys.forEach((key, i) => result[key] = values[i]);
			table.push( result );
			
		});

		//Add Owner Info to BIP, this get pushed into Geojson for styling
		temp.forEach( el => {
			let ac = table.filter( row =>{
				return normalizeBbl(row['BBL']) === normalizeBbl(el.properties.BBL)
			})
			if (ac[0]) el.properties.Owner = ac[0]['Owner'];
		})
		
		// Initiate data.BIP
		data.bip = temp;

		// Borders
		const res2 = await fetch( url_border );
		let border_lots = await res2.json();
		data.border = border_lots.features;

	});

	//Handle Clicked Geojson Object, Point or Polygon. Returns active Polygon Object
	function handleMessage(e){

		//Bring Panel Back
		if (shrunk){
			shrunk = !shrunk;
			document.getElementsByClassName('legend')[0].style.visibility = "hidden";
		}

		// Match clicked parcel by BBL (Block+Lot is not unique — e.g. CitiStorage N/S)
		let active = e.detail.active;
		let bbl = normalizeBbl(active.feature.properties.BBL);

		active_data = data.bip.filter(function (feature) {
			return normalizeBbl(feature.properties.BBL) === bbl;
		});
	}

	function handleClick(e){
		active_data = null;
		mapActions.resetSelection();
	}

	let shrunk = false;
    function handleShrunk(event){
		shrunk = !shrunk;
		if (shrunk == true){
			document.getElementsByClassName('legend')[0].style.visibility = "visible";
			document.getElementsByClassName('legend')[0].style.bottom = "70px";
		} else{
			document.getElementsByClassName('legend')[0].style.visibility = "hidden";
		}
	}

	import ResizeObserver from "svelte-resize-observer";
	let width;
	let height;
	let ratio;
	let islandscape = false;
	function setShrunk(e){
		width = e.detail.clientWidth;
		height = e.detail.clientHeight;
		ratio = width/height;

		if (width > 689 ){
			shrunk = false;
			document.getElementsByClassName('legend')[0].style.visibility = "visible";
			document.getElementsByClassName('legend')[0].style.bottom = "15px";
		}else{
			//If size is smaller the 689
			if (shrunk == true){ //and shrunk
				document.getElementsByClassName('legend')[0].style.visibility = "visible";
				document.getElementsByClassName('legend')[0].style.bottom = "50px";
			} else{
				document.getElementsByClassName('legend')[0].style.visibility = "hidden";
			}
		}

		//Mobile on Landscape
		//islandscape defines legend size. 
		if( (ratio > 1) & (height < 600) ){
			if (document.getElementsByClassName('legend')[0].style.visibility === 'visible'){
				document.getElementsByClassName('legend')[0].style.visibility = "hidden";
			} 
			islandscape = true;
		}
		else{
			islandscape = false;
		}
	}

</script>

<svelte:head>
	<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.1/css/all.min.css" rel="stylesheet"/>
	<link rel="stylesheet" href="https://use.typekit.net/kjc8ltt.css">
	<link rel="stylesheet" href="leaflet.css">
</svelte:head>


{#if data.border.length > 0 }
	<div class="two-column">
		<div class="left-panel">
			<LeafletMap >
				<ButtonHome on:homebutton={handleClick}/>
				<ButtonLayer />
				<GeoJson on:message={handleMessage} geojson={data.bip} {table} />
				<GeoJsonBorder geojson={data.border} />
				<!--Legend Size is dependent on Mobile-->
				{#key islandscape}
					{#if islandscape == false}
						<Legend />
					{:else}
						<LegendSmall />
					{/if}
				{/key}
			</LeafletMap>
		</div>

		<!-- If the shrink button is pressed, show a different panel-->
		{#if shrunk == false}
			<div class="right-panel">

				<div class="shrink" on:click={handleShrunk}>
					&#10094;
				</div>

				<InfoPanel {active_data} {table}/>
			</div>
		{:else}
			<div class="right-panel shrunk">
				
				<div class="shrink" on:click={handleShrunk}>
					&#10094;
				</div>

				<ShrunkPanel {active_data} {table}/>
			</div>
		{/if}

		<ResizeObserver on:resize={(e) => setShrunk(e) } />

	</div>

{:else}
	<div class="wait">
		Loading.... <br>
		Please Wait...
	</div>
{/if}

<style>
	.wait{
		position: absolute;
		top: 50%;
		left: 50%;
		margin-top: -50px;
		margin-left: -50px;
	}

	.right-panel>.shrink{
		transform: rotate(-90deg);
	}

	.right-panel.shrunk>.shrink{
		transform: rotate(90deg);
	}

	.shrink{
		position:absolute;
		right:20px;
		top:12px;
		font-family: Arial, Helvetica, sans-serif;
		font-style: normal;
		color:#444;
		font-size:18pt;
		visibility: hidden;
		cursor: pointer;
	}

@media only screen and (max-width: 690px) {
    .shrink{
        visibility: visible;
    }
}
</style>
