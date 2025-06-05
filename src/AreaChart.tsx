import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import HighchartsMore from 'highcharts/highcharts-more'
HighchartsMore(Highcharts)

export const AreaChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Retool states for user-defined inputs
  const [title, setTitle] = Retool.useStateString({ name: 'title' })
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' })
  const [xAxisTitle, setXAxisTitle] = Retool.useStateString({
    name: 'xAxisTitle'
  })
  const [yAxisTitle, setYAxisTitle] = Retool.useStateString({
    name: 'yAxisTitle'
  })
  const [xAxisValues, setXAxisValues] = Retool.useStateArray({
    name: 'xAxisValues'
  }) // Array of x values
  const [seriesData, setSeriesData] = Retool.useStateArray({
    name: 'seriesData'
  }) // Array of series with x, y pairs
  const [smooth, setSmooth] = Retool.useStateBoolean({ name: 'smooth' })
  const [showMarkers, setShowMarkers] = Retool.useStateBoolean({
    name: 'showMarkers'
  })
  const [verticalLines, setVerticalLines] = Retool.useStateArray({
    name: 'verticalLines'
  })
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' })

  useEffect(() => {
    if (chartContainerRef.current && seriesData) {
      const options: Highcharts.Options = {
        chart: {
          type: smooth ? 'areaspline' : 'area',
          zooming: {
            type: 'xy'
          }
        },
        accessibility: {
          description:
            'An area chart comparing different data series over time.'
        },
        title: {
          text: title || ' '
        },
        subtitle: {
          text: subtitle || ' '
        },
        xAxis: {
          title: {
            text: xAxisTitle || 'X-Axis'
          },
          type: 'linear', // Use linear axis for numeric x values
          accessibility: {
            rangeDescription: `Range: ${Math.min(...xAxisValues)} to ${Math.max(...xAxisValues)}.`
          },
          plotLines: (verticalLines || []).map((line) => ({
            color: 'red', // Customize line color
            width: 2, // Line width
            value: line.x, // Position line at specified X value
            dashStyle: 'ShortDash',
            label: {
              text: line.label,
              align: 'center',
              rotation: 0,
              y: -5
            }
          }))
        },
        yAxis: {
          title: {
            text: yAxisTitle || 'Y-Axis Title'
          }
        },
        tooltip: {
          pointFormat: `{series.name}: <b>{point.y:,.4f}</b><br/>${yAxisTitle || 'Y-Axis'}: {point.y:,.4f}<br/>${xAxisTitle || 'X-Axis'}: {point.x}`
        },
        plotOptions: {
          areaspline: {
            marker: {
              enabled: showMarkers,
              symbol: 'circle',
              radius: 2,
              states: {
                hover: {
                  enabled: true
                }
              }
            }
          },
          area: {
            marker: {
              enabled: showMarkers,
              symbol: 'circle',
              radius: 2,
              states: {
                hover: {
                  enabled: true
                }
              }
            }
          }
        },
        credits: {
          enabled: false
        },
        series: seriesData.map((series, index) => ({
          ...series,
          type: smooth ? 'areaspline' : 'area',
          color: colors[index], // Apply color based on the index
          data: series.data.map((y, index) => ({ x: xAxisValues[index], y })) // Pair x and y values
        }))
      }

      Highcharts.chart(chartContainerRef.current, options)
    }
  }, [
    title,
    subtitle,
    yAxisTitle,
    xAxisValues,
    seriesData,
    smooth,
    showMarkers,
    verticalLines
  ])

  return <div ref={chartContainerRef} />
}
