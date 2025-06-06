import Highcharts from 'highcharts'
import treemap from 'highcharts/modules/treemap'
import data from 'highcharts/modules/data'
import colorAxis from 'highcharts/modules/coloraxis'
import exporting from 'highcharts/modules/exporting'
import accessibility from 'highcharts/modules/accessibility'
import HighchartsMore from 'highcharts/highcharts-more'

import { type FC, useEffect, useRef, useCallback, useState } from 'react'

// Initialize Highcharts modules once when this file is imported
treemap(Highcharts)
data(Highcharts)
colorAxis(Highcharts)
exporting(Highcharts)
accessibility(Highcharts)

// Highcharts event plugin for custom data label logic.
// Placed outside the component to ensure it's registered only once.
// This version includes the corrected performance calculation.
Highcharts.addEvent(Highcharts.Series, 'drawDataLabels', function () {
  if (this.type === 'treemap' && this.points.length > 0) {
    this.points.forEach((point) => {
      // Color the level 2 headers with the combined performance of its children
      if (point.node.level === 2 && Number.isFinite(point.value)) {
        // CORRECTED: This formula now correctly calculates the previous total market cap.
        const previousValue = (point.node.children || []).reduce(
          (acc, child) =>
            acc +
            (child.point.value || 0) /
              (1 + (child.point.colorValue || 0) / 100),
          0,
        )

        // Percentage change from previous value to point.value
        const perf =
          (100 * (point.value - previousValue)) / (previousValue || 1)

        point.custom = {
          ...(point.custom || {}),
          performance: (perf < 0 ? '' : '+') + perf.toFixed(2) + '%',
        }

        if (point.dlOptions && this.colorAxis) {
          point.dlOptions.backgroundColor = this.colorAxis.toColor(perf)
        }
      }

      // Set font size based on the area of the point for level 3
      if (
        point.node.level === 3 &&
        point.shapeArgs &&
        point.dlOptions?.style
      ) {
        const area = point.shapeArgs.width * point.shapeArgs.height
        point.dlOptions.style.fontSize = `${Math.min(
          32,
          7 + Math.round(area * 0.0008),
        )}px`
      }
    })
  }
})

export const ColorScaleTreeMapChart: FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Highcharts.Chart | null>(null)
  const [chartData, setChartData] = useState<Highcharts.PointOptionsObject[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // This useEffect handles all data fetching and processing on component mount.
  useEffect(() => {
    const processData = async () => {
      setIsLoading(true)

      const getCSV = async (url: string) => {
        try {
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const csv = await response.text()
          const dataModule = new Highcharts.Data({ csv })
          const arr = (dataModule.columns[0] || []).map((_, i) =>
            dataModule.columns.reduce((obj: any, column) => {
              obj[column[0]] = column[i]
              return obj
            }, {}),
          )
          return arr
        } catch (error) {
          console.error('Failed to fetch or parse CSV:', error)
          return [] // Return empty array on error to prevent crashes
        }
      }

      // URLs for current and historical data
      const currentDataUrl =
        'https://cdn.jsdelivr.net/gh/datasets/s-and-p-500-companies-financials@67dd99e/data/constituents-financials.csv'
      const oldDataUrl =
        'https://cdn.jsdelivr.net/gh/datasets/s-and-p-500-companies-financials@9f63bc5/data/constituents-financials.csv'

      const [csvData, oldData] = await Promise.all([
        getCSV(currentDataUrl),
        getCSV(oldDataUrl),
      ])

      const data: Highcharts.PointOptionsObject[] = [
        { id: 'Technology' }, { id: 'Financial' }, { id: 'Consumer Cyclical' },
        { id: 'Communication Services' }, { id: 'Healthcare' }, { id: 'Consumer Defensive' },
        { id: 'Industrials' }, { id: 'Real Estate' }, { id: 'Energy' },
        { id: 'Utilities' }, { id: 'Basic Materials' },
      ]

      // The complete mapping from sector to industry is crucial for data integrity.
      const sectorToIndustry: Record<string, string> = {
          'Industrial Conglomerates': 'Industrials', 'Building Products': 'Industrials', 'Health Care Equipment': 'Healthcare',
          Biotechnology: 'Healthcare', 'IT Consulting & Other Services': 'Technology', 'Application Software': 'Technology',
          Semiconductors: 'Technology', 'Independent Power Producers & Energy Traders': 'Energy', 'Life & Health Insurance': 'Financial',
          'Life Sciences Tools & Services': 'Healthcare', 'Industrial Gases': 'Basic Materials', 'Hotels, Resorts & Cruise Lines': 'Consumer Cyclical',
          'Internet Services & Infrastructure': 'Technology', 'Specialty Chemicals': 'Basic Materials', 'Office REITs': 'Real Estate',
          'Health Care Supplies': 'Healthcare', 'Electric Utilities': 'Utilities', 'Property & Casualty Insurance': 'Financial',
          'Interactive Media & Services': 'Communication Services', Tobacco: 'Consumer Defensive', 'Broadline Retail': 'Consumer Cyclical',
          'Paper & Plastic Packaging Products & Materials': 'Basic Materials', 'Diversified Support Services': 'Industrials',
          'Multi-Utilities': 'Utilities', 'Consumer Finance': 'Financial', 'Multi-line Insurance': 'Financial',
          'Telecom Tower REITs': 'Real Estate', 'Water Utilities': 'Utilities', 'Asset Management & Custody Banks': 'Financial',
          'Electrical Components & Equipment': 'Industrials', 'Electronic Components': 'Technology', 'Insurance Brokers': 'Financial',
          'Oil & Gas Exploration & Production': 'Energy', 'Technology Hardware, Storage & Peripherals': 'Technology',
          'Semiconductor Materials & Equipment': 'Technology', 'Automotive Parts & Equipment': 'Consumer Cyclical',
          'Agricultural Products & Services': 'Consumer Defensive', 'Communications Equipment': 'Technology',
          'Integrated Telecommunication Services': 'Communication Services', 'Gas Utilities': 'Utilities',
          'Human Resource & Employment Services': 'Industrials', 'Automotive Retail': 'Consumer Cyclical',
          'Multi-Family Residential REITs': 'Real Estate', 'Aerospace & Defense': 'Industrials', 'Oil & Gas Equipment & Services': 'Energy',
          'Metal, Glass & Plastic Containers': 'Basic Materials', 'Diversified Banks': 'Financial', 'Multi-Sector Holdings': 'Financial',
          'Computer & Electronics Retail': 'Consumer Cyclical', Pharmaceuticals: 'Healthcare', 'Data Processing & Outsourced Services': 'Technology',
          'Distillers & Vintners': 'Consumer Defensive', 'Air Freight & Logistics': 'Industrials', 'Casinos & Gaming': 'Consumer Cyclical',
          'Packaged Foods & Meats': 'Consumer Defensive', 'Health Care Distributors': 'Healthcare',
          'Construction Machinery & Heavy Transportation Equipment': 'Industrials', 'Financial Exchanges & Data': 'Financial',
          'Real Estate Services': 'Real Estate', 'Technology Distributors': 'Technology', 'Managed Health Care': 'Healthcare',
          'Fertilizers & Agricultural Chemicals': 'Basic Materials', 'Investment Banking & Brokerage': 'Financial',
          'Cable & Satellite': 'Communication Services', 'Integrated Oil & Gas': 'Energy', Restaurants: 'Consumer Cyclical',
          'Household Products': 'Consumer Defensive', 'Health Care Services': 'Healthcare', 'Regional Banks': 'Financial',
          'Soft Drinks & Non-alcoholic Beverages': 'Consumer Defensive', 'Transaction & Payment Processing Services': 'Technology',
          'Consumer Staples Merchandise Retail': 'Consumer Defensive', 'Systems Software': 'Technology',
          'Rail Transportation': 'Industrials', Homebuilding: 'Consumer Cyclical', Footwear: 'Consumer Cyclical',
          'Agricultural & Farm Machinery': 'Consumer Cyclical', 'Passenger Airlines': 'Industrials', 'Data Center REITs': 'Real Estate',
          'Industrial Machinery & Supplies & Components': 'Industrials', 'Commodity Chemicals': 'Basic Materials',
          'Interactive Home Entertainment': 'Communication Services', 'Research & Consulting Services': 'Industrials',
          'Personal Care Products': 'Consumer Defensive', Reinsurance: 'Financial', 'Self-Storage REITs': 'Real Estate',
          'Trading Companies & Distributors': 'Industrials', 'Retail REITs': 'Real Estate', 'Automobile Manufacturers': 'Consumer Cyclical',
          Broadcasting: 'Communication Services', Copper: 'Basic Materials', 'Consumer Electronics': 'Technology',
          'Heavy Electrical Equipment': 'Industrials', Distributors: 'Industrials', 'Leisure Products': 'Consumer Cyclical',
          'Health Care Facilities': 'Healthcare', 'Health Care REITs': 'Real Estate', 'Home Improvement Retail': 'Consumer Cyclical',
          'Hotel & Resort REITs': 'Real Estate', Advertising: 'Communication Services', 'Single-Family Residential REITs': 'Real Estate',
          'Other Specialized REITs': 'Real Estate', 'Cargo Ground Transportation': 'Industrials', 'Electronic Manufacturing Services': 'Technology',
          'Construction & Engineering': 'Industrials', 'Electronic Equipment & Instruments': 'Technology',
          'Oil & Gas Storage & Transportation': 'Energy', 'Food Retail': 'Consumer Defensive', 'Movies & Entertainment': 'Communication Services',
          'Apparel, Accessories & Luxury Goods': 'Consumer Cyclical', 'Oil & Gas Refining & Marketing': 'Energy',
          'Construction Materials': 'Basic Materials', 'Home Furnishings': 'Consumer Cyclical', Brewers: 'Consumer Defensive',
          Gold: 'Basic Materials', Publishing: 'Communication Services', Steel: 'Basic Materials',
          'Industrial REITs': 'Real Estate', 'Environmental & Facilities Services': 'Industrials', 'Apparel Retail': 'Consumer Cyclical',
          'Health Care Technology': 'Healthcare', 'Food Distributors': 'Consumer Defensive', 'Wireless Telecommunication Services': 'Communication Services',
          'Other Specialty Retail': 'Consumer Cyclical', 'Passenger Ground Transportation': 'Industrials', 'Drug Retail': 'Consumer Cyclical',
          'Timber REITs': 'Real Estate', 'Specialty Retail': 'Consumer Cyclical'
      };

      // Create sectors (level 2)
      const sectors = new Set<string>();
      csvData.forEach((row: any) => {
        const sector = row.Sector;
        if (sectorToIndustry[sector] && !sectors.has(sector)) {
          data.push({ id: sector, parent: sectorToIndustry[sector] });
          sectors.add(sector);
        }
      });

      // Set names for industries and sectors
      data.forEach((point) => {
        point.name = point.id;
        point.custom = { fullName: point.id };
      });

      // Add companies (level 3) with robust validation
      csvData
        .filter((row: any) =>
          row.Symbol !== 'GOOG' && row.Price && row['Market Cap'] && sectorToIndustry[row.Sector]
        )
        .forEach((row: any) => {
          const old = oldData.find((oldRow: any) => oldRow.Symbol === row.Symbol);
          let perf: number | null = null;
          if (old && old.Price) {
            const oldPrice = parseFloat(old.Price);
            const newPrice = parseFloat(row.Price);
            if (!isNaN(oldPrice) && !isNaN(newPrice) && oldPrice !== 0) {
              perf = (100 * (newPrice - oldPrice)) / oldPrice;
            }
          }

          if (perf !== null) {
            data.push({
              name: row.Symbol,
              id: row.Symbol,
              value: parseFloat(row['Market Cap']),
              parent: row.Sector,
              colorValue: perf,
              custom: {
                fullName: row.Name,
                performance: (perf < 0 ? '' : '+') + perf.toFixed(2) + '%',
              },
            });
          }
        });

      setChartData(data);
      setIsLoading(false);
    }

    processData();
  }, []); // Empty dependency array ensures this runs only once.

  // useCallBack memoizes the chart options object.
  const getChartOptions = useCallback(
    (data: Highcharts.PointOptionsObject[]): Highcharts.Options => {
      // This is the full, cosmetically-correct options object.
      return {
          chart: {
              backgroundColor: '#252931',
          },
          series: [{
              type: 'treemap',
              name: 'All',
              layoutAlgorithm: 'squarified',
              allowDrillToNode: true,
              animationLimit: 1000,
              borderColor: '#252931',
              color: '#252931',
              opacity: 0.01,
              nodeSizeBy: 'leaf',
              dataLabels: {
                  enabled: false,
                  allowOverlap: true,
                  style: {
                      fontSize: '0.9em',
                      textOutline: 'none'
                  }
              },
              levels: [{
                  level: 1,
                  dataLabels: {
                      enabled: true,
                      headers: true,
                      align: 'left',
                      style: {
                          fontWeight: 'bold',
                          fontSize: '0.7em',
                          textTransform: 'uppercase'
                      },
                      padding: 3
                  },
                  borderWidth: 3,
                  levelIsConstant: false
              }, {
                  level: 2,
                  dataLabels: {
                      enabled: true,
                      headers: true,
                      align: 'center',
                      shape: 'callout',
                      backgroundColor: 'gray',
                      borderWidth: 1,
                      borderColor: '#252931',
                      padding: 0,
                      style: {
                          color: 'white',
                          fontWeight: 'normal',
                          fontSize: '0.6em',
                          textOutline: 'none',
                          textTransform: 'lowercase'
                      }
                  },
                  groupPadding: 1
              }, {
                  level: 3,
                  dataLabels: {
                      enabled: true,
                      align: 'center',
                      format: '{point.name}<br><span style="font-size: 0.7em">{point.custom.performance}</span>',
                      style: {
                          color: 'white'
                      }
                  }
              }],
              accessibility: {
                  exposeAsGroupOnly: true
              },
              breadcrumbs: {
                  buttonTheme: {
                      style: { color: 'silver' },
                      states: {
                          hover: { fill: '#333' },
                          select: { style: { color: 'white' } }
                      }
                  }
              },
              data,
          }],
          title: {
              text: 'S&P 500 Companies',
              align: 'left',
              style: { color: 'white' },
          },
          subtitle: {
              text: 'Click points to drill down. Source: <a href="http://okfn.org/">okfn.org</a>.',
              align: 'left',
              style: { color: 'silver' },
          },
          tooltip: {
              followPointer: true,
              outside: true,
              headerFormat: '<span style="font-size: 0.9em">{point.custom.fullName}</span><br/>',
              pointFormat: '<b>Market Cap:</b> USD {(divide point.value 1000000000):.1f} bln<br/>' +
                  '{#if point.custom.performance}<b>1 month performance:</b> {point.custom.performance}{/if}',
          },
          colorAxis: {
              minColor: '#f73539',
              maxColor: '#2ecc59',
              stops: [
                  [0, '#f73539'],
                  [0.5, '#414555'],
                  [1, '#2ecc59']
              ],
              min: -10,
              max: 10,
              gridLineWidth: 0,
              labels: {
                  overflow: 'allow',
                  format: '{#gt value 0}+{value}{else}{value}{/gt}%',
                  style: { color: 'white' },
              },
          },
          legend: {
              itemStyle: { color: 'white' },
          },
          exporting: {
              sourceWidth: 1200,
              sourceHeight: 800,
              buttons: {
                  contextButton: {
                      menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG'],
                  }
              }
          },
          navigation: {
              buttonOptions: {
                  theme: {
                      fill: '#252931',
                      style: { color: 'silver', whiteSpace: 'nowrap' },
                      states: {
                          hover: {
                              fill: '#333',
                              style: { color: 'white' }
                          }
                      }
                  },
                  symbolStroke: 'silver',
              }
          },
      };
    },
    [],
  );

  // This useEffect handles rendering and destroying the chart instance.
  useEffect(() => {
    if (isLoading || chartData.length === 0 || !chartContainerRef.current) {
      return;
    }

    const options = getChartOptions(chartData);
    if (!chartRef.current) {
      chartRef.current = Highcharts.chart(chartContainerRef.current, options);
    } else {
      chartRef.current.update(options, true, true);
    }

    // Cleanup function to destroy the chart on component unmount.
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [isLoading, chartData, getChartOptions]);

  return (
    <div style={{ width: '100%', height: '800px', background: '#252931' }}>
      {isLoading && <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>Loading Chart Data...</div>}
      <div ref={chartContainerRef} style={{ display: isLoading ? 'none' : 'block', width: '100%', height: '100%' }} />
    </div>
  );
};