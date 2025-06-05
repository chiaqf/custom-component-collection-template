import 'bootstrap/dist/css/bootstrap.min.css';
import { type FC, useEffect, useRef, useState, useCallback } from 'react'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import AnnotationsModule from 'highcharts/modules/annotations';
import HighchartsTreemap from 'highcharts/modules/treemap';
import HighchartsHeatmap from 'highcharts/modules/heatmap';
import HighchartsSunburst from 'highcharts/modules/sunburst';
import HighchartsVariablePie from 'highcharts/modules/variable-pie';
import HighchartsBullet from 'highcharts/modules/bullet';
HighchartsSunburst(Highcharts); // Initialize sunburst module
HighchartsHeatmap(Highcharts);
HighchartsTreemap(Highcharts);
HighchartsMore(Highcharts) // Initialize highcharts-more module for bubble charts
AnnotationsModule(Highcharts) // Initialize annotations module
HighchartsVariablePie(Highcharts);
HighchartsBullet(Highcharts);

import Boost from 'highcharts/modules/boost';
Boost(Highcharts);
import { Retool } from '@tryretool/custom-component-support'

export { BubbleChart } from './BubbleChart';
export { PieChart } from './PieChart';
export { MorphableBubbleChart } from './MorphableBubbleChart';
export { PackedBubbleChart } from './PackedBubbleChart';

export const BarChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null);
  
  const [data, setData] = Retool.useStateArray({ name: 'data' });
  const [categories, setCategories] = Retool.useStateArray({ name: 'categories' });
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' });
  const [title, setTitle] = Retool.useStateString({ name: 'title' });
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
  const [showLegend, setShowLegend] = Retool.useStateBoolean({ name: 'showLegend' });
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' });
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' });
  const [layout, setLayout] = Retool.useStateString({ 
    name: 'layout',
    initialValue: 'bar'
  });
  const [seriesNames, setSeriesNames] = Retool.useStateArray({ name: 'seriesNames' });
  const [reverseYAxis, setReverseYAxis] = Retool.useStateBoolean({ name: 'reverseYAxis' });
  const [stacking, setStacking] = Retool.useStateBoolean({ name: 'stacking' });
  const [xAxisTitle, setXAxisTitle] = Retool.useStateString({ name: 'xAxisTitle' });
  const [yAxisTitle, setYAxisTitle] = Retool.useStateString({ name: 'yAxisTitle' });
  const [yMin, setYMin] = Retool.useStateNumber({ name: 'yMin' });
  const [yMax, setYMax] = Retool.useStateNumber({ name: 'yMax' });
  const [marginBottom, setMarginBottom] = Retool.useStateNumber({ name: 'marginBottom' });
  const [marginTop, setMarginTop] = Retool.useStateNumber({ name: 'marginTop' });
  const [hideYAxis, setHideYAxis] = Retool.useStateBoolean({ name: 'hideYAxis' });
  const [fontSize, setFontSize] = Retool.useStateString({ name: 'fontSize' });
  const [dataLabelsOff, setDataLabelsOff] = Retool.useStateBoolean({ name: 'dataLabelsOff' });

  // Memoize the series data preparation
  const prepareSeriesData = useCallback(() => {
    return Array.isArray(data[0]) 
      ? data.map((series, index) => ({
          type: layout,
          data: series,
          color: colors[index % colors.length],
          name: seriesNames[index]
        }))
      : [{
          type: layout,
          data,
          color: colors[0],
          name: seriesNames[0]
        }];
  }, [JSON.stringify(data), JSON.stringify(colors), JSON.stringify(seriesNames), layout]);

  // Memoize chart options
  const getChartOptions = useCallback((): Highcharts.Options => ({
    chart: {
      type: layout,
      reflow: true,
      backgroundColor: 'transparent',
      width: width,
      height: height,
      marginBottom: marginBottom || undefined,
      marginTop: marginTop || undefined,
    },
    xAxis: {
      categories: categories as string[],
      gridLineWidth: 0,
      title: {
        text: xAxisTitle
      },
      labels: {
        style: {
          fontSize: fontSize || '12px'
        }
      }
    },
    yAxis: {
      labels: {
        enabled: !hideYAxis
      },
      title: {
        text: yAxisTitle
      },
      gridLineWidth: 1,
      reversed: reverseYAxis,
      min: yMin || undefined,
      max: yMax || undefined
    },
    tooltip: {
      headerFormat: '{point.key}<br/>',
      pointFormat: '<span style="color:{point.color}">\u25cf</span> {series.name}: <b>{point.y}</b><br/>'
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
          enabled: !dataLabelsOff,
          style: {
            fontSize: fontSize || '12px'
          }
        },
        stacking: stacking ? 'normal' : undefined
      },
      column: {
        dataLabels: {
          enabled: !dataLabelsOff,
          style: {
            fontSize: fontSize || '12px'
          }
        },
        stacking: stacking ? 'normal' : undefined
      }
    },
    series: prepareSeriesData(),
    credits: {
      enabled: false
    }
  }), [
    layout, width, height, marginBottom, marginTop,
    categories, xAxisTitle, fontSize,
    hideYAxis, yAxisTitle, reverseYAxis, yMin, yMax,
    title, subtitle, showLegend,
    dataLabelsOff, stacking,
    JSON.stringify(prepareSeriesData())
  ]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const options = getChartOptions();

    if (!chartRef.current) {
      // Create new chart if it doesn't exist
      chartRef.current = Highcharts.chart(chartContainerRef.current, options);
    } else {
      // Update existing chart
      chartRef.current.update(options, true);
    }

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [JSON.stringify(getChartOptions())]);

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
  const [xAxisTitle, setXAxisTitle] = Retool.useStateString({ name: 'xAxisTitle' });
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
            text: xAxisTitle || 'X-Axis'
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
          pointFormat: `{series.name}: <b>{point.y:,.4f}</b><br/>${yAxisTitle || 'Y-Axis'}: {point.y:,.4f}<br/>${xAxisTitle || 'X-Axis'}: {point.x}`
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
  const chartRef = useRef<Highcharts.Chart | null>(null); // Store chart instance
  
  const [data, setData] = Retool.useStateArray({ name: 'data' });
  const [title, setTitle] = Retool.useStateString({ name: 'title' });
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
  const [width, setWidth] = Retool.useStateString({ name: 'width' });
  const [height, setHeight] = Retool.useStateString({ name: 'height' });
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' });
  
  // Utility function to generate lighter or darker shades
  const generateShade = useCallback((color: string, factor: number) => {
    // Convert hex color to RGB
    const [r, g, b] = color.match(/\w\w/g)?.map((hex) => parseInt(hex, 16)) || [0, 0, 0];
    
    // Darken the color by scaling each channel towards 0
    const adjust = (value: number) => Math.round(value * (1 + factor)); // Factor < 0 makes it darker
    
    // Clamp and convert back to hex
    const newR = Math.min(255, Math.max(0, adjust(r)));
    const newG = Math.min(255, Math.max(0, adjust(g)));
    const newB = Math.min(255, Math.max(0, adjust(b)));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }, []);

  // Memoize the data processing function
  const prepareColoredData = useCallback(() => {
    if (!data.length || !colors.length) return [];
    
    const parentColorMap = new Map(); // Map to store parent color assignments

    // Assign colors and generate shades
    return data.map((point) => {
      if (point?.parent === '0.0') {
        const pointId = point?.id || '';
        const pointName = point?.name || '';
        
        // Maintain a set of used colors
        const usedColors = new Set(parentColorMap.values());
        
        // Find the next available color
        let colorIndex = pointName ? pointName.length % colors.length : 0;
        let color = colors[colorIndex];
        
        // If color is already used, try the next one
        if (usedColors.size < colors.length) {
          while (usedColors.has(color)) {
            colorIndex = (colorIndex + 1) % colors.length;
            color = colors[colorIndex];
          }
        } else {
          // All colors are used; fallback strategy (e.g., reuse with a modifier)
          color = colors[colorIndex];
        }
        
        parentColorMap.set(pointId, color); // Save color for children
        return {
          ...point,
          color: color,
        };
      } else if (point?.parent === '1.0' || point?.parent === '2.0') {
        // Level 2: Assign a shade of the parent's color
        const parentColor = parentColorMap.get(point?.parent) || '#cccccc';
        return {
          ...point,
          color: generateShade(parentColor, point?.percent ? -Math.min(0.8, point.percent / 10) : -0.3), // Darker for higher values
        };
      } 
      return point; // Return as-is for other nodes
    });
  }, [JSON.stringify(data), JSON.stringify(colors), generateShade]);

  // Memoize chart options
  const getChartOptions = useCallback((): Highcharts.Options => {
    const coloredData = prepareColoredData();
    
    return {
      chart: {
        type: 'treemap',
        reflow: true,
        backgroundColor: 'transparent',
        width: width,
        height: height || '100%',
        events: {
          load: function () {
            // Drill down to the first level programmatically
            if (this.series[0] && coloredData.length > 0) {
              try {
                // @ts-ignore - drillToNode exists on treemap series
                this.series[0].drillToNode('0.0');
              } catch (error) {
                console.error('Failed to drill to node:', error);
              }
            }
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
          // @ts-ignore - colorByPoint exists on treemap levels
          colorByPoint: true,
          dataLabels: {
            enabled: true,
            formatter: function() {
              return `<b>${this.point.name}</b><br>${this.point.percent}%`;
            },
          },
          borderWidth: 3,
          // @ts-ignore - levelIsConstant exists on treemap levels
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
      }]
    };
  }, [title, subtitle, width, height, prepareColoredData]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (data.length > 0 && colors.length > 0) {
      const options = getChartOptions();

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
    };
  }, [JSON.stringify(getChartOptions()), data.length, colors.length]);

  return <div ref={chartContainerRef} />;
};

export const TreemapChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null); // Store chart instance

  const [labels, setLabels] = Retool.useStateArray({ name: 'labels' });
  const [values, setValues] = Retool.useStateArray({ name: 'values' });
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' });
  const [title, setTitle] = Retool.useStateString({ name: 'title' });
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' });
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' });

  // Memoize data preparation
  const prepareData = useCallback(() => {
    const totalValue = (values || []).reduce((acc, val) => acc + (val || 0), 0);

    return (labels || []).map((label, index) => ({
      name: label || '',
      value: (values || [])[index] || 0,
      color: (colors || [])[index],  // Color can be undefined
      percentage: (((values || [])[index] || 0) / (totalValue || 1) * 100).toFixed(1)
    }));
  }, [JSON.stringify(labels), JSON.stringify(values), JSON.stringify(colors)]);

  // Memoize chart options
  const getChartOptions = useCallback((): Highcharts.Options => ({
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
      data: prepareData(),
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
  }), [
    width, height, title, subtitle,
    JSON.stringify(prepareData())
  ]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const options = getChartOptions();

    if (!chartRef.current) {
      // Create new chart if it doesn't exist
      chartRef.current = Highcharts.chart(chartContainerRef.current, options);
    } else {
      // Update existing chart
      chartRef.current.update(options, true);
    }

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [JSON.stringify(getChartOptions())]);

  return <div ref={chartContainerRef} />;
};

export const FundExposureChart: FC = () => {
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
  const [verticalLineValue, setVerticalLineValue] = Retool.useStateNumber({
    name: 'verticalLineValue'
  });

  const [verticalLineColor, setVerticalLineColor] = Retool.useStateString({
    name: 'verticalLineColor'  });
  const [borderColor, setBorderColor] = Retool.useStateString({
    name: 'borderColor'
  });
  const [fontSize, setFontSize] =  Retool.useStateString({
    name: 'fontSize',
    initialValue: '15px'
  });

  useEffect(() => {
    if (chartContainerRef.current) {
      const stops = colorRange.map((color, index) => [index / (colorRange.length - 1), color]);

      const options: Highcharts.Options = {
        chart: {
          type: 'heatmap',
          plotBorderWidth: 0,
          backgroundColor: 'transparent',
          width: width,
          height: height,
          plotBorderColor: borderColor || '#000000'
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
          labels:{
            style: {
              fontSize: fontSize || '15px'
            }
          },
          title: {
            text: xAxisTitle
          },
          plotLines: verticalLineValue !== undefined ? [{
            color: verticalLineColor,
            width: 3,
            value: verticalLineValue,
            zIndex: 5  // Make sure line appears above the heatmap
          }] : undefined
        },
        yAxis: {
          categories: yAxisCategories,
          labels:{
            style: {
              fontSize: fontSize || '15px'
            }
          },
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
          stops: stops
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
          borderColor: borderColor || '#000000',
          data: data,
          dataLabels: {
            enabled: true,
            color: '#000000'
          }
        }]
      };

      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [xAxisCategories, yAxisCategories, data, title, subtitle, width, height, 
    xAxisTitle, yAxisTitle, valueLabel, verticalLineValue, verticalLineColor, 
    borderColor, fontSize]);

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
      const stops = colorRange.map((color, index) => [index / (colorRange.length - 1), color]);

      const options: Highcharts.Options = {
        chart: {
          type: 'heatmap',
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
          },
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
          stops: stops
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
  const chartRef = useRef<Highcharts.Chart | null>(null); // Store chart instance

  // Retool states for user-defined inputs
  const [title, setTitle] = Retool.useStateString({ name: 'title' });
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
  const [xAxisTitle, setXAxisTitle] = Retool.useStateString({ name: 'xAxisTitle' });
  const [yAxisTitle, setYAxisTitle] = Retool.useStateString({ name: 'yAxisTitle' });
  const [secondaryYAxisTitle, setSecondaryYAxisTitle] = Retool.useStateString({ name: 'secondaryYAxisTitle' });
  const [xAxisValues, setXAxisValues] = Retool.useStateArray({ name: 'xAxisValues' });
  const [seriesData, setSeriesData] = Retool.useStateArray({ name: 'seriesData' });
  const [smooth, setSmooth] = Retool.useStateBoolean({ name: 'smooth' });
  const [showMarkers, setShowMarkers] = Retool.useStateBoolean({ name: 'showMarkers' });
  const [verticalLines, setVerticalLines] = Retool.useStateArray({ name: 'verticalLines' });
  const [verticalLinesLabel, setVerticalLinesLabel] = Retool.useStateString({ name: 'verticalLinesLabel', description: 'Example: Label here' });
  const [verticalLinesColor, setVerticalLinesColor] = Retool.useStateString({ name: 'verticalLinesColor', description: 'Example: #333333', initialValue: '#333333' });
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' });
  const [useSecondaryYAxis, setUseSecondaryYAxis] = Retool.useStateArray({ name: 'useSecondaryYAxis' }); // Array of booleans
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' });
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' });

  // Memoize series data preparation
  const prepareSeriesData = useCallback(() => {
    return (seriesData || []).map((series: any, index: number) => ({
      ...series,
      type: 'line',
      color: colors?.[index] ? String(colors[index]) : undefined,
      yAxis: useSecondaryYAxis?.[index] ? 1 : 0, // Assign to secondary y-axis based on useSecondaryYAxis state
      // Ensure x and y values are correctly paired and are numbers
      data: (series.data || []).map((y: any, idx: number) => ({
        x: Number(xAxisValues?.[idx] || 0),
        y: Number(y || 0)
      }))
    }));
  }, [
    JSON.stringify(seriesData),
    JSON.stringify(xAxisValues),
    JSON.stringify(colors),
    JSON.stringify(useSecondaryYAxis)
  ]);

  // Memoize chart options
  const getChartOptions = useCallback((): Highcharts.Options => ({
    chart: {
      type: 'line',
      width: width,
      height: height,
      backgroundColor: 'transparent', // Added for consistency with PieChart
      reflow: true // Added for responsiveness
    },
    title: {
      text: title || " "
    },
    subtitle: {
      text: subtitle || " "
    },
    xAxis: {
      type: 'linear',
      title: {
        text: xAxisTitle || 'X-Axis'
      },
      accessibility: {
        rangeDescription: xAxisValues && xAxisValues.length > 0
          ? `Range: ${Math.min(...xAxisValues.map(Number))} to ${Math.max(...xAxisValues.map(Number))}.`
          : ''
      },
      plotLines: (verticalLines || []).map((value: any) => ({
        color: verticalLinesColor,
        width: 2,
        value: Number(value),
        zIndex: 5,
        label: {
          text: verticalLinesLabel,
          rotation: 90,
          style: {
            color: verticalLinesColor
          }
        }
      }))
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
        opposite: true
      }
    ],
    tooltip: {
      formatter: function () {
        // Use the xAxisTitle variable from the closure scope
        // Fallback to 'X-Axis' if xAxisTitle is empty
        const xTitle = xAxisTitle;
        return `${this.series.name} : ${this.y} <br/> ${xTitle} : ${this.x}`;
      }
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
        // The Highcharts 'line' series type itself doesn't have a direct 'smooth' property like some other libraries.
        // For smoothing, you'd typically use 'spline' type or define a custom interpolation.
        // Assuming 'smooth' here might imply changing line width or a visual effect.
        // If you intend for actual spline interpolation, you'd change series type to 'spline'.
        // For now, I'll keep the line width adjustment as per your original code.
        lineWidth: smooth ? 2 : 1
      }
    },
    series: prepareSeriesData() as Highcharts.SeriesOptionsType[], // Cast to Highcharts.SeriesOptionsType[]
  }), [
    width, height, title, subtitle, xAxisTitle, yAxisTitle, secondaryYAxisTitle,
    showMarkers, smooth,
    JSON.stringify(prepareSeriesData()), // Dependency on the memoized series data
    JSON.stringify(verticalLines) // Add verticalLines to dependencies if it affects options
  ]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const options = getChartOptions();

    if (!chartRef.current) {
      // Create new chart if it doesn't exist
      chartRef.current = Highcharts.chart(chartContainerRef.current, options);
    } else {
      // Update existing chart
      chartRef.current.update(options, true);
    }

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [JSON.stringify(getChartOptions())]); // Re-run effect only when memoized options object changes

  return <div ref={chartContainerRef} />;
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
          pointFormat: `{series.name}: ${xAxisTitle}: {point.x}, ${yAxisTitle}: {point.y:,.3f}`
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

  // Refs to reference the chart container and chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null);

  // Memoize the prepareSeries function to prevent unnecessary recalculations
  const prepareSeries = useCallback(() => {
    return chartData.map((stock: any, index: number) => ({
      ...stock,
      color: colorData[index] || "#7cb5ec", // Default to a light blue if no color is set
    }));
  }, [JSON.stringify(chartData), JSON.stringify(colorData)]); // Deep comparison

  // Function to create or update the Highcharts stock chart
  const createOrUpdateChart = useCallback((series: any) => {
    if (!chartContainerRef.current) return;

    const options: Highcharts.Options = {
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
    };

    if (!chartRef.current) {
      // Create new chart if it doesn't exist
      chartRef.current = Highcharts.stockChart(chartContainerRef.current, options);
    } else {
      // Update existing chart
      chartRef.current.update(options, true);
    }
  }, []); // No dependencies as this is just a configuration function

  // Create or update the chart when data changes
  useEffect(() => {
    if (chartData.length > 0) {
      const series = prepareSeries();
      createOrUpdateChart(series);
    }

    // Cleanup function to destroy chart on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [JSON.stringify(chartData), JSON.stringify(colorData)]); // Deep comparison of data changes

  return (
    <div>
      <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />
    </div>
  );
};


import SolidGauge from 'highcharts/modules/solid-gauge';

// Initialize the solid gauge module
SolidGauge(Highcharts);

export const GaugeChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = Retool.useStateString({ name: 'title' });
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
  const [yMin, setYMin] = Retool.useStateNumber({ name: 'yMin' });
  const [yMax, setYMax] = Retool.useStateNumber({ name: 'yMax' });
  const [value, setValue] = Retool.useStateNumber({ name: 'value' });
  const [seriesName, setSeriesName] = Retool.useStateString({ name: 'seriesName' });
  const [height, setHeight] = Retool.useStateString({ name: 'height' });
  const [width, setWidth] = Retool.useStateString({ name: 'width' });

  useEffect(() => {
    if (chartContainerRef.current) {
      console.log({ title, subtitle, yMin, yMax, value, seriesName });  // Log values for debugging

      Highcharts.chart(chartContainerRef.current, {
        chart: { 
          type: 'solidgauge',
          width: width,
          height: height
        },
        plotOptions: {
          solidgauge: {
              borderRadius: 3,
              dataLabels: {
                  y: 5,
                  borderWidth: 0,
                  useHTML: true
              }
          }
        },
        pane: {
          center: ['50%', '85%'],
          size: '140%',
          startAngle: -90,
          endAngle: 90,
          background: {
            backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#fafafa',
            borderRadius: 5,
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },
        credits: {
          enabled: false,
        },
        title: { text: title },
        subtitle: { text: subtitle },
        yAxis: {
          min: yMin,
          max: yMax,
          stops: [
            [0.1, '#55BF3B'], // green
            [0.5, '#DDDF0D'], // yellow
            [0.9, '#DF5353'] // red
          ],
          lineWidth: 0,
          tickWidth: 0,
          minorTickInterval: null,
          tickAmount: 2,
          title: {
            y: -70
          },
          labels: {
              y: 16
          }
        },
        series: [{
          data: [value],
          name: seriesName
        }]
      });
    }
  }, [title, subtitle, yMin, yMax, value, seriesName, width, height]);

  return (
    <div 
      ref={chartContainerRef} 
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%', // Ensure the parent container has a defined height
      }}
    />
);
};


export const NGFSQuadrant: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  
  const [xValues, setXValues] = Retool.useStateArray({ name: 'xValues' })
  const [xLabel, setXLabel] = Retool.useStateString({ name: 'xLabel' })
  const [yValues, setYValues] = Retool.useStateArray({ name: 'yValues' })
  const [yLabel, setYLabel] = Retool.useStateString({ name: 'yLabel' })
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
          color: colors[groupIndex % colors.length],
        }));
      } else {
        // No groups - create single series
        seriesData = [{
          data: (labels || []).map((label, index) => ({
            name: label,
            x: xValues[index],
            y: yValues[index],
            z: zValues[index],
            color: colors[index] || defaultColor,
          }))
        }];
      }

      const options: Highcharts.Options = {
        chart: {
          type: 'bubble',
          reflow: true,
          backgroundColor: 'transparent',
          width: width,
          height: height,
          events: {
            load: function () {
                const chart = this;

                // Function to draw quadrants
                function drawQuadrants() {
                    const xMid = 50; // Midpoint of x-axis
                    const yMid = 50; // Midpoint of y-axis

                    // Remove existing quadrants and labels if they exist
                    if (chart.quadrants) {
                        chart.quadrants.forEach(quadrant => quadrant.destroy());
                    }
                    if (chart.quadrantLabels) {
                        chart.quadrantLabels.forEach(label => label.destroy());
                    }

                    // Redraw quadrants
                    chart.quadrants = [
                        chart.renderer.rect(chart.plotLeft, chart.plotTop, chart.xAxis[0].toPixels(xMid) - chart.plotLeft, chart.yAxis[0].toPixels(yMid) - chart.plotTop)
                            .attr({
                                fill: '#00a7ad', // Top-left quadrant
                                zIndex: 1
                            }).add(),
                        chart.renderer.rect(chart.xAxis[0].toPixels(xMid), chart.plotTop, chart.plotWidth - chart.xAxis[0].toPixels(xMid) + chart.plotLeft, chart.yAxis[0].toPixels(yMid) - chart.plotTop)
                            .attr({
                                fill: '#00a7ad', // Top-right quadrant
                                zIndex: 1
                            }).add(),
                        chart.renderer.rect(chart.plotLeft, chart.yAxis[0].toPixels(yMid), chart.xAxis[0].toPixels(xMid) - chart.plotLeft, chart.plotHeight - chart.yAxis[0].toPixels(yMid) + chart.plotTop)
                            .attr({
                                fill: '#00a7ad', // Bottom-left quadrant
                                zIndex: 1
                            }).add(),
                        chart.renderer.rect(chart.xAxis[0].toPixels(xMid), chart.yAxis[0].toPixels(yMid), chart.plotWidth - chart.xAxis[0].toPixels(xMid) + chart.plotLeft, chart.plotHeight - chart.yAxis[0].toPixels(yMid) + chart.plotTop)
                            .attr({
                                fill: '#00a7ad', // Bottom-right quadrant
                                zIndex: 1
                            }).add()
                    ];

                    // Add labels to the corners of the quadrants
                    chart.quadrantLabels = [
                        chart.renderer.text('Disorderly', chart.plotLeft + 5, chart.plotTop + 15)
                            .css({ color: '#ffffff', fontSize: '15px', fontWeight: 'bold' })
                            .attr({ zIndex: 1 })
                            .add(),
                        chart.renderer.text('Too Little, Too Late', chart.plotLeft + chart.plotWidth - 5, chart.plotTop + 15)
                            .css({ color: '#ffffff', fontSize: '15px', textAlign: 'right', fontWeight: 'bold' })
                            .attr({ zIndex: 1, align: 'right' })
                            .add(),
                        chart.renderer.text('Orderly', chart.plotLeft + 5, chart.plotTop + chart.plotHeight - 5)
                            .css({ color: '#ffffff', fontSize: '15px' , fontWeight: 'bold'})
                            .attr({ zIndex: 1 })
                            .add(),
                        chart.renderer.text('Hot House World', chart.plotLeft + chart.plotWidth - 5, chart.plotTop + chart.plotHeight - 5)
                            .css({ color: '#ffffff', fontSize: '15px', textAlign: 'right', fontWeight: 'bold' })
                            .attr({ zIndex: 1, align: 'right' })
                            .add()
                    ];

                    chart.quadrantLines = [
                      // Vertical line
                      chart.renderer.path([
                        'M', chart.xAxis[0].toPixels(xMid), chart.plotTop, // Move to top middle
                        'L', chart.xAxis[0].toPixels(xMid), chart.plotTop + chart.plotHeight, // Line to bottom middle
                      ])
                        .attr({
                          stroke: '#FFFFFF', // White color
                          'stroke-width': 4,
                          zIndex: 1, // Ensure it is above the quadrants
                        })
                        .add(),
                      // Horizontal line
                      chart.renderer.path([
                        'M', chart.plotLeft, chart.yAxis[0].toPixels(yMid), // Move to middle left
                        'L', chart.plotLeft + chart.plotWidth, chart.yAxis[0].toPixels(yMid), // Line to middle right
                      ])
                        .attr({
                          stroke: '#FFFFFF', // White color
                          'stroke-width': 4,
                          zIndex: 2, // Ensure it is above the quadrants
                        })
                        .add(),

                      // Fake Circle
                      // Add these two lines for the plus sign
                      // Vertical part of the plus
                      chart.renderer.path([
                        'M', chart.xAxis[0].toPixels(xMid), chart.yAxis[0].toPixels(yMid) - 70, // Start 10px above center
                        'L', chart.xAxis[0].toPixels(xMid), chart.yAxis[0].toPixels(yMid) + 70  // End 10px below center
                      ])
                        .attr({
                          stroke: '#b3cf1e',
                          'stroke-width': 3,
                          zIndex: 3, // Ensure it's above the white lines
                        })
                        .add(),
                      // Horizontal part of the plus
                      chart.renderer.path([
                        'M', chart.xAxis[0].toPixels(xMid) - 70, chart.yAxis[0].toPixels(yMid), // Start 10px left of center
                        'L', chart.xAxis[0].toPixels(xMid) + 70, chart.yAxis[0].toPixels(yMid)  // End 10px right of center
                      ])
                        .attr({
                          stroke: '#b3cf1e',
                          'stroke-width': 3,
                          zIndex: 3, // Ensure it's above the white lines
                        })
                        .add(),
                    ];
                }

                // Draw quadrants initially
                drawQuadrants();

                // Redraw quadrants and labels on resize
                Highcharts.addEvent(chart, 'redraw', drawQuadrants);
            }
          }
        },
        xAxis: {
          min: 0,
          max: 100,
          gridLineWidth: 0,
          title: {
              text: 'Physical Risk'
          },
          tickLength: 0,
          lineWidth: 0,
          tickPositions: [0, 50, 95, 100], // Define explicit tick positions for plotting the lable
          labels: {
              formatter: function () {
                  if (this.value === 0) return 'Lower';
                  if (this.value === 95) return 'Higher';
                  return '';
              },
          },
        },
        yAxis: {
          min: 0,
          max: 100,
          gridLineWidth: 0,
          title: {
              text: 'Transition Risk'
          },
          labels: {
              formatter: function () {
                  if (this.value === 0) return 'Lower';
                  if (this.value === 100) return 'Higher';
                  return '';
              },
          },
        },
        tooltip: {
          headerFormat: '',
          pointFormat: '<span style="color:{point.color}">\u25cf</span> ' +
            '{point.name}<br/>' +
            `${zLabel}: {point.z}<br/>`
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
              return `<div style="text-align: center;">${this.point.name}<br/>VaR: ${this.point.z}</div>`;
            },
            useHTML: true, // Ensures you can use custom HTML styling
            align: 'center', // Centers the text horizontally
            verticalAlign: 'middle', // Centers the text vertically
            style: {
              color: '#000000', // Adjust label color if needed
              textOutline: 'none'
            }
          },
          minSize: '20%', // Minimum bubble size as a percentage of the chart width/height
          maxSize: '20%', // Maximum bubble size as a percentage of the chart width/height
          marker: {
            fillOpacity: 1 // Ensures the bubbles are fully opaque
          },
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
    groups, showLegend
  ]);

  return <div ref={chartContainerRef} />
}

export const MirroredBarChart: FC = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<Highcharts.Chart | null>(null); // Store chart instance
  
    // Retool states
    const [categories, setCategories] = Retool.useStateArray({ name: 'categories' });
    const [leftData, setLeftData] = Retool.useStateArray({ name: 'leftData' });
    const [rightData, setRightData] = Retool.useStateArray({ name: 'rightData' });
    const [leftSeriesName, setLeftSeriesName] = Retool.useStateString({ name: 'leftSeriesName' });
    const [rightSeriesName, setRightSeriesName] = Retool.useStateString({ name: 'rightSeriesName' });
    const [title, setTitle] = Retool.useStateString({ name: 'title' });
    const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
    const [xAxisLabel, setXAxisLabel] = Retool.useStateString({ name: 'xAxisLabel' });
    const [yAxisLabel, setYAxisLabel] = Retool.useStateString({ name: 'yAxisLabel' });
    const [width, setWidth] = Retool.useStateNumber({ name: 'width' });
    const [height, setHeight] = Retool.useStateNumber({ name: 'height' });
    const [colors, setColors] = Retool.useStateArray({ name: 'colors' });
  
    // Memoize chart options
    const getChartOptions = useCallback((): Highcharts.Options => {
      // Add custom template helper for absolute values
      // This needs to be outside the options object or handled globally by Highcharts.
      // For a per-chart solution, it's generally done once during module import or chart creation if needed.
      // Highcharts.Templating.helpers.abs will be globally defined here, so only call once or ensure idempotency.
      if (!Highcharts.Templating.helpers.abs) {
        Highcharts.Templating.helpers.abs = (value: number) => Math.abs(value);
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
        xAxis: [{
          categories,
          reversed: false,
          title: {
            text: xAxisLabel || null
          },
          labels: {
            step: 1
          },
        }, { // mirror axis on right side
          opposite: true,
          reversed: false,
          categories,
          linkedTo: 0,
          labels: {
            step: 1
          },
        }],
        yAxis: {
          title: {
            text: yAxisLabel || null
          },
          labels: {
            formatter: function(this: Highcharts.AxisLabelsFormatterContextObject) {
              return Math.abs(this.value as number) + '%';
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
          formatter: function(this: Highcharts.TooltipFormatterContextObject) {
            return `<b>${this.series.name}, ${xAxisLabel} : ${this.point.category}</b><br/>` +
                    `Value: ${Math.abs(this.point.y?.valueOf() as number).toFixed(2)}%`;
            }
        },
        series: [{
          name: leftSeriesName,
          data: leftData.map(value => Number(value) * -1), // Negative values for left side
          color: colors?.[0],
          type: 'bar' // Explicitly set type
        }, {
          name: rightSeriesName,
          data: rightData.map(Number), // Positive values for right side
          color: colors?.[1],
          type: 'bar' // Explicitly set type
        }],
        credits: {
          enabled: false
        }
      };
    }, [
      JSON.stringify(categories), JSON.stringify(leftData), JSON.stringify(rightData),
      leftSeriesName, rightSeriesName,
      title, subtitle, xAxisLabel, yAxisLabel,
      width, height, JSON.stringify(colors)
    ]);
  
    useEffect(() => {
      if (!chartContainerRef.current) return;
  
      const options = getChartOptions();
  
      if (!chartRef.current) {
        // Create new chart if it doesn't exist
        chartRef.current = Highcharts.chart(chartContainerRef.current, options);
      } else {
        // Update existing chart
        chartRef.current.update(options, true);
      }
  
      // Cleanup function
      return () => {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      };
    }, [JSON.stringify(getChartOptions())]); // Re-run effect only when memoized options object changes
  
    return <div ref={chartContainerRef} />;
  };

export const VariablePieChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Highcharts.Chart | null>(null) // Store chart instance

  // Reuse existing state patterns
  const [labels, setLabels] = Retool.useStateArray({ name: 'labels' })
  const [values, setValues] = Retool.useStateArray({ name: 'values (slice sizes)' })
  const [zValues, setZValues] = Retool.useStateArray({ name: 'zValues (slice height)' })
  const [colors, setColors] = Retool.useStateArray({ name: 'colors' })
  const [title, setTitle] = Retool.useStateString({ name: 'title' })
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' })
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' })
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' })
  const [yLabel, setYLabel] = Retool.useStateString({ name: 'yLabel' })
  const [zLabel, setZLabel] = Retool.useStateString({ name: 'zLabel' })
  const [showLabelThreshold, setShowLabelThreshold] = Retool.useStateNumber({ name: 'showLabelThreshold', 
    initialValue: 10, 
    label: 'Show label threshold.',
    description: 'Example: 10'
  })

  const [minPointSize, setMinPointSize] = Retool.useStateNumber({
    name: 'minPointSize',
    initialValue: 10
  })

  const [innerSize, setInnerSize] = Retool.useStateString({
    name: 'innerSize',
    initialValue: '20%'
  })

  const [borderRadius, setBorderRadius] = Retool.useStateNumber({
    name: 'borderRadius',
    initialValue: 5
  })

  const data = (labels || []).map((label, index) => ({
    name: label,
    y: values[index],  // Size of slice
    z: zValues[index], // Variable dimension
    color: colors[index]
  }))

  const getChartOptions = useCallback((): Highcharts.Options => ({
      chart: {
        type: 'variablepie',
        reflow: true,
        backgroundColor: 'transparent',
        width: width,
        height: height,
      },
      tooltip: {
        headerFormat: '',
        pointFormat: '<span style="color:{point.color}">\u25CF</span> <b>{point.name}</b><br/>' +
          `${yLabel}: <b>{point.y}</b><br/>` +
          `${zLabel}: <b>{point.z}</b><br/>`
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
        type: 'variablepie',
        // minPointSize: minPointSize,
        innerSize: innerSize,
        zMin: 0,
        zMax: 100,
        name: 'Variable Pie Series',
        borderRadius: borderRadius,
        data: data,
        dataLabels: {
          enabled: true,
          filter: {
            property: 'percentage',
            operator: '>',
            value: showLabelThreshold
          },
          format: `{point.name}, {point.percentage:.1f}%`,
          align: 'center',
          verticalAlign: 'middle'
      }
      }]
    }), [
    labels, values, zValues, colors, 
    title, subtitle, width, height,
    minPointSize, innerSize, borderRadius,
    zLabel, yLabel
  ]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const options = getChartOptions();

    if (!chartRef.current) {
      // Create new chart if it doesn't exist
      chartRef.current = Highcharts.chart(chartContainerRef.current, options);
    } else {
      // Update existing chart
      chartRef.current.update(options, true);
    }

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [JSON.stringify(getChartOptions())]);

  return <div ref={chartContainerRef} />
}

export const BulletChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Retool state for target and actual values
  const [target, setTarget] = Retool.useStateNumber({ name: 'target' });
  const [actual, setActual] = Retool.useStateNumber({ name: 'actual' });
  const [width, setWidth] = Retool.useStateNumber({ name: 'width' });
  const [height, setHeight] = Retool.useStateNumber({ name: 'height' });
  const [targetColor, setTargetColor] = Retool.useStateString({ name: 'targetColor' });
  const [actualColor, setActualColor] = Retool.useStateString({ name: 'actualColor' });
  const [title, setTitle] = Retool.useStateString({ name: 'title' });
  const [subtitle, setSubtitle] = Retool.useStateString({ name: 'subtitle' });
  const [reversed, setReversed] = Retool.useStateBoolean({ name: 'reversed' });
  const [xAxisLabel, setXAxisLabel] = Retool.useStateString({ name: 'xAxisLabel' });
  const [marginLeft, setMarginLeft] = Retool.useStateNumber({ name: 'marginLeft' });

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
          text: title,
        },
        subtitle: {
          text: subtitle,
        },
        legend: {
          enabled: false,
        },
        xAxis: {
          categories: [
            xAxisLabel,
          ],
        },
        yAxis: {
          gridLineWidth: 1,
          plotBands: [
            {
              from: -9e9,
              to: 9e9,
              color: '#bbb',
            },
          ],
          title: null,
          reversed: reversed,
        },
        plotOptions: {
          series: {
            pointPadding: 0.25,
            borderWidth: 0,
            color: actualColor,
            targetOptions: {
              width: '500%',
              color: targetColor,
            },
          },
        },
        series: [
          {
            type: 'bullet',
            data: [
              {
                y: actual || 0, // Actual value from Retool state
                target: target || 0, // Target value from Retool state
              },
            ],
          },
        ],
        tooltip: {
          pointFormat: '<b>{point.y}</b> (with target at {point.target})',
        },
        credits: {
          enabled: false,
        },
      };

      Highcharts.chart(chartContainerRef.current, options);
    }
  }, [actual, target, width, height, targetColor, actualColor, title, subtitle, reversed, xAxisLabel, marginLeft]);

  return (
    <div>
      {/* Chart container */}
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
