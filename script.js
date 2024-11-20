async function fetchThingSpeakData() {
    const channelId = '2739296'; // Your actual Channel ID
    const readApiKey = 'J0NT42QJ7Y5MN44E'; // Your actual Read API Key
    const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=10`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const feeds = data.feeds;

        const labels = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
        const phData = feeds.map(feed => feed.field1);
        const tdsData = feeds.map(feed => feed.field2);
        const temperatureData = feeds.map(feed => feed.field3);
        const turbidityData = feeds.map(feed => feed.field4);

        const latestPH = phData[phData.length - 1];
        const latestTDS = tdsData[tdsData.length - 1];
        const latestTemperature = temperatureData[temperatureData.length - 1];
        const latestTurbidity = turbidityData[turbidityData.length - 1];

        document.getElementById('ph').innerText = `PH: ${latestPH}`;
        document.getElementById('tds').innerText = `TDS: ${latestTDS}`;
        document.getElementById('temperature').innerText = `Temperature: ${latestTemperature}`;
        document.getElementById('turbidity').innerText = `Turbidity: ${latestTurbidity}`;

        updateChart(phChart, labels, phData);
        updateChart(tdsChart, labels, tdsData);
        updateChart(temperatureChart, labels, temperatureData);
        updateChart(turbidityChart, labels, turbidityData);

        const overallQuality = detectWaterQuality(latestPH, latestTDS);
        document.getElementById('overall-quality').innerText = `Overall Water Quality: ${overallQuality}`;
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching data. Please try again later.');
    }
}

function detectWaterQuality(ph, tds) {
    let quality = "Good";

    if (ph < 6.5 || ph > 8.5) quality = "Poor";
    if (tds > 500) quality = "Poor";

    return quality;
}

function updateChart(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

function openDetails(metric) {
    const url = `details.html?metric=${metric}`;
    window.open(url, '_blank');
}

let phChart, tdsChart, temperatureChart, turbidityChart;

window.onload = () => {
    const ctxPh = document.getElementById('phChart').getContext('2d');
    phChart = new Chart(ctxPh, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'PH',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const ctxTds = document.getElementById('tdsChart').getContext('2d');
    tdsChart = new Chart(ctxTds, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'TDS',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const ctxTemperature = document.getElementById('temperatureChart').getContext('2d');
    temperatureChart = new Chart(ctxTemperature, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature',
                data: [],
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const ctxTurbidity = document.getElementById('turbidityChart').getContext('2d');
    turbidityChart = new Chart(ctxTurbidity, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Turbidity',
                data: [],
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    fetchThingSpeakData();
    setInterval(fetchThingSpeakData, 15000); // Fetch new data every 15 seconds
};
