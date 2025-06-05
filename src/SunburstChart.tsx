import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import HighchartsMore from 'highcharts/highcharts-more'
HighchartsMore(Highcharts)

export const SunburstChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Retool states for the chart configuration
  const [data, setData] = Retool.useStateArray({
    name: 'data' // Hierarchical data structure
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

  const [colors, setColors] = Retool.useStateArray({
    name: 'colors'
  })

  const [allowTraversingTree, setAllowTraversingTree] = Retool.useStateBoolean({
    name: 'allowTraversingTree',
    defaultValue: true
  })

  const [startAngle, setStartAngle] = Retool.useStateNumber({
    name: 'startAngle',
    defaultValue: 90
  })

  const [endAngle, setEndAngle] = Retool.useStateNumber({
    name: 'endAngle',
    defaultValue: 450
  })

  useEffect(() => {
    if (chartContainerRef.current) {
      const options: Highcharts.Options = {
        chart: {
          type: 'sunburst',
          height: height || '100%',
          width: width,
          backgroundColor: 'transparent'
        },

        colors:
          colors && colors.length > 0
            ? colors
            : ['transparent'].concat(Highcharts.getOptions().colors),

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
            type: 'sunburst',
            data: data,
            name: 'Root',
            allowTraversingTree: allowTraversingTree,
            borderRadius: 3,
            cursor: 'pointer',
            startAngle: startAngle,
            endAngle: endAngle,
            dataLabels: {
              format: '{point.name}<br>({point.percent}%)',
              filter: {
                property: 'innerArcLength',
                operator: '>',
                value: 25
              },
              style: {
                textOutline: 'none'
              }
            },
            levels: [
              {
                level: 1,
                levelIsConstant: false,
                dataLabels: {
                  filter: {
                    property: 'outerArcLength',
                    operator: '>',
                    value: 64
                  }
                }
              },
              {
                level: 2,
                colorByPoint: true
              },
              {
                level: 3,
                colorVariation: {
                  key: 'brightness',
                  to: -0.5
                }
              },
              {
                level: 4,
                colorVariation: {
                  key: 'brightness',
                  to: 0.5
                }
              }
            ]
          }
        ],

        tooltip: {
          headerFormat: '',
          pointFormat: '<b>{point.name}</b>: <b>{point.value}</b>'
        }
      }

      Highcharts.chart(chartContainerRef.current, options)
    }
  }, [
    data,
    title,
    subtitle,
    width,
    height,
    allowTraversingTree,
    startAngle,
    endAngle
  ])

  return (
    <div
      ref={chartContainerRef}
      style={{
        margin: '0 auto',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    />
  )
}
