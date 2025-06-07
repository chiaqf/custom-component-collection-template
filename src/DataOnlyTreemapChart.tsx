import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useState, useRef, useCallback } from 'react'

import 'highcharts/modules/treemap'

export const DataOnlyTreemapChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Highcharts.Chart | null>(null) // Store chart instance

  const [data, setData] = Retool.useStateArray({ name: 'data' })
  const [title, setTitle] = Retool.useStateString({ name: 'title' })
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' })
  const [width, setWidth] = Retool.useStateString({ name: 'width' })
  const [height, setHeight] = Retool.useStateString({ name: 'height' })
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' })

  // Utility function to generate lighter or darker shades
  const generateShade = useCallback((color: string, factor: number) => {
    // Convert hex color to RGB
    const [r, g, b] = color.match(/\w\w/g)?.map((hex) => parseInt(hex, 16)) || [
      0, 0, 0
    ]

    // Darken the color by scaling each channel towards 0
    const adjust = (value: number) => Math.round(value * (1 + factor)) // Factor < 0 makes it darker

    // Clamp and convert back to hex
    const newR = Math.min(255, Math.max(0, adjust(r)))
    const newG = Math.min(255, Math.max(0, adjust(g)))
    const newB = Math.min(255, Math.max(0, adjust(b)))

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }, [])

  // Memoize the data processing function
  const prepareColoredData = useCallback(() => {
    if (!data.length || !colors.length) return []

    const parentColorMap = new Map() // Map to store parent color assignments

    // Assign colors and generate shades
    return data.map((point) => {
      if (point?.parent === '0.0') {
        const pointId = point?.id || ''
        const pointName = point?.name || ''

        // Maintain a set of used colors
        const usedColors = new Set(parentColorMap.values())

        // Find the next available color
        let colorIndex = pointName ? pointName.length % colors.length : 0
        let color = colors[colorIndex]

        // If color is already used, try the next one
        if (usedColors.size < colors.length) {
          while (usedColors.has(color)) {
            colorIndex = (colorIndex + 1) % colors.length
            color = colors[colorIndex]
          }
        } else {
          // All colors are used; fallback strategy (e.g., reuse with a modifier)
          color = colors[colorIndex]
        }

        parentColorMap.set(pointId, color) // Save color for children
        return {
          ...point,
          color: color
        }
      } else if (point?.parent === '1.0' || point?.parent === '2.0') {
        // Level 2: Assign a shade of the parent's color
        const parentColor = parentColorMap.get(point?.parent) || '#cccccc'
        return {
          ...point,
          color: generateShade(
            parentColor,
            point?.percent ? -Math.min(0.8, point.percent / 10) : -0.3
          ) // Darker for higher values
        }
      }
      return point // Return as-is for other nodes
    })
  }, [JSON.stringify(data), JSON.stringify(colors), generateShade])

  // Memoize chart options
  const getChartOptions = useCallback((): Highcharts.Options => {
    const coloredData = prepareColoredData()

    return {
      chart: {
        type: 'treemap',
        reflow: true,
        backgroundColor: 'transparent',
        width: width,
        height: height || '100%',
        events: {
          load: function () {
            // Drill down to the first level programmatically
            if (this.series[0] && coloredData.length > 0) {
              try {
                // @ts-ignore - drillToNode exists on treemap series
                this.series[0].drillToNode('0.0')
              } catch (error) {
                console.error('Failed to drill to node:', error)
              }
            }
          }
        }
      },
      title: {
        text: title
      },
      subtitle: {
        text: subtitle
      },
      credits: {
        enabled: false
      },
      series: [
        {
          type: 'treemap',
          name: 'All',
          layoutAlgorithm: 'squarified',
          allowDrillToNode: true,
          clip: false,
          data: coloredData,
          dataLabels: {
            enabled: false
          },
          levels: [
            {
              level: 1,
              // @ts-ignore - colorByPoint exists on treemap levels
              colorByPoint: true,
              dataLabels: {
                enabled: true,
                formatter: function () {
                  return `<b>${this.point.name}</b><br>${this.point.percent}%`
                }
              },
              borderWidth: 3,
              // @ts-ignore - levelIsConstant exists on treemap levels
              levelIsConstant: false
            }
          ]
        }
      ]
    }
  }, [title, subtitle, width, height, prepareColoredData])

  useEffect(() => {
    if (!chartContainerRef.current) return

    if (data.length > 0 && colors.length > 0) {
      const options = getChartOptions()

      if (!chartRef.current) {
        // Create chart only if it doesn't exist
        chartRef.current = Highcharts.chart(chartContainerRef.current, options)
      } else {
        // Update existing chart instead of recreating
        chartRef.current.update(options, true)
      }
    }

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [JSON.stringify(getChartOptions()), data.length, colors.length])

  return <div ref={chartContainerRef} />
}