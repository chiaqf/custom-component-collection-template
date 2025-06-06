import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'

import 'highcharts/modules/solid-gauge'

export const GaugeChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = Retool.useStateString({ name: 'title' })
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' })
  const [yMin, setYMin] = Retool.useStateNumber({ name: 'yMin' })
  const [yMax, setYMax] = Retool.useStateNumber({ name: 'yMax' })
  const [value, setValue] = Retool.useStateNumber({ name: 'value' })
  const [seriesName, setSeriesName] = Retool.useStateString({
    name: 'seriesName'
  })
  const [height, setHeight] = Retool.useStateString({ name: 'height' })
  const [width, setWidth] = Retool.useStateString({ name: 'width' })

  useEffect(() => {
    if (chartContainerRef.current) {
      console.log({ title, subtitle, yMin, yMax, value, seriesName }) // Log values for debugging

      Highcharts.chart(chartContainerRef.current, {
        chart: {
          type: 'solidgauge',
          width: width,
          height: height
        },
        plotOptions: {
          solidgauge: {
            borderRadius: 3,
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true
            }
          }
        },
        pane: {
          center: ['50%', '85%'],
          size: '140%',
          startAngle: -90,
          endAngle: 90,
          background: {
            backgroundColor:
              Highcharts.defaultOptions.legend.backgroundColor || '#fafafa',
            borderRadius: 5,
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },
        credits: {
          enabled: false
        },
        title: { text: title },
        subtitle: { text: subtitle },
        yAxis: {
          min: yMin,
          max: yMax,
          stops: [
            [0.1, '#55BF3B'], // green
            [0.5, '#DDDF0D'], // yellow
            [0.9, '#DF5353'] // red
          ],
          lineWidth: 0,
          tickWidth: 0,
          minorTickInterval: null,
          tickAmount: 2,
          title: {
            y: -70
          },
          labels: {
            y: 16
          }
        },
        series: [
          {
            data: [value],
            name: seriesName
          }
        ]
      })
    }
  }, [title, subtitle, yMin, yMax, value, seriesName, width, height])

  return (
    <div
      ref={chartContainerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%' // Ensure the parent container has a defined height
      }}
    />
  )
}
