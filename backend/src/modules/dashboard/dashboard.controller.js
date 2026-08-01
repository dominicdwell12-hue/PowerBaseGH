const dashboardService = require('./dashboard.service');
const { success } = require('../../utils/apiResponse');

async function getSummary(req, res, next) {
  try {
    const summary = await dashboardService.getSummary();
    return success(res, { data: summary });
  } catch (err) {
    next(err);
  }
}

async function getSalesReport(req, res, next) {
  try {
    const data = await dashboardService.getSalesData(req.query);
    return success(res, { data: { period: req.query.period, sales: data } });
  } catch (err) {
    next(err);
  }
}

async function getTopProducts(req, res, next) {
  try {
    const products = await dashboardService.getTopProducts(req.query);
    return success(res, { data: { products } });
  } catch (err) {
    next(err);
  }
}

async function exportSalesReport(req, res, next) {
  try {
    const csv = await dashboardService.exportSalesCsv(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sales-report.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary, getSalesReport, getTopProducts, exportSalesReport };
