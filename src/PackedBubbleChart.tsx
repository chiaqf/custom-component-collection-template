import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import HighchartsMore from 'highcharts/highcharts-more'
HighchartsMore(Highcharts)

export const PackedBubbleChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Highcharts.Chart | null>(null) // Store chart instance

  const [labels, setLabels] = Retool.useStateArray({
    name: 'labels'
  })

  const [values, setValues] = Retool.useStateArray({
    name: 'values'
  })

  const [groups, setGroups] = Retool.useStateArray({
    name: 'groups' // Array of group names, same length as labels and values
  })

  const [minBubbleSize, setMinBubbleSize] = Retool.useStateNumber({
    name: 'minBubbleSize'
  })

  const [maxBubbleSize, setMaxBubbleSize] = Retool.useStateNumber({
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

  // Memoize the data preparation logic
  const prepareSeriesData = useCallback(() => {
    // Create a color map for groups
    const colorMap: Record<string, string> = {}
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

    ;(groups || []).forEach((group, index) => {
      const groupKey = String(group || '') // Convert to string to ensure type safety
      if (!colorMap[groupKey]) {
        colorMap[groupKey] = colorsToUse[index % colorsToUse.length] // Cycle through colors if more groups than colors
      }
    })

    // Organize data by group
    const groupedData: Record<
      string,
      Array<{ name: string; value: number; color: string }>
    > = {}
    ;(labels || []).forEach((label, index) => {
      const group = String(groups?.[index] || '')
      if (!groupedData[group]) groupedData[group] = []
      groupedData[group].push({
        name: String(label || ''),
        value: Number(values?.[index] || 0),
        color: colorMap[group] // Assign color based on group
      })
    })

    // Map grouped data into series format
    return Object.keys(groupedData).map((groupName) => ({
      type: 'packedbubble' as const,
      name: groupName,
      data: groupedData[groupName],
      color: colorMap[groupName], // Ensure legend color matches bubble color
      dataLabels: {
        enabled: true,
        format: '{point.name}', // Show label if value meets the threshold
        filter: {
          property: 'value',
          operator: '>=' as const,
          value: Number(labelThreshold || 0)
        },
        style: {
          color: 'black',
          textOutline: 'none',
          fontWeight: 'bold'
        }
      }
    }))
  }, [
    JSON.stringify(labels),
    JSON.stringify(values),
    JSON.stringify(groups),
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
        width: Number(width || 0),
        height: Number(height || 0)
      },
      plotOptions: {
        packedbubble: {
          layoutAlgorithm: {
            gravitationalConstant: 0.03
          }
        }
      },
      title: {
        text: String(title || '')
      },
      subtitle: {
        text: String(subtitle || '')
      },
      tooltip: {
        headerFormat: '',
        pointFormat:
          '<span style="color:{point.color}">\u25cf</span> {point.name}: <b>{point.value}</b><br/>'
      },
      legend: {
        enabled: Boolean(showLegend)
      },
      credits: {
        enabled: false
      },
      series: prepareSeriesData().map((s) => ({
        ...s,
        minSize: Number(minBubbleSize || 0),
        maxSize: Number(maxBubbleSize || 0)
      }))
    }),
    [
      width,
      height,
      title,
      subtitle,
      showLegend,
      minBubbleSize,
      maxBubbleSize,
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
