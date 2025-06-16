import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef } from 'react'

// --- NEW: Reusable helper function to calculate the buffered range ---
const calculateBufferedRange = (min: number | null, max: number | null) => {
  if (min === null || max === null) {
    return { finalMin: null, finalMax: null };
  }

  const range = max - min;
  let buffer;

  if (range === 0) {
    // If there's only one point, create a small artificial buffer
    buffer = min === 0 ? 1 : Math.abs(min * 0.01);
  } else {
    // Otherwise, use 5% of the total range
    buffer = range * 0.01;
  }

  return {
    finalMin: min - buffer,
    finalMax: max + buffer
  };
};


export const BubbleChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Highcharts.Chart | null>(null) // Store chart instance

  const [xValues, setXValues] = Retool.useStateArray({ name: 'xValues' })
  const [xLabel, setXLabel] = Retool.useStateString({ name: 'xLabel' })
  const [yValues, setYValues] = Retool.useStateArray({ name: 'yValues' })
  const [yLabel, setYLabel] = Retool.useStateString({ name: 'yLabel' })
  const [zValues, setZValues] = Retool.useStateArray({ name: 'zValues' })
  const [zLabel, setZLabel] = Retool.useStateString({ name: 'zLabel' })
  const [labels, setLabels] = Retool.useStateArray({ name: 'labels' })
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' })
  const [defaultColor, setDefaultColor] = Retool.useStateString({ name: 'defaultColor' })
  const [title, setTitle] = Retool.useStateString({ name: 'title' })
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' })
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' })
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' })
  const [groups, setGroups] = Retool.useStateArray({ name: 'groups' })
  const [showLegend, setShowLegend] = Retool.useStateBoolean({ name: 'showLegend' })
  const [xAxisType, setXAxisType] = Retool.useStateString({ name: 'xAxisType' })
  const [yAxisType, setYAxisType] = Retool.useStateString({ name: 'yAxisType' })
  const [labelThreshold, setLabelThreshold] = Retool.useStateNumber({ name: 'labelThreshold' })
  const [plotLineXValues, setPlotLineXValues] = Retool.useStateArray({ name: 'plotLineXValues' })
  const [plotLineLabels, setPlotLineLabels] = Retool.useStateArray({ name: 'plotLineLabels' })
  const [plotLineYValues, setPlotLineYValues] = Retool.useStateArray({ name: 'plotLineYValues' })
  const [plotLineYLabels, setPlotLineYLabels] = Retool.useStateArray({ name: 'plotLineYLabels' })
  const [categories, setCategories] = Retool.useStateArray({ name: 'Categories' })
  const [minSize, setMinSize] = Retool.useStateNumber({ name: 'minSize' })
  const [maxSize, setMaxSize] = Retool.useStateNumber({ name: 'maxSize' })
  const [areaHighLight, setAreaHighLight] = Retool.useStateObject({ name: 'areaHighlight', description: "example {x1: 0, x2: 0.5, y1: 0, y2: 0.5, color:'#ea9999'}"})

  // --- Calculate axis min and max ---
  const allXDataPoints = [
    ...(xValues || []),
    ...(plotLineXValues || [])
  ].filter((v): v is number => typeof v === 'number' && isFinite(v))
  const xMin = allXDataPoints.length > 0 ? Math.min(...allXDataPoints) : null
  const xMax = allXDataPoints.length > 0 ? Math.max(...allXDataPoints) : null

  const allYDataPoints = [
    ...(yValues || []),
    ...(plotLineYValues || [])
  ].filter((v): v is number => typeof v === 'number' && isFinite(v));
  const yMin = allYDataPoints.length > 0 ? Math.min(...allYDataPoints) : null;
  const yMax = allYDataPoints.length > 0 ? Math.max(...allYDataPoints) : null;

  // --- MORE CONCISE: Use the helper function for buffering ---
  const { finalMin: finalXMin, finalMax: finalXMax } = calculateBufferedRange(xMin, xMax);
  const { finalMin: finalYMin, finalMax: finalYMax } = calculateBufferedRange(yMin, yMax);

  useEffect(() => {
    if (chartContainerRef.current) {
      // ... (The rest of the useEffect hook remains exactly the same)
      let bubbleSeriesData
      if (groups && groups.length > 0) {
        const uniqueGroups = [...new Set(groups)]
        bubbleSeriesData = uniqueGroups.map((group, groupIndex) => ({
          type: 'bubble',
          name: group,
          data: (labels || [])
            .map((label, index) => {
              if (groups[index] === group) {
                return {
                  name: label,
                  x: xValues[index],
                  y: yValues[index],
                  z: zValues[index]
                }
              }
              return null
            })
            .filter(Boolean),
          color: colors[groupIndex % colors.length]
        }))
      } else {
        bubbleSeriesData = [
          {
            type: 'bubble',
            name: labels ? 'Data' : '',
            data: (labels || []).map((label, index) => ({
              name: label,
              x: xValues[index],
              y: yValues[index],
              z: zValues[index],
              color: colors[index] || defaultColor
            }))
          }
        ]
      }
      const finalBubbleSeries = bubbleSeriesData.map((series) => ({
        ...series,
        zIndex: 1,
        dataLabels: {
          enabled: true,
          formatter: function () {
            return this.point.name
          },
          style: {
            color: '#000000',
            textOutline: 'none'
          }
        }
      }));
      const finalSeries: Highcharts.SeriesOptionsType[] = [...finalBubbleSeries];
      if (
        areaHighLight &&
        areaHighLight.x1 != null &&
        areaHighLight.x2 != null &&
        areaHighLight.y1 != null &&
        areaHighLight.y2 != null
      ) {
        finalSeries.push({
          type: 'polygon',
          name: 'Highlight',
          data: [
            [areaHighLight.x1, areaHighLight.y1],
            [areaHighLight.x2, areaHighLight.y1],
            [areaHighLight.x2, areaHighLight.y2],
            [areaHighLight.x1, areaHighLight.y2]
          ],
          lineWidth: 0,
          color: areaHighLight.color || 'rgba(234, 153, 153, 0.4)',
          fillOpacity: 0.5,
          zIndex: 0,
          enableMouseTracking: false,
          showInLegend: false,
          marker: {
              enabled: false
          }
        });
      }
      const options: Highcharts.Options = {
        chart: {
          type: 'bubble',
          reflow: true,
          backgroundColor: 'transparent',
          zooming: {
            type: 'xy'
          },
          width: width,
          height: height
        },
        plotOptions: {
          bubble: {
            minSize: minSize || 1,
            maxSize: maxSize || 50
          }
        },
        xAxis: {
          title: {
            text: xLabel
          },
          type: xAxisType as 'linear' | 'logarithmic',
          gridLineWidth: 1,
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true,
          min: finalXMin,
          max: finalXMax,
          plotLines: plotLineXValues.map((xValue, index) => ({
            value: xValue,
            color: '#000000',
            width: 1,
            dashStyle: 'Dash',
            zIndex: 3,
            label: {
              text: plotLineLabels[index] || `Line ${index + 1}`,
              align: 'left',
              verticalAlign: 'top',
              style: {
                color: '#000000'
              }
            }
          }))
        },
        yAxis: {
          title: {
            text: yLabel
          },
          type: yAxisType as 'linear' | 'logarithmic' | 'category',
          categories: yAxisType === 'category' ? categories : undefined,
          gridLineWidth: 1,
          startOnTick: yAxisType !== 'category',
          endOnTick: yAxisType !== 'category',
          min: finalYMin,
          max: finalYMax,
          plotLines: plotLineYValues.map((yValue, index) => ({
            value: yValue,
            color: '#000000',
            width: 1,
            dashStyle: 'Dash',
            zIndex: 3,
            label: {
              text: plotLineYLabels[index] || `Line ${index + 1}`,
              align: 'left',
              verticalAlign: 'top',
              style: {
                color: '#000000'
              }
            }
          }))
        },
        tooltip: {
          headerFormat: '',
          pointFormat:
            '<span style="color:{point.color}">\u25cf</span> ' +
            '{point.name}<br/>' +
            `${xLabel}: {point.x}<br/>` +
            `${yLabel}: {point.y}<br/>` +
            `${zLabel}: {point.z}<br/>` +
            'Group: {series.name}'
        },
        title: {
          text: title
        },
        subtitle: {
          text: subtitle
        },
        series: finalSeries,
        legend: {
          enabled: showLegend
        },
        credits: {
          enabled: false
        }
      }
      if (!chartRef.current) {
        chartRef.current = Highcharts.chart(chartContainerRef.current, options)
      } else {
        chartRef.current.update(options, true)
      }
    }
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [
    JSON.stringify(xValues),
    JSON.stringify(yValues),
    JSON.stringify(zValues),
    JSON.stringify(labels),
    JSON.stringify(colors),
    JSON.stringify(groups),
    JSON.stringify(plotLineXValues),
    JSON.stringify(plotLineLabels),
    JSON.stringify(plotLineYValues),
    JSON.stringify(plotLineYLabels),
    JSON.stringify(areaHighLight),
    title,
    subtitle,
    width,
    height,
    xLabel,
    yLabel,
    zLabel,
    showLegend,
    xAxisType,
    yAxisType,
    labelThreshold,
    defaultColor
  ])

  return <div ref={chartContainerRef} />
}