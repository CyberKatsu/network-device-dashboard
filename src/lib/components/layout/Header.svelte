<script>
  import { snapshot } from '$lib/stores/telemetry.js'
  import { deviceInfo } from '$lib/stores/device.js'

  export let currentRoute = 'dashboard'

  const routeLabels = {
    dashboard:     'Dashboard',
    ports:         'Port Manager',
    configuration: 'Configuration',
    alarms:        'Alarm Log',
  }

  // Format uptime live (add elapsed seconds since page load)
  let secondsElapsed = 0
  setInterval(() => secondsElapsed++, 1000)

  function formatUptime(base) {
    // base = "14d 07h 22m" — just return it for now; a real device would tick
    return base
  }
</script>

<header class="flex items-center gap-4 px-4 h-12 bg-surface-800 border-b border-surface-500 flex-shrink-0">

  <!-- Breadcrumb / page title -->
  <div class="flex items-center gap-2 min-w-0">
    <span class="text-2xs font-mono text-gray-500 hidden sm:block">
      {$deviceInfo.vendor} / {$deviceInfo.model}
    </span>
    <span class="text-gray-600 hidden sm:block">/</span>
    <span class="text-sm font-medium text-gray-100">{routeLabels[currentRoute]}</span>
  </div>

  <!-- Spacer -->
  <div class="flex-1"></div>

  <!-- Live stats strip — visible on md+ -->
  {#if $snapshot}
    <div class="hidden md:flex items-center gap-4 text-2xs font-mono">
      <div class="flex items-center gap-1.5 text-gray-400">
        <svg class="w-3 h-3 text-status-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
        <span class="text-gray-500">UP</span>
        <span class="text-status-up tabular-nums">{$snapshot.totalUp} Mbps</span>
      </div>
      <div class="flex items-center gap-1.5 text-gray-400">
        <svg class="w-3 h-3 text-cyan-DEFAULT" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
        <span class="text-gray-500">DN</span>
        <span class="text-cyan-DEFAULT tabular-nums">{$snapshot.totalDown} Mbps</span>
      </div>
      <div class="w-px h-4 bg-surface-500"></div>
      <div class="text-gray-500">
        <span class="text-gray-300">{$snapshot.activePorts}</span>/8 ports up
      </div>
    </div>
  {/if}

  <!-- Firmware / uptime info -->
  <div class="hidden lg:flex items-center gap-3 pl-3 border-l border-surface-500 text-2xs font-mono text-gray-500">
    <span>{$deviceInfo.firmware}</span>
    <span>UP {formatUptime($deviceInfo.uptime)}</span>
  </div>

</header>
