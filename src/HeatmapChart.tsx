import Highcharts from 'highcharts'
import { Retool } from '@tryretool/custom-component-support'
import { type FC, useEffect, useRef, useCallback } from 'react'
import HighchartsMore from 'highcharts/highcharts-more'
HighchartsMore(Highcharts)

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
  
  