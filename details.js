function getMetricFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('metric');
}

function updatePageTitle(metric) {
    const metricTitle = {
        ph: 'PH Level Details',
        tds: 'TDS Level Details',
        temperature: 'Temperature Details',
        turbidity: 'Turbidity Details'
    };
    document.getElementById('metric-title').innerText = metricTitle[metric] || 'Metric Details';
}

async function fetchDailyData(metric) {
    const channelId = '2739296'; // Your actual Channel ID
    const readApiKey = 'J0NT42QJ7Y5MN44E'; // Your actual Read API Key
    const url = `https://api.thingspeak.com/channels/${channelId}/fields/${getFieldNumber(metric)}.json?api_key=${readApiKey}&results=30`; // Fetch 30 entries for daily data
    const response = await fetch(url);
    const data = await response.json();
    return parseData(data.feeds, metric);
}

async function fetchWeeklyData(metric) {
    const channelId = '2739296'; // Your actual Channel ID
    const readApiKey = 'J0NT42QJ7Y5MN44E'; // Your actual Read API Key
    const url = `https://api.thingspeak.com/channels/${channelId}/fields/${getFieldNumber(metric)}.json?api_key=${readApiKey}&results=210`; // Fetch 210 entries for weekly data
    const response = await fetch(url);
    const data = await response.json();
    return parseData(data.feeds, metric);
}

function getFieldNumber(metric) {
    const metricToField = {
        ph: 1,
        tds: 2,
        temperature: 3,
        turbidity: 4
    };
    return metricToField[metric];
}

function parseData(feeds, metric) {
    const labels = feeds.map(feed => new Date(feed.created_at).toLocaleString());
    const values = feeds.map(feed => parseFloat(feed[`field${getFieldNumber(metric)}`]));
    return { labels, values };
}

async function renderChart(ctx, data, label) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: label,
                data: data.values,
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
}

window.onload = async () => {
    const metric = getMetricFromURL();
    updatePageTitle(metric);

    const dailyData = await fetchDailyData(metric);
    const weeklyData = await fetchWeeklyData(metric);

    const ctxDaily = document.getElementById('dailyChart').getContext('2d');
    await renderChart(ctxDaily, dailyData, `${metric} Daily Data`);

    const ctxWeekly = document.getElementById('weeklyChart').getContext('2d');
    await renderChart(ctxWeekly, weeklyData, `${metric} Weekly Data`);
};
