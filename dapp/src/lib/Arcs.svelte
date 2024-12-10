<script lang="ts">

  import { arcForIndex, degToRad } from "$lib/geometry"

  export type Section = {
    label : string,
    amount: number,
    percent: number,
    fromDeg : number,
    toDeg : number
  }
  type Props = {
    radius : number,
    sections: Section[],
    fontSize : number,
    labelOffset : number,
    labelGap : number,
    centerX : number,
    centerY: number
  }
  let { centerX, centerY, radius, sections, fontSize = 50, labelOffset, labelGap } : Props = $props()

  let labelRadius = $derived(radius + labelOffset)


  const arc = (index : number, r : number) => arcForIndex(centerX, centerY, sections.length, index, r)

  function translateForIndex(index : number) {
    const { startAngle, endAngle } = arc(index, labelRadius)
    const radians = startAngle + ((endAngle - startAngle) / 2)
    
    const translateX = labelGap * Math.cos(radians)
    const translateY = labelGap * Math.sin(radians)
    return `translate(${translateX}, ${translateY})`
  }


  function textFlipTransform(index :number, section : Section) {
    // const { startAngle, endAngle } = arc(index, labelRadius)
    const startAngle = degToRad(section.fromDeg)
    const endAngle = degToRad(section.toDeg)
    // const r = radius
    // const x1 = centerX + r * Math.cos(startAngle)
    // const y1 = centerY + r * Math.sin(startAngle)
    // const x2 = centerX + r * Math.cos(endAngle)
    // const y2 = centerY + r * Math.sin(endAngle)
    const isBottomHalf = (startAngle + endAngle) / 2 > Math.PI  
    return isBottomHalf ? `rotate(90)` : ""
  }

  function createLabelPathForSection(index :number, section : Section) {
    // const { x1, y1, x2, y2 } = arc(index, labelRadius)
    const startAngle = degToRad(section.fromDeg)
    const endAngle = degToRad(section.toDeg)
    const r = radius
    const x1 = centerX + r * Math.cos(startAngle)
    const y1 = centerY + r * Math.sin(startAngle)
    const x2 = centerX + r * Math.cos(endAngle)
    const y2 = centerY + r * Math.sin(endAngle)

    return `M ${x1},${y1} A ${labelRadius},${labelRadius} 0 0 1 ${x2},${y2}`;
  }


  // Function to generate SVG arc path
  function createArcPathForSection(section : Section) {
    if (sections.length == 1) {
      return `M ${centerX + radius},${centerY} A ${radius},${radius} 0 1,1 ${centerX - radius},${centerY} A ${radius},${radius} 0 1,1 ${centerX + radius},${centerY}`
    }
    // const { startAngle, endAngle, x1, y1, x2, y2 } = arc(index, radius)

    const startAngle = degToRad(section.fromDeg)
    const endAngle = degToRad(section.toDeg)
    const r = radius
    const x1 = centerX + r * Math.cos(startAngle)
    const y1 = centerY + r * Math.sin(startAngle)
    const x2 = centerX + r * Math.cos(endAngle)
    const y2 = centerY + r * Math.sin(endAngle)
    

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;
  }

</script>


{#each sections as section, index}
  {#if sections.length}

  <!-- shift each pie piece out from the center -->
  <g transform={translateForIndex(index)}>
    
    <!-- Render the arc path for each section -->
    <path
      d={createArcPathForSection(section)}
      fill={`hsl(${index * 40}, 90%, 60%)`}
      fill-opacity="0.1"
      stroke="#333"
      stroke-width="1"
    />


      <!-- Define path for the label text -->
      <path
      id="label-path-{index}"
      d={createLabelPathForSection(index, section)}
      fill="none"
      stroke="none"
    />

    <!-- Render the label centered along the arc -->
    <text class="label" font-size={fontSize}>
      <textPath href={`#label-path-${index}`} startOffset="50%" text-anchor="middle" dominant-baseline="middle" transform={textFlipTransform(index, section)}>
        {section.label}
      </textPath>
    </text>

    
  </g>
  {/if}
{/each}
