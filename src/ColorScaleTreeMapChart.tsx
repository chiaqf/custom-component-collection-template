import Highcharts from 'highcharts'
import 'highcharts/modules/treemap'
import 'highcharts/modules/data'
import 'highcharts/modules/coloraxis'
// import exporting from 'highcharts/modules/exporting'
import 'highcharts/modules/accessibility'
import 'highcharts/modules/treemap'

import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback, useState } from 'react'

// Highcharts event plugin for custom data label logic.
// Placed outside the component to ensure it's registered only once.
// This version includes the corrected performance calculation.
Highcharts.addEvent(Highcharts.Series, 'drawDataLabels', function () {
  if (this.type === 'treemap' && this.points.length > 0) {
    this.points.forEach((point) => {
      // Set font size based on the area of the point for level 3
      if (point.node.level >= 3) {
        if (point.dlOptions && this.colorAxis && point.custom) {
          // point.dlOptions.backgroundColor = this.colorAxis.toColor(performance)
          const performance = point.custom.performance
          point.color = this.colorAxis.toColor(performance)
        }
      }
    })
  }
})

export const ColorScaleTreeMapChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Highcharts.Chart | null>(null) // Store chart instance

  const [data, setData] = Retool.useStateArray({ name: 'data' })
  const [title, setTitle] = Retool.useStateString({ name: 'title' })
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' })
  const [width, setWidth] = Retool.useStateString({ name: 'width' })
  const [height, setHeight] = Retool.useStateString({ name: 'height' })
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' })
  const [showColorAxis, setShowColorAxis] = Retool.useStateBoolean({ name: 'showColorAxis', initialValue: false, description: 'true/false' })

  // Memoize chart options
  const getChartOptions = useCallback((): Highcharts.Options => {
    const coloredData = data

    return {
      chart: {
        type: 'treemap',
        backgroundColor: 'transparent',
        width: width,
        height: height,
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
      colorAxis: {
        visible: showColorAxis,
        minColor: '#f73539',
        maxColor: '#2ecc59',
        stops: [
            [0, '#f73539'],
            [0.5, '#414555'],
            [1, '#2ecc59']
        ],
        min: -10,
        max: 10,
        gridLineWidth: 0,
        labels: {
            overflow: 'allow',
            format: '{#gt value 0}+{value}{else}{value}{/gt}%',
            style: { color: 'black' },
        },
      },
      series: [
        {
          type: 'treemap',
          name: 'All',
          layoutAlgorithm: 'squarified',
          allowDrillToNode: true,
          animationLimit: 1000,
          borderColor: '#252931',
          color: '#252931',
          dataLabels: {
              enabled: false,
              allowOverlap: true,
              style: {
                  textOutline: 'none'
              }
          },
          clip: false,
          data: coloredData,
          levels: [
            {
              level: 1,
              // @ts-ignore - colorByPoint exists on treemap levels
              colorByPoint: true,
              dataLabels: {
                enabled: true,
                headers: true,
                align: 'left',
                style: {
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    lineClamp: 1,
                    color: 'black'
                },
                padding: 3
              },
              borderWidth: 3,
              levelIsConstant: false
            },
            {
              level: 3,
              dataLabels: {
                  enabled: true,
                  align: 'center',
                  style: {
                      color: 'white'
                  },
                  formatter: function () {
                    let label = this.point.name;
                    if (this.point.custom) {
                      label += '<br><span style="font-size: 0.7em">' + this.point.custom.performance + '%</span>';
                      if ((this.point.percent > 0) && (this.point.custom.performance !== 0)) {
                        return label;
                      }
                    }
                    return null;
                  }
              }
            },
            {
              level: 4,
              dataLabels: {
                  enabled: true,
                  align: 'center',
                  style: {
                      color: 'white'
                  },
                  formatter: function () {
                    let label = this.point.name;
                    if (this.point.custom) {
                      label += '<br><span style="font-size: 0.7em">' + this.point.custom.performance + '%</span>';
                      if ((this.point.percent > 0) && (this.point.custom.performance !== 0)) {
                        return label;
                      }
                    }
                    return null;
                  }
              }
            },
            {
              level: 5,
              dataLabels: {
                  enabled: true,
                  align: 'center',
                  style: {
                      color: 'white'
                  },
                  formatter: function () {
                    let label = this.point.name;
                    if (this.point.custom) {
                      label += '<br><span style="font-size: 0.7em">' + this.point.custom.performance + '%</span>';
                      if ((this.point.percent > 0) && (this.point.custom.performance !== 0)) {
                        return label;
                      }
                    }
                    return null;
                  }
              }
            }
          ]
        }
      ]
    }
  }, [title, subtitle, width, height, data])

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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}