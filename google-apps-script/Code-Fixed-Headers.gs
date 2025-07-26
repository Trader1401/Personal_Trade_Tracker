/**
 * IntraDay Trading Dashboard - FIXED Google Apps Script Integration
 * CRITICAL FIX: Headers now match UI exactly, P&L calculated correctly, no duplicates
 * 
 * Version: 3.0.0 - Complete Header Fix
 * Last Updated: 2025-01-26
 */

// Configuration - Update SPREADSHEET_ID with your actual Google Sheets ID
const CONFIG = {
  SPREADSHEET_ID: '', // IMPORTANT: Replace with your actual Sheet ID from the URL
  SHEETS: {
    TRADES: 'Trades',
    STRATEGIES: 'Strategies', 
    PSYCHOLOGY: 'Psychology'
  }
};

// CORRECT Headers that match UI exactly
const TRADES_HEADERS = [
  'ID', 'Trade Date', 'Stock Name', 'Quantity', 'Entry Price', 'Exit Price', 
  'Stop Loss', 'Target Price', 'P&L', 'Setup Followed', 'Strategy', 'Emotion', 
  'Trade Notes', 'Psychology Reflections', 'Screenshot Link', 'Created At'
];

const PSYCHOLOGY_HEADERS = [
  'ID', 'Month', 'Year', 'Monthly P&L', 'Best Trade ID', 'Worst Trade ID',
  'Mental Reflections', 'Improvement Areas', 'Created At'
];

/**
 * Main entry point for POST requests
 */
function doPost(e) {
  try {
    if (!CONFIG.SPREADSHEET_ID) {
      throw new Error('SPREADSHEET_ID not configured. Please update CONFIG.SPREADSHEET_ID');
    }
    
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    console.log(`Processing ${action} request`);
    
    let result;
    switch (action) {
      case 'test':
        result = handleTestConnection();
        break;
      case 'sync':
        result = handleSyncRequest(requestData);
        break;
      case 'getTrades':
        result = handleGetTrades();
        break;
      case 'addTrade':
        result = handleAddTrade(requestData);
        break;
      case 'getPsychologyEntries':
        result = handleGetPsychology();
        break;
      case 'addPsychologyEntry':
        result = handleAddPsychology(requestData);
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
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test connection
 */
function handleTestConnection() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Connection successful',
        spreadsheetName: spreadsheet.getName(),
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
 * Handle sync request with duplicate prevention
 */
function handleSyncRequest(requestData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let results = { trades: 0, strategies: 0, psychology: 0 };
    
    // Sync trades with duplicate prevention
    if (requestData.trades && requestData.trades.length > 0) {
      const tradesSheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.TRADES);
      if (tradesSheet.getLastRow() === 0) {
        initializeTradesSheet(tradesSheet);
      }
      
      for (const trade of requestData.trades) {
        if (!isDuplicateTrade(tradesSheet, trade)) {
          addTradeRow(tradesSheet, trade);
          results.trades++;
        }
      }
    }
    
    // Sync psychology entries with duplicate prevention
    if (requestData.psychologyEntries && requestData.psychologyEntries.length > 0) {
      const psychologySheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.PSYCHOLOGY);
      if (psychologySheet.getLastRow() === 0) {
        initializePsychologySheet(psychologySheet);
      }
      
      for (const entry of requestData.psychologyEntries) {
        if (!isDuplicatePsychology(psychologySheet, entry)) {
          addPsychologyRow(psychologySheet, entry);
          results.psychology++;
        }
      }
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
 * Add single trade with duplicate prevention
 */
function handleAddTrade(requestData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.TRADES);
    
    if (sheet.getLastRow() === 0) {
      initializeTradesSheet(sheet);
    }
    
    const trade = requestData.data || requestData;
    
    // Check for duplicates
    if (isDuplicateTrade(sheet, trade)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Trade already exists (duplicate prevented)',
          data: trade,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    addTradeRow(sheet, trade);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: trade,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Add trade error:', error);
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
 * Add single psychology entry with duplicate prevention
 */
function handleAddPsychology(requestData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.PSYCHOLOGY);
    
    if (sheet.getLastRow() === 0) {
      initializePsychologySheet(sheet);
    }
    
    const entry = requestData.data || requestData;
    
    // Check for duplicates
    if (isDuplicatePsychology(sheet, entry)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Psychology entry already exists (duplicate prevented)',
          data: entry,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    addPsychologyRow(sheet, entry);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: entry,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Add psychology error:', error);
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
 * Get trades from sheet
 */
function handleGetTrades() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.TRADES);
    
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
    const trades = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
      
      trades.push({
        id: row[0],
        tradeDate: formatDate(row[1]),
        stockName: row[2] || '',
        quantity: parseFloat(row[3]) || 0,
        entryPrice: row[4]?.toString() || '0',
        exitPrice: row[5]?.toString() || null,
        stopLoss: row[6]?.toString() || null,
        targetPrice: row[7]?.toString() || null,
        profitLoss: row[8]?.toString() || '0',
        setupFollowed: row[9] === true,
        whichSetup: row[10] || null,
        emotion: row[11] || null,
        notes: row[12] || null,
        psychologyReflections: row[13] || null,
        screenshotLink: row[14] || null,
        createdAt: row[15] ? new Date(row[15]) : new Date()
      });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: trades,
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
 * Get psychology entries from sheet
 */
function handleGetPsychology() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.PSYCHOLOGY);
    
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
      if (!row[0]) continue;
      
      entries.push({
        id: row[0],
        month: row[1] || '',
        year: parseInt(row[2]) || new Date().getFullYear(),
        monthlyPnL: row[3]?.toString() || null,
        bestTradeId: row[4] ? parseInt(row[4]) : null,
        worstTradeId: row[5] ? parseInt(row[5]) : null,
        mentalReflections: row[6] || '',
        improvementAreas: row[7] || '',
        createdAt: row[8] ? new Date(row[8]) : new Date()
      });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: entries,
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
 * Helper Functions
 */

function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  return sheet;
}

function initializeTradesSheet(sheet) {
  sheet.getRange(1, 1, 1, TRADES_HEADERS.length).setValues([TRADES_HEADERS]);
  sheet.getRange(1, 1, 1, TRADES_HEADERS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function initializePsychologySheet(sheet) {
  sheet.getRange(1, 1, 1, PSYCHOLOGY_HEADERS.length).setValues([PSYCHOLOGY_HEADERS]);
  sheet.getRange(1, 1, 1, PSYCHOLOGY_HEADERS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function addTradeRow(sheet, trade) {
  // Calculate P&L correctly
  const entryPrice = parseFloat(trade.entryPrice || '0');
  const exitPrice = parseFloat(trade.exitPrice || '0');
  const quantity = parseFloat(trade.quantity || '0');
  const pnl = (exitPrice > 0 && entryPrice > 0) ? (exitPrice - entryPrice) * quantity : 0;
  
  const newRow = [
    trade.id || Date.now(),
    trade.tradeDate || new Date().toISOString().split('T')[0],
    trade.stockName || '',
    quantity,
    entryPrice,
    exitPrice || '',
    trade.stopLoss || '',
    trade.targetPrice || '',
    pnl,
    trade.setupFollowed || false,    
    trade.whichSetup || '',
    trade.emotion || '',
    trade.notes || '',
    trade.psychologyReflections || '',
    trade.screenshotLink || '',
    new Date().toISOString()
  ];
  
  sheet.appendRow(newRow);
}

function addPsychologyRow(sheet, entry) {
  const newRow = [
    entry.id || Date.now(),
    entry.month || '',
    entry.year || new Date().getFullYear(),
    entry.monthlyPnL || '',
    entry.bestTradeId || '',
    entry.worstTradeId || '',
    entry.mentalReflections || '',
    entry.improvementAreas || '',
    new Date().toISOString()
  ];
  
  sheet.appendRow(newRow);
}

function isDuplicateTrade(sheet, trade) {
  if (sheet.getLastRow() <= 1) return false;
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[1] === trade.tradeDate && 
        row[2] === trade.stockName && 
        parseFloat(row[3]) === parseFloat(trade.quantity) &&
        parseFloat(row[4]) === parseFloat(trade.entryPrice)) {
      return true;
    }
  }
  return false;
}

function isDuplicatePsychology(sheet, entry) {
  if (sheet.getLastRow() <= 1) return false;
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[1] === entry.month && parseInt(row[2]) === parseInt(entry.year)) {
      return true;
    }
  }
  return false;
}

function formatDate(date) {
  if (!date) return '';
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date.toString();
}

/**
 * For GET requests (testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Trading Dashboard Google Apps Script is running',
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      hint: 'Use POST requests for data operations'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}