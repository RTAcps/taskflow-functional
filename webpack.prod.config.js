const { withModuleFederationPlugin, shareAll } = require('@angular-architects/module-federation/webpack');

const baseConfig = withModuleFederationPlugin({
  name: 'taskflow-functional',
  filename: 'remoteEntry.js',
  exposes: {
    './Module': './src/app/app.component.ts',
    './Routes': './src/app/app.routes.ts',
    './AnalyticsReportComponent': './src/app/features/reports/analytics-report.component.ts',
    './DashboardComponent': './src/app/features/dashboard/dashboard.component',
    './ReportFormComponent': './src/app/features/reports/report-form.component.ts',
    './ReportDetailComponent': './src/app/features/reports/report-detail.component.ts'
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: false, eager: false }),
  },
});

module.exports = {
  ...baseConfig,

  output: {
    ...baseConfig.output,
    publicPath: "https://taskflow-functional.netlify.app/",
    uniqueName: "taskflow-functional"
  },

  optimization: {
    ...baseConfig.optimization,
    runtimeChunk: false
  },
};
