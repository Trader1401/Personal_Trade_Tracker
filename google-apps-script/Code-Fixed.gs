/**
 * UPDATED Google Apps Script for IntraDay Trading Dashboard
 * Deploy this version to fix all the issues:
 * - Psychology data sync
 * - Duplicate prevention
 * - Complete field mapping
 * - Improved performance
 * 
 * Installation:
 * 1. Copy this entire code
 * 2. Replace existing Code.gs in your Google Apps Script project
 * 3. Deploy as Web App with permissions
 */

// Configuration
const CONFIG = {
  SPREADSHEET_ID: '1ntYSVDQ43cZnl-IVss7bp0I_wBrJE4xIQjRDPS6FaRM',
  SHEETS: {
    TRADES: 'Trades',
    STRATEGIES: 'Strategies',
    PSYCHOLOGY: 'Psychology'
  },
  BACKUP_ENABLED: false,
  REQUEST_TIMEOUT: 30 // seconds
};

/**
 * Main entry point - handles all requests
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;

    console.log(`📥 Received request: ${action}`);

    switch (action) {
      case 'test':
        return handleConnectionTest();
      case 'sync':
        return handleSyncRequest(requestData);
      default:
        console.error(`❌ Unknown action: ${action}`);
        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            error: `Unknown action: ${action}`,
            timestamp: new Date().toISOString()
          }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('❌ Request processing error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Connection test - verifies configuration and sheets
 */
function handleConnectionTest() {
  try {
    validateConfig();
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    const sheetsInfo = Object.values(CONFIG.SHEETS).map(sheetName => {
      const sheet = getOrCreateSheet(spreadsheet, sheetName);
      return {
        name: sheetName,
        rows: sheet.getLastRow(),
        ready: true
      };
    });

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Connection successful - All sheets ready",
        spreadsheetName: spreadsheet.getName(),
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        mainSheets: sheetsInfo,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Sync data from the web app - prevents duplicates
 */
function handleSyncRequest(requestData) {
  const results = {
    trades: 0,
    strategies: 0,
    psychology: 0,
    errors: []
  };
  
  try {
    validateConfig();
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    // Sync trades with duplicate prevention
    if (requestData.trades && Array.isArray(requestData.trades)) {
      results.trades = syncTradesToSheet(spreadsheet, requestData.trades);
    }
    
    // Sync strategies with duplicate prevention
    if (requestData.strategies && Array.isArray(requestData.strategies)) {
      results.strategies = syncStrategiesToSheet(spreadsheet, requestData.strategies);
    }
    
    // Sync psychology entries with duplicate prevention
    if (requestData.psychologyEntries && Array.isArray(requestData.psychologyEntries)) {
      results.psychology = syncPsychologyToSheet(spreadsheet, requestData.psychologyEntries);
    }

    console.log(`✅ Sync complete: ${results.trades} trades, ${results.strategies} strategies, ${results.psychology} psychology entries`);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        results: results,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ Sync error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Sync trades - with complete field mapping and duplicate prevention
 */
function syncTradesToSheet(spreadsheet, trades) {
  const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.TRADES);
  
  // Set comprehensive headers
  if (sheet.getLastRow() === 0) {
    const headers = [
      'ID', 'Trade Date', 'Stock Name', 'Quantity', 'Entry Price',
      'Exit Price', 'Stop Loss', 'Target Price', 'P&L', 'Setup Followed',
      'Which Setup', 'Emotion', 'Notes', 'Psychology Reflections', 
      'Screenshot Link', 'Created At'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatHeaderRow(sheet, headers.length, '#4285f4');
  }
  
  // Get existing IDs to prevent duplicates
  const existingIds = getExistingIds(sheet);
  
  // Add only new trades
  if (trades.length > 0) {
    const newTrades = trades.filter(trade => !existingIds.includes(trade.id?.toString()));
    
    if (newTrades.length > 0) {
      const data = newTrades.map(trade => [
        trade.id || '',
        trade.tradeDate || '',
        trade.stockName || '',
        trade.quantity || 0,
        trade.entryPrice || '',
        trade.exitPrice || '',
        trade.stopLoss || '',
        trade.targetPrice || '',
        trade.profitLoss || '',
        trade.setupFollowed || false,
        trade.whichSetup || '',
        trade.emotion || '',
        trade.notes || '',
        trade.psychologyReflections || '',
        trade.screenshotLink || '',
        trade.createdAt ? new Date(trade.createdAt) : new Date()
      ]);
      
      appendData(sheet, data);
      console.log(`📊 Added ${newTrades.length} new trades`);
      return newTrades.length;
    }
  }
  
  return 0;
}

/**
 * Sync strategies - with complete field mapping and duplicate prevention
 */
function syncStrategiesToSheet(spreadsheet, strategies) {
  const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.STRATEGIES);
  
  // Set headers
  if (sheet.getLastRow() === 0) {
    const headers = ['ID', 'Name', 'Description', 'Status', 'Tags', 'Screenshot URL', 'Created At'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatHeaderRow(sheet, headers.length, '#34a853');
  }
  
  // Get existing IDs to prevent duplicates
  const existingIds = getExistingIds(sheet);
  
  // Add only new strategies
  if (strategies.length > 0) {
    const newStrategies = strategies.filter(strategy => !existingIds.includes(strategy.id?.toString()));
    
    if (newStrategies.length > 0) {
      const data = newStrategies.map(strategy => [
        strategy.id || '',
        strategy.name || '',
        strategy.description || '',
        strategy.status || 'active',
        strategy.tags ? strategy.tags.join(', ') : '',
        strategy.screenshotUrl || '',
        strategy.createdAt ? new Date(strategy.createdAt) : new Date()
      ]);
      
      appendData(sheet, data);
      console.log(`🎯 Added ${newStrategies.length} new strategies`);
      return newStrategies.length;
    }
  }
  
  return 0;
}

/**
 * Sync psychology entries - with complete field mapping and duplicate prevention
 */
function syncPsychologyToSheet(spreadsheet, entries) {
  const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.PSYCHOLOGY);
  
  // Set headers
  if (sheet.getLastRow() === 0) {
    const headers = [
      'ID', 'Month', 'Year', 'Monthly P&L', 'Best Trade ID', 
      'Worst Trade ID', 'Mental Reflections', 'Improvement Areas', 'Created At'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatHeaderRow(sheet, headers.length, '#ea4335');
  }
  
  // Get existing IDs to prevent duplicates
  const existingIds = getExistingIds(sheet);
  
  // Add only new psychology entries
  if (entries.length > 0) {
    const newEntries = entries.filter(entry => !existingIds.includes(entry.id?.toString()));
    
    if (newEntries.length > 0) {
      const data = newEntries.map(entry => [
        entry.id || '',
        entry.month || '',
        entry.year || new Date().getFullYear(),
        entry.monthlyPnL || '',
        entry.bestTradeId || '',
        entry.worstTradeId || '',
        entry.mentalReflections || '',
        entry.improvementAreas || '',
        entry.createdAt ? new Date(entry.createdAt) : new Date()
      ]);
      
      appendData(sheet, data);
      console.log(`🧠 Added ${newEntries.length} new psychology entries`);
      return newEntries.length;
    }
  }
  
  return 0;
}

/**
 * Helper functions
 */
function validateConfig() {
  if (!CONFIG.SPREADSHEET_ID) {
    throw new Error('SPREADSHEET_ID not configured');
  }
}

function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    console.log(`📋 Created new sheet: ${sheetName}`);
  }
  return sheet;
}

function getExistingIds(sheet) {
  const existingIds = [];
  if (sheet.getLastRow() > 1) {
    const existingData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    existingData.forEach(row => {
      if (row[0]) existingIds.push(row[0].toString());
    });
  }
  return existingIds;
}

function appendData(sheet, data) {
  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, data.length, data[0].length).setValues(data);
}

function formatHeaderRow(sheet, numColumns, backgroundColor) {
  const headerRange = sheet.getRange(1, 1, 1, numColumns);
  headerRange.setBackground(backgroundColor);
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  sheet.setFrozenRows(1);
}