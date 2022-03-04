const domain = 'fun-hawk.waylay.io'
const resource = 'Paris'
const excludedMetrics = ['collectedTime', 'sunset', 'sunrise', 'pressure']

const client = new waylay({domain: domain})

const loginForm = $('#formConnect')
const userInput = $('#user')
const passwordInput = $('#pwd')
const loginButton = $('#btnFormConnect')

const metricSelect = $('#metricSelect')
const timeSelect = $('#time')

const dashboard = $('#app')

const chartContext = document.getElementById('my-simple-chart').getContext('2d')
const chart = new Chart(chartContext, {
  type: 'line',
  data: { datasets: []},
  options: {
    spanGaps: true,
    scales: {
      xAxes: [{
        type: 'time'
      }]
    }
  }
})
const plotColors = ["#543005", "#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"]

async function login() {
  await client.login(userInput.val(), passwordInput.val())
  await client.loadSettings()

  loginForm.hide()
  dashboard.show()

  loadData(resource)
}

function getColor(num) {
  return plotColors[num % plotColors.length]
}

async function getMetrics(resource) {
  const metrics = await client.data.getSeries(resource, {metadata: true})
  return metrics.map(metric => metric.name).filter(metric => !excludedMetrics.includes(metric))
}

async function loadData(resource, time = 'P1D') {
  const metrics = await getMetrics(resource)

  const from = (moment().unix() - moment.duration(time).asSeconds()) * 1000
  var timeseries = []

  // Fetch data from server
  for (let i = 0; i < metrics.length; i++) {
    const metric = metrics[i]
    var data = await client.data.getMetricSeries(resource, metric, {from})

    if(data.series.length) {
      timeseries.push({
        label: metric,
        data: data.series.map(d => {return {x: new Date(d[0]), y: d[1]}}),
        borderColor: getColor(i)
      })
    }
  }

  // Update dashboard
  chart.data.datasets = timeseries
  chart.update()
}

function init() {
  dashboard.hide()

  loginButton.click(login)

  timeSelect.change(() => {
    const time = $('#time :selected').val()
    loadData(resource, time)
  })
}

init()
