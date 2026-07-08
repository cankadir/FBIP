
<script>
    import {afterUpdate} from "svelte";
    import Carousel from 'svelte-carousel'
    import { normalizeBbl } from './utils.js';
    export let active_data;
    export let table;

    let active_table;
    let active_photos;
    let active_bbl = '';
    let photosLoading = false;
    let carousel;
    let currentPhotoIndex = 0;

    function photoSrc(photo) {
        return `./img/${photo.site}/${photo.photo.trim()}.jpg`;
    }

    function photoKey(photo) {
        return `${photo.site}/${photo.photo}`;
    }

    function checkPhotoExists(photo) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.onload = function () { resolve(true); };
            img.onerror = function () { resolve(false); };
            img.src = photoSrc(photo);
        });
    }

    function filterExistingPhotos(candidates, bbl) {
        if (!candidates.length) {
            active_photos = [];
            photosLoading = false;
            return;
        }

        photosLoading = true;

        Promise.all(
            candidates.map(function (photo) {
                return checkPhotoExists(photo).then(function (exists) {
                    return exists ? photo : null;
                });
            })
        ).then(function (results) {
            if (active_bbl !== bbl) return;
            active_photos = results.filter(Boolean);
            currentPhotoIndex = 0;
            photosLoading = false;
        });
    }

    function handlePhotoError(photo) {
        var key = photoKey(photo);
        var next = active_photos.filter(function (p) { return photoKey(p) !== key; });

        if (next.length === active_photos.length) return;

        active_photos = next;

        if (currentPhotoIndex >= active_photos.length) {
            currentPhotoIndex = Math.max(0, active_photos.length - 1);
        }
    }

    function handlePageChange(event) {
        currentPhotoIndex = event.detail;
    }

    function showPrevPhoto(event) {
        event.preventDefault();
        if (carousel) carousel.goToPrev();
    }

    function showNextPhoto(event) {
        event.preventDefault();
        if (carousel) carousel.goToNext();
    }

    function goToPhoto(index, event) {
        event.preventDefault();
        if (carousel) carousel.goTo(index);
    }

    function buildActivePhotos(row) {
        if (!row || !row['Photos']) return [];

        let photos = row['Photos']
            .split(/[,;\n]+/)
            .map(function (name) { return name.trim(); })
            .filter(Boolean);

        let credits = row['Credits']
            ? row['Credits'].split(/[,;\n]+/).map(function (c) { return c.trim(); })
            : [];

        let ac = [];
        for (let i = 0; i < photos.length; i++) {
            ac.push({
                site: `${row['BBL']}`,
                photo: photos[i],
                credit: credits[i] || ''
            });
        }
        return ac;
    }
    function getCredits(data){
        let a = []
        data.forEach(function(d){
            a.push(d.credit)
        })
        a = [...new Set(a)]; // Remove Duplicates
        return a.join(', ');
    }

    function scrollPanelToTop() {
        let element = document.getElementsByClassName('right-panel')[0];
        if (!element) return;

        element.scroll({ top: 0, behavior: 'auto' });

        // If the scroll did not work, try again after layout settles
        setTimeout(function () {
            if (element.scrollTop !== 0) {
                element.scroll({ top: 0, behavior: 'auto' });
            }
        }, 500);
    }

    // Load panel content and scroll only when the selected parcel changes
    afterUpdate(() => {
        if (active_data) {
            let bbl = normalizeBbl(active_data[0].properties.BBL);

            if (bbl !== active_bbl) {
                active_bbl = bbl;
                active_table = table.filter(function (row) {
                    return normalizeBbl(row['BBL']) === bbl;
                });
                currentPhotoIndex = 0;
                active_photos = [];
                photosLoading = false;

                if (active_table.length > 0) {
                    filterExistingPhotos(buildActivePhotos(active_table[0]), bbl);
                }

                scrollPanelToTop();
            }
        } else if (active_bbl) {
            active_bbl = '';
            active_table = undefined;
            active_photos = [];
            photosLoading = false;
            currentPhotoIndex = 0;
        }
	});

</script>

<div class="right-content">
    <!-- Show panel whena polygon is selected -->
    {#if active_table}

            {#if active_table[0]['Text-Name']}
                <div class="info-title">
                    <span id='pane-title' >{active_table[0]['Text-Name']}</span>
                </div>
            {/if}

        <!-- Photos: loading state, then carousel if any exist -->
        {#if photosLoading}
            <div class="photo-loading" aria-live="polite">
                <div class="photo-loading-spinner" aria-hidden="true"></div>
                <span>Loading photos…</span>
            </div>
        {:else if active_photos && active_photos.length}
        {#key active_bbl}
            <div class="photo-container">
                
                <Carousel
                    bind:this={carousel}
                    dots={false}
                    duration={280}
                    timingFunction="ease-out"
                    on:pageChange={handlePageChange}
                >

                    <button type="button" slot="prev" on:click={showPrevPhoto} class="custom-arrow custom-arrow-prev" aria-label="Previous photo">
                        <span class="arrow-icon">&#10094;</span>
                    </button>

                    {#each active_photos as photo}
                        <div class="carousel-slide">
                            <img
                                class="container-photos"
                                alt="Site"
                                src={photoSrc(photo)}
                                on:error={() => handlePhotoError(photo)}
                            />
                        </div>
                    {/each}

                    <button type="button" slot="next" on:click={showNextPhoto} class="custom-arrow custom-arrow-next" aria-label="Next photo">
                        <span class="arrow-icon">&#10095;</span>
                    </button>

                </Carousel>

                <div class="photo-thumbs">
                    {#each active_photos as photo, i}
                        <button
                            type="button"
                            class="photo-thumb"
                            class:thumb-active={currentPhotoIndex === i}
                            aria-label="Show photo {i + 1}"
                            on:click|preventDefault={(e) => goToPhoto(i, e)}
                        >
                            <img
                                src={photoSrc(photo)}
                                alt=""
                                on:error={() => handlePhotoError(photo)}
                            />
                        </button>
                    {/each}
                </div>
            </div>
        
        {/key}
        {/if}

        <div class="info-container">

            {#if active_table[0]['Text-Acres']}
                <p><span id='info-title' >{active_table[0]['Text-Acres']}</span></p>
            {/if}
            {#if active_table[0]['Text-Address']}
                <p><span id='info-title' >{active_table[0]['Text-Address']}</span></p>
            {/if}

            {#if active_table[0]['Text-Copy']}
                <p><span id='info-title' >{@html active_table[0]['Text-Copy']}</span></p>
            {:else}
                <p><strong>Status: </strong><span id='info-title' >{@html active_table[0]['Text_Status']}</span></p>
                <p><strong>History: </strong> <span id='info-title' >{@html active_table[0]['Text_History']}</span></p>
            {/if}

            {#if active_table[0]['Text_Web']}
                <p><strong>Website: </strong><span id='info-title' ><a href={active_table[0]['Text_Web']} target="_blank">{active_table[0]['Text_Web']}</a></span></p>
            {/if}

            {#if active_photos && active_photos.length}
                <p class='photo-credit'>Photo Credits: {getCredits(active_photos)}</p>
            {/if}
        </div>
    {:else}

        <div class="info-title">
            <span id='pane-title' >BIP Parcel Map</span>
        </div>

        <div class="info-container">
            <p>Bushwick Inlet Park is a mosaic public park project. Its multiple sections are in various phases of development. This map aims to help simplify this picture. Click or tap on a section within the park’s borders or adjacent spaces to see images, brief histories and the current development status of each space.
            <br><br>This project is a collaboration between Pratt Institute’s <a href="https://commons.pratt.edu/savi/" target="_blank">Spatial Analysis & Visualization Initiative (SAVI)</a> and Friends of Bushwick Inlet Park. Support for this project has been provided by the 
            <span style="color:var(--parkColor);font-weight:bold">Brooklyn Borough President,</span> <span style="color:var(--parkColor);font-weight:bold">City Parks Foundation</span> and the 
            <span style="color:var(--parkColor);font-weight:bold">NYC Green Relief & Recovery Fund</span>.
            </p>
        </div>

    {/if}

</div>


<style>

.photo-container{
    width:100%;
    /* Let horizontal swipes hit the carousel, not the panel scroll */
    touch-action: pan-y;
}

.photo-container :global(.sc-carousel__pages-window){
    touch-action: pan-x pinch-zoom;
}

.photo-container :global(.sc-carousel__pages-container){
    touch-action: pan-x pinch-zoom;
}

.photo-container :global(.sc-carousel__content-container){
    touch-action: pan-x pinch-zoom;
}

.photo-loading{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    min-height:200px;
    color:#666;
    font-size:10pt;
}

.photo-loading-spinner{
    width:18px;
    height:18px;
    border:2px solid #ddd;
    border-top-color:var(--parkColor, #82C444);
    border-radius:50%;
    animation:photo-spin 0.7s linear infinite;
}

@keyframes photo-spin{
    to { transform:rotate(360deg); }
}

/* Hide svelte-carousel default dots — we use .photo-thumbs below instead */
.photo-container :global(.sc-carousel-dots__container){
    display:none !important;
}

.photo-container :global(img.container-photos){
    width:100%;
    height:auto;
    max-height:200px;
    object-fit:cover;
    display:block;
    -webkit-user-drag:none;
    user-select:none;
    pointer-events:none;
}

.custom-arrow{
    font-family: Arial, Helvetica, sans-serif;
    font-style: normal;
    color:#222;
    font-size:18pt;
    font-weight: 900;
    width:44px;
    height:100%;
    position:absolute;
    z-index:3;
    border:none;
    background:rgba(255,255,255,0.15)!important;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding:0;
    touch-action: manipulation;
}

.arrow-icon{
    line-height:1;
}

.custom-arrow.custom-arrow-next{
    right:0;
}
	
.custom-arrow.custom-arrow-prev{
    left:0;
}

.photo-thumbs{
    display:flex;
    flex-wrap:wrap;
    justify-content:center;
    gap:6px;
    padding:8px 44px 4px;
    width:100%;
    box-sizing:border-box;
}

.photo-thumb{
    padding:0;
    border:2px solid transparent;
    background:none;
    cursor:pointer;
    flex-shrink:0;
    touch-action: manipulation;
}

.photo-thumb.thumb-active{
    border-color:var(--parkColor, #4a7c59);
}

.photo-thumb img{
    width:52px;
    height:40px;
    max-width:52px;
    max-height:40px;
    object-fit:cover;
    display:block;
}

@media only screen and (max-width: 690px) {
    .custom-arrow{
        width:32px;
    }

    .photo-thumbs{
        padding-left:8px;
        padding-right:8px;
    }
}

</style>