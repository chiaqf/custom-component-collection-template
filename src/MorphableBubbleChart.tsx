import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import HighchartsMore from 'highcharts/highcharts-more'
HighchartsMore(Highcharts)

export const MorphableBubbleChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Highcharts.Chart | null>(null) // Retool states for user-defined data and field mappings

  const [seriesData, setSeriesData] = Retool.useStateArray({
    name: 'seriesData'
  })
  const [xField, setXField] = Retool.useStateString({ name: 'xField' })
  const [xAltField, setXAltField] = Retool.useStateString({ name: 'xAltField' })
  const [yField, setYField] = Retool.useStateString({ name: 'yField' })
  const [yAltField, setYAltField] = Retool.useStateString({ name: 'yAltField' })
  const [zField, setZField] = Retool.useStateString({ name: 'zField' })
  const [nameField, setNameField] = Retool.useStateString({ name: 'nameField' })
  const [groupField, setGroupField] = Retool.useStateArray({
    name: 'groupField'
  })
  const [xAxisType, setXAxisType] = Retool.useStateString({ name: 'xAxisType' })
  const [yAxisType, setYAxisType] = Retool.useStateString({ name: 'yAxisType' })
  const [showLegend, setShowLegend] = Retool.useStateBoolean({
    name: 'showLegend'
  })
  const [toggleOptions, setToggleOptions] = Retool.useStateArray({
    name: 'toggleOptions'
  })
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' })

  const [title, setTitle] = Retool.useStateString({ name: 'title' })
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' })
  const [xAxisTitle, setXAxisTitle] = Retool.useStateString({
    name: 'xAxisTitle'
  })
  const [yAxisTitle, setYAxisTitle] = Retool.useStateString({
    name: 'yAxisTitle'
  })

  const [width, setWidth] = Retool.useStateNumber({ name: 'width' })
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' }) // Memoize the chart options

  const getChartOptions = useCallback((): Highcharts.Options => {
    if (!seriesData || !xField || !yField || !groupField) {
      return {} // Return empty options if essential data is missing
    }

    const colorMap: Record<string, string> = {}
    groupField.forEach((group, index) => {
      if (!colorMap[group] && colors.length > 0) {
        colorMap[group] = colors[index % colors.length] // Assign a color from the colors array
      }
    }) // Group the data using the groupField array

    const groupedData = seriesData.reduce(
      (acc: Record<string, any[]>, point: any, index: number) => {
        const group = groupField[index] || 'Ungrouped'
        if (!acc[group]) {
          acc[group] = []
        }
        acc[group].push({
          x: point[xField],
          x_1: point[xAltField],
          y: point[yField],
          y_1: point[yAltField],
          z: zField ? point[zField] : undefined,
          name: nameField ? point[nameField] : undefined
        })
        return acc
      },
      {}
    )

    const seriesOptions = Object.keys(groupedData).map((group) => ({
      name: group,
      data: groupedData[group],
      color: colorMap[group], // Assign color based on group name
      animation: {
        duration: 1000,
        easing: 'easeOutBounce'
      },
      dataLabels: {
        enabled: true,
        formatter: function (this: Highcharts.PointLabelObject) {
          return this.point.name
        },
        style: {
          color: '#000000', // Adjust label color if needed
          textOutline: 'none'
        }
      }
    }))

    return {
      chart: {
        type: 'bubble',
        width: width,
        height: height,
        plotBorderWidth: 1,
        zooming: {
          type: 'xy'
        },
        reflow: true,
        backgroundColor: 'transparent'
      },
      title: {
        text: title
      },
      subtitle: {
        text: subtitle
      },
      xAxis: {
        gridLineWidth: 1,
        type: xAxisType as 'linear' | 'logarithmic',
        title: {
          text: xAxisTitle
        }
      },
      yAxis: {
        type: yAxisType as 'linear' | 'logarithmic',
        title: {
          text: yAxisTitle
        }
      },
      legend: {
        enabled: showLegend
      },
      tooltip: {
        headerFormat: '',
        pointFormat:
          '<span style="color:{point.color}">\u25cf</span> ' +
          '{point.name}<br/>' +
          `${xAxisTitle}: {point.x}<br/>` +
          `${yAxisTitle}: {point.y}<br/>` +
          `${zField ? zField : ''}: {point.z}<br/>`
      },
      plotOptions: {
        series: {
          dataLabels: {
            enabled: true,
            format: '{point.name}'
          }
        }
      },
      series: seriesOptions as Highcharts.SeriesOptionsType[], // Cast to Highcharts.SeriesOptionsType[]
      credits: {
        enabled: false
      }
    }
  }, [
    seriesData,
    xField,
    xAltField,
    yField,
    yAltField,
    zField,
    nameField,
    groupField,
    xAxisType,
    yAxisType,
    showLegend,
    title,
    subtitle,
    xAxisTitle,
    yAxisTitle,
    width,
    height,
    JSON.stringify(colors) // Stringify colors to ensure deep comparison
  ])

  useEffect(() => {
    if (!chartContainerRef.current) return

    const options = getChartOptions() // If there are no series data, destroy the chart and return

    if (!options.series || options.series.length === 0) {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
      return
    }

    if (!chartRef.current) {
      // Create new chart if it doesn't exist
      chartRef.current = Highcharts.chart(chartContainerRef.current, options)
    } else {
      // Update existing chart
      chartRef.current.update(options, true)
    } // Add event listener for the toggle switch only once when the chart is created

    const toggleSwitch = document.getElementById('coordinateToggle')
    if (toggleSwitch && chartRef.current) {
      const currentChart = chartRef.current
      const originalData = options.series!.map((series) => ({
        // Store initial data for toggling
        ...series,
        data:
          series.data?.map((point) => ({
            ...(point as Highcharts.PointOptionsObject)
          })) || []
      }))

      const handleToggleChange = () => {
        setTimeout(() => {
          const isChecked = (toggleSwitch as HTMLInputElement).checked

          currentChart.series.forEach((series, seriesIndex) => {
            series.data.forEach((point, pointIndex) => {
              const originalPoint = originalData[seriesIndex].data[pointIndex]
              point.update(
                {
                  x: isChecked ? originalPoint.x_1 : originalPoint.x,
                  y: isChecked ? originalPoint.y_1 : originalPoint.y
                },
                false, // Do not redraw immediately for each point
                true // Enable animation for each point
              )
            })
          })
          currentChart.redraw()
        }, 150)
      }

      toggleSwitch.addEventListener('change', handleToggleChange) // Cleanup event listener

      return () => {
        toggleSwitch.removeEventListener('change', handleToggleChange)
        if (chartRef.current) {
          chartRef.current.destroy()
          chartRef.current = null
        }
      }
    } // Cleanup function for when component unmounts or dependencies change significantly

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [JSON.stringify(getChartOptions())]) // Re-run effect only when memoized options object changes, which includes data changes

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
             {' '}
      <div
        className="d-flex align-items-center mb-3"
        style={{ padding: '10px' }}
      >
                 {' '}
        <span className="me-3 text-muted small">{toggleOptions[0]}</span>
                 {' '}
        <div className="form-check form-switch">
                     {' '}
          <input
            id="coordinateToggle"
            className="form-check-input"
            type="checkbox"
          />
                   {' '}
        </div>
                 {' '}
        <span className="ms-3 text-muted small">{toggleOptions[1]}</span>
               {' '}
      </div>
             {' '}
      <div
        ref={chartContainerRef}
        style={{
          flex: 1, // Makes the chart take up the remaining space
          overflow: 'hidden' // Prevents scrollbars
        }}
      ></div>
           {' '}
    </div>
  )
}
