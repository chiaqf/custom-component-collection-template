import React from 'react'
import { type FC, useEffect, useRef } from 'react'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
HighchartsMore(Highcharts) // Initialize highcharts-more module for bubble charts

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
      const data = (labels || []).map((label, index) => ({
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


export const BubbleChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  
  const [xValues, setXValues] = Retool.useStateArray({
    name: 'xValues'
  })

  const [xLabel, setXLabel] = Retool.useStateString({
    name: 'xLabel'
  })

  const [yValues, setYValues] = Retool.useStateArray({
    name: 'yValues'
  })

  const [yLabel, setYLabel] = Retool.useStateString({
    name: 'yLabel'
  })

  const [zValues, setZValues] = Retool.useStateArray({
    name: 'zValues'  // For bubble sizes
  })
  
  const [zLabel, setZLabel] = Retool.useStateString({
    name: 'zLabel'
  })

  const [labels, setLabels] = Retool.useStateArray({
    name: 'labels'
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

  const [groups, setGroups] = Retool.useStateArray({
    name: 'groups'
  })

  const [showLegend, setShowLegend] = Retool.useStateBoolean({
    name: 'showLegend'
  })

  useEffect(() => {
    if (chartContainerRef.current) {
      // Group the data by unique group values
      let seriesData;

      if (groups && groups.length > 0) {
        // Group the data by unique group values
        const uniqueGroups = [...new Set(groups)];
        
        seriesData = uniqueGroups.map((group, groupIndex) => ({
          name: group,
          data: labels.map((label, index) => {
            if (groups[index] === group) {
              return {
                name: label,
                x: xValues[index],
                y: yValues[index],
                z: zValues[index]
              }
            }
            return null;
          }).filter(Boolean),
          color: colors[groupIndex % colors.length]
        }));
      } else {
        // No groups - create single series
        seriesData = [{
          data: labels.map((label, index) => ({
            name: label,
            x: xValues[index],
            y: yValues[index],
            z: zValues[index],
            color: colors[index]
          }))
        }];
      }

      const options: Highcharts.Options = {
        chart: {
          type: 'bubble',
          reflow: true,
          backgroundColor: 'transparent',
          width: width,
          height: height
        },
        xAxis: {
          title: {
            text: xLabel
          },
          gridLineWidth: 1,
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true
        },
        yAxis: {
          title: {
            text: yLabel
          },
          gridLineWidth: 1,
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true
        },
        tooltip: {
          headerFormat: '',
          pointFormat: '<span style="color:{point.color}">\u25cf</span> ' +
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
        series: seriesData,
        legend: {
          enabled: showLegend
        },
        };

      
      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [
    xValues, yValues, zValues, labels, colors, 
    title, subtitle, width, height,
    xLabel, yLabel, zLabel,
    groups, showLegend
  ]);

  return <div ref={chartContainerRef} />
}

export const BarChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  
  const [data, setData] = Retool.useStateArray({
    name: 'data'
  })

  const [categories, setCategories] = Retool.useStateArray({
    name: 'categories'
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

  const [showLegend, setShowLegend] = Retool.useStateBoolean({
    name: 'showLegend'
  })

  const [width, setWidth] = Retool.useStateNumber({
    name: 'width'
  })

  const [height, setHeight] = Retool.useStateNumber({
    name: 'height'
  })

  const [layout, setLayout] = Retool.useStateString({
    name: 'layout',
    defaultValue: 'bar'
  })

  const [seriesNames, setSeriesNames] = Retool.useStateArray({
    name: 'seriesNames'
  })

  useEffect(() => {
    if (chartContainerRef.current) {
      // Handle multiple series if data is nested array, otherwise single series
      const seriesData = Array.isArray(data[0]) 
        ? data.map((series, index) => ({
            data: series,
            color: colors[index % colors.length],
            name: seriesNames[index]
          }))
        : [{
            data,
            color: colors[0],
            name: seriesNames[0]
          }];

      const options: Highcharts.Options = {
        chart: {
          type: layout,
          reflow: true,
          backgroundColor: 'transparent',
          width: width,
          height: height
        },
        xAxis: {
          categories: categories,
          gridLineWidth: 0
        },
        yAxis: {
          title: {
            text: null
          },
          gridLineWidth: 1
        },
        tooltip: {
          headerFormat: '{point.key}<br/>',
          pointFormat: '<span style="color:{point.color}">\u25cf</span> : <b>{point.y}</b><br/>'
        },
        title: {
          text: title
        },
        subtitle: {
          text: subtitle
        },
        legend: {
          enabled: showLegend
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true
            }
          }
        },
        series: seriesData
      };
      
      Highcharts.chart(chartContainerRef.current, options)
    }
  }, [data, categories, colors, title, subtitle, showLegend, width, height]);

  return <div ref={chartContainerRef} />
}