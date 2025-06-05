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
import SolidGauge from 'highcharts/modules/solid-gauge';
import HighchartsStock from "highcharts/modules/stock";

HighchartsStock(Highcharts);
SolidGauge(Highcharts);
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
export { NGFSQuadrant } from './NGFSQuadrant';
export { FundExposureChart } from './FundExposureChart';
export { GaugeChart } from './GaugeChart';
export { BarChart } from './BarChart';
export { StockChartComponent } from './StockChart';
export { VariablePieChart } from './VariablePieChart';
export { LineChart } from './LineChart';
export { AreaChart } from './AreaChart';
export { HeatmapChart } from './HeatmapChart';

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
