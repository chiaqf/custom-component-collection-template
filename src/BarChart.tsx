import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'


export const BarChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Highcharts.Chart | null>(null)

  const [data, setData] = Retool.useStateArray({ name: 'data' })
  const [categories, setCategories] = Retool.useStateArray({
    name: 'categories'
  })
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' })
  const [title, setTitle] = Retool.useStateString({ name: 'title' })
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' })
  const [showLegend, setShowLegend] = Retool.useStateBoolean({
    name: 'showLegend'
  })
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' })
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' })
  const [layout, setLayout] = Retool.useStateString({
    name: 'layout',
    initialValue: 'bar'
  })
  const [seriesNames, setSeriesNames] = Retool.useStateArray({
    name: 'seriesNames'
  })
  const [reverseYAxis, setReverseYAxis] = Retool.useStateBoolean({
    name: 'reverseYAxis'
  })
  const [stacking, setStacking] = Retool.useStateBoolean({ name: 'stacking' })
  const [xAxisTitle, setXAxisTitle] = Retool.useStateString({
    name: 'xAxisTitle'
  })
  const [yAxisTitle, setYAxisTitle] = Retool.useStateString({
    name: 'yAxisTitle'
  })
  const [yMin, setYMin] = Retool.useStateNumber({ name: 'yMin' })
  const [yMax, setYMax] = Retool.useStateNumber({ name: 'yMax' })
  const [marginBottom, setMarginBottom] = Retool.useStateNumber({
    name: 'marginBottom'
  })
  const [marginTop, setMarginTop] = Retool.useStateNumber({ name: 'marginTop' })
  const [hideYAxis, setHideYAxis] = Retool.useStateBoolean({
    name: 'hideYAxis'
  })
  const [fontSize, setFontSize] = Retool.useStateString({ name: 'fontSize' })
  const [dataLabelsOff, setDataLabelsOff] = Retool.useStateBoolean({
    name: 'dataLabelsOff'
  })
  
  // New threshold-related state variables
  const [threshold, setThreshold] = Retool.useStateNumber({ name: 'threshold' })
  const [thresholdColor, setThresholdColor] = Retool.useStateString({ 
    name: 'thresholdColor',
    initialValue: '#ff0000' // Default red color
  })
  const [enableThreshold, setEnableThreshold] = Retool.useStateBoolean({ 
    name: 'enableThreshold',
    initialValue: false
  })

  // Helper function to apply threshold colors to data points
  const applyThresholdColors = useCallback((seriesData: any[], seriesIndex: number) => {
    if (!enableThreshold || threshold === undefined || threshold === null) {
      return seriesData
    }

    return seriesData.map((point: any) => {
      const value = typeof point === 'object' ? point.y : point
      const exceedsThreshold = value > threshold
      
      if (typeof point === 'object') {
        return {
          ...point,
          color: exceedsThreshold ? thresholdColor : (point.color || colors[seriesIndex % colors.length])
        }
      } else {
        return {
          y: point,
          color: exceedsThreshold ? thresholdColor : colors[seriesIndex % colors.length]
        }
      }
    })
  }, [enableThreshold, threshold, thresholdColor, colors])

  // Memoize the series data preparation
  const prepareSeriesData = useCallback(() => {
    return Array.isArray(data[0])
      ? data.map((series, index) => ({
          type: layout,
          data: applyThresholdColors(series, index),
          color: colors[index % colors.length], // Fallback color for series
          name: seriesNames[index]
        }))
      : [
          {
            type: layout,
            data: applyThresholdColors(data, 0),
            color: colors[0], // Fallback color for series
            name: seriesNames[0]
          }
        ]
  }, [
    JSON.stringify(data),
    JSON.stringify(colors),
    JSON.stringify(seriesNames),
    layout,
    applyThresholdColors
  ])

  // Memoize chart options
  const getChartOptions = useCallback(
    (): Highcharts.Options => ({
      chart: {
        type: layout,
        reflow: true,
        width: width,
        height: height,
        marginBottom: marginBottom || undefined,
        marginTop: marginTop || undefined
      },
      xAxis: {
        categories: categories as string[],
        gridLineWidth: 0,
        title: {
          text: xAxisTitle
        },
        labels: {
          style: {
            fontSize: fontSize || '12px'
          }
        }
      },
      yAxis: {
        labels: {
          enabled: !hideYAxis
        },
        title: {
          text: yAxisTitle
        },
        gridLineWidth: 1,
        reversed: reverseYAxis,
        min: yMin || undefined,
        max: yMax || undefined,
        // Add threshold line if enabled
        plotLines: enableThreshold && threshold !== undefined && threshold !== null ? [{
          color: thresholdColor,
          width: 2,
          value: threshold,
          dashStyle: 'Dash',
          label: {
            text: `Threshold: ${threshold}`,
            align: 'right',
            style: {
              color: thresholdColor
            }
          }
        }] : undefined
      },
      tooltip: {
        headerFormat: '{point.key}<br/>',
        pointFormat:
          '<span style="color:{point.color}">\u25cf</span> {series.name}: <b>{point.y}</b><br/>'
      },
      title: {
        text: title
      },
      subtitle: {
        text: subtitle
      },
      legend: {
        enabled: showLegend
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: !dataLabelsOff,
            style: {
              fontSize: fontSize || '12px'
            }
          },
          stacking: stacking ? 'normal' : undefined,
          colorByPoint: enableThreshold // Enable individual point colors when threshold is active
        },
        column: {
          dataLabels: {
            enabled: !dataLabelsOff,
            style: {
              fontSize: fontSize || '12px'
            }
          },
          stacking: stacking ? 'normal' : undefined,
          colorByPoint: enableThreshold // Enable individual point colors when threshold is active
        }
      },
      series: prepareSeriesData(),
      credits: {
        enabled: false
      }
    }),
    [
      layout,
      width,
      height,
      marginBottom,
      marginTop,
      categories,
      xAxisTitle,
      fontSize,
      hideYAxis,
      yAxisTitle,
      reverseYAxis,
      yMin,
      yMax,
      title,
      subtitle,
      showLegend,
      dataLabelsOff,
      stacking,
      enableThreshold,
      threshold,
      thresholdColor,
      JSON.stringify(prepareSeriesData())
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
  }, [JSON.stringify(getChartOptions())])

  return <div ref={chartContainerRef} />
}