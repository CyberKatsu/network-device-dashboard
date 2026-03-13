<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { RouteKey } from '$lib/types'
  import { startTelemetry, stopTelemetry } from '$lib/stores/telemetry'
  import Sidebar       from '$lib/components/layout/Sidebar.svelte'
  import Header        from '$lib/components/layout/Header.svelte'
  import Dashboard     from './routes/Dashboard.svelte'
  import Ports         from './routes/Ports.svelte'
  import Configuration from './routes/Configuration.svelte'
  import Alarms        from './routes/Alarms.svelte'

  let currentRoute: RouteKey = 'dashboard'
  let sidebarCollapsed = false

  onMount(() => startTelemetry())
  onDestroy(() => stopTelemetry())
</script>

<div class="flex h-screen overflow-hidden bg-surface-900">
  <Sidebar bind:currentRoute bind:collapsed={sidebarCollapsed} />
  <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
    <Header bind:currentRoute />
    <main class="flex-1 overflow-y-auto">
      {#if currentRoute === 'dashboard'}
        <Dashboard />
      {:else if currentRoute === 'ports'}
        <Ports />
      {:else if currentRoute === 'configuration'}
        <Configuration />
      {:else if currentRoute === 'alarms'}
        <Alarms />
      {/if}
    </main>
  </div>
</div>
