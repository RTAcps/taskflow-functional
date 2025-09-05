const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'taskflowFunctional',
  exposes: {
    './Module': './src/app/app.component.ts',
    './Routes': './src/app/app.routes.ts',
    './AnalyticsReportComponent': './src/app/features/reports/analytics-report.component.ts',
    './DashboardComponent': './src/app/features/dashboard/dashboard.component',
  './ReportFormComponent': './src/app/features/reports/report-form.component.ts',
  './ReportDetailComponent': './src/app/features/reports/report-detail.component.ts'
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});
