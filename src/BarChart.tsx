import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import HighchartsMore from 'highcharts/highcharts-more'
HighchartsMore(Highcharts)

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
  