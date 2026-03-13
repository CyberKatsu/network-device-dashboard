<script>
  import { alarms, acknowledgeAlarm, clearAcknowledged, unackAlarmCount } from '$lib/stores/telemetry.js'

  let filterSeverity = 'all'   // 'all' | 'critical' | 'major' | 'minor' | 'warning' | 'info'
  let showAcked = false

  const SEVERITIES = ['all', 'critical', 'major', 'minor', 'warning', 'info']

  $: filtered = $alarms.filter(a => {
    if (!showAcked && a.acknowledged) return false
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false
    return true
  })

  function severityClass(s) {
    return s === 'critical' ? 'text-status-down bg-status-down/10 border-status-down/20' :
           s === 'major'    ? 'text-status-warn bg-status-warn/10 border-status-warn/20' :
           s === 'minor'    ? 'text-status-ranging bg-status-ranging/10 border-status-ranging/20' :
           s === 'warning'  ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                              'text-gray-400 bg-gray-400/10 border-gray-400/20'
  }

  function dotClass(s) {
    return s === 'critical' ? 'bg-status-down' :
           s === 'major'    ? 'bg-status-warn' :
           s === 'minor'    ? 'bg-status-ranging' :
           s === 'warning'  ? 'bg-yellow-400' : 'bg-gray-500'
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString('en-GB', { hour12: false })
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  }
</script>

<div class="p-4 space-y-3 animate-fade-in">

  <!-- Toolbar -->
  <div class="flex flex-wrap items-center gap-3">
    <!-- Severity filter -->
    <div class="flex items-center gap-1 bg-surface-800 border border-surface-500 rounded-md p-1">
      {#each SEVERITIES as sev}
        <button
          class="px-2.5 py-1 rounded text-xs font-mono transition-colors duration-100"
          class:bg-surface-600={filterSeverity === sev}
          class:text-gray-100={filterSeverity === sev}
          class:text-gray-500={filterSeverity !== sev}
          on:click={() => filterSeverity = sev}
        >
          {sev.charAt(0).toUpperCase() + sev.slice(1)}
        </button>
      {/each}
    </div>

    <!-- Show acknowledged toggle -->
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" class="sr-only" bind:checked={showAcked} />
      <div class="relative inline-flex h-4 w-7 items-center rounded-full transition-colors"
           class:bg-cyan-DEFAULT={showAcked} class:bg-surface-500={!showAcked}>
        <span class="inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform"
              class:translate-x-3.5={showAcked} class:translate-x-0.5={!showAcked}></span>
      </div>
      <span class="text-xs font-mono text-gray-400">Show acknowledged</span>
    </label>

    <!-- Stats -->
    <div class="ml-auto flex items-center gap-3 text-2xs font-mono text-gray-500">
      <span><span class="text-gray-300">{$unackAlarmCount}</span> unacknowledged</span>
      <span><span class="text-gray-300">{$alarms.length}</span> total</span>
    </div>

    <!-- Clear acknowledged -->
    <button
      class="btn-ghost text-xs"
      on:click={clearAcknowledged}
      disabled={!$alarms.some(a => a.acknowledged)}
    >
      Clear Acknowledged
    </button>
  </div>

  <!-- Alarm list -->
  <div class="panel overflow-hidden">
    {#if filtered.length === 0}
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <svg class="w-10 h-10 text-gray-700 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <p class="text-sm font-mono text-gray-600">No alarms match current filter</p>
      </div>
    {:else}
      <!-- Table header -->
      <div class="grid text-2xs font-mono text-gray-500 px-4 py-2 border-b border-surface-500/60 bg-surface-800/40"
           style="grid-template-columns: 80px 70px 80px 1fr auto">
        <span>Time</span>
        <span>Severity</span>
        <span>Code</span>
        <span>Message</span>
        <span class="text-right">Action</span>
      </div>

      <div class="divide-y divide-surface-500/30 max-h-[calc(100vh-280px)] overflow-y-auto">
        {#each filtered as alarm (alarm.id)}
          <div
            class="grid items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-600/20"
            class:opacity-50={alarm.acknowledged}
            style="grid-template-columns: 80px 70px 80px 1fr auto"
          >
            <!-- Timestamp -->
            <div class="text-2xs font-mono text-gray-500 leading-tight">
              <p>{formatTime(alarm.timestamp)}</p>
              <p class="text-gray-700">{formatDate(alarm.timestamp)}</p>
            </div>

            <!-- Severity pill -->
            <span class="pill border text-2xs capitalize {severityClass(alarm.severity)}">
              <span class="w-1.5 h-1.5 rounded-full flex-shrink-0 {dotClass(alarm.severity)}"></span>
              {alarm.severity}
            </span>

            <!-- Code -->
            <span class="text-2xs font-mono text-gray-400 truncate">{alarm.code}</span>

            <!-- Message -->
            <p class="text-xs font-mono text-gray-300 leading-relaxed">{alarm.message}</p>

            <!-- Acknowledge -->
            <div class="text-right">
              {#if !alarm.acknowledged}
                <button
                  class="text-2xs font-mono text-gray-500 hover:text-cyan-DEFAULT transition-colors px-2 py-1 rounded hover:bg-cyan-DEFAULT/10"
                  on:click={() => acknowledgeAlarm(alarm.id)}
                >
                  ACK
                </button>
              {:else}
                <span class="text-2xs font-mono text-gray-700">ACK'd</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

</div>
