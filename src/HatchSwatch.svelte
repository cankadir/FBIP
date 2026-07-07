<script>
    import { hatchBgColor, hatchLineColor, hatchStrokeColor } from './utils.js';
</script>

<div class="hatch-swatch">
    <svg width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
        <defs>
            <pattern
                id="legend-crosshatch"
                patternUnits="userSpaceOnUse"
                width="10"
                height="10"
                patternTransform="rotate(0 5 5) scale(0.8)"
            >
                <rect width="10" height="10" fill={hatchBgColor} />
                <line
                    x1="-10"
                    y1="5"
                    x2="20"
                    y2="5"
                    stroke={hatchLineColor}
                    stroke-width="1.5"
                    stroke-opacity="0.8"
                    stroke-linecap="butt"
                />
            </pattern>
        </defs>
        <rect
            width="100%"
            height="100%"
            fill="url(#legend-crosshatch)"
            stroke={hatchStrokeColor}
            stroke-width="0.8"
        />
    </svg>
</div>

<style>
    .hatch-swatch {
        position: absolute;
        inset: 0;
    }

    svg {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
