import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import HighchartsMore from 'highcharts/highcharts-more'
HighchartsMore(Highcharts)

export const SLineChart: FC = () => {
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
  const [seriesData, setSeriesData] = Retool.useStateArray({
    name: 'seriesData'
  }) // Array of series objects
  const [smooth, setSmooth] = Retool.useStateBoolean({ name: 'smooth' })
  const [showMarkers, setShowMarkers] = Retool.useStateBoolean({
    name: 'showMarkers'
  })
  const [verticalLines, setVerticalLines] = Retool.useStateArray({
    name: 'verticalLines'
  })
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' })
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' })
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' })

  useEffect(() => {
    if (chartContainerRef.current && seriesData) {
      const options: Highcharts.Options = {
        chart: {
          type: 'line',
          width: width,
          height: height,
          zooming: {
            type: 'xy'
          }
        },
        title: {
          text: title || ' '
        },
        subtitle: {
          text: subtitle || ' '
        },
        xAxis: {
          type: 'linear', // Use linear scale for numeric x-axis values
          title: {
            text: xAxisTitle || 'X-Axis'
          }
        },
        yAxis: {
          title: {
            text: yAxisTitle || 'Y-Axis'
          }
        },
        tooltip: {
          pointFormat: `{series.name}: ${xAxisTitle}: {point.x}, ${yAxisTitle}: {point.y:,.3f}`
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
            lineWidth: smooth ? 2 : 1
          }
        },
        series: seriesData.map((series, index) => ({
          ...series,
          type: 'line',
          color: colors[index],
          data: series.data // Pair x and y values
        }))
      }

      Highcharts.chart(chartContainerRef.current, options)
    }
  }, [
    title,
    subtitle,
    yAxisTitle,
    seriesData,
    smooth,
    showMarkers,
    verticalLines,
    colors
  ])

  return <div ref={chartContainerRef} />
}
