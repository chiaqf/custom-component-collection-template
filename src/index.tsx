import React from 'react'
import { type FC, useEffect, useRef } from 'react'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'

import { Retool } from '@tryretool/custom-component-support'

export const PieChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [labels, setLabels] = Retool.useStateArray({
    name: 'labels'
  })

  const [values, setValues] = Retool.useStateArray({
    name: 'values'
  })

  const [colors, setColors] = Retool.useStateArray({
    name: 'colors'
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

  useEffect(() => {
    if (chartContainerRef.current) {
      const data = labels.map((label, index) => ({
        name: label,
        y: values[index],
        color: colors[index]
      }));

    const options: Highcharts.Options = {
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
      series: [{
          allowPointSelect: true,
          cursor: 'pointer',
          type: 'pie',
          data: data,
          dataLabels: [{
            enabled: true,
            distance: 20,
          }]
        }
      ]
      };
      Highcharts.chart(chartContainerRef.current, options)
    };
  }, [labels, values, colors, title, subtitle]);

  return <div ref={chartContainerRef} />
}
