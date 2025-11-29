import React, {useEffect, useState} from 'react';
import Chart from 'chart.js/auto';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import 'chartjs-adapter-date-fns'; // Import the adapter

interface AnalyticsData {
  views: Array<{
    timestamp: number;
    event: string;
    count: number;
  }>;
}

function Analytics() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const [currTablePage, setCurrTablePage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const chartElement = document.getElementById('viewsPerDayChart') as HTMLCanvasElement;
  if (chartElement) {
    const chartInstance = Chart.getChart(chartElement);
    if (chartInstance) {
      chartInstance.destroy();
    }
  }


  // Fetch analytics data from API
  useEffect(() => {
    async function getAnalytics() {
      try {
        console.log('Fetching analytics data from API...', API_BASE_URL);
        const url = new URL(`${API_BASE_URL}/api/v1/analytics/event`);
        url.searchParams.append('event_type', 'view');
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            // 'Authorization': `Bearer ${yourAccessToken}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched analytics data:', data);
        setAnalyticsData(data.sort((a: any, b: any) => a.timestamp - b.timestamp));
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    }
    
    getAnalytics();
  }, []); // Run once on mount

  useEffect(() => {
    // Placeholder for ChartJS initialization code
    const ctx = (document.getElementById('viewsPerDayChart') as HTMLCanvasElement).getContext('2d');
    if (ctx) {
      // Example ChartJS setup (assuming ChartJS is imported and available)
      let rand = Array(24).fill(0).map(() => Math.floor(Math.random() * 20) + 1);
      let viewsData = [];
      for(let i = 0; i < 24; i++){
        let date = new Date();
        date.setHours(i, 0, 0, 0);
        viewsData.push({x: new Date(date.getTime()), y: rand[i]});
      }
      console.log('Analytics data:', analyticsData);
      new Chart(ctx, {
        type: 'line',
        data: {
           datasets: [{
             label: 'Views',
              data: analyticsData ? analyticsData.map(item => ({ x: new Date(item.timestamp * 1000), y: item.count })) : viewsData,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          },
          options: {
            scales: {
              x: {
                type: 'time',
                title: {
                  display: true,
                  text: 'Date',
                },
                time: {
                  unit: 'hour',
                  displayFormats: {
                    hour: 'ha',
                    day: 'MMM d',
                    month: 'MMM yyyy'
                  }
                },
                ticks: {
                  maxRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: 10,
                },
              },
            }
          }
      });

    }

    return () => {
      const chartElement = document.getElementById('viewsPerDayChart') as HTMLCanvasElement;
      if (chartElement) {
        const chartInstance = Chart.getChart(chartElement);
        if (chartInstance) {
          chartInstance.destroy();
        }
      }
    };
  }, [analyticsData]);


  async function handleTimeframeChange(timeframe: string) {
    // Placeholder for handling timeframe change and updating the chart
    console.log(`Timeframe changed to: ${timeframe}`);
    // update chart data accordingly
    // use ChartJS methods to update the chart, use sample data for now
    const chartElement = document.getElementById('viewsPerDayChart') as HTMLCanvasElement;
    if (chartElement) {
      const chartInstance = Chart.getChart(chartElement);
      if (chartInstance) {
        // Update chart data based on timeframe
        // This is just a placeholder logic
        if(timeframe === 'today') {
          // get timestamp from 00:00 today to now
          let start = new Date();
          start.setHours(0, 0, 0, 0);
          let timestampStart = Math.floor(start.getTime() / 1000);
          const todayData = await fetch(`${API_BASE_URL}/api/v1/analytics/event?event_type=view&oldest=${timestampStart}`)
            .then(response => response.json())
            .then(data => data.map((item: any) => ({ x: new Date(item.timestamp * 1000), y: item.count })).sort((a: any, b: any) => a.x - b.x))
            .then(data => {
                console.log('Today data:', data);
                chartInstance.data.datasets[0].data = data;
                chartInstance.options.scales!.x!.time!.unit = 'hour';
                chartInstance.options.scales!.x!.min = start;
                chartInstance.update();
                return data;
              }
            );
        }
        else if(timeframe === 'lastseven') {
          let start = new Date();
          start.setDate(start.getDate() - 7);
          start.setHours(0, 0, 0, 0);
          let timestampStart = Math.floor(start.getTime() / 1000);
          const todayData = await fetch(`${API_BASE_URL}/api/v1/analytics/event?event_type=view&oldest=${timestampStart}`)
            .then(response => response.json())
            .then(data => data.map((item: any) => ({ x: new Date(item.timestamp * 1000), y: item.count })).sort((a: any, b: any) => a.x - b.x))
            .then(data => {
                chartInstance.data.datasets[0].data = data;
                chartInstance.options.scales!.x!.time!.unit = 'hour';
                chartInstance.options.scales!.x!.min = start;
                chartInstance.update();
                return data;
              }
            );
        }
        else if (timeframe === 'month'){
          // Last 30 days logic
          let start = new Date();
          start.setDate(start.getDate() - 30);
          start.setHours(0, 0, 0, 0);
          let timestampStart = Math.floor(start.getTime() / 1000);
          const monthData = await fetch(`${API_BASE_URL}/api/v1/analytics/event?event_type=view&oldest=${timestampStart}&group=day`)
            .then(response => response.json())
            .then(data => data.map((item: any) => ({ x: new Date(item.timestamp * 1000), y: item.count })).sort((a: any, b: any) => a.x - b.x))
            .then(data => {
                chartInstance.data.datasets[0].data = data;
                chartInstance.options.scales!.x!.time!.unit = 'day';
                chartInstance.options.scales!.x!.min = start;
                chartInstance.update();
                return data;
              }
            );
        }
        else if (timeframe === 'ytd') {
          // Year to date logic
          // calc data for YTD
          let days = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24));
          let rand = Array(days).fill(0).map(() => Math.floor(Math.random() * 20) + 1);
          let newData = [];
          for(let i = days; i >= 0; i--){
            let date = new Date();
            date.setDate(date.getDate() - i);
            newData.push({x: new Date(date.getTime()), y: rand[days - i]});
          }
          chartInstance.data.datasets[0].data = newData;
          chartInstance.options.scales!.x!.time!.unit = 'day';
        }
      }
        chartInstance.update();
      }
    }

  function exportChartData() {
    // Placeholder for exporting chart data logic
    console.log('Exporting chart data...');
    const chartElement = document.getElementById('viewsPerDayChart') as HTMLCanvasElement;
    let row = 1;
    if (chartElement) {
      const chartInstance = Chart.getChart(chartElement);
      if (chartInstance) {
        const data = chartInstance.data.datasets[0].data;
        let csvContent = "data:text/csv;charset=utf-8,Entry,Date,Views\n";
        data.forEach((point: any) => {
          if(point.x === undefined || point.y === undefined) return;
          const date = new Date(point.x);
          const formattedDate = date.toLocaleDateString()+' '+date.toLocaleTimeString();
          csvContent += `${row},${formattedDate},${point.y}\n`;
          row++;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "chart_data.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
      }
    }
  }
  const tableData = [
      {page: 'Explore', today: 30, past7: 210},
      {page: 'Hiking', today: 25, past7: 140},
      {page: 'Map', today: 25, past7: 200},
      {page: 'Details - Perrot State Park', today: 23, past7: 122},
      {page: 'Details - Trempealeau Mountain State Natural Area', today: 15, past7: 80},
      {page: 'Details - Trempealeau National Wildlife Refugee', today: 12, past7: 90},
      {page: 'Details - Brady\'s Bluff', today: 10, past7: 70},
      {page: 'Details - Pine Creek', today: 8, past7: 50},
      {page: 'Details - Buffalo River State Trail', today: 5, past7: 30},
      {page: 'Details - Great River State Trail', today: 4, past7: 25},
    ];
  
  function exportTableData() {
    // Placeholder for exporting table data logic
    console.log('Exporting table data...');
    let csvContent = "data:text/csv;charset=utf-8,Page,Views (Today),Views (Past 7 Days)\n";
    tableData.forEach((row) => {
      csvContent += `${row.page},${row.today},${row.past7}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "table_data.csv");  
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  }

  return (
    <main className="main-content">
      <div>
        <h1>Analytics</h1>
        {/*ChartJS chart for views per day*/}
        <div className="chart-container w-75">
          <div className="flex flex--justify-space-between">
            <div className="flex gap-1">
              <button className="btn btn--primary" onClick={() => handleTimeframeChange('today')}>Today</button>
              <button className="btn btn--primary mr-2" onClick={() => handleTimeframeChange('lastseven')}>Last 7 Days</button>
              <button className="btn btn--primary mr-2" onClick={() => handleTimeframeChange('month')}>Last 30 Days</button>
              <button className="btn btn--primary mr-2" onClick={() => handleTimeframeChange('ytd')}>YTD</button>
              <button className="btn btn--secondary mr-2">Custom</button>
            </div>
            <button className="btn btn--secondary" onClick={exportChartData}>Export Data</button>
          </div>
          <canvas id="viewsPerDayChart"></canvas>
        </div>
        <div>
          {/* Table for view count by page */}
          <div className="flex flex--align-center flex--justify-space-between w-75">
            <div className='flex flex--align-center search-bar mt-1'>
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{ marginRight: '0' }} />
              <input type="text" placeholder="Search..." className="bg-light w-100 h-100" style={{borderWidth: 0}} onChange={(e) => setSearchInput(e.target.value)} value={searchInput} />
            </div>
            <button className="btn btn--secondary" onClick={exportTableData}>Export Data</button>
          </div>
          <table className="table mt-1">
            {/*Table with pagination */}
            <thead>
              <tr>
                <th>Page</th>
                <th>Views (Today)</th>
                <th>Views (Past 7 Days)</th>
              </tr>
            </thead>
            <tbody>
              {tableData.slice((currTablePage - 1) * 5, currTablePage * 5).map((row, index) => (
                <tr key={index}>
                  <td>{row.page}</td>
                  <td>{row.today}</td>
                  <td>{row.past7}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination controls */}
          <div className="pagination-controls flex flex--align-center flex--justify-center gap-1 mt-1">
            <button className="btn btn--secondary" onClick={() => {if(currTablePage > 1) setCurrTablePage(currTablePage - 1)}}>Previous</button>
            <span>Page {currTablePage} of {Math.ceil(tableData.length / 5)}</span>
            <button className="btn btn--secondary" onClick={() => {if(currTablePage < Math.ceil(tableData.length / 5)) setCurrTablePage(currTablePage + 1)}}>Next</button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Analytics;