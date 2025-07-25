/**
 * SIMPLIFIED Google Apps Script for Trading Dashboard
 * This version removes ALL header manipulation to avoid Google Apps Script compatibility issues
 * Version: 1.1 - CORS-Free
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
  API_VERSION: '1.1',
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
 * Google Apps Script deployed as web app automatically handles CORS
 */
function doGet(e) {
  try {
    validateConfig();
    
    const action = e.parameter.action || 'status';
    console.log(`GET request: ${action} at ${new Date().toISOString()}`);
    
    if (action === 'test') {
      return handleTestConnection();
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Trading Dashboard Google Apps Script is running',
        timestamp: new Date().toISOString(),
        version: CONFIG.API_VERSION,
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        availableActions: ['test', 'sync']
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('doGet error:', error);
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
 * Handle POST requests from your web application
 */
function doPost(e) {
  try {
    validateConfig();
    
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action || 'sync';
    
    console.log(`POST request: ${action} at ${new Date().toISOString()}`);
    
    switch (action) {
      case 'sync':
        return handleSyncRequest(requestData);
      case 'test':
        return handleTestConnection();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
  } catch (error) {
    console.error('doPost error:', error);
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
 * Test function you can run in the Apps Script editor
 */
function testConfiguration() {
  try {
    console.log('🔧 Starting configuration test...');
    
    validateConfig();
    console.log('✅ Configuration validation passed!');
    
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    console.log(`✅ Opened spreadsheet: "${spreadsheet.getName()}"`);
    
    // Create test sheet with timestamp
    const testSheetName = `ConfigTest_${new Date().getTime()}`;
    const testSheet = getOrCreateSheet(spreadsheet, testSheetName);
    
    // Write test data
    const testData = [
      ['Configuration Test Results', new Date().toISOString()],
      ['Spreadsheet ID', CONFIG.SPREADSHEET_ID],
      ['Spreadsheet Name', spreadsheet.getName()],
      ['Test Status', 'SUCCESS'],
      ['API Version', CONFIG.API_VERSION]
    ];
    
    testSheet.getRange(1, 1, testData.length, 2).setValues(testData);
    
    // Format header
    const headerRange = testSheet.getRange(1, 1, 1, 2);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    
    console.log(`✅ Created test sheet: ${testSheetName}`);
    
    // Ensure main sheets exist
    [CONFIG.SHEETS.TRADES, CONFIG.SHEETS.STRATEGIES, CONFIG.SHEETS.PSYCHOLOGY].forEach(sheetName => {
      const sheet = getOrCreateSheet(spreadsheet, sheetName);
      setupSheetHeaders(sheet, sheetName);
      console.log(`✅ Main sheet "${sheetName}" ready`);
    });
    
    console.log('🎉 All tests passed! Configuration ready.');
    return 'SUCCESS: Configuration test completed';
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

/**
 * Handle test connection requests
 */
function handleTestConnection() {
  try {
    validateConfig();
    
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    // Ensure main sheets exist
    const mainSheets = [CONFIG.SHEETS.TRADES, CONFIG.SHEETS.STRATEGIES, CONFIG.SHEETS.PSYCHOLOGY];
    const sheetsStatus = mainSheets.map(sheetName => {
      const sheet = getOrCreateSheet(spreadsheet, sheetName);
      setupSheetHeaders(sheet, sheetName);
      return {
        name: sheetName,
        rows: sheet.getLastRow(),
        ready: true
      };
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Connection successful - All sheets ready',
        spreadsheetName: spreadsheet.getName(),
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        mainSheets: sheetsStatus,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
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
 * Handle sync requests from the dashboard
 */
function handleSyncRequest(requestData) {
  try {
    validateConfig();
    
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const results = { trades: 0, strategies: 0, psychology: 0, errors: [] };
    
    // Sync trades
    if (requestData.trades && requestData.trades.length > 0) {
      const tradesSheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.TRADES);
      setupSheetHeaders(tradesSheet, CONFIG.SHEETS.TRADES);
      
      requestData.trades.forEach(trade => {
        try {
          addTradeToSheet(tradesSheet, trade);
          results.trades++;
        } catch (error) {
          results.errors.push(`Trade sync error: ${error.message}`);
        }
      });
    }
    
    // Sync strategies
    if (requestData.strategies && requestData.strategies.length > 0) {
      const strategiesSheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.STRATEGIES);
      setupSheetHeaders(strategiesSheet, CONFIG.SHEETS.STRATEGIES);
      
      requestData.strategies.forEach(strategy => {
        try {
          addStrategyToSheet(strategiesSheet, strategy);
          results.strategies++;
        } catch (error) {
          results.errors.push(`Strategy sync error: ${error.message}`);
        }
      });
    }
    
    // Sync psychology entries
    if (requestData.psychology && requestData.psychology.length > 0) {
      const psychologySheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.PSYCHOLOGY);
      setupSheetHeaders(psychologySheet, CONFIG.SHEETS.PSYCHOLOGY);
      
      requestData.psychology.forEach(entry => {
        try {
          addPsychologyToSheet(psychologySheet, entry);
          results.psychology++;
        } catch (error) {
          results.errors.push(`Psychology sync error: ${error.message}`);
        }
      });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Sync completed',
        results: results,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
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
 * Get or create a sheet by name
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
 * Setup headers for different sheet types
 */
function setupSheetHeaders(sheet, sheetType) {
  if (sheet.getLastRow() > 0) return; // Headers already exist
  
  let headers = [];
  
  switch (sheetType) {
    case CONFIG.SHEETS.TRADES:
      headers = [
        'Date', 'Time', 'Symbol', 'Side', 'Quantity', 'Entry Price', 
        'Exit Price', 'P&L', 'Strategy', 'Emotion', 'Notes', 'Screenshots'
      ];
      break;
      
    case CONFIG.SHEETS.STRATEGIES:
      headers = [
        'Name', 'Description', 'Type', 'Win Rate', 'Avg P&L', 
        'Total Trades', 'Screenshots', 'Created Date'
      ];
      break;
      
    case CONFIG.SHEETS.PSYCHOLOGY:
      headers = [
        'Date', 'Month', 'Overall Mood', 'Trading Confidence', 
        'Market Outlook', 'Key Learnings', 'Improvements', 'Notes'
      ];
      break;
      
    default:
      headers = ['Data', 'Value', 'Timestamp'];
  }
  
  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#34495e');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
  }
}

/**
 * Add trade data to trades sheet
 */
function addTradeToSheet(sheet, trade) {
  const row = [
    trade.date || new Date().toDateString(),
    trade.time || new Date().toTimeString(),
    trade.symbol || '',
    trade.side || '',
    trade.quantity || 0,
    trade.entryPrice || 0,
    trade.exitPrice || 0,
    trade.pnl || 0,
    trade.strategy || '',
    trade.emotion || '',
    trade.notes || '',
    trade.screenshots ? trade.screenshots.join(', ') : ''
  ];
  
  sheet.appendRow(row);
  
  // Color code P&L
  const lastRow = sheet.getLastRow();
  const pnlCell = sheet.getRange(lastRow, 8); // P&L column
  const pnl = parseFloat(trade.pnl || 0);
  
  if (pnl > 0) {
    pnlCell.setBackground('#d5f4e6'); // Light green
  } else if (pnl < 0) {
    pnlCell.setBackground('#ffeaa7'); // Light red
  }
}

/**
 * Add strategy data to strategies sheet
 */
function addStrategyToSheet(sheet, strategy) {
  const row = [
    strategy.name || '',
    strategy.description || '',
    strategy.type || '',
    strategy.winRate || 0,
    strategy.avgPnl || 0,
    strategy.totalTrades || 0,
    strategy.screenshots ? strategy.screenshots.join(', ') : '',
    new Date().toISOString()
  ];
  
  sheet.appendRow(row);
}

/**
 * Add psychology data to psychology sheet
 */
function addPsychologyToSheet(sheet, entry) {
  const row = [
    entry.date || new Date().toDateString(),
    entry.month || '',
    entry.overallMood || '',
    entry.tradingConfidence || '',
    entry.marketOutlook || '',
    entry.keyLearnings || '',
    entry.improvements || '',
    entry.notes || ''
  ];
  
  sheet.appendRow(row);
}