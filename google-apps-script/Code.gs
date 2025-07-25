/**
 * IntraDay Trading Dashboard - Google Apps Script Integration
 * 
 * This script handles data synchronization between your web application
 * and Google Sheets for persistent storage of trading data.
 * 
 * Author: Generated for Trading Dashboard
 * Version: 1.0.0
 * Last Updated: 2025-01-24
 */

// Configuration - Update SPREADSHEET_ID with your actual Google Sheets ID
const CONFIG = {
  SPREADSHEET_ID: '', // IMPORTANT: Replace with your actual Sheet ID from the URL
  SHEETS: {
    TRADES: 'Trades',
    STRATEGIES: 'Strategies', 
    PSYCHOLOGY: 'Psychology',
    SETTINGS: 'Settings'
  },
  API_VERSION: '1.0',
  MAX_RETRIES: 3,
  BACKUP_ENABLED: true
};

// Validation function to check if spreadsheet ID is configured
function validateConfig() {
  if (!CONFIG.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID === '') {
    throw new Error('SPREADSHEET_ID not configured. Please update CONFIG.SPREADSHEET_ID with your Google Sheets ID from the URL.');
  }
  
  try {
    SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  } catch (error) {
    throw new Error(`Cannot access spreadsheet with ID: ${CONFIG.SPREADSHEET_ID}. Please check the ID is correct and you have permission to access it.`);
  }
}

/**
 * Handle GET requests (for direct browser testing)
 */
function doGet(e) {
  try {
    // Validate configuration
    validateConfig();
    
    const action = e.parameter.action || 'test';
    
    console.log(`Received GET ${action} request at ${new Date().toISOString()}`);
    
    if (action === 'test') {
      return handleTestConnection();
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Trading Dashboard Google Apps Script is running',
        timestamp: new Date().toISOString(),
        availableActions: ['test', 'sync', 'backup'],
        usage: 'Use POST requests with JSON data for full functionality'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        hint: error.message.includes('SPREADSHEET_ID') ? 'Please update the SPREADSHEET_ID in your Google Apps Script code' : null
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 * Note: Google Apps Script automatically handles CORS for deployed web apps
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Main entry point for HTTP POST requests from your web application
 */
function doPost(e) {
  try {
    // Validate configuration before processing any requests
    validateConfig();
    
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action || 'sync';
    
    console.log(`Received POST ${action} request at ${new Date().toISOString()}`);
    
    let result;
    switch (action) {
      case 'sync':
        result = handleSyncRequest(requestData);
        break;
      case 'backup':
        result = handleBackupRequest();
        break;
      case 'restore':
        result = handleRestoreRequest(requestData);
        break;
      case 'test':
        result = handleTestConnection();
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return result;
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        hint: error.message.includes('SPREADSHEET_ID') ? 'Please update the SPREADSHEET_ID in your Google Apps Script code' : null
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function you can run in the Apps Script editor
 * This helps verify your configuration is correct
 */
function testConfiguration() {
  try {
    console.log('🔧 Starting configuration test...');
    
    // Step 1: Validate configuration
    validateConfig();
    console.log('✅ Configuration validation passed!');
    
    // Step 2: Test spreadsheet access
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    console.log(`✅ Successfully opened spreadsheet: "${spreadsheet.getName()}"`);
    console.log(`📋 Spreadsheet URL: https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit`);
    
    // Step 3: Test sheet creation
    const testSheetName = `ConfigTest_${new Date().getTime()}`;
    console.log(`🔧 Creating test sheet: ${testSheetName}`);
    
    const testSheet = getOrCreateSheet(spreadsheet, testSheetName);
    
    // Step 4: Test data writing
    const testData = [
      ['Configuration Test Results', new Date().toISOString()],
      ['Spreadsheet ID', CONFIG.SPREADSHEET_ID],
      ['Spreadsheet Name', spreadsheet.getName()],
      ['Test Status', 'SUCCESS'],
      ['API Version', CONFIG.API_VERSION]
    ];
    
    testSheet.getRange(1, 1, testData.length, 2).setValues(testData);
    
    // Format the test sheet
    const headerRange = testSheet.getRange(1, 1, 1, 2);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    
    console.log('✅ Successfully wrote test data to sheet');
    console.log(`📊 Test sheet "${testSheetName}" created with sample data`);
    
    // Step 5: Test main sheets creation
    const mainSheets = [CONFIG.SHEETS.TRADES, CONFIG.SHEETS.STRATEGIES, CONFIG.SHEETS.PSYCHOLOGY];
    mainSheets.forEach(sheetName => {
      const sheet = getOrCreateSheet(spreadsheet, sheetName);
      console.log(`✅ Main sheet "${sheetName}" ready (${sheet.getLastRow()} rows)`);
    });
    
    console.log('🎉 All tests passed! Configuration is ready for production use.');
    console.log('📝 Note: ConfigTest sheet was left in your spreadsheet for verification');
    
    return {
      success: true,
      message: 'All configuration tests passed!',
      details: {
        spreadsheetName: spreadsheet.getName(),
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        testSheetCreated: testSheetName,
        mainSheetsReady: mainSheets.length
      }
    };
    
  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
    console.error('💡 Please check the troubleshooting guide for solutions');
    throw error;
  }
}

/**
 * Handle data synchronization from web app
 */
function handleSyncRequest(requestData) {
  const results = {
    trades: 0,
    strategies: 0,
    psychology: 0,
    errors: []
  };
  
  try {
    // Validate configuration first
    validateConfig();
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    // Sync trades
    if (requestData.trades && Array.isArray(requestData.trades)) {
      results.trades = syncTradesToSheet(spreadsheet, requestData.trades);
    }
    
    // Sync strategies
    if (requestData.strategies && Array.isArray(requestData.strategies)) {
      results.strategies = syncStrategiesToSheet(spreadsheet, requestData.strategies);
    }
    
    // Sync psychology entries
    if (requestData.psychologyEntries && Array.isArray(requestData.psychologyEntries)) {
      results.psychology = syncPsychologyToSheet(spreadsheet, requestData.psychologyEntries);
    }
    
    // Create backup if enabled
    if (CONFIG.BACKUP_ENABLED) {
      createBackup(spreadsheet);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        results: results,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Sync error:', error);
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
 * Sync trades data to Google Sheets
 */
function syncTradesToSheet(spreadsheet, trades) {
  const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.TRADES);
  
  // Set headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    const headers = [
      'ID', 'Trade Date', 'Stock Name', 'Quantity', 'Entry Price',
      'Exit Price', 'Stop Loss', 'Target Price', 'P&L', 'Setup Followed',
      'Which Setup', 'Emotion', 'Notes', 'Psychology Reflections',
      'Screenshot Link', 'Created At'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
  }
  
  // Don't clear existing data - append only to prevent duplicates
  const existingIds = [];
  if (sheet.getLastRow() > 1) {
    const existingData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    existingData.forEach(row => {
      if (row[0]) existingIds.push(row[0].toString());
    });
  }
  
  // Add only new trades data (prevent duplicates)
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
      
      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, data.length, data[0].length).setValues(data);
      
      // Format new data rows
      formatTradesSheet(sheet, startRow + data.length);
    }
  }
  
  return trades.length;
}

/**
 * Sync strategies data to Google Sheets
 */
function syncStrategiesToSheet(spreadsheet, strategies) {
  const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.STRATEGIES);
  
  // Set headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    const headers = [
      'ID', 'Name', 'Description', 'Status', 'Tags', 'Screenshot URL', 'Created At'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#34a853');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
  }
  
  // Don't clear existing data - append only to prevent duplicates
  const existingIds = [];
  if (sheet.getLastRow() > 1) {
    const existingData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    existingData.forEach(row => {
      if (row[0]) existingIds.push(row[0].toString());
    });
  }
  
  // Add only new strategies data (prevent duplicates)
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
      
      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, data.length, data[0].length).setValues(data);
      
      // Format new data rows
      formatStrategiesSheet(sheet, startRow + data.length);
    }
  }
  
  return strategies.length;
}

/**
 * Sync psychology entries to Google Sheets
 */
function syncPsychologyToSheet(spreadsheet, entries) {
  const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.PSYCHOLOGY);
  
  // Set headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    const headers = [
      'ID', 'Month', 'Year', 'Monthly P&L', 'Best Trade ID', 
      'Worst Trade ID', 'Mental Reflections', 'Improvement Areas', 'Created At'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#ea4335');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
  }
  
  // Don't clear existing data - append only to prevent duplicates
  const existingIds = [];
  if (sheet.getLastRow() > 1) {
    const existingData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    existingData.forEach(row => {
      if (row[0]) existingIds.push(row[0].toString());
    });
  }
  
  // Add only new psychology data (prevent duplicates)
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
      
      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, data.length, data[0].length).setValues(data);
      
      // Format new data rows
      formatPsychologySheet(sheet, startRow + data.length);
    }
  }
  
  return entries.length;
}

/**
 * Get or create a sheet with the given name
 */
function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    console.log(`Created new sheet: ${sheetName}`);
  }
  return sheet;
}

/**
 * Format trades sheet for better readability
 */
function formatTradesSheet(sheet, lastRow) {
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Set column widths
  sheet.setColumnWidth(1, 50);  // ID
  sheet.setColumnWidth(2, 100); // Date
  sheet.setColumnWidth(3, 120); // Stock Name
  sheet.setColumnWidth(4, 80);  // Quantity
  sheet.setColumnWidth(5, 100); // Entry Price
  sheet.setColumnWidth(6, 100); // Exit Price
  sheet.setColumnWidth(7, 100); // Stop Loss
  sheet.setColumnWidth(8, 100); // Target Price
  sheet.setColumnWidth(9, 100); // P&L
  sheet.setColumnWidth(10, 80); // Setup Followed
  sheet.setColumnWidth(11, 150); // Which Setup
  sheet.setColumnWidth(12, 100); // Emotion
  sheet.setColumnWidth(13, 200); // Notes
  sheet.setColumnWidth(14, 200); // Psychology Reflections
  sheet.setColumnWidth(15, 150); // Screenshot Link
  sheet.setColumnWidth(16, 150); // Created At
  
  // Color code P&L column (positive = green, negative = red)
  if (lastRow > 1) {
    const pnlRange = sheet.getRange(2, 9, lastRow - 1, 1);
    const values = pnlRange.getValues();
    
    for (let i = 0; i < values.length; i++) {
      const value = parseFloat(values[i][0]);
      if (!isNaN(value)) {
        const cellRange = sheet.getRange(i + 2, 9);
        if (value > 0) {
          cellRange.setBackground('#d9ead3'); // Light green
          cellRange.setFontColor('#137333'); // Dark green
        } else if (value < 0) {
          cellRange.setBackground('#fce5cd'); // Light red
          cellRange.setFontColor('#d50000'); // Dark red
        }
      }
    }
  }
}

/**
 * Format strategies sheet for better readability
 */
function formatStrategiesSheet(sheet, lastRow) {
  sheet.setFrozenRows(1);
  
  // Set column widths
  sheet.setColumnWidth(1, 50);  // ID
  sheet.setColumnWidth(2, 150); // Name
  sheet.setColumnWidth(3, 300); // Description
  sheet.setColumnWidth(4, 100); // Status
  sheet.setColumnWidth(5, 150); // Tags
  sheet.setColumnWidth(6, 200); // Screenshot URL
  sheet.setColumnWidth(7, 150); // Created At
  
  // Color code status column
  if (lastRow > 1) {
    const statusRange = sheet.getRange(2, 4, lastRow - 1, 1);
    const values = statusRange.getValues();
    
    for (let i = 0; i < values.length; i++) {
      const cellRange = sheet.getRange(i + 2, 4);
      switch (values[i][0].toLowerCase()) {
        case 'active':
          cellRange.setBackground('#d9ead3');
          cellRange.setFontColor('#137333');
          break;
        case 'testing':
          cellRange.setBackground('#fff2cc');
          cellRange.setFontColor('#bf9000');
          break;
        case 'deprecated':
          cellRange.setBackground('#fce5cd');
          cellRange.setFontColor('#d50000');
          break;
      }
    }
  }
}

/**
 * Format psychology sheet for better readability
 */
function formatPsychologySheet(sheet, lastRow) {
  sheet.setFrozenRows(1);
  
  // Set column widths
  sheet.setColumnWidth(1, 50);  // ID
  sheet.setColumnWidth(2, 100); // Month
  sheet.setColumnWidth(3, 80);  // Year
  sheet.setColumnWidth(4, 120); // Monthly P&L
  sheet.setColumnWidth(5, 100); // Best Trade ID
  sheet.setColumnWidth(6, 100); // Worst Trade ID
  sheet.setColumnWidth(7, 300); // Mental Reflections
  sheet.setColumnWidth(8, 300); // Improvement Areas
  sheet.setColumnWidth(9, 150); // Created At
}

/**
 * Create backup of current data
 */
function createBackup(spreadsheet) {
  try {
    const backupName = `Backup_${Utilities.formatDate(new Date(), 'GMT+5:30', 'yyyyMMdd_HHmmss')}`;
    const backupSheet = spreadsheet.insertSheet(backupName);
    
    // Copy all main sheets to backup
    const sheets = [CONFIG.SHEETS.TRADES, CONFIG.SHEETS.STRATEGIES, CONFIG.SHEETS.PSYCHOLOGY];
    let startRow = 1;
    
    sheets.forEach(sheetName => {
      const sourceSheet = spreadsheet.getSheetByName(sheetName);
      if (sourceSheet && sourceSheet.getLastRow() > 0) {
        const data = sourceSheet.getDataRange().getValues();
        
        // Add sheet name header
        backupSheet.getRange(startRow, 1).setValue(`=== ${sheetName} ===`);
        backupSheet.getRange(startRow, 1).setFontWeight('bold');
        startRow++;
        
        // Copy data
        if (data.length > 0) {
          backupSheet.getRange(startRow, 1, data.length, data[0].length).setValues(data);
          startRow += data.length + 2; // Add spacing
        }
      }
    });
    
    console.log(`Backup created: ${backupName}`);
  } catch (error) {
    console.error('Backup creation failed:', error);
  }
}

/**
 * Handle test connection request
 */
function handleTestConnection() {
  try {
    // Validate configuration first
    validateConfig();
    
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheetsInfo = spreadsheet.getSheets().map(sheet => ({
      name: sheet.getName(),
      rows: sheet.getLastRow(),
      columns: sheet.getLastColumn()
    }));
    
    // Ensure main sheets exist
    const mainSheets = [CONFIG.SHEETS.TRADES, CONFIG.SHEETS.STRATEGIES, CONFIG.SHEETS.PSYCHOLOGY];
    const sheetsStatus = mainSheets.map(sheetName => {
      const sheet = getOrCreateSheet(spreadsheet, sheetName);
      return {
        name: sheetName,
        exists: true,
        rows: sheet.getLastRow(),
        ready: true
      };
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Connection and setup successful',
        spreadsheetName: spreadsheet.getName(),
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit`,
        allSheets: sheetsInfo,
        mainSheets: sheetsStatus,
        apiVersion: CONFIG.API_VERSION,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: `Connection failed: ${error.message}`,
        timestamp: new Date().toISOString(),
        hint: error.message.includes('SPREADSHEET_ID') ? 'Update SPREADSHEET_ID in your Google Apps Script code' : 'Check your Google Sheets permissions'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle backup request
 */
function handleBackupRequest() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    createBackup(spreadsheet);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Backup created successfully',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: `Backup failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle restore request (for future use)
 */
function handleRestoreRequest(requestData) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: 'Restore functionality not implemented yet',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Utility function to get performance metrics
 */
function getPerformanceMetrics() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const tradesSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.TRADES);
    
    if (!tradesSheet || tradesSheet.getLastRow() <= 1) {
      return { totalTrades: 0, totalPnL: 0, winRate: 0 };
    }
    
    const data = tradesSheet.getRange(2, 1, tradesSheet.getLastRow() - 1, 16).getValues();
    
    let totalPnL = 0;
    let winningTrades = 0;
    
    data.forEach(row => {
      const pnl = parseFloat(row[8]) || 0; // P&L column
      totalPnL += pnl;
      if (pnl > 0) winningTrades++;
    });
    
    const winRate = data.length > 0 ? (winningTrades / data.length) * 100 : 0;
    
    return {
      totalTrades: data.length,
      totalPnL: totalPnL,
      winRate: winRate,
      winningTrades: winningTrades,
      losingTrades: data.length - winningTrades
    };
    
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return { error: error.message };
  }
}