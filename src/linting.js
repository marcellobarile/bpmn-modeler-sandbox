import { Linter } from '@camunda/linting';
import { CloudElementTemplatesLinterPlugin, CloudElementTemplatesCachedLinterPlugin } from 'bpmn-js-element-templates';
import { connectors } from '@camunda/connectors-element-templates';

import linterStats from './stats.js';

// Plugin state management
let isUsingCachedPlugin = true;

const PLUGIN_CONFIG = {
  cached: {
    name: 'Cached Plugin',
    factory: CloudElementTemplatesCachedLinterPlugin,
    buttonText: 'Switch to Standard Plugin'
  },
  standard: {
    name: 'Standard Plugin',
    factory: CloudElementTemplatesLinterPlugin,
    buttonText: 'Switch to Cached Plugin'
  }
};

const linterConfig = {
  "rules": {
    "conditional-flows": "info",
    "end-event-required": "info",
    "event-sub-process-typed-start-event": "info",
    "fake-join": "info",
    "label-required": "info",
    "no-bpmndi": "warn",
    "no-complex-gateway": "info",
    "no-disconnected": "info",
    "no-duplicate-sequence-flows": "info",
    "no-gateway-join-fork": "info",
    "no-implicit-end": "info",
    "no-implicit-split": "info",
    "no-implicit-start": "info",
    "no-inclusive-gateway": "info",
    "no-overlapping-elements": "info",
    "single-blank-start-event": "info",
    "single-event-definition": "info",
    "start-event-required": "info",
    "sub-process-blank-start-event": "info",
    "superfluous-gateway": "info",
    "superfluous-termination": "info"
  }
};

export const initializePluginToggle = () => {
  const toggleButton = document.getElementById('plugin-toggle');
  const statusElement = document.getElementById('plugin-status');

  if (!toggleButton || !statusElement) {
    console.warn('Plugin toggle elements not found in DOM');
    return;
  }

  toggleButton.addEventListener('click', async () => {
    toggleButton.disabled = true;
    toggleButton.textContent = 'Switching...';

    try {
      isUsingCachedPlugin = !isUsingCachedPlugin;
      await doLinting();
      updatePluginUI();
    } catch (error) {
      console.error('Failed to switch plugins:', error);
      // Revert state on failure
      isUsingCachedPlugin = !isUsingCachedPlugin;
    } finally {
      toggleButton.disabled = false;
    }
  });

  updatePluginUI();
};

const updatePluginUI = () => {
  const toggleButton = document.getElementById('plugin-toggle');
  const statusElement = document.getElementById('plugin-status');

  const currentConfig = isUsingCachedPlugin ? PLUGIN_CONFIG.cached : PLUGIN_CONFIG.standard;

  if (toggleButton) toggleButton.textContent = currentConfig.buttonText;
  if (statusElement) statusElement.textContent = `Using: ${currentConfig.name}`;
};

export const doLinting = async () => {
  const definitions = modeler.getDefinitions();
  const templates = flattenTemplates(connectors);

  const modelInfo = {
    elementCount: definitions.rootElements?.length || 0,
    templateCount: templates.length
  };

  const pluginType = isUsingCachedPlugin ? 'cached' : 'standard';
  const pluginInstance = PLUGIN_CONFIG[pluginType].factory(templates);

  linterStats.startTiming(pluginType, modelInfo);

  console.log('Templates', templates);

  const linter = new Linter({
    modeler: 'web',
    plugins: [pluginInstance, linterConfig],
    type: 'cloud'
  });

  const results = await linter.lint(definitions);

  linterStats.endTiming({ issues: results });
  return results;
};

const flattenTemplates = (data) => {
  const result = [];

  const flatten = (item) => {
    if (Array.isArray(item)) {
      item.forEach(flatten);
    } else if (item != null) {
      result.push(item);
    }
  };

  flatten(data);
  return result;
};

const createStatsWidget = () => {
  const widget = document.createElement('div');
  widget.innerHTML = `
    <div id="linter-widget" style="
      position: fixed;
      top: 20px;
      right: 340px;
      background: white;
      border: 2px solid #007bff;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      font-family: monospace;
      min-width: 250px;
    ">
      <div style="font-weight: bold; margin-bottom: 10px; color: #007bff;">
        🔧 Linter Performance Test
      </div>

      <button id="plugin-toggle" style="
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      ">
        Switch to Standard Plugin
      </button>

      <div style="font-size: 11px; color: #666;">
        <div id="performance-indicator" style="
          font-size: 13px;
          color: #333;
          background: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 8px;
        ">
          <div id="speed-comparison" style="margin-bottom: 4px;">
            ⚡ Speed: No data yet
          </div>
          <div id="latest-timing">
            ⏱️ Last: --ms
          </div>
        </div>
        <div style="margin-top: 5px;">
          <button onclick="linterStats.exportSummary()" style="
            font-size: 13px;
            padding: 4px 8px;
            margin-right: 5px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
          ">Summary</button>

          <button onclick="linterStats.reset()" style="
            font-size: 13px;
            padding: 4px 8px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
          ">Reset</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(widget);
  return widget;
};

const initializeStatsWidget = () => {
  createStatsWidget();

  // Register UI update callback with stats module
  linterStats.setUpdateCallback(() => {
    updatePerformanceIndicators();
  });

  const toggleButton = document.getElementById('plugin-toggle');

  const updateWidgetUI = () => {
    const nextConfig = isUsingCachedPlugin ? PLUGIN_CONFIG.standard : PLUGIN_CONFIG.cached;

    if (toggleButton) toggleButton.textContent = `Switch to ${nextConfig.name}`;

    // Update real-time performance data
    updatePerformanceIndicators();
  };

  const updatePerformanceIndicators = () => {
    const speedElement = document.getElementById('speed-comparison');
    const timingElement = document.getElementById('latest-timing');

    if (!speedElement || !timingElement) return;

    const cachedStats = linterStats.getLatestStats('cached');
    const standardStats = linterStats.getLatestStats('standard');

    // Reset case - clear all indicators
    if (!cachedStats && !standardStats) {
      speedElement.textContent = '⚡ Speed: No data yet';
      speedElement.style.color = '#6c757d';
      timingElement.textContent = '⏱️ Last: --ms';
      timingElement.style.color = '#666';
      return;
    }

    // Update latest timing
    const currentPluginType = isUsingCachedPlugin ? 'cached' : 'standard';
    const currentRuns = linterStats.runs[currentPluginType];

    if (currentRuns.length > 0) {
      const latestRun = currentRuns[currentRuns.length - 1];
      timingElement.textContent = `⏱️ Last: ${latestRun.duration.toFixed(1)}ms`;
      timingElement.style.color = latestRun.duration < 100 ? '#28a745' : latestRun.duration < 500 ? '#9a8244' : '#dc3545';
    } else {
      timingElement.textContent = '⏱️ Last: --ms';
      timingElement.style.color = '#666';
    }

    // Update speed comparison
    if (cachedStats && standardStats) {
      const speedDiff = ((standardStats.avgDuration - cachedStats.avgDuration) / standardStats.avgDuration * 100);
      const fasterPlugin = speedDiff > 0 ? 'Cached' : 'Standard';
      const percentage = Math.abs(speedDiff).toFixed(1);

      speedElement.textContent = `⚡ ${fasterPlugin} ${percentage}% faster`;
      speedElement.style.color = speedDiff > 5 ? '#28a745' : speedDiff < -5 ? '#dc3545' : '#9a8244';
    } else if (cachedStats || standardStats) {
      const hasData = cachedStats ? 'Cached' : 'Standard';
      const runCount = (cachedStats || standardStats).totalRuns;
      speedElement.textContent = `⚡ ${hasData}: ${runCount} run${runCount !== 1 ? 's' : ''}`;
      speedElement.style.color = '#6c757d';
    } else {
      speedElement.textContent = '⚡ Speed: No data yet';
      speedElement.style.color = '#6c757d';
    }
  };

  if (toggleButton) {
    toggleButton.addEventListener('click', async () => {
      toggleButton.disabled = true;
      toggleButton.textContent = 'Switching...';

      try {
        isUsingCachedPlugin = !isUsingCachedPlugin;
        await doLinting();
        updateWidgetUI();
      } catch (error) {
        console.error('Failed to switch plugins:', error);
        // Revert state on failure
        isUsingCachedPlugin = !isUsingCachedPlugin;
        updateWidgetUI();
      } finally {
        toggleButton.disabled = false;
      }
    });
  }

  updateWidgetUI();
};

document.addEventListener('DOMContentLoaded', initializeStatsWidget);