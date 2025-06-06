import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import 'highcharts/highcharts-more'

export const PieChart: FC = () => {
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
    return (labels || []).map((label, index) => ({
      name: String(label || ''),
      y: Number(values?.[index] || 0),
      color: colors?.[index] ? String(colors[index]) : undefined
    }))
  }, [JSON.stringify(labels), JSON.stringify(values), JSON.stringify(colors)])

  // Memoize chart options
  const getChartOptions = useCallback(
    (): Highcharts.Options => ({
      chart: {
        type: 'pie',
        reflow: true,
        backgroundColor: 'transparent',
        width: width,
        height: height
      },
      tooltip: {
        headerFormat: '',
        pointFormat:
          '<span style="color:{point.color}">\u25cf</span> ' +
          '{point.name}: <b>{point.percentage:.1f}%</b>'
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
          allowPointSelect: true,
          cursor: 'pointer',
          type: 'pie',
          data: prepareData(),
          dataLabels: [
            {
              enabled: true,
              format: '{point.name} : {point.percentage:.1f}%',
              distance: 20
            }
          ]
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
