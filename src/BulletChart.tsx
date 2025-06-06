import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'

import 'highcharts/modules/bullet'

export const BulletChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Retool state for target and actual values
  const [target, setTarget] = Retool.useStateNumber({ name: 'target' })
  const [actual, setActual] = Retool.useStateNumber({ name: 'actual' })
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' })
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' })
  const [targetColor, setTargetColor] = Retool.useStateString({
    name: 'targetColor'
  })
  const [actualColor, setActualColor] = Retool.useStateString({
    name: 'actualColor'
  })
  const [title, setTitle] = Retool.useStateString({ name: 'title' })
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' })
  const [reversed, setReversed] = Retool.useStateBoolean({ name: 'reversed' })
  const [xAxisLabel, setXAxisLabel] = Retool.useStateString({
    name: 'xAxisLabel'
  })
  const [marginLeft, setMarginLeft] = Retool.useStateNumber({
    name: 'marginLeft'
  })

  useEffect(() => {
    if (chartContainerRef.current) {
      const options: Highcharts.Options = {
        chart: {
          type: 'bullet',
          inverted: true,
          marginLeft: marginLeft,
          width: width,
          height: height
        },
        title: {
          text: title
        },
        subtitle: {
          text: subtitle
        },
        legend: {
          enabled: false
        },
        xAxis: {
          categories: [xAxisLabel]
        },
        yAxis: {
          gridLineWidth: 1,
          plotBands: [
            {
              from: -9e9,
              to: 9e9,
              color: '#bbb'
            }
          ],
          title: null,
          reversed: reversed
        },
        plotOptions: {
          series: {
            pointPadding: 0.25,
            borderWidth: 0,
            color: actualColor,
            targetOptions: {
              width: '500%',
              color: targetColor
            }
          }
        },
        series: [
          {
            type: 'bullet',
            data: [
              {
                y: actual || 0, // Actual value from Retool state
                target: target || 0 // Target value from Retool state
              }
            ]
          }
        ],
        tooltip: {
          pointFormat: '<b>{point.y}</b> (with target at {point.target})'
        },
        credits: {
          enabled: false
        }
      }

      Highcharts.chart(chartContainerRef.current, options)
    }
  }, [
    actual,
    target,
    width,
    height,
    targetColor,
    actualColor,
    title,
    subtitle,
    reversed,
    xAxisLabel,
    marginLeft
  ])

  return (
    <div>
      {/* Chart container */}
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
