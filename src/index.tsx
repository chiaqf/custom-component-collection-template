import React from 'react'
import { type FC, useEffect, useRef } from 'react'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import AnnotationsModule from 'highcharts/modules/annotations';
HighchartsMore(Highcharts) // Initialize highcharts-more module for bubble charts
AnnotationsModule(Highcharts) // Initialize annotations module

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
            color: colors[index] || defaultColor
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
          type: xAxisType as 'linear' | 'logarithmic',
          gridLineWidth: 1,
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true,
        },
        yAxis: {
          title: {
            text: yLabel
          },
          type: yAxisType as 'linear' | 'logarithmic',
          gridLineWidth: 1,
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true,
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
    groups, showLegend,
    xAxisType, yAxisType
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
          pointFormat: '<span style="color:{point.color}">\u25cf</span> {series.name}: <b>{point.y}</b><br/>'        },
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

export const PackedBubbleChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const [labels, setLabels] = Retool.useStateArray({
    name: 'labels'
  });

  const [values, setValues] = Retool.useStateArray({
    name: 'values'
  });

  const [groups, setGroups] = Retool.useStateArray({
    name: 'groups'  // Array of group names, same length as labels and values
  });

  const [minBubbleSize, setMinBubbleSize] = Retool.useStateNumber({
    name: 'minBubbleSize'
  });

  const [maxBubbleSize, setMaxBubbleSize] = Retool.useStateNumber({
    name: 'maxBubbleSize'
  });

  const [title, setTitle] = Retool.useStateString({
    name: 'title'
  });

  const [subtitle, setSubtitle] = Retool.useStateString({
    name: 'subtitle'
  });

  const [width, setWidth] = Retool.useStateNumber({
    name: 'width'
  });

  const [height, setHeight] = Retool.useStateNumber({
    name: 'height'
  });  

  const [showLegend, setShowLegend] = Retool.useStateBoolean({
    name: 'showLegend'
  });

  const [labelThreshold, setLabelThreshold] = Retool.useStateNumber({
    name: 'labelThreshold'
  });

  const [colors, setColors] = Retool.useStateArray({
    name: 'colors'
  });

  useEffect(() => {
    if (chartContainerRef.current) {
      // Create a color map for groups
      const colorMap = {};
      const defaultColors = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'];
      const colorsToUse = colors && colors.length > 0 ? colors : defaultColors;
  
      groups.forEach((group, index) => {
        if (!colorMap[group]) {
          colorMap[group] = colorsToUse[index % colorsToUse.length]; // Cycle through colors if more groups than colors
        }
      });
  
      // Organize data by group
      const groupedData = (labels || []).reduce((acc, label, index) => {
        const group = groups[index];
        if (!acc[group]) acc[group] = [];
        acc[group].push({
          name: label,
          value: values[index],
          color: colorMap[group] // Assign color based on group
        });
        return acc;
      }, {});
  
      // Map grouped data into series format
      const series = Object.keys(groupedData).map((groupName) => ({
        type: 'packedbubble',
        name: groupName,
        data: groupedData[groupName],
        color: colorMap[groupName], // Ensure legend color matches bubble color
        dataLabels: {
          enabled: true,
          format: '{point.name}', // Show label if value meets the threshold
          filter: {
            property: 'value',
            operator: '>=',
            value: labelThreshold  // Only show labels if value is above threshold
          },
          style: {
            color: 'black',
            textOutline: 'none',
            fontWeight: 'bold'
          }
        }
      }));
  
      const options: Highcharts.Options = {
        chart: {
          type: 'packedbubble',
          reflow: true,
          backgroundColor: 'transparent',
          width: width,
          height: height
        },
        title: {
          text: title
        },
        subtitle: {
          text: subtitle
        },
        tooltip: {
          headerFormat: '',
          pointFormat: '<span style="color:{point.color}">\u25cf</span> {point.name}: <b>{point.value}</b><br/>'
        },
        legend: {
          enabled: showLegend
        },
        series: series.map((s) => ({
          ...s,
          minSize: minBubbleSize,
          maxSize: maxBubbleSize
        }))
      };
  
      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [labels, values, groups, minBubbleSize, maxBubbleSize, title, subtitle, width, height, showLegend, labelThreshold, colors]);
  
  return <div ref={chartContainerRef} />;
};


export const SplitPackedBubbleChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Existing Retool states
  const [minBubbleSize, setMinBubbleSize] = Retool.useStateNumber({
    name: 'minBubbleSize'
  });

  const [maxBubbleSize, setMaxBubbleSize] = Retool.useStateNumber({
    name: 'maxBubbleSize'
  });

  const [title, setTitle] = Retool.useStateString({
    name: 'title'
  });

  const [subtitle, setSubtitle] = Retool.useStateString({
    name: 'subtitle'
  });

  const [width, setWidth] = Retool.useStateNumber({
    name: 'width'
  });

  const [height, setHeight] = Retool.useStateNumber({
    name: 'height'
  });  

  const [showLegend, setShowLegend] = Retool.useStateBoolean({
    name: 'showLegend'
  });

  // New Retool state for `seriesData` holding the data structure
  const [seriesData, setSeriesData] = Retool.useStateArray({
    name: 'seriesData' // This should contain the split-packed bubble data, structured like Highcharts' `series` property
  });

  useEffect(() => {
    if (chartContainerRef.current && seriesData) {
      const options: Highcharts.Options = {
        chart: {
          type: 'packedbubble',
          reflow: true,
          backgroundColor: 'transparent',
          width: width,
          height: height
        },
        title: {
          text: title
        },
        subtitle: {
          text: subtitle
        },
        tooltip: {
          useHTML: true,
          pointFormat: '<b>{point.name}:</b> {point.value}m CO<sub>2</sub>'
        },
        legend: {
          enabled: showLegend
        },
        plotOptions: {
          packedbubble: {
            minSize: `${minBubbleSize}%`,
            maxSize: `${maxBubbleSize}%`,
            zMin: 0,
            zMax: 1000,
            layoutAlgorithm: {
              gravitationalConstant: 0.05,
              splitSeries: true,
              seriesInteraction: false,
              dragBetweenSeries: true,
              parentNodeLimit: true
            },
            dataLabels: {
              enabled: true,
              format: '{point.name}',
              filter: {
                property: 'y',
                operator: '>',
                value: 250
              },
              style: {
                color: 'black',
                textOutline: 'none',
                fontWeight: 'normal'
              }
            }
          }
        },
        series: seriesData // Use data from Retool state
      };

      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [seriesData, minBubbleSize, maxBubbleSize, title, subtitle, width, height, showLegend]);

  return <div ref={chartContainerRef} />;
};

export const AreaChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Retool states for user-defined inputs
  const [title, setTitle] = Retool.useStateString({ name: 'title' });
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
  const [yAxisTitle, setYAxisTitle] = Retool.useStateString({ name: 'yAxisTitle' });
  const [xAxisCategories, setXAxisCategories] = Retool.useStateArray({ name: 'xAxisCategories' });
  
  // [
  //   {
  //     "name": "historical",
  //     "data": [2, 9, 13, 50, 170, 299, 438, 200, 150, 30, 1]
  //   },
  //   {
  //     "name": "monte carlo",
  //     "data": [2, 9, 13, 50, 270, 299, 338, 200, 220, 150, 30, 1]
  //   }
  // ]
  
  const [seriesData, setSeriesData] = Retool.useStateArray({ name: 'seriesData' });
  const [smooth, setSmooth] = Retool.useStateBoolean({ name: 'smooth' });
  const [showMarkers, setShowMarkers] = Retool.useStateBoolean({ name: 'showMarkers' });


  //[
  // { "x": 1, "label": "99%" },
  // { "x": 2, "label": "95%" }
  // ]
  const [verticalLines, setVerticalLines] = Retool.useStateArray({
    name: 'verticalLines' 
  });

  useEffect(() => {
    if (chartContainerRef.current && seriesData) {
      const options: Highcharts.Options = {
        chart: {
          type: smooth ? 'areaspline' : 'area'
        },
        accessibility: {
          description: 'An area chart comparing different data series over time.'
        },
        title: {
          text: title || 'Default Title'
        },
        subtitle: {
          text: subtitle || 'Default Subtitle'
        },
        xAxis: {
          categories: xAxisCategories,
          allowDecimals: false,
          accessibility: {
            rangeDescription: `Range: ${xAxisCategories[0]} to ${xAxisCategories[xAxisCategories.length - 1]}.`
          },
          plotLines: verticalLines.map((line) => ({
            color: 'red', // Customize line color
            width: 2, // Line width
            value: xAxisCategories.indexOf(line.x), // Position line at specified X value
            dashStyle: 'ShortDash',
            label: {
              text: line.label,
              align: 'center',
              rotation: 0,
              y: -10 // Adjust label position as needed
            }
          }))
        },
        yAxis: {
          title: {
            text: yAxisTitle || 'Y-Axis Title'
          }
        },
        tooltip: {
          pointFormat: '{series.name} had <b>{point.y:,.0f}</b><br/>at {point.x}'
        },
        plotOptions: {
          areaspline: {
            marker: {
              enabled: showMarkers,
              symbol: 'circle',
              radius: 2,
              states: {
                hover: {
                  enabled: true
                }
              }
            }
          },
          area: {
            marker: {
              enabled: showMarkers,
              symbol: 'circle',
              radius: 2,
              states: {
                hover: {
                  enabled: true
                }
              }
            }
          }
        },
        series: seriesData.map((series) => ({
          ...series,
          type: smooth ? 'areaspline' : 'area'
        }))
      };

      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [title, subtitle, yAxisTitle, xAxisCategories, seriesData, smooth, showMarkers, verticalLines]);

  return <div ref={chartContainerRef} />;
};