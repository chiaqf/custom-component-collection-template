import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import 'highcharts/highcharts-more'
import 'highcharts/modules/variable-pie'

export const VariablePieChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Highcharts.Chart | null>(null) // Store chart instance

  // Reuse existing state patterns
  const [labels, setLabels] = Retool.useStateArray({ name: 'labels' })
  const [values, setValues] = Retool.useStateArray({
    name: 'values (slice sizes)'
  })
  const [zValues, setZValues] = Retool.useStateArray({
    name: 'zValues (slice height)'
  })
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' })
  const [title, setTitle] = Retool.useStateString({ name: 'title' })
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' })
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' })
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' })
  const [yLabel, setYLabel] = Retool.useStateString({ name: 'yLabel' })
  const [zLabel, setZLabel] = Retool.useStateString({ name: 'zLabel' })
  const [showLabelThreshold, setShowLabelThreshold] = Retool.useStateNumber({
    name: 'showLabelThreshold',
    initialValue: 10,
    label: 'Show label threshold.',
    description: 'Example: 10'
  })

  const [minPointSize, setMinPointSize] = Retool.useStateNumber({
    name: 'minPointSize',
    initialValue: 10
  })

  const [innerSize, setInnerSize] = Retool.useStateString({
    name: 'innerSize',
    initialValue: '20%'
  })

  const [borderRadius, setBorderRadius] = Retool.useStateNumber({
    name: 'borderRadius',
    initialValue: 5
  })

  const data = (labels || []).map((label, index) => ({
    name: label,
    y: values[index], // Size of slice
    z: zValues[index], // Variable dimension
    color: colors[index]
  }))

  const getChartOptions = useCallback(
    (): Highcharts.Options => ({
      chart: {
        type: 'variablepie',
        reflow: true,
        backgroundColor: 'transparent',
        width: width,
        height: height
      },
      tooltip: {
        headerFormat: '',
        pointFormat:
          '<span style="color:{point.color}">\u25CF</span> <b>{point.name}</b><br/>' +
          `${yLabel}: <b>{point.y}</b><br/>` +
          `${zLabel}: <b>{point.z}</b><br/>`
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
          type: 'variablepie',
          // minPointSize: minPointSize,
          innerSize: innerSize,
          zMin: 0,
          zMax: 100,
          name: 'Variable Pie Series',
          borderRadius: borderRadius,
          data: data,
          dataLabels: {
            enabled: true,
            filter: {
              property: 'percentage',
              operator: '>',
              value: showLabelThreshold
            },
            format: `{point.name}, {point.percentage:.1f}%`,
            align: 'center',
            verticalAlign: 'middle'
          }
        }
      ]
    }),
    [
      labels,
      values,
      zValues,
      colors,
      title,
      subtitle,
      width,
      height,
      minPointSize,
      innerSize,
      borderRadius,
      zLabel,
      yLabel
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
