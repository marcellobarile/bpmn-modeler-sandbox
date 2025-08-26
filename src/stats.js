class LinterStats {
  constructor() {
    this.runs = { cached: [], standard: [] };
    this.currentRun = null;
    this.onStatsUpdated = null; // Callback for UI updates
  }

  setUpdateCallback(callback) {
    this.onStatsUpdated = callback;
  }

  startTiming(pluginType, modelInfo = {}) {
    this.currentRun = {
      pluginType,
      startTime: performance.now(),
      startMemory: this.getMemoryUsage(),
      modelInfo
    };

    console.group(`🔍 Linting with ${pluginType} plugin`);
    console.log(`📊 Model: ${modelInfo.elementCount || 0} elements, ${modelInfo.templateCount || 0} templates`);
  }

  endTiming(results = {}) {
    if (!this.currentRun) return;

    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    const duration = endTime - this.currentRun.startTime;
    const memoryDelta = endMemory - this.currentRun.startMemory;

    const runData = {
      duration,
      memoryDelta,
      timestamp: Date.now(),
      success: !results.error,
      issueCount: results.issues?.length || 0,
      modelInfo: this.currentRun.modelInfo
    };

    this.runs[this.currentRun.pluginType].push(runData);

    // Console output
    console.log(`⏱️  Duration: ${duration.toFixed(2)}ms`);
    console.log(`🧠 Memory: ${this.formatMemory(memoryDelta)}`);
    console.log(`📋 Issues found: ${runData.issueCount}`);
    console.log(`✅ Status: ${runData.success ? 'Success' : 'Error'}`);

    this.showComparison();
    console.groupEnd();

    if (this.onStatsUpdated && typeof this.onStatsUpdated === 'function') {
      this.onStatsUpdated(runData, this.currentRun.pluginType);
    }

    this.currentRun = null;
    return runData;
  }

  showComparison() {
    const cached = this.getLatestStats('cached');
    const standard = this.getLatestStats('standard');

    if (!cached || !standard) return;

    console.group('📈 Performance Comparison');

    const speedDiff = ((standard.avgDuration - cached.avgDuration) / standard.avgDuration * 100);
    const memoryDiff = cached.avgMemory - standard.avgMemory;

    console.log(`🏃 Speed: Cached is ${Math.abs(speedDiff).toFixed(1)}% ${speedDiff > 0 ? 'faster' : 'slower'}`);
    console.log(`🧠 Memory: Cached uses ${this.formatMemory(memoryDiff)} ${memoryDiff > 0 ? 'more' : 'less'}`);

    console.table({
      'Cached Plugin': {
        'Avg Duration (ms)': cached.avgDuration.toFixed(2),
        'Avg Memory': this.formatMemory(cached.avgMemory),
        'Success Rate': `${cached.successRate.toFixed(1)}%`,
        'Total Runs': cached.totalRuns
      },
      'Standard Plugin': {
        'Avg Duration (ms)': standard.avgDuration.toFixed(2),
        'Avg Memory': this.formatMemory(standard.avgMemory),
        'Success Rate': `${standard.successRate.toFixed(1)}%`,
        'Total Runs': standard.totalRuns
      }
    });

    console.groupEnd();
  }

  getLatestStats(pluginType) {
    const runs = this.runs[pluginType];
    if (runs.length === 0) return null;

    const recent = runs.slice(-5); // Last 5 runs
    const avgDuration = recent.reduce((sum, run) => sum + run.duration, 0) / recent.length;
    const avgMemory = recent.reduce((sum, run) => sum + run.memoryDelta, 0) / recent.length;
    const successRate = recent.filter(run => run.success).length / recent.length * 100;

    return {
      avgDuration,
      avgMemory,
      successRate,
      totalRuns: runs.length
    };
  }

  getMemoryUsage() {
    return performance.memory ? performance.memory.usedJSHeapSize : 0;
  }

  formatMemory(bytes) {
    const mb = bytes / (1024 * 1024);
    return `${mb >= 0 ? '+' : ''}${mb.toFixed(2)}MB`;
  }

  exportSummary() {
    console.group('📊 Complete Performance Summary');

    Object.keys(this.runs).forEach(pluginType => {
      const stats = this.getLatestStats(pluginType);
      if (stats) {
        console.log(`\n${pluginType.toUpperCase()} PLUGIN:`);
        console.log(`  Average Duration: ${stats.avgDuration.toFixed(2)}ms`);
        console.log(`  Average Memory: ${this.formatMemory(stats.avgMemory)}`);
        console.log(`  Success Rate: ${stats.successRate.toFixed(1)}%`);
        console.log(`  Total Runs: ${stats.totalRuns}`);
      }
    });

    console.groupEnd();
    return this.runs;
  }

  reset() {
    this.runs = { cached: [], standard: [] };

    console.log('📊 Performance stats reset');

    // Trigger UI update callback if registered
    if (this.onStatsUpdated && typeof this.onStatsUpdated === 'function') {
      this.onStatsUpdated(null, 'reset');
    }
  }
}

window.linterStats = new LinterStats();
export default window.linterStats;