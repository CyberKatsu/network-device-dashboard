<script>
  /**
   * ThroughputChart.svelte
   *
   * Real-time upstream / downstream throughput line chart.
   * Uses Chart.js directly (no wrapper library) so we control
   * exactly how data is streamed in — important for 1 Hz update performance.
   */

  import { onMount, onDestroy } from 'svelte'
  import { Chart, LineController, LineElement, PointElement, LinearScale,
           CategoryScale, Filler, Tooltip } from 'chart.js'

  Chart.register(LineController, LineElement, PointElement, LinearScale,
                 CategoryScale, Filler, Tooltip)

  export let history = []   // Array of { t, up, down }

  let canvas
  let chart = null

  // Chart.js dataset config
  const UP_COLOR   = '#22d3a0'
  const DOWN_COLOR = '#00c8e8'

  function buildChart() {
    if (!canvas) return

    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels:   [],
        datasets: [
          {
            label:           'Upstream (Mbps)',
            data:            [],
            borderColor:     UP_COLOR,
            backgroundColor: UP_COLOR + '18',
            borderWidth:     1.5,
            pointRadius:     0,
            fill:            true,
            tension:         0.3,
          },
          {
            label:           'Downstream (Mbps)',
            data:            [],
            borderColor:     DOWN_COLOR,
            backgroundColor: DOWN_COLOR + '18',
            borderWidth:     1.5,
            pointRadius:     0,
            fill:            true,
            tension:         0.3,
          }
        ]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 0 },   // disable animation for real-time perf
        interaction:         { mode: 'index', intersect: false },
        plugins: {
          legend:  { display: false },          // custom legend below
          tooltip: {
            backgroundColor: '#0f1a2e',
            borderColor:     '#1e2d4a',
            borderWidth:     1,
            titleColor:      '#9ca3af',
            bodyColor:       '#e5e7eb',
            titleFont:       { family: 'JetBrains Mono', size: 10 },
            bodyFont:        { family: 'JetBrains Mono', size: 11 },
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} Mbps`
            }
          }
        },
        scales: {
          x: {
            display:   false,  // timestamps clutters real-time display
            grid:      { display: false },
          },
          y: {
            position: 'left',
            min:      0,
            grid:     { color: '#1e2d4a', lineWidth: 1 },
            ticks:    {
              color:     '#6b7280',
              font:      { family: 'JetBrains Mono', size: 10 },
              callback:  v => `${v} Mbps`,
              maxTicksLimit: 5,
            },
            border: { display: false }
          }
        }
      }
    })
  }

  // Update chart when history changes
  $: if (chart && history.length > 0) {
    const labels = history.map(h => new Date(h.t).toLocaleTimeString())
    chart.data.labels             = labels
    chart.data.datasets[0].data  = history.map(h => h.up)
    chart.data.datasets[1].data  = history.map(h => h.down)
    chart.update('none')  // 'none' = no animation for real-time
  }

  onMount(buildChart)
  onDestroy(() => chart?.destroy())
</script>

<div class="relative w-full" style="height: 140px;">
  <canvas bind:this={canvas}></canvas>
</div>

<!-- Custom legend -->
<div class="flex items-center gap-4 mt-2">
  <div class="flex items-center gap-1.5">
    <div class="w-6 h-0.5 rounded" style="background: #22d3a0"></div>
    <span class="text-2xs font-mono text-gray-500">Upstream</span>
  </div>
  <div class="flex items-center gap-1.5">
    <div class="w-6 h-0.5 rounded" style="background: #00c8e8"></div>
    <span class="text-2xs font-mono text-gray-500">Downstream</span>
  </div>
</div>
