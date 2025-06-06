import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import 'highcharts/highcharts-more'

export const LineChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Highcharts.Chart | null>(null) // Store chart instance

  // Retool states for user-defined inputs
  const [title, setTitle] = Retool.useStateString({ name: 'title' })
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' })
  const [xAxisTitle, setXAxisTitle] = Retool.useStateString({
    name: 'xAxisTitle'
  })
  const [yAxisTitle, setYAxisTitle] = Retool.useStateString({
    name: 'yAxisTitle'
  })
  const [secondaryYAxisTitle, setSecondaryYAxisTitle] = Retool.useStateString({
    name: 'secondaryYAxisTitle'
  })
  const [xAxisValues, setXAxisValues] = Retool.useStateArray({
    name: 'xAxisValues'
  })
  const [seriesData, setSeriesData] = Retool.useStateArray({
    name: 'seriesData'
  })
  const [smooth, setSmooth] = Retool.useStateBoolean({ name: 'smooth' })
  const [showMarkers, setShowMarkers] = Retool.useStateBoolean({
    name: 'showMarkers'
  })
  const [verticalLines, setVerticalLines] = Retool.useStateArray({
    name: 'verticalLines'
  })
  const [verticalLinesLabel, setVerticalLinesLabel] = Retool.useStateString({
    name: 'verticalLinesLabel',
    description: 'Example: Label here'
  })
  const [verticalLinesColor, setVerticalLinesColor] = Retool.useStateString({
    name: 'verticalLinesColor',
    description: 'Example: #333333',
    initialValue: '#333333'
  })
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' })
  const [useSecondaryYAxis, setUseSecondaryYAxis] = Retool.useStateArray({
    name: 'useSecondaryYAxis'
  }) // Array of booleans
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' })
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' })

  // Memoize series data preparation
  const prepareSeriesData = useCallback(() => {
    return (seriesData || []).map((series: any, index: number) => ({
      ...series,
      type: 'line',
      color: colors?.[index] ? String(colors[index]) : undefined,
      yAxis: useSecondaryYAxis?.[index] ? 1 : 0, // Assign to secondary y-axis based on useSecondaryYAxis state
      // Ensure x and y values are correctly paired and are numbers
      data: (series.data || []).map((y: any, idx: number) => ({
        x: Number(xAxisValues?.[idx] || 0),
        y: Number(y || 0)
      }))
    }))
  }, [
    JSON.stringify(seriesData),
    JSON.stringify(xAxisValues),
    JSON.stringify(colors),
    JSON.stringify(useSecondaryYAxis)
  ])

  // Memoize chart options
  const getChartOptions = useCallback(
    (): Highcharts.Options => ({
      chart: {
        type: 'line',
        width: width,
        height: height,
        backgroundColor: 'transparent', // Added for consistency with PieChart
        reflow: true // Added for responsiveness
      },
      title: {
        text: title || ' '
      },
      subtitle: {
        text: subtitle || ' '
      },
      xAxis: {
        type: 'linear',
        title: {
          text: xAxisTitle || 'X-Axis'
        },
        accessibility: {
          rangeDescription:
            xAxisValues && xAxisValues.length > 0
              ? `Range: ${Math.min(...xAxisValues.map(Number))} to ${Math.max(...xAxisValues.map(Number))}.`
              : ''
        },
        plotLines: (verticalLines || []).map((value: any) => ({
          color: verticalLinesColor,
          width: 2,
          value: Number(value),
          zIndex: 5,
          label: {
            text: verticalLinesLabel,
            rotation: 90,
            style: {
              color: verticalLinesColor
            }
          }
        }))
      },
      yAxis: [
        {
          title: {
            text: yAxisTitle || 'Primary Y-Axis'
          }
        },
        {
          title: {
            text: secondaryYAxisTitle || 'Secondary Y-Axis'
          },
          opposite: true
        }
      ],
      tooltip: {
        formatter: function () {
          // Use the xAxisTitle variable from the closure scope
          // Fallback to 'X-Axis' if xAxisTitle is empty
          const xTitle = xAxisTitle
          return `${this.series.name} : ${this.y} <br/> ${xTitle} : ${this.x}`
        }
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        line: {
          marker: {
            enabled: showMarkers,
            symbol: 'circle',
            radius: 3,
            states: {
              hover: {
                enabled: true
              }
            }
          },
          // The Highcharts 'line' series type itself doesn't have a direct 'smooth' property like some other libraries.
          // For smoothing, you'd typically use 'spline' type or define a custom interpolation.
          // Assuming 'smooth' here might imply changing line width or a visual effect.
          // If you intend for actual spline interpolation, you'd change series type to 'spline'.
          // For now, I'll keep the line width adjustment as per your original code.
          lineWidth: smooth ? 2 : 1
        }
      },
      series: prepareSeriesData() as Highcharts.SeriesOptionsType[] // Cast to Highcharts.SeriesOptionsType[]
    }),
    [
      width,
      height,
      title,
      subtitle,
      xAxisTitle,
      yAxisTitle,
      secondaryYAxisTitle,
      showMarkers,
      smooth,
      JSON.stringify(prepareSeriesData()), // Dependency on the memoized series data
      JSON.stringify(verticalLines) // Add verticalLines to dependencies if it affects options
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
  }, [JSON.stringify(getChartOptions())]) // Re-run effect only when memoized options object changes

  return <div ref={chartContainerRef} />
}
