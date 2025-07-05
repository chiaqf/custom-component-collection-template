import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'

export const SplitPackedBubbleChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Highcharts.Chart | null>(null)

  // Changed 'sectors' to 'data' for generic input
  const [data, setData] = Retool.useStateArray({
    name: 'data' // Array of data objects, each representing a series with its points
  })

  const [minBubbleSize, setMinBubbleSize] = Retool.useStateString({
    name: 'minBubbleSize'
  })

  const [maxBubbleSize, setMaxBubbleSize] = Retool.useStateString({
    name: 'maxBubbleSize'
  })

  const [title, setTitle] = Retool.useStateString({
    name: 'title'
  })

  const [subtitle, setSubtitle] = Retool.useStateString({
    name: 'subtitle'
  })

  const [width, setWidth] = Retool.useStateNumber({
    name: 'width'
  })

  const [height, setHeight] = Retool.useStateNumber({
    name: 'height'
  })

  const [showLegend, setShowLegend] = Retool.useStateBoolean({
    name: 'showLegend'
  })

  const [labelThreshold, setLabelThreshold] = Retool.useStateNumber({
    name: 'labelThreshold'
  })

  const [colors, setColors] = Retool.useStateArray({
    name: 'colors'
  })

//   const [splitSeries, setSplitSeries] = Retool.useStateBoolean({
//     name: 'splitSeries'
//   })

//   const [gravitationalConstant, setGravitationalConstant] = Retool.useStateNumber({
//     name: 'gravitationalConstant'
//   })

//   const [seriesInteraction, setSeriesInteraction] = Retool.useStateBoolean({
//     name: 'seriesInteraction'
//   })

//   const [dragBetweenSeries, setDragBetweenSeries] = Retool.useStateBoolean({
//     name: 'dragBetweenSeries'
//   })

//   const [parentNodeLimit, setParentNodeLimit] = Retool.useStateBoolean({
//     name: 'parentNodeLimit'
//   })

  const [tooltipFormat, setTooltipFormat] = Retool.useStateString({
    name: 'tooltipFormat'
  })

  // Memoize the data preparation logic
  const prepareSeriesData = useCallback(() => {
    const defaultColors = [
      '#7cb5ec',
      '#434348',
      '#90ed7d',
      '#f7a35c',
      '#8085e9',
      '#f15c80',
      '#e4d354',
      '#2b908f',
      '#f45b5b',
      '#91e8e1'
    ]
    const colorsToUse = (
      colors && colors.length > 0 ? colors : defaultColors
    ) as string[]

    // Use the generic 'data' prop directly
    if (!data || !Array.isArray(data)) return []

    return data.map((seriesData: any, index: number) => ({
      type: 'packedbubble' as const,
      name: String(seriesData.name || ''), // Assuming seriesData has a 'name' property for the series
      color: colorsToUse[index % colorsToUse.length],
      // Assuming seriesData.data is already an array of { name: string, value: number } objects
      data: (seriesData.data || [])
        .filter((point: any) => Number(point.value || 0) > 0) // Filter out zero or negative values
        .map((point: any) => ({
          name: String(point.name || ''),
          value: Number(point.value || 0)
        })),
      dataLabels: {
        enabled: true,
        format: '{point.name}',
        filter: {
          property: 'value',
          operator: '>=' as const,
          value: Number(labelThreshold || 0)
        },
        style: {
          color: 'black',
          textOutline: 'none',
          fontWeight: 'normal',
          fontSize: '10px'
        }
      }
    })).filter(series => series.data.length > 0) // Only include series with actual data points
  }, [
    JSON.stringify(data), // Dependency on the generic 'data' input
    JSON.stringify(colors),
    labelThreshold
  ])

  // Memoize chart options
  const getChartOptions = useCallback(
    (): Highcharts.Options => ({
      chart: {
        type: 'packedbubble',
        reflow: true,
        backgroundColor: 'transparent',
        width: Number(width || 0) || undefined,
        height: Number(height || 0) || undefined
      },
      plotOptions: {
        packedbubble: {
          minSize: minBubbleSize || '20%',
          maxSize: maxBubbleSize || '100%',
          layoutAlgorithm: {
            gravitationalConstant: 0.01,
            splitSeries: true,
            seriesInteraction: false,
            dragBetweenSeries: false,
            parentNodeLimit: false,
            maxSpeed: 3
          }
        }
      },
      title: {
        text: String(title || 'Packed Bubble Chart'), // Generic title
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      },
      subtitle: {
        text: String(subtitle || 'Bubble size represents value'), // Generic subtitle
        align: 'left',
        style: {
          fontSize: '14px',
          color: '#666'
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: String(tooltipFormat || '<b>{point.name}:</b> {point.value:,.0f}')
      },
      legend: {
        enabled: Boolean(showLegend)
      },
      credits: {
        enabled: false
      },
      series: prepareSeriesData()
    }),
    [
      width,
      height,
      title,
      subtitle,
      showLegend,
      minBubbleSize,
      maxBubbleSize,
    //   gravitationalConstant,
    //   splitSeries,
    //   seriesInteraction,
    //   dragBetweenSeries,
    //   parentNodeLimit,
      tooltipFormat,
      JSON.stringify(prepareSeriesData()) // Dependency on the prepared series data
    ]
  )

  useEffect(() => {
    if (!chartContainerRef.current) return

    const options = getChartOptions()

    if (!chartRef.current) {
      // Create new chart if it doesn't exist
      chartRef.current = Highcharts.chart(chartContainerRef.current, options)
    } else {
      // Update existing chart
      chartRef.current.update(options, true)
    }

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [JSON.stringify(getChartOptions())]) // Re-render chart when options change

  return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
}
