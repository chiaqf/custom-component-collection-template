import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import 'highcharts/highcharts-more'

export const NGFSQuadrant: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  const [xValues, setXValues] = Retool.useStateArray({ name: 'xValues' })
  const [xLabel, setXLabel] = Retool.useStateString({ name: 'xLabel' })
  const [yValues, setYValues] = Retool.useStateArray({ name: 'yValues' })
  const [yLabel, setYLabel] = Retool.useStateString({ name: 'yLabel' })
  const [zValues, setZValues] = Retool.useStateArray({
    name: 'zValues' // For bubble sizes
  })

  const [zLabel, setZLabel] = Retool.useStateString({
    name: 'zLabel'
  })

  const [labels, setLabels] = Retool.useStateArray({
    name: 'labels'
  })

  const [colors, setColors] = Retool.useStateArray({
    name: 'colors'
  })

  const [defaultColor, setDefaultColor] = Retool.useStateString({
    name: 'defaultColor'
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

  const [groups, setGroups] = Retool.useStateArray({
    name: 'groups'
  })

  const [showLegend, setShowLegend] = Retool.useStateBoolean({
    name: 'showLegend'
  })

  useEffect(() => {
    if (chartContainerRef.current) {
      // Group the data by unique group values
      let seriesData

      if (groups && groups.length > 0) {
        // Group the data by unique group values
        const uniqueGroups = [...new Set(groups)]

        seriesData = uniqueGroups.map((group, groupIndex) => ({
          name: group,
          data: (labels || [])
            .map((label, index) => {
              if (groups[index] === group) {
                return {
                  name: label,
                  x: xValues[index],
                  y: yValues[index],
                  z: zValues[index]
                }
              }
              return null
            })
            .filter(Boolean),
          color: colors[groupIndex % colors.length]
        }))
      } else {
        // No groups - create single series
        seriesData = [
          {
            data: (labels || []).map((label, index) => ({
              name: label,
              x: xValues[index],
              y: yValues[index],
              z: zValues[index],
              color: colors[index] || defaultColor
            }))
          }
        ]
      }

      const options: Highcharts.Options = {
        chart: {
          type: 'bubble',
          reflow: true,
          backgroundColor: 'transparent',
          width: width,
          height: height,
          events: {
            load: function () {
              const chart = this

              // Function to draw quadrants
              function drawQuadrants() {
                const xMid = 50 // Midpoint of x-axis
                const yMid = 50 // Midpoint of y-axis

                // Remove existing quadrants and labels if they exist
                if (chart.quadrants) {
                  chart.quadrants.forEach((quadrant) => quadrant.destroy())
                }
                if (chart.quadrantLabels) {
                  chart.quadrantLabels.forEach((label) => label.destroy())
                }

                // Redraw quadrants
                chart.quadrants = [
                  chart.renderer
                    .rect(
                      chart.plotLeft,
                      chart.plotTop,
                      chart.xAxis[0].toPixels(xMid) - chart.plotLeft,
                      chart.yAxis[0].toPixels(yMid) - chart.plotTop
                    )
                    .attr({
                      fill: '#00a7ad', // Top-left quadrant
                      zIndex: 1
                    })
                    .add(),
                  chart.renderer
                    .rect(
                      chart.xAxis[0].toPixels(xMid),
                      chart.plotTop,
                      chart.plotWidth -
                        chart.xAxis[0].toPixels(xMid) +
                        chart.plotLeft,
                      chart.yAxis[0].toPixels(yMid) - chart.plotTop
                    )
                    .attr({
                      fill: '#00a7ad', // Top-right quadrant
                      zIndex: 1
                    })
                    .add(),
                  chart.renderer
                    .rect(
                      chart.plotLeft,
                      chart.yAxis[0].toPixels(yMid),
                      chart.xAxis[0].toPixels(xMid) - chart.plotLeft,
                      chart.plotHeight -
                        chart.yAxis[0].toPixels(yMid) +
                        chart.plotTop
                    )
                    .attr({
                      fill: '#00a7ad', // Bottom-left quadrant
                      zIndex: 1
                    })
                    .add(),
                  chart.renderer
                    .rect(
                      chart.xAxis[0].toPixels(xMid),
                      chart.yAxis[0].toPixels(yMid),
                      chart.plotWidth -
                        chart.xAxis[0].toPixels(xMid) +
                        chart.plotLeft,
                      chart.plotHeight -
                        chart.yAxis[0].toPixels(yMid) +
                        chart.plotTop
                    )
                    .attr({
                      fill: '#00a7ad', // Bottom-right quadrant
                      zIndex: 1
                    })
                    .add()
                ]

                // Add labels to the corners of the quadrants
                chart.quadrantLabels = [
                  chart.renderer
                    .text('Disorderly', chart.plotLeft + 5, chart.plotTop + 15)
                    .css({
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: 'bold'
                    })
                    .attr({ zIndex: 1 })
                    .add(),
                  chart.renderer
                    .text(
                      'Too Little, Too Late',
                      chart.plotLeft + chart.plotWidth - 5,
                      chart.plotTop + 15
                    )
                    .css({
                      color: '#ffffff',
                      fontSize: '15px',
                      textAlign: 'right',
                      fontWeight: 'bold'
                    })
                    .attr({ zIndex: 1, align: 'right' })
                    .add(),
                  chart.renderer
                    .text(
                      'Orderly',
                      chart.plotLeft + 5,
                      chart.plotTop + chart.plotHeight - 5
                    )
                    .css({
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: 'bold'
                    })
                    .attr({ zIndex: 1 })
                    .add(),
                  chart.renderer
                    .text(
                      'Hot House World',
                      chart.plotLeft + chart.plotWidth - 5,
                      chart.plotTop + chart.plotHeight - 5
                    )
                    .css({
                      color: '#ffffff',
                      fontSize: '15px',
                      textAlign: 'right',
                      fontWeight: 'bold'
                    })
                    .attr({ zIndex: 1, align: 'right' })
                    .add()
                ]

                chart.quadrantLines = [
                  // Vertical line
                  chart.renderer
                    .path([
                      'M',
                      chart.xAxis[0].toPixels(xMid),
                      chart.plotTop, // Move to top middle
                      'L',
                      chart.xAxis[0].toPixels(xMid),
                      chart.plotTop + chart.plotHeight // Line to bottom middle
                    ])
                    .attr({
                      stroke: '#FFFFFF', // White color
                      'stroke-width': 4,
                      zIndex: 1 // Ensure it is above the quadrants
                    })
                    .add(),
                  // Horizontal line
                  chart.renderer
                    .path([
                      'M',
                      chart.plotLeft,
                      chart.yAxis[0].toPixels(yMid), // Move to middle left
                      'L',
                      chart.plotLeft + chart.plotWidth,
                      chart.yAxis[0].toPixels(yMid) // Line to middle right
                    ])
                    .attr({
                      stroke: '#FFFFFF', // White color
                      'stroke-width': 4,
                      zIndex: 2 // Ensure it is above the quadrants
                    })
                    .add(),

                  // Fake Circle
                  // Add these two lines for the plus sign
                  // Vertical part of the plus
                  chart.renderer
                    .path([
                      'M',
                      chart.xAxis[0].toPixels(xMid),
                      chart.yAxis[0].toPixels(yMid) - 70, // Start 10px above center
                      'L',
                      chart.xAxis[0].toPixels(xMid),
                      chart.yAxis[0].toPixels(yMid) + 70 // End 10px below center
                    ])
                    .attr({
                      stroke: '#b3cf1e',
                      'stroke-width': 3,
                      zIndex: 3 // Ensure it's above the white lines
                    })
                    .add(),
                  // Horizontal part of the plus
                  chart.renderer
                    .path([
                      'M',
                      chart.xAxis[0].toPixels(xMid) - 70,
                      chart.yAxis[0].toPixels(yMid), // Start 10px left of center
                      'L',
                      chart.xAxis[0].toPixels(xMid) + 70,
                      chart.yAxis[0].toPixels(yMid) // End 10px right of center
                    ])
                    .attr({
                      stroke: '#b3cf1e',
                      'stroke-width': 3,
                      zIndex: 3 // Ensure it's above the white lines
                    })
                    .add()
                ]
              }

              // Draw quadrants initially
              drawQuadrants()

              // Redraw quadrants and labels on resize
              Highcharts.addEvent(chart, 'redraw', drawQuadrants)
            }
          }
        },
        xAxis: {
          min: 0,
          max: 100,
          gridLineWidth: 0,
          title: {
            text: 'Physical Risk'
          },
          tickLength: 0,
          lineWidth: 0,
          tickPositions: [0, 50, 95, 100], // Define explicit tick positions for plotting the lable
          labels: {
            formatter: function () {
              if (this.value === 0) return 'Lower'
              if (this.value === 95) return 'Higher'
              return ''
            }
          }
        },
        yAxis: {
          min: 0,
          max: 100,
          gridLineWidth: 0,
          title: {
            text: 'Transition Risk'
          },
          labels: {
            formatter: function () {
              if (this.value === 0) return 'Lower'
              if (this.value === 100) return 'Higher'
              return ''
            }
          }
        },
        tooltip: {
          headerFormat: '',
          pointFormat:
            '<span style="color:{point.color}">\u25cf</span> ' +
            '{point.name}<br/>' +
            `${zLabel}: {point.z}<br/>`
        },
        title: {
          text: title
        },
        subtitle: {
          text: subtitle
        },
        series: seriesData.map((series) => ({
          ...series,
          dataLabels: {
            enabled: true,
            formatter: function () {
              return `<div style="text-align: center;">${this.point.name}<br/>VaR: ${this.point.z}</div>`
            },
            useHTML: true, // Ensures you can use custom HTML styling
            align: 'center', // Centers the text horizontally
            verticalAlign: 'middle', // Centers the text vertically
            style: {
              color: '#000000', // Adjust label color if needed
              textOutline: 'none'
            }
          },
          minSize: '20%', // Minimum bubble size as a percentage of the chart width/height
          maxSize: '20%', // Maximum bubble size as a percentage of the chart width/height
          marker: {
            fillOpacity: 1 // Ensures the bubbles are fully opaque
          }
        })),
        legend: {
          enabled: showLegend
        },
        credits: {
          enabled: false
        }
      }

      Highcharts.chart(chartContainerRef.current, options)
    }
  }, [
    xValues,
    yValues,
    zValues,
    labels,
    colors,
    title,
    subtitle,
    width,
    height,
    xLabel,
    yLabel,
    zLabel,
    groups,
    showLegend
  ])

  return <div ref={chartContainerRef} />
}
