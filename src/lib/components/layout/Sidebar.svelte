<script>
  import { unackAlarmCount, workerStatus } from '$lib/stores/telemetry.js'

  export let currentRoute = 'dashboard'
  export let collapsed = false

  const navItems = [
    { id: 'dashboard',     label: 'Dashboard',     icon: GridIcon },
    { id: 'ports',         label: 'Port Manager',  icon: PortIcon },
    { id: 'configuration', label: 'Configuration', icon: ConfigIcon },
    { id: 'alarms',        label: 'Alarm Log',     icon: AlarmIcon },
  ]

  // Icon path data (inline SVG paths — no icon library dependency)
  function GridIcon()   {}
  function PortIcon()   {}
  function ConfigIcon() {}
  function AlarmIcon()  {}
</script>

<!-- Sidebar shell -->
<aside
  class="flex flex-col h-full bg-surface-800 border-r border-surface-500 transition-all duration-200"
  class:w-56={!collapsed}
  class:w-14={collapsed}
>
  <!-- Device identity block -->
  <div class="px-3 py-4 border-b border-surface-500">
    {#if !collapsed}
      <div class="flex items-center gap-2 mb-1">
        <!-- Device icon -->
        <div class="w-7 h-7 rounded bg-cyan-DEFAULT/15 flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-cyan-DEFAULT" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="6" width="20" height="12" rx="2"/>
            <circle cx="6"  cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="10" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <line x1="14" y1="9" x2="20" y2="9" stroke-width="1"/>
            <line x1="14" y1="12" x2="20" y2="12" stroke-width="1"/>
            <line x1="14" y1="15" x2="18" y2="15" stroke-width="1"/>
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-xs font-mono font-semibold text-gray-100 truncate">NX-8800 OLT</p>
          <p class="text-2xs font-mono text-gray-500 truncate">192.168.100.1</p>
        </div>
      </div>
      <!-- Live indicator -->
      <div class="flex items-center gap-1.5 mt-2">
        <span class="relative flex h-2 w-2">
          {#if $workerStatus === 'live'}
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-up opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-status-up"></span>
          {:else if $workerStatus === 'error'}
            <span class="relative inline-flex rounded-full h-2 w-2 bg-status-down"></span>
          {:else}
            <span class="relative inline-flex rounded-full h-2 w-2 bg-status-ranging animate-pulse-slow"></span>
          {/if}
        </span>
        <span class="text-2xs font-mono text-gray-500">
          {$workerStatus === 'live' ? 'LIVE' : $workerStatus === 'error' ? 'ERROR' : 'CONNECTING...'}
        </span>
      </div>
    {:else}
      <!-- Collapsed: just the device icon -->
      <div class="w-8 h-8 mx-auto rounded bg-cyan-DEFAULT/15 flex items-center justify-center">
        <svg class="w-4 h-4 text-cyan-DEFAULT" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="6" width="20" height="12" rx="2"/>
          <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="10" cy="12" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
      </div>
    {/if}
  </div>

  <!-- Nav items -->
  <nav class="flex-1 p-2 space-y-0.5 overflow-y-auto">
    {#if !collapsed}
      <p class="section-label px-3 pt-2 pb-1">Navigation</p>
    {/if}

    <!-- Dashboard -->
    <button
      class="nav-item w-full text-left"
      class:active={currentRoute === 'dashboard'}
      on:click={() => currentRoute = 'dashboard'}
    >
      <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
      {#if !collapsed}<span>Dashboard</span>{/if}
    </button>

    <!-- Ports -->
    <button
      class="nav-item w-full text-left"
      class:active={currentRoute === 'ports'}
      on:click={() => currentRoute = 'ports'}
    >
      <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="7" width="20" height="10" rx="1.5"/>
        <circle cx="6"  cy="12" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="10" cy="12" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="14" cy="12" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
      {#if !collapsed}<span>Port Manager</span>{/if}
    </button>

    <!-- Configuration -->
    <button
      class="nav-item w-full text-left"
      class:active={currentRoute === 'configuration'}
      on:click={() => currentRoute = 'configuration'}
    >
      <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
      </svg>
      {#if !collapsed}<span>Configuration</span>{/if}
    </button>

    <!-- Alarms -->
    <button
      class="nav-item w-full text-left relative"
      class:active={currentRoute === 'alarms'}
      on:click={() => currentRoute = 'alarms'}
    >
      <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
      {#if !collapsed}
        <span class="flex-1">Alarm Log</span>
        {#if $unackAlarmCount > 0}
          <span class="ml-auto text-2xs font-mono bg-status-down text-white rounded-full px-1.5 py-0.5 leading-none">
            {$unackAlarmCount > 99 ? '99+' : $unackAlarmCount}
          </span>
        {/if}
      {:else if $unackAlarmCount > 0}
        <!-- Collapsed badge -->
        <span class="absolute top-1 right-1 w-2 h-2 bg-status-down rounded-full"></span>
      {/if}
    </button>
  </nav>

  <!-- Collapse toggle -->
  <div class="p-2 border-t border-surface-500">
    <button
      class="nav-item w-full justify-center"
      on:click={() => collapsed = !collapsed}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <svg
        class="w-4 h-4 transition-transform duration-200"
        class:rotate-180={collapsed}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
      >
        <path d="M15 18l-6-6 6-6"/>
      </svg>
      {#if !collapsed}<span class="text-xs">Collapse</span>{/if}
    </button>
  </div>
</aside>
