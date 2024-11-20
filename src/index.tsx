import React from 'react'
import { type FC, useEffect, useRef, useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import AnnotationsModule from 'highcharts/modules/annotations';
import HighchartsTreemap from 'highcharts/modules/treemap';
import HighchartsHeatmap from 'highcharts/modules/heatmap';
import HighchartsSunburst from 'highcharts/modules/sunburst';
HighchartsSunburst(Highcharts); // Initialize sunburst module
HighchartsHeatmap(Highcharts);
HighchartsTreemap(Highcharts);
HighchartsMore(Highcharts) // Initialize highcharts-more module for bubble charts
AnnotationsModule(Highcharts) // Initialize annotations module

import Boost from 'highcharts/modules/boost';
Boost(Highcharts);
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
      credits: {
        enabled: false
      },
      series: [{
          allowPointSelect: true,
          cursor: 'pointer',
          type: 'pie',
          data: data,
          dataLabels: [{
            enabled: true,
            format: '{point.name} : {point.percentage:.1f}%',
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
  const [labelThreshold, setLabelThreshold] = Retool.useStateNumber({ name: 'labelThreshold' });
  
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

      
      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [
    xValues, yValues, zValues, labels, colors, 
    title, subtitle, width, height,
    xLabel, yLabel, zLabel,
    groups, showLegend,
    xAxisType, yAxisType, labelThreshold
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

  const [reverseYAxis, setReverseYAxis] = Retool.useStateBoolean({
    name: 'reverseYAxis'
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
          gridLineWidth: 1,
          reversed: reverseYAxis
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
            },
          },
          column: {
            dataLabels: {
              enabled: true
            },
          }
        },
        series: seriesData,
        credits: {
          enabled: false
      },
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
          height: height,
        },
        plotOptions :{
          packedbubble: {
            layoutAlgorithm: {
              gravitationalConstant: 0.1,
              splitSeries: true,
              seriesInteraction: false,
              dragBetweenSeries: true,
              parentNodeLimit: true
            },
          }
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
        credits: {
          enabled: false
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
        series: seriesData, // Use data from Retool state
        credits: {
          enabled: false
        }
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
  const [xAxisValues, setXAxisValues] = Retool.useStateArray({ name: 'xAxisValues' }); // Array of x values
  const [seriesData, setSeriesData] = Retool.useStateArray({ name: 'seriesData' }); // Array of series with x, y pairs
  const [smooth, setSmooth] = Retool.useStateBoolean({ name: 'smooth' });
  const [showMarkers, setShowMarkers] = Retool.useStateBoolean({ name: 'showMarkers' });
  const [verticalLines, setVerticalLines] = Retool.useStateArray({ name: 'verticalLines' });
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' });

  useEffect(() => {
    if (chartContainerRef.current && seriesData) {
      const options: Highcharts.Options = {
        chart: {
          type: smooth ? 'areaspline' : 'area',
          zooming: {
            type: 'xy'
          }
        },
        accessibility: {
          description: 'An area chart comparing different data series over time.'
        },
        title: {
          text: title || " "
        },
        subtitle: {
          text: subtitle || " "
        },
        xAxis: {
          title: {
            text: 'X-Axis'
          },
          type: 'linear', // Use linear axis for numeric x values
          accessibility: {
            rangeDescription: `Range: ${Math.min(...xAxisValues)} to ${Math.max(...xAxisValues)}.`
          },
          plotLines: (verticalLines || []).map((line) => ({
            color: 'red', // Customize line color
            width: 2, // Line width
            value: line.x, // Position line at specified X value
            dashStyle: 'ShortDash',
            label: {
              text: line.label,
              align: 'center',
              rotation: 0,
              y: -5,
            }
          }))
        },
        yAxis: {
          title: {
            text: yAxisTitle || 'Y-Axis Title'
          },
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.y:,.0f}</b><br/>at {point.x}'
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
        credits: {
          enabled: false
        },
        series: seriesData.map((series, index) => ({
          ...series,
          type: smooth ? 'areaspline' : 'area',
          color: colors[index],  // Apply color based on the index
          data: series.data.map((y, index) => ({ x: xAxisValues[index], y })) // Pair x and y values
        }))
      };

      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [title, subtitle, yAxisTitle, xAxisValues, seriesData, smooth, showMarkers, verticalLines]);

  return <div ref={chartContainerRef} />;
};

export const DataOnlyTreemapChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = Retool.useStateArray({ name: 'data' });
  const [title, setTitle] = Retool.useStateString({ name: 'title' });
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
  const [width, setWidth] = Retool.useStateString({ name: 'width' });
  const [height, setHeight] = Retool.useStateString({ name: 'height' });
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' });
  
  useEffect(() => {
    if (chartContainerRef.current && data.length > 0 && colors.length > 0) {

      let colorIndex = 0;

      const coloredData = data.map((point) => {
        // Check if the node is at level 2 by verifying that its parent is '0.0'
        if (point.parent === '0.0') {
          const coloredPoint = {
            ...point,
            color: colors[colorIndex % colors.length] // Assign color and cycle through colors if needed
          };
          colorIndex++; // Increment the color index for each level 2 node
          return coloredPoint;
        }
        return point; // Return other nodes as-is
      });

      const options: Highcharts.Options = {
        chart: {
          type: 'treemap',
          reflow: true,
          backgroundColor: 'transparent',
          width: width,
          height: height || '100%',
          events: {
            load: function () {
              // Drill down to the first level programmatically
              this.series[0].drillToNode('0.0');
            }
          }
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
        series: [{
          type: 'treemap',
          layoutAlgorithm: 'squarified',
          allowDrillToNode: true,
          clip: false,
          data: coloredData,
          dataLabels: {
            enabled: false
          },
          levels: [{
            level: 1,
            dataLabels: {
              enabled: true,
              formatter: function() {
                return `<b>${this.point.name}</b><br>${this.point.percent}%`;
              },
            },
            borderWidth: 3,
            levelIsConstant: false
          }, {
            level: 1,
            dataLabels: {
              formatter: function() {
                return `<b>${this.point.name}</b><br>${this.point.percent}%`;
              },
              style: {
                fontSize: '14px'
              }
            }
          }],
          // dataLabels: {
          //   enabled: true,
          //   formatter: function() {
          //     return `<b>${this.point.name}</b><br>${this.point.percentage}%`;
          //   },
          //   style: {
          //     fontSize: '12px'
          //   }
          // }
        }]
      };

      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [title, subtitle, width, height, data]);

  return <div ref={chartContainerRef} />;
};

export const TreemapChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [labels, setLabels] = Retool.useStateArray({ name: 'labels' });
  const [values, setValues] = Retool.useStateArray({ name: 'values' });
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' });
  const [title, setTitle] = Retool.useStateString({ name: 'title' });
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' });
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' });

  useEffect(() => {
    if (chartContainerRef.current) {
      const totalValue = (values || []).reduce((acc, val) => acc + (val || 0), 0);

      const data = (labels || []).map((label, index) => ({
        name: label || '',
        value: (values || [])[index] || 0,
        color: (colors || [])[index],  // Color can be undefined
        percentage: (((values || [])[index] || 0) / (totalValue || 1) * 100).toFixed(1)
      }));

      const options: Highcharts.Options = {
        chart: {
          type: 'treemap',
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
        credits: {
          enabled: false
        },
        series: [{
          type: 'treemap',
          layoutAlgorithm: 'squarified',
          clip: false,
          data: data,
          dataLabels: {
            enabled: true,
            formatter: function() {
              return `<b>${this.point.name}</b><br>${this.point.percentage}%`;
            },
            style: {
              fontSize: '12px'
            }
          }
        }]
      };

      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [labels, values, colors, title, subtitle, width, height]);

  return <div ref={chartContainerRef} />;
};

export const HeatmapChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = Retool.useStateArray({ name: 'data' });
  const [title, setTitle] = Retool.useStateString({ name: 'title' });
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' });
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' });
  const [colorRange, setColorRange] = Retool.useStateArray({ name: 'colorRange' }); // [minColor, maxColor]
  const [valueRange, setValueRange] = Retool.useStateArray({ name: 'valueRange' }); // [minValue, maxValue]
  const [xAxisCategories, setXAxisCategories] = Retool.useStateArray({ name: 'xAxisCategories' });
  const [yAxisCategories, setYAxisCategories] = Retool.useStateArray({ name: 'yAxisCategories' });
  const [xAxisTitle, setXAxisTitle] = Retool.useStateString({ name: 'xAxisTitle' });
  const [yAxisTitle, setYAxisTitle] = Retool.useStateString({ name: 'yAxisTitle' });
  const [valueLabel, setValueLabel] = Retool.useStateString({ name: 'valueLabel' });

  useEffect(() => {
    if (chartContainerRef.current) {
      const options: Highcharts.Options = {
        chart: {
          type: 'heatmap',
          // marginTop: 40,
          // marginBottom: 80,
          plotBorderWidth: 0,
          backgroundColor: 'transparent',
          width: width,
          height: height,
          plotBorderColor: '#000000' // Sets the color of the border (e.g., black)
        },
        title: {
          text: title,
          style: { fontSize: '1em' }
        },
        subtitle: {
          text: subtitle,
          style: { fontSize: '1em' }
        },
        xAxis: {
          categories: xAxisCategories,
          title: {
            text: xAxisTitle
          }
        },
        yAxis: {
          categories: yAxisCategories,
          title: {
            text: yAxisTitle
          },
          reversed: true
        },
        credits: {
          enabled: false
        },
        colorAxis: {
          min: valueRange[0],
          max: valueRange[1],
          minColor: colorRange[0],
          maxColor: colorRange[1]
        },
        legend: {
          align: 'right',
          layout: 'vertical',
          margin: 0,
          verticalAlign: 'top',
          y: 25,
          symbolHeight: 280
        },
        tooltip: {
          formatter: function () {
            return `<b>${xAxisTitle}</b> : ${xAxisCategories[this.point.x]}<br>` +
                   `<b>${yAxisTitle}</b> : ${yAxisCategories[this.point.y]}<br>` +
                   `<b>${valueLabel}</b> : ${this.point.value}`;
          }
        },
        series: [{
          type: 'heatmap',
          borderWidth: 1,
          borderColor: '#000000',
          data: data,
          dataLabels: {
            enabled: true,
            color: '#000000'
          }
        }]
      };

      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [xAxisCategories, yAxisCategories, data, title, subtitle, width, height, xAxisTitle, yAxisTitle, valueLabel]);

  return <div ref={chartContainerRef} />;
};


// Add this component after your other chart components
export const SunburstChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Retool states for the chart configuration
  const [data, setData] = Retool.useStateArray({
    name: 'data'  // Hierarchical data structure
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

  const [colors, setColors] = Retool.useStateArray({
    name: 'colors'
  });

  const [allowTraversingTree, setAllowTraversingTree] = Retool.useStateBoolean({
    name: 'allowTraversingTree',
    defaultValue: true
  });

  const [startAngle, setStartAngle] = Retool.useStateNumber({
    name: 'startAngle',
    defaultValue: 90
  });

  const [endAngle, setEndAngle] = Retool.useStateNumber({
    name: 'endAngle',
    defaultValue: 450
  });

  useEffect(() => {
    if (chartContainerRef.current) {
      const options: Highcharts.Options = {
        chart: {
          type: 'sunburst',
          height: height || '100%',
          width: width,
          backgroundColor: 'transparent'
        },

        colors: colors && colors.length > 0 
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

        series: [{
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
          levels: [{
            level: 1,
            levelIsConstant: false,
            dataLabels: {
              filter: {
                property: 'outerArcLength',
                operator: '>',
                value: 64
              }
            }
          }, {
            level: 2,
            colorByPoint: true
          }, {
            level: 3,
            colorVariation: {
              key: 'brightness',
              to: -0.5
            }
          }, {
            level: 4,
            colorVariation: {
              key: 'brightness',
              to: 0.5
            }
          }]
        }],

        tooltip: {
          headerFormat: '',
          pointFormat: '<b>{point.name}</b>: <b>{point.value}</b>'
        }
      };

      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [data, title, subtitle, width, height, allowTraversingTree, startAngle, endAngle]);

  return (<div 
    ref={chartContainerRef} 
    style={{
      margin: '0 auto',
      justifyContent: 'center',
      alignItems: 'center',
    }} 
  />);

};


export const LineChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Retool states for user-defined inputs
  const [title, setTitle] = Retool.useStateString({ name: 'title' });
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
  const [xAxisTitle, setXAxisTitle] = Retool.useStateString({ name: 'xAxisTitle' });
  const [yAxisTitle, setYAxisTitle] = Retool.useStateString({ name: 'yAxisTitle' });
  const [secondaryYAxisTitle, setSecondaryYAxisTitle] = Retool.useStateString({ name: 'secondaryYAxisTitle' });
  const [xAxisValues, setXAxisValues] = Retool.useStateArray({ name: 'xAxisValues' });
  const [seriesData, setSeriesData] = Retool.useStateArray({ name: 'seriesData' }); // Array of series objects
  const [smooth, setSmooth] = Retool.useStateBoolean({ name: 'smooth' });
  const [showMarkers, setShowMarkers] = Retool.useStateBoolean({ name: 'showMarkers' });
  const [verticalLines, setVerticalLines] = Retool.useStateArray({ name: 'verticalLines' });
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' });
  const [useSecondaryYAxis, setUseSecondaryYAxis] = Retool.useStateArray({ name: 'useSecondaryYAxis' }); // Array of booleans

  useEffect(() => {
    if (chartContainerRef.current && seriesData) {
      const options: Highcharts.Options = {
        chart: {
          type: 'line'
        },
        title: {
          text: title || " "
        },
        subtitle: {
          text: subtitle || " "
        },
        xAxis: {
          type: 'linear', // Use linear scale for numeric x-axis values
          title: {
            text: xAxisTitle || 'X-Axis'
          },
          accessibility: {
            rangeDescription: `Range: ${Math.min(...xAxisValues)} to ${Math.max(...xAxisValues)}.`
          },
        },
        yAxis: [
          {
            title: {
              text: yAxisTitle || 'Primary Y-Axis'
            },
          },
          {
            title: {
              text: secondaryYAxisTitle || 'Secondary Y-Axis'
            },
            opposite: true // Secondary y-axis on the right side
          }
        ],
        tooltip: {
          pointFormat: '{series.name} had <b>{point.y}</b><br/>at {point.x}'
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          line: {
            marker: {
              enabled: showMarkers,
              symbol: 'circle',
              radius: 3,
              states: {
                hover: {
                  enabled: true
                }
              }
            },
            lineWidth: smooth ? 2 : 1
          }
        },
        series: seriesData.map((series, index) => ({
          ...series,
          type: 'line',
          color: colors[index],
          yAxis: useSecondaryYAxis[index] ? 1 : 0, // Assign to secondary y-axis based on useSecondaryYAxis state
          data: series.data.map((y, idx) => ({ x: xAxisValues[idx], y })) // Pair x and y values
        }))
      };

      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [title, subtitle, yAxisTitle, secondaryYAxisTitle, xAxisValues, seriesData, smooth, showMarkers, verticalLines, useSecondaryYAxis, colors]);

  return <div ref={chartContainerRef} />;
};


import 'bootstrap/dist/css/bootstrap.min.css';
import { Form } from 'react-bootstrap';

export const MorphableBubbleChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Retool states for user-defined data and field mappings
  const [seriesData, setSeriesData] = Retool.useStateArray({ name: 'seriesData' });
  const [xField, setXField] = Retool.useStateString({ name: 'xField' });
  const [xAltField, setXAltField] = Retool.useStateString({ name: 'xAltField' });
  const [yField, setYField] = Retool.useStateString({ name: 'yField' });
  const [yAltField, setYAltField] = Retool.useStateString({ name: 'yAltField' });
  const [zField, setZField] = Retool.useStateString({ name: 'zField' });
  const [nameField, setNameField] = Retool.useStateString({ name: 'nameField' });
  const [groupField, setGroupField] = Retool.useStateArray({ name: 'groupField' });
  const [xAxisType, setXAxisType] = Retool.useStateString({ name: 'xAxisType' });
  const [yAxisType, setYAxisType] = Retool.useStateString({ name: 'yAxisType' });
  const [showLegend, setShowLegend] = Retool.useStateBoolean({ name: 'showLegend' });
  const [toggleOptions, setToggleOptions] = Retool.useStateArray({ name: 'toggleOptions' });
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' });

  const [title, setTitle] = Retool.useStateString({ name: 'title' });
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
  const [xAxisTitle, setXAxisTitle] = Retool.useStateString({ name: 'xAxisTitle' });
  const [yAxisTitle, setYAxisTitle] = Retool.useStateString({ name: 'yAxisTitle' });

  useEffect(() => {
    if (chartContainerRef.current && seriesData && xField && yField && groupField) {

      const colorMap: Record<string, string> = {};
      groupField.forEach((group, index) => {
        if (!colorMap[group] && colors.length > 0) {
          colorMap[group] = colors[index % colors.length]; // Assign a color from the colors array
        }
      });
      // Group the data using the groupField array
      const groupedData = seriesData.reduce((acc: Record<string, any[]>, point: any, index: number) => {
        const group = groupField[index] || 'Ungrouped';
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push({
          x: point[xField],
          x_1: point[xAltField],
          y: point[yField],
          y_1: point[yAltField],
          z: zField ? point[zField] : undefined,
          name: nameField ? point[nameField] : undefined,
        });
        return acc;
      }, {});

      const seriesOptions = Object.keys(groupedData).map(group => ({
        name: group,
        data: groupedData[group],
        color: colorMap[group], // Assign color based on group name
        animation: {
          duration: 1000,
          easing: 'easeOutBounce'
        },
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
      }));

      const originalData = seriesOptions.map(series => ({
        ...series,
        data: series.data.map(point => ({ ...point }))
      }));

      const options: Highcharts.Options = {
        chart: {
          type: 'bubble',
          plotBorderWidth: 1,
          zooming: {
            type: 'xy'
          },
          renderTo: chartContainerRef.current
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
          pointFormat: '<span style="color:{point.color}">\u25cf</span> ' +
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
        series: seriesOptions,
        credits: {
          enabled: false
        }
      };

      const chart = Highcharts.chart(chartContainerRef.current, options);

      // Handle dropdown selection to switch between x/y and x_1/y_1
      const toggleSwitch = document.getElementById('coordinateToggle');
      toggleSwitch?.addEventListener('change', function () {
        setTimeout(() => {
          const isChecked = (toggleSwitch as HTMLInputElement).checked;
      
          chart.series.forEach((series, seriesIndex) => {
            series.data.forEach((point, pointIndex) => {
              const original = originalData[seriesIndex].data[pointIndex];
      
              point.update(
                {
                  x: isChecked ? original.x_1 : original.x,
                  y: isChecked ? original.y_1 : original.y,
                },
                false, // Do not redraw immediately for each point
                true // Enable animation for each point
              );
            });
          });
      
          // Redraw the chart after all points are updated
          chart.redraw();
        }, 150);
      });
      
      
      
      
    }
  }, [seriesData, xField, xAltField, yField, yAltField, zField, 
    nameField, groupField, xAxisType, yAxisType, showLegend, 
    title, subtitle, xAxisTitle, yAxisTitle]);

  return (
    <div>
      <div className="d-flex align-items-center mb-3" style={{ margin: '10px' }}>
        <span className="me-3 text-muted small">{toggleOptions[0]}</span>
        <div className="form-check form-switch">
          <input
            id="coordinateToggle"
            className="form-check-input"
            type="checkbox"
          />
        </div>
        <span className="ms-3 text-muted small">{toggleOptions[1]}</span>
      </div>
      <div ref={chartContainerRef}></div>
    </div>
  );
};

export const SLineChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Retool states for user-defined inputs
  const [title, setTitle] = Retool.useStateString({ name: 'title' });
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
  const [xAxisTitle, setXAxisTitle] = Retool.useStateString({ name: 'xAxisTitle' });
  const [yAxisTitle, setYAxisTitle] = Retool.useStateString({ name: 'yAxisTitle' });
  const [seriesData, setSeriesData] = Retool.useStateArray({ name: 'seriesData' }); // Array of series objects
  const [smooth, setSmooth] = Retool.useStateBoolean({ name: 'smooth' });
  const [showMarkers, setShowMarkers] = Retool.useStateBoolean({ name: 'showMarkers' });
  const [verticalLines, setVerticalLines] = Retool.useStateArray({ name: 'verticalLines' });
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' });
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' });
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' });

  useEffect(() => {
    if (chartContainerRef.current && seriesData) {
      const options: Highcharts.Options = {
        chart: {
          type: 'line',
          width: width,
          height: height,
          zooming: {
            type: 'xy'
          }
        },
        title: {
          text: title || " "
        },
        subtitle: {
          text: subtitle || " "
        },
        xAxis: {
          type: 'linear', // Use linear scale for numeric x-axis values
          title: {
            text: xAxisTitle || 'X-Axis'
          }
        },
        yAxis: {
          title: {
            text: yAxisTitle || 'Y-Axis'
          },
        },
        tooltip: {
          pointFormat: `{series.name}: ${xAxisTitle}: {point.x}, ${yAxisTitle}: {point.y:,.0f}`
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          line: {
            marker: {
              enabled: showMarkers,
              symbol: 'circle',
              radius: 3,
              states: {
                hover: {
                  enabled: true
                }
              }
            },
            lineWidth: smooth ? 2 : 1
          }
        },
        series: seriesData.map((series, index) => ({
          ...series,
          type: 'line',
          color: colors[index],
          data: series.data // Pair x and y values
        }))
      };

      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [title, subtitle, yAxisTitle, seriesData, smooth, showMarkers, verticalLines, colors]);

  return <div ref={chartContainerRef} />;
};

import HighchartsStock from "highcharts/modules/stock";

HighchartsStock(Highcharts);
export const StockChartComponent: FC = () => {
  const [chartData, setChartData] = Retool.useStateArray({ name: "chartData" });
  const [colorData, setColorData] = Retool.useStateArray({
    name: "colorData", // This will store the color for each stock symbol
  });

  // Ref to reference the chart container
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Function to create the Highcharts stock chart
  const createChart = (series: any) => {
    if (chartContainerRef.current) {
      Highcharts.stockChart(chartContainerRef.current, {
        rangeSelector: {
          selected: 4,
        },
        yAxis: {
          labels: {
            format: '{#if (gt value 0)}+{/if}{value}%',
          },
          plotLines: [
            {
              value: 0,
              width: 2,
              color: 'silver',
            },
          ],
        },
        plotOptions: {
          series: {
            compare: 'percent',
            showInNavigator: true,
          },
        },
        tooltip: {
          pointFormat: '<span style="color:{series.color}">' +
            '{series.name}</span>: <b>{point.y}</b> ' +
            '({point.change}%)<br/>',
          valueDecimals: 2,
          split: true,
        },
        series,
        credits: {
          enabled: false,
        },
        legend: {
          enabled: true,
        },
      });
    }
  };

  // Combine chart data with color data and create the chart
  const prepareSeries = () => {
    // Merge the chartData with the colors (if available) for each stock symbol
    return chartData.map((stock: any, index: number) => {
      return {
        ...stock,
        color: colorData[index] || "#7cb5ec", // Default to a light blue if no color is set
      };
    });
  };

  // Create the chart when chartData or colorData changes
  useEffect(() => {
    if (chartData.length > 0) {
      const series = prepareSeries(); // Prepare the series data with colors
      createChart(series); // Create the chart with the prepared data
    }
  }, [chartData, colorData]); // Re-run this effect when chartData or colorData changes

  return (
    <div>
      {/* Render the Highcharts chart inside this div */}
      <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />
    </div>
  );
};