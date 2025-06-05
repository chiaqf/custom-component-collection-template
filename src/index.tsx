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
Boost(Highcharts);

import Boost from 'highcharts/modules/boost';
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
export { SLineChart } from './SLineChart';
export { SunburstChart } from './SunburstChart';
export { TreemapChart } from './TreemapChart';
export { DataOnlyTreemapChart } from './DataOnlyTreemapChart';
export { BulletChart } from './BulletChart';

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
