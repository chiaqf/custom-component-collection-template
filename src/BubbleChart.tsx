import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef } from 'react'
import HighchartsMore from 'highcharts/highcharts-more'
HighchartsMore(Highcharts)

export const BubbleChart: FC = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<Highcharts.Chart | null>(null) // Store chart instance
    
    const [xValues, setXValues] = Retool.useStateArray({ name: 'xValues' })
    const [xLabel, setXLabel] = Retool.useStateString({ name: 'xLabel' })
    const [yValues, setYValues] = Retool.useStateArray({ name: 'yValues' })
    const [yLabel, setYLabel] = Retool.useStateString({ name: 'yLabel' })
    const [zValues, setZValues] = Retool.useStateArray({ name: 'zValues' })
    const [zLabel, setZLabel] = Retool.useStateString({ name: 'zLabel' })
  
    const [labels, setLabels] = Retool.useStateArray({
      name: 'labels'
    })
  
    const [colors, setColors] = Retool.useStateArray({
      name: 'colors'
    })
  
    const [defaultColor, setDefaultColor] = Retool.useStateString({
      name: 'defaultColor'
    });
  
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
  
    const [xAxisType, setXAxisType] = Retool.useStateString({ name: 'xAxisType' });
    const [yAxisType, setYAxisType] = Retool.useStateString({ name: 'yAxisType' });
    const [labelThreshold, setLabelThreshold] = Retool.useStateNumber({ name: 'labelThreshold' });
    const [plotLineXValues, setPlotLineXValues] = Retool.useStateArray({ name: 'plotLineXValues' });
    const [plotLineLabels, setPlotLineLabels] = Retool.useStateArray({ name: 'plotLineLabels' });
    const [categories, setCategories] = Retool.useStateArray({ name: 'Categories' });
    const [minSize, setMinSize] = Retool.useStateNumber({ name: 'minSize' });
    const [maxSize, setMaxSize] = Retool.useStateNumber({ name: 'maxSize' });
  
    
    useEffect(() => {
      if (chartContainerRef.current) {
        // Group the data by unique group values
        let seriesData;
  
        if (groups && groups.length > 0) {
          // Group the data by unique group values
          const uniqueGroups = [...new Set(groups)];
          
          seriesData = uniqueGroups.map((group, groupIndex) => ({
            name: group,
            data: (labels || []).map((label, index) => {
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
            data: (labels || []).map((label, index) => ({
              name: label,
              x: xValues[index],
              y: yValues[index],
              z: zValues[index],
              color: colors[index] || defaultColor
            }))
          }];
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
            plotLines: plotLineXValues.map((xValue, index) => ({
              value: xValue, // x-coordinate where the line is drawn
              color: '#000000', // Line color (customize as needed)
              width: 1, // Line width
              dashStyle: 'Dash',
              zIndex: 1, // Ensure the line appears above other chart elements
              label: {
                text: plotLineLabels[index] || `Line ${index + 1}`, // Use provided label or default
                align: 'left', // Label alignment: 'left', 'center', or 'right'
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
            endOnTick: yAxisType !== 'category'
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
          series: seriesData.map(series => ({
            ...series,
            dataLabels: {
              enabled: true,
              formatter: function () {
                return this.point.name;
              },
              style: {
                color: '#000000', // Adjust label color if needed
                textOutline: 'none'
              }
            }
          })),
          legend: {
            enabled: showLegend
          },
          credits: {
            enabled: false
          }
        };
  
        if (!chartRef.current) {
          // Create chart only if it doesn't exist
          chartRef.current = Highcharts.chart(chartContainerRef.current, options);
        } else {
          // Update existing chart instead of recreating
          chartRef.current.update(options, true);
        }
      }
  
      // Cleanup on unmount
      return () => {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      }
    }, [
      JSON.stringify(xValues),
      JSON.stringify(yValues),
      JSON.stringify(zValues),
      JSON.stringify(labels),
      JSON.stringify(colors),
      JSON.stringify(groups),
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
    ]);
  
    return <div ref={chartContainerRef} />
  }
  