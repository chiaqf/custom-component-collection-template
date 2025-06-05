import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import HighchartsMore from 'highcharts/highcharts-more'
HighchartsMore(Highcharts)

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