import 'bootstrap/dist/css/bootstrap.min.css'
import { type FC, useEffect, useRef, useState, useCallback } from 'react'
// import Highcharts from 'highcharts'
// 
// import 'highcharts/modules/annotations'
// import 'highcharts/modules/treemap'
// import 'highcharts/modules/heatmap'
// import 'highcharts/modules/sunburst'
// import 'highcharts/modules/variable-pie'
// import 'highcharts/modules/bullet'
// import 'highcharts/modules/solid-gauge'
// import 'highcharts/modules/stock'

// HighchartsStock(Highcharts)
// SolidGauge(Highcharts)
// HighchartsSunburst(Highcharts) // Initialize sunburst module
// HighchartsHeatmap(Highcharts)
// HighchartsTreemap(Highcharts)
// HighchartsMore(Highcharts) // Initialize highcharts-more module for bubble charts
// AnnotationsModule(Highcharts) // Initialize annotations module
// HighchartsVariablePie(Highcharts)
// HighchartsBullet(Highcharts)

export { BubbleChart } from './BubbleChart'
export { PieChart } from './PieChart'
export { MorphableBubbleChart } from './MorphableBubbleChart'
export { PackedBubbleChart } from './PackedBubbleChart'
export { SplitPackedBubbleChart } from './SplitPackedBubbleChart'
export { NGFSQuadrant } from './NGFSQuadrant'
export { FundExposureChart } from './FundExposureChart'
export { GaugeChart } from './GaugeChart'
export { BarChart } from './BarChart'
export { StockChartComponent } from './StockChart'
export { VariablePieChart } from './VariablePieChart'
export { LineChart } from './LineChart'
export { AreaChart } from './AreaChart'
export { HeatmapChart } from './HeatmapChart'
export { SLineChart } from './SLineChart'
export { SunburstChart } from './SunburstChart'
export { TreemapChart } from './TreemapChart'
export { DataOnlyTreemapChart } from './DataOnlyTreemapChart'
export { BulletChart } from './BulletChart'
export { MirroredBarChart } from './MirroredBarChart'
export { ColorScaleTreeMapChart } from './ColorScaleTreeMapChart'


// export const SplitPackedBubbleChart: FC = () => {
//   const chartContainerRef = useRef<HTMLDivElement>(null)

//   // Existing Retool states
//   const [minBubbleSize, setMinBubbleSize] = Retool.useStateNumber({
//     name: 'minBubbleSize'
//   })

//   const [maxBubbleSize, setMaxBubbleSize] = Retool.useStateNumber({
//     name: 'maxBubbleSize'
//   })

//   const [title, setTitle] = Retool.useStateString({
//     name: 'title'
//   })

//   const [subtitle, setSubtitle] = Retool.useStateString({
//     name: 'subtitle'
//   })

//   const [width, setWidth] = Retool.useStateNumber({
//     name: 'width'
//   })

//   const [height, setHeight] = Retool.useStateNumber({
//     name: 'height'
//   })

//   const [showLegend, setShowLegend] = Retool.useStateBoolean({
//     name: 'showLegend'
//   })

//   // New Retool state for `seriesData` holding the data structure
//   const [seriesData, setSeriesData] = Retool.useStateArray({
//     name: 'seriesData' // This should contain the split-packed bubble data, structured like Highcharts' `series` property
//   })

//   useEffect(() => {
//     if (chartContainerRef.current && seriesData) {
//       const options: Highcharts.Options = {
//         chart: {
//           type: 'packedbubble',
//           reflow: true,
//           backgroundColor: 'transparent',
//           width: width,
//           height: height
//         },
//         title: {
//           text: title
//         },
//         subtitle: {
//           text: subtitle
//         },
//         tooltip: {
//           useHTML: true,
//           pointFormat: '<b>{point.name}:</b> {point.value}m CO<sub>2</sub>'
//         },
//         legend: {
//           enabled: showLegend
//         },
//         plotOptions: {
//           packedbubble: {
//             minSize: `${minBubbleSize}%`,
//             maxSize: `${maxBubbleSize}%`,
//             zMin: 0,
//             zMax: 1000,
//             layoutAlgorithm: {
//               gravitationalConstant: 0.05,
//               splitSeries: true,
//               seriesInteraction: false,
//               dragBetweenSeries: true,
//               parentNodeLimit: true
//             },
//             dataLabels: {
//               enabled: true,
//               format: '{point.name}',
//               filter: {
//                 property: 'y',
//                 operator: '>',
//                 value: 250
//               },
//               style: {
//                 color: 'black',
//                 textOutline: 'none',
//                 fontWeight: 'normal'
//               }
//             }
//           }
//         },
//         series: seriesData, // Use data from Retool state
//         credits: {
//           enabled: false
//         }
//       }

//       Highcharts.chart(chartContainerRef.current, options)
//     }
//   }, [
//     seriesData,
//     minBubbleSize,
//     maxBubbleSize,
//     title,
//     subtitle,
//     width,
//     height,
//     showLegend
//   ])

//   return <div ref={chartContainerRef} />
// }

