/**
 * IntraDay Trading Dashboard - Complete Google Apps Script Integration
 * 
 * This script handles complete data synchronization between your web application
 * and Google Sheets with proper headers, P&L calculations, and field mapping
 * 
 * Version: 2.0.0 - Complete Fix
 * Last Updated: 2025-01-26
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
  API_VERSION: '2.0',
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
    validateConfig();
    
    const action = e.parameter.action || 'test';
    
    console.log(`Received GET ${action} request at ${new Date().toISOString()}`);
    
    switch (action) {
      case 'test':
        return handleTestConnection();
      case 'getTrades':
        return handleGetTrades();
      case 'getStrategies':
        return handleGetStrategies();
      case 'getPsychology':
        return handleGetPsychology();
      default:
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            message: 'Trading Dashboard Google Apps Script is running',
            timestamp: new Date().toISOString(),
            availableActions: ['test', 'getTrades', 'getStrategies', 'getPsychology'],
            usage: 'Use POST requests with JSON data for full functionality'
          }))
          .setMimeType(ContentService.MimeType.JSON);
    }
      
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
 * Main entry point for HTTP POST requests from your web application
 */
function doPost(e) {
  try {
    validateConfig();
    
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action || 'sync';
    
    console.log(`Received POST ${action} request at ${new Date().toISOString()}`);
    
    let result;
    switch (action) {
      case 'getTrades':
        result = handleGetTrades();
        break;
      case 'getStrategies':
        result = handleGetStrategies();
        break;
      case 'getPsychology':
        result = handleGetPsychology();
        break;
      case 'addTrade':
        result = handleAddTrade(requestData);
        break;
      case 'addStrategy':
        result = handleAddStrategy(requestData);
        break;
      case 'addPsychology':
        result = handleAddPsychology(requestData);
        break;
      case 'sync':
        result = handleSyncRequest(requestData);
        break;
      case 'backup':
        result = handleBackupRequest();
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
 * Handle getting trades from sheet
 */
function handleGetTrades() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.TRADES);
    
    // Initialize headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      initializeTradesSheet(sheet);
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          data: [],
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const trades = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Skip empty rows
      
      const trade = {
        id: row[0] || i,
        tradeDate: formatDate(row[1]),
        stockName: row[2] || '',
        quantity: parseFloat(row[3]) || 0,
        entryPrice: row[4]?.toString() || '0',
        exitPrice: row[5]?.toString() || null,
        stopLoss: row[6]?.toString() || null,
        targetPrice: row[7]?.toString() || null,
        profitLoss: calculatePnL(row[4], row[5], row[3]).toString(),
        setupFollowed: row[9] === true || row[9] === 'TRUE' || row[9] === 'Yes',
        whichSetup: row[10] || null,
        emotion: row[11] || null,
        notes: row[12] || null,
        psychologyReflections: row[13] || null,
        screenshotLink: row[14] || null,
        createdAt: row[15] ? new Date(row[15]) : new Date()
      };
      trades.push(trade);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: trades,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error getting trades:', error);
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
 * Handle getting strategies from sheet
 */
function handleGetStrategies() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.STRATEGIES);
    
    // Initialize headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      initializeStrategiesSheet(sheet);
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          data: [],
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const strategies = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Skip empty rows
      
      const strategy = {
        id: row[0] || i,
        name: row[1] || '',
        description: row[2] || null,
        screenshotUrl: row[3] || null,
        tags: row[4] ? row[4].split(',').map(tag => tag.trim()) : [],
        status: row[5] || 'active',
        createdAt: row[6] ? new Date(row[6]) : new Date()
      };
      strategies.push(strategy);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: strategies,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error getting strategies:', error);
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
 * Handle getting psychology entries from sheet
 */
function handleGetPsychology() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.PSYCHOLOGY);
    
    // Initialize headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      initializePsychologySheet(sheet);
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          data: [],
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const entries = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Skip empty rows
      
      const entry = {
        id: row[0] || i,
        month: row[1] || '',
        year: parseInt(row[2]) || new Date().getFullYear(),
        monthlyPnL: row[3]?.toString() || null,
        bestTradeId: row[4] ? parseInt(row[4]) : null,
        worstTradeId: row[5] ? parseInt(row[5]) : null,
        mentalReflections: row[6] || null,
        improvementAreas: row[7] || null,
        createdAt: row[8] ? new Date(row[8]) : new Date()
      };
      entries.push(entry);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: entries,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error getting psychology entries:', error);
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
 * Handle adding a single trade
 */
function handleAddTrade(requestData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.TRADES);
    
    // Initialize headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      initializeTradesSheet(sheet);
    }
    
    const trade = requestData.trade;
    if (!trade) {
      throw new Error('Trade data is required');
    }
    
    // Calculate P&L
    const pnl = calculatePnL(
      parseFloat(trade.entryPrice), 
      parseFloat(trade.exitPrice || 0), 
      parseFloat(trade.quantity || 0)
    );
    
    // Generate unique ID
    const id = Date.now();
    
    const newRow = [
      id,
      trade.tradeDate,
      trade.stockName,
      trade.quantity,
      trade.entryPrice,
      trade.exitPrice || '',
      trade.stopLoss || '',
      trade.targetPrice || '',
      pnl,
      trade.setupFollowed || false,
      trade.whichSetup || '',
      trade.emotion || '',
      trade.notes || '',
      trade.psychologyReflections || '',
      trade.screenshotLink || '',
      new Date()
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: { id: id, ...trade, profitLoss: pnl.toString() },
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error adding trade:', error);
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
 * Handle adding a single strategy
 */
function handleAddStrategy(requestData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.STRATEGIES);
    
    // Initialize headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      initializeStrategiesSheet(sheet);
    }
    
    const strategy = requestData.strategy;
    if (!strategy) {
      throw new Error('Strategy data is required');
    }
    
    // Generate unique ID
    const id = Date.now();
    
    const newRow = [
      id,
      strategy.name,
      strategy.description || '',
      strategy.screenshotUrl || '',
      Array.isArray(strategy.tags) ? strategy.tags.join(', ') : '',
      strategy.status || 'active',
      new Date()
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: { id: id, ...strategy },
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error adding strategy:', error);
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
 * Handle adding a psychology entry
 */
function handleAddPsychology(requestData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.PSYCHOLOGY);
    
    // Initialize headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      initializePsychologySheet(sheet);
    }
    
    const entry = requestData.entry;
    if (!entry) {
      throw new Error('Psychology entry data is required');
    }
    
    // Generate unique ID
    const id = Date.now();
    
    const newRow = [
      id,
      entry.month,
      entry.year,
      entry.monthlyPnL || '',
      entry.bestTradeId || '',
      entry.worstTradeId || '',
      entry.mentalReflections || '',
      entry.improvementAreas || '',
      new Date()
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: { id: id, ...entry },
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error adding psychology entry:', error);
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
 * Initialize trades sheet with proper headers
 */
function initializeTradesSheet(sheet) {
  const headers = [
    'ID', 'Trade Date', 'Stock Name', 'Quantity', 'Entry Price',
    'Exit Price', 'Stop Loss', 'Target Price', 'P&L', 'Setup Followed',
    'Strategy Used', 'Emotion', 'Trade Notes', 'Psychology Reflections',
    'Screenshot Link', 'Created At'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1f2937');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // Set column widths
  sheet.setColumnWidth(1, 80);   // ID
  sheet.setColumnWidth(2, 120);  // Trade Date
  sheet.setColumnWidth(3, 120);  // Stock Name
  sheet.setColumnWidth(4, 100);  // Quantity
  sheet.setColumnWidth(5, 120);  // Entry Price
  sheet.setColumnWidth(6, 120);  // Exit Price
  sheet.setColumnWidth(7, 120);  // Stop Loss
  sheet.setColumnWidth(8, 120);  // Target Price
  sheet.setColumnWidth(9, 120);  // P&L
  sheet.setColumnWidth(10, 120); // Setup Followed
  sheet.setColumnWidth(11, 150); // Strategy Used
  sheet.setColumnWidth(12, 120); // Emotion
  sheet.setColumnWidth(13, 200); // Trade Notes
  sheet.setColumnWidth(14, 200); // Psychology Reflections
  sheet.setColumnWidth(15, 200); // Screenshot Link
  sheet.setColumnWidth(16, 150); // Created At
}

/**
 * Initialize strategies sheet with proper headers
 */
function initializeStrategiesSheet(sheet) {
  const headers = [
    'ID', 'Strategy Name', 'Description', 'Screenshot URL', 'Tags', 'Status', 'Created At'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1f2937');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // Set column widths
  sheet.setColumnWidth(1, 80);   // ID
  sheet.setColumnWidth(2, 200);  // Strategy Name
  sheet.setColumnWidth(3, 300);  // Description
  sheet.setColumnWidth(4, 200);  // Screenshot URL
  sheet.setColumnWidth(5, 150);  // Tags
  sheet.setColumnWidth(6, 100);  // Status
  sheet.setColumnWidth(7, 150);  // Created At
}

/**
 * Initialize psychology sheet with proper headers
 */
function initializePsychologySheet(sheet) {
  const headers = [
    'ID', 'Month', 'Year', 'Monthly P&L', 'Best Trade ID', 'Worst Trade ID', 
    'Mental Reflections', 'Improvement Areas', 'Created At'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1f2937');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // Set column widths
  sheet.setColumnWidth(1, 80);   // ID
  sheet.setColumnWidth(2, 120);  // Month
  sheet.setColumnWidth(3, 80);   // Year
  sheet.setColumnWidth(4, 150);  // Monthly P&L
  sheet.setColumnWidth(5, 120);  // Best Trade ID
  sheet.setColumnWidth(6, 120);  // Worst Trade ID
  sheet.setColumnWidth(7, 300);  // Mental Reflections
  sheet.setColumnWidth(8, 300);  // Improvement Areas
  sheet.setColumnWidth(9, 150);  // Created At
}

/**
 * Calculate P&L properly
 */
function calculatePnL(entryPrice, exitPrice, quantity) {
  const entry = parseFloat(entryPrice) || 0;
  const exit = parseFloat(exitPrice) || 0;
  const qty = parseFloat(quantity) || 0;
  
  if (entry <= 0 || exit <= 0 || qty <= 0) {
    return 0;
  }
  
  return (exit - entry) * qty;
}

/**
 * Format date consistently
 */
function formatDate(dateValue) {
  if (!dateValue) return '';
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return dateValue.toString();
  
  return date.toISOString().split('T')[0];
}

/**
 * Get or create a sheet
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
 * Handle test connection
 */
function handleTestConnection() {
  try {
    validateConfig();
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    const sheets = [];
    spreadsheet.getSheets().forEach(sheet => {
      sheets.push({
        name: sheet.getName(),
        rows: sheet.getLastRow(),
        columns: sheet.getLastColumn()
      });
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Connection successful',
        spreadsheetName: spreadsheet.getName(),
        sheets: sheets,
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
 * Handle legacy sync request for backward compatibility
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
    
    // Handle trades sync
    if (requestData.trades && Array.isArray(requestData.trades)) {
      requestData.trades.forEach(trade => {
        try {
          handleAddTrade({ trade: trade });
          results.trades++;
        } catch (error) {
          results.errors.push(`Trade sync error: ${error.message}`);
        }
      });
    }
    
    // Handle strategies sync
    if (requestData.strategies && Array.isArray(requestData.strategies)) {
      requestData.strategies.forEach(strategy => {
        try {
          handleAddStrategy({ strategy: strategy });
          results.strategies++;
        } catch (error) {
          results.errors.push(`Strategy sync error: ${error.message}`);
        }
      });
    }
    
    // Handle psychology sync
    if (requestData.psychologyEntries && Array.isArray(requestData.psychologyEntries)) {
      requestData.psychologyEntries.forEach(entry => {
        try {
          handleAddPsychology({ entry: entry });
          results.psychology++;
        } catch (error) {
          results.errors.push(`Psychology sync error: ${error.message}`);
        }
      });
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
        results: results,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle backup request
 */
function handleBackupRequest() {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Backup functionality not implemented yet',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}