import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import HighchartsMore from 'highcharts/highcharts-more'
HighchartsMore(Highcharts)

export const MirroredBarChart: FC = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<Highcharts.Chart | null>(null) // Store chart instance
    // Retool states
  
    const [categories, setCategories] = Retool.useStateArray({
      name: 'categories'
    })
    const [leftData, setLeftData] = Retool.useStateArray({ name: 'leftData' })
    const [rightData, setRightData] = Retool.useStateArray({ name: 'rightData' })
    const [leftSeriesName, setLeftSeriesName] = Retool.useStateString({
      name: 'leftSeriesName'
    })
    const [rightSeriesName, setRightSeriesName] = Retool.useStateString({
      name: 'rightSeriesName'
    })
    const [title, setTitle] = Retool.useStateString({ name: 'title' })
    const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' })
    const [xAxisLabel, setXAxisLabel] = Retool.useStateString({
      name: 'xAxisLabel'
    })
    const [yAxisLabel, setYAxisLabel] = Retool.useStateString({
      name: 'yAxisLabel'
    })
    const [width, setWidth] = Retool.useStateNumber({ name: 'width' })
    const [height, setHeight] = Retool.useStateNumber({ name: 'height' })
    const [colors, setColors] = Retool.useStateArray({ name: 'colors' }) // Memoize chart options
  
    const getChartOptions = useCallback((): Highcharts.Options => {
      // Add custom template helper for absolute values
      // This needs to be outside the options object or handled globally by Highcharts.
      // For a per-chart solution, it's generally done once during module import or chart creation if needed.
      // Highcharts.Templating.helpers.abs will be globally defined here, so only call once or ensure idempotency.
      if (!Highcharts.Templating.helpers.abs) {
        Highcharts.Templating.helpers.abs = (value: number) => Math.abs(value)
      }
  
      return {
        chart: {
          type: 'bar',
          width,
          height,
          reflow: true,
          backgroundColor: 'transparent'
        },
        title: {
          text: title
        },
        subtitle: {
          text: subtitle
        },
        xAxis: [
          {
            categories,
            reversed: false,
            title: {
              text: xAxisLabel || null
            },
            labels: {
              step: 1
            }
          },
          {
            // mirror axis on right side
            opposite: true,
            reversed: false,
            categories,
            linkedTo: 0,
            labels: {
              step: 1
            }
          }
        ],
        yAxis: {
          title: {
            text: yAxisLabel || null
          },
          labels: {
            formatter: function (
              this: Highcharts.AxisLabelsFormatterContextObject
            ) {
              return Math.abs(this.value as number) + '%'
            }
          }
        },
        plotOptions: {
          series: {
            stacking: 'normal',
            borderRadius: 0 // Keep as 0 for classic bar charts
          }
        },
        tooltip: {
          formatter: function (this: Highcharts.TooltipFormatterContextObject) {
            return (
              `<b>${this.series.name}, ${xAxisLabel} : ${this.point.category}</b><br/>` +
              `Value: ${Math.abs(this.point.y?.valueOf() as number).toFixed(2)}%`
            )
          }
        },
        series: [
          {
            name: leftSeriesName,
            data: leftData.map((value) => Number(value) * -1), // Negative values for left side
            color: colors?.[0],
            type: 'bar' // Explicitly set type
          },
          {
            name: rightSeriesName,
            data: rightData.map(Number), // Positive values for right side
            color: colors?.[1],
            type: 'bar' // Explicitly set type
          }
        ],
        credits: {
          enabled: false
        }
      }
    }, [
      JSON.stringify(categories),
      JSON.stringify(leftData),
      JSON.stringify(rightData),
      leftSeriesName,
      rightSeriesName,
      title,
      subtitle,
      xAxisLabel,
      yAxisLabel,
      width,
      height,
      JSON.stringify(colors)
    ])
  
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
    }, [JSON.stringify(getChartOptions())]) // Re-run effect only when memoized options object changes
  
    return <div ref={chartContainerRef} />
  }
  