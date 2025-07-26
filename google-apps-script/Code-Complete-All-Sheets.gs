/**
 * IntraDay Trading Dashboard - COMPLETE Google Apps Script Integration
 * ALL SHEETS: Trades, Strategies, Psychology + TEST DATA
 * 
 * Version: 4.0.0 - Complete Implementation
 * Last Updated: 2025-01-26
 */

// Configuration - Update SPREADSHEET_ID with your actual Google Sheets ID
const CONFIG = {
  SPREADSHEET_ID: '1RXg9THvQd2WMwVgWH6G4tDuuoGOC59mf5pJGko51mVo', // Your actual Sheet ID
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

const STRATEGIES_HEADERS = [
  'ID', 'Name', 'Description', 'Screenshot URL', 'Tags', 'Status', 'Created At'
];

const PSYCHOLOGY_HEADERS = [
  'ID', 'Month', 'Year', 'Monthly P&L', 'Best Trade ID', 'Worst Trade ID',
  'Mental Reflections', 'Improvement Areas', 'Created At'
];

/**
 * TEST DATA FUNCTIONS - Use these in Apps Script editor to populate test data
 */

/**
 * Call this function in Apps Script editor to populate test data
 */
function populateTestData() {
  try {
    if (!CONFIG.SPREADSHEET_ID) {
      throw new Error('Please set CONFIG.SPREADSHEET_ID first!');
    }
    
    console.log('Populating test data...');
    
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    // Initialize all sheets
    initializeAllSheets(spreadsheet);
    
    // Add test trades
    addTestTrades(spreadsheet);
    
    // Add test strategies
    addTestStrategies(spreadsheet);
    
    // Add test psychology entries
    addTestPsychology(spreadsheet);
    
    console.log('Test data populated successfully!');
    return 'Test data populated successfully!';
    
  } catch (error) {
    console.error('Error populating test data:', error);
    return 'Error: ' + error.message;
  }
}

/**
 * Test connection function for Apps Script editor
 */
function testConnection() {
  try {
    if (!CONFIG.SPREADSHEET_ID) {
      return 'ERROR: Please set CONFIG.SPREADSHEET_ID first!';
    }
    
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    return `SUCCESS: Connected to spreadsheet "${spreadsheet.getName()}"`;
    
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
}

/**
 * Initialize all sheets with proper headers
 */
function initializeAllSheets(spreadsheet) {
  // Initialize Trades sheet
  const tradesSheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.TRADES);
  if (tradesSheet.getLastRow() === 0) {
    initializeTradesSheet(tradesSheet);
  }
  
  // Initialize Strategies sheet
  const strategiesSheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.STRATEGIES);
  if (strategiesSheet.getLastRow() === 0) {
    initializeStrategiesSheet(strategiesSheet);
  }
  
  // Initialize Psychology sheet
  const psychologySheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.PSYCHOLOGY);
  if (psychologySheet.getLastRow() === 0) {
    initializePsychologySheet(psychologySheet);
  }
}

/**
 * Add test trade data
 */
function addTestTrades(spreadsheet) {
  const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.TRADES);
  
  const testTrades = [
    {
      id: 1,
      tradeDate: '2024-01-15',
      stockName: 'RELIANCE',
      quantity: 100,
      entryPrice: '2450.50',
      exitPrice: '2485.75',
      stopLoss: '2430.00',
      targetPrice: '2500.00',
      setupFollowed: true,
      whichSetup: 'Breakout Momentum',
      emotion: 'Confident',
      notes: 'Clean breakout above resistance with good volume',
      psychologyReflections: 'Followed my plan perfectly, stayed disciplined',
      screenshotLink: 'https://example.com/screenshot1.png'
    },
    {
      id: 2,
      tradeDate: '2024-01-16',
      stockName: 'TCS',
      quantity: 50,
      entryPrice: '3650.25',
      exitPrice: '3625.80',
      stopLoss: '3620.00',
      targetPrice: '3700.00',
      setupFollowed: false,
      whichSetup: 'Support Bounce',
      emotion: 'Nervous',
      notes: 'Entered too early, market was still weak',
      psychologyReflections: 'Need to wait for confirmation, rushed the entry',
      screenshotLink: 'https://example.com/screenshot2.png'
    },
    {
      id: 3,
      tradeDate: '2024-01-17',
      stockName: 'HDFC',
      quantity: 75,
      entryPrice: '1580.00',
      exitPrice: '1595.50',
      stopLoss: '1570.00',
      targetPrice: '1610.00',
      setupFollowed: true,
      whichSetup: 'Cup and Handle',
      emotion: 'Calm',
      notes: 'Perfect setup, executed well',
      psychologyReflections: 'Great patience and discipline shown today',
      screenshotLink: 'https://example.com/screenshot3.png'
    }
  ];
  
  testTrades.forEach(trade => {
    if (!isDuplicateTrade(sheet, trade)) {
      addTradeRow(sheet, trade);
    }
  });
}

/**
 * Add test strategy data
 */
function addTestStrategies(spreadsheet) {
  const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.STRATEGIES);
  
  const testStrategies = [
    {
      id: 1,
      name: 'Breakout Momentum',
      description: 'Enter when price breaks above resistance with volume confirmation',
      screenshotUrl: 'https://example.com/strategy1.png',
      tags: 'breakout,momentum,volume',
      status: 'active'
    },
    {
      id: 2,
      name: 'Support Bounce',
      description: 'Buy at key support levels with bullish divergence',
      screenshotUrl: 'https://example.com/strategy2.png',
      tags: 'support,bounce,divergence',
      status: 'active'
    },
    {
      id: 3,
      name: 'Cup and Handle',
      description: 'Classic pattern with consolidation and breakout',
      screenshotUrl: 'https://example.com/strategy3.png',
      tags: 'pattern,cup,handle,breakout',
      status: 'testing'
    },
    {
      id: 4,
      name: 'Moving Average Crossover',
      description: 'Enter when fast MA crosses above slow MA',
      screenshotUrl: 'https://example.com/strategy4.png',
      tags: 'moving-average,crossover,trend',
      status: 'deprecated'
    }
  ];
  
  testStrategies.forEach(strategy => {
    if (!isDuplicateStrategy(sheet, strategy)) {
      addStrategyRow(sheet, strategy);
    }
  });
}

/**
 * Add test psychology data
 */
function addTestPsychology(spreadsheet) {
  const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.PSYCHOLOGY);
  
  const testPsychology = [
    {
      id: 1,
      month: 'January',
      year: 2024,
      monthlyPnL: '15750.50',
      bestTradeId: 1,
      worstTradeId: 2,
      mentalReflections: 'Good month overall. Stayed disciplined most of the time. Need to work on patience for setups.',
      improvementAreas: 'Wait for better confirmation signals, reduce position size when unsure'
    },
    {
      id: 2,
      month: 'February',
      year: 2024,
      monthlyPnL: '-5420.25',
      bestTradeId: 3,
      worstTradeId: 2,
      mentalReflections: 'Tough month, let emotions get the better of me. Revenge trading after initial losses.',
      improvementAreas: 'Stick to risk management rules, take breaks after losses, journal emotions before trading'
    }
  ];
  
  testPsychology.forEach(entry => {
    if (!isDuplicatePsychology(sheet, entry)) {
      addPsychologyRow(sheet, entry);
    }
  });
}

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
      case 'getStrategies':
        result = handleGetStrategies();
        break;
      case 'addStrategy':
        result = handleAddStrategy(requestData);
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
    
    // Sync strategies with duplicate prevention
    if (requestData.strategies && requestData.strategies.length > 0) {
      const strategiesSheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.STRATEGIES);
      if (strategiesSheet.getLastRow() === 0) {
        initializeStrategiesSheet(strategiesSheet);
      }
      
      for (const strategy of requestData.strategies) {
        if (!isDuplicateStrategy(strategiesSheet, strategy)) {
          addStrategyRow(strategiesSheet, strategy);
          results.strategies++;
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
 * Add single strategy with duplicate prevention
 */
function handleAddStrategy(requestData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.STRATEGIES);
    
    if (sheet.getLastRow() === 0) {
      initializeStrategiesSheet(sheet);
    }
    
    const strategy = requestData.data || requestData;
    
    // Check for duplicates
    if (isDuplicateStrategy(sheet, strategy)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Strategy already exists (duplicate prevented)',
          data: strategy,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    addStrategyRow(sheet, strategy);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: strategy,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Add strategy error:', error);
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
 * Get strategies from sheet
 */
function handleGetStrategies() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateSheet(spreadsheet, CONFIG.SHEETS.STRATEGIES);
    
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
      if (!row[0]) continue;
      
      strategies.push({
        id: row[0],
        name: row[1] || '',
        description: row[2] || null,
        screenshotUrl: row[3] || null,
        tags: row[4] ? row[4].split(',').map(tag => tag.trim()) : null,
        status: row[5] || 'active',
        createdAt: row[6] ? new Date(row[6]) : new Date()
      });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: strategies,
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

function initializeStrategiesSheet(sheet) {
  sheet.getRange(1, 1, 1, STRATEGIES_HEADERS.length).setValues([STRATEGIES_HEADERS]);
  sheet.getRange(1, 1, 1, STRATEGIES_HEADERS.length).setFontWeight('bold');
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

function addStrategyRow(sheet, strategy) {
  const newRow = [
    strategy.id || Date.now(),
    strategy.name || '',
    strategy.description || '',
    strategy.screenshotUrl || '',
    Array.isArray(strategy.tags) ? strategy.tags.join(',') : (strategy.tags || ''),
    strategy.status || 'active',
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

function isDuplicateStrategy(sheet, strategy) {
  if (sheet.getLastRow() <= 1) return false;
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[1] === strategy.name) {
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
      version: '4.0.0 - Complete with all sheets and test data',
      timestamp: new Date().toISOString(),
      hint: 'Use POST requests for data operations. Call populateTestData() function to add test data.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}