import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import HighchartsMore from 'highcharts/highcharts-more'
HighchartsMore(Highcharts)

export const TreemapChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Highcharts.Chart | null>(null) // Store chart instance

  const [labels, setLabels] = Retool.useStateArray({ name: 'labels' })
  const [values, setValues] = Retool.useStateArray({ name: 'values' })
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' })
  const [title, setTitle] = Retool.useStateString({ name: 'title' })
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' })
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' })
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' })

  // Memoize data preparation
  const prepareData = useCallback(() => {
    const totalValue = (values || []).reduce((acc, val) => acc + (val || 0), 0)

    return (labels || []).map((label, index) => ({
      name: label || '',
      value: (values || [])[index] || 0,
      color: (colors || [])[index], // Color can be undefined
      percentage: (
        (((values || [])[index] || 0) / (totalValue || 1)) *
        100
      ).toFixed(1)
    }))
  }, [JSON.stringify(labels), JSON.stringify(values), JSON.stringify(colors)])

  // Memoize chart options
  const getChartOptions = useCallback(
    (): Highcharts.Options => ({
      chart: {
        type: 'treemap',
        reflow: true,
        backgroundColor: 'transparent',
        width: width,
        height: height
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
          layoutAlgorithm: 'squarified',
          clip: false,
          data: prepareData(),
          dataLabels: {
            enabled: true,
            formatter: function () {
              return `<b>${this.point.name}</b><br>${this.point.percentage}%`
            },
            style: {
              fontSize: '12px'
            }
          }
        }
      ]
    }),
    [width, height, title, subtitle, JSON.stringify(prepareData())]
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
