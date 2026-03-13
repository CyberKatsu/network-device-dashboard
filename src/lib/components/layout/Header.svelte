<script lang="ts">
  import { snapshot } from '$lib/stores/telemetry'
  import { deviceInfo } from '$lib/stores/device'
  import { theme, toggleTheme } from '$lib/stores/theme'

  import type { RouteKey } from '$lib/types'
  export let currentRoute: RouteKey = 'dashboard'

  const routeLabels = {
    dashboard:     'Dashboard',
    ports:         'Port Manager',
    configuration: 'Configuration',
    alarms:        'Alarm Log',
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

  <div class="flex-1"></div>

  <!-- Live stats strip -->
  {#if $snapshot}
    <div class="hidden md:flex items-center gap-4 text-2xs font-mono">
      <div class="flex items-center gap-1.5">
        <svg class="w-3 h-3 text-status-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
        <span class="text-gray-500">UP</span>
        <span class="text-status-up tabular-nums">{$snapshot.totalUp} Mbps</span>
      </div>
      <div class="flex items-center gap-1.5">
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

  <!-- Firmware / uptime -->
  <div class="hidden lg:flex items-center gap-3 pl-3 border-l border-surface-500 text-2xs font-mono text-gray-500">
    <span>{$deviceInfo.firmware}</span>
    <span>UP {$deviceInfo.uptime}</span>
  </div>

  <!-- Theme toggle -->
  <button
    class="ml-2 p-1.5 rounded-md text-gray-500 hover:text-gray-200 hover:bg-surface-600 transition-colors"
    on:click={toggleTheme}
    title="Toggle {$theme === 'dark' ? 'light' : 'dark'} mode"
    aria-label="Toggle {$theme === 'dark' ? 'light' : 'dark'} mode"
  >
    {#if $theme === 'dark'}
      <!-- Sun icon -->
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
    {:else}
      <!-- Moon icon -->
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
      </svg>
    {/if}
  </button>

</header>
