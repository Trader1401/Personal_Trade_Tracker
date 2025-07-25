# Netlify Deployment Guide for IntraDay Trading Dashboard

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Google Sheets Setup**: Ensure your Google Apps Script is deployed and working
3. **Netlify Account**: Sign up at netlify.com

## Step-by-Step Deployment

### 1. Build Configuration

The project includes pre-configured build settings:
- `netlify.toml` - Netlify configuration
- `build-for-netlify.js` - Custom build script

### 2. Deploy to Netlify

#### Option A: Connect GitHub Repository (Recommended)

1. **Connect Repository**:
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your trading dashboard repository

2. **Configure Build Settings**:
   ```
   Build command: npm run build
   Publish directory: dist/public
   ```

3. **Environment Variables**:
   Add these in Netlify dashboard → Site Settings → Environment Variables:
   ```
   NODE_ENV = production
   VITE_GOOGLE_SHEET_ID = 1ntYSVDQ43cZnl-IVss7bp0I_wBrJE4xIQjRDPS6FaRM
   VITE_GOOGLE_SCRIPT_URL = https://script.google.com/macros/s/AKfycbydES5srEfMknBpgjxFRNWK5SN9ypUzdDroDtkWSTnw3uKjLVu1A0IzCZXJ8wq1pPVh/exec
   ```

4. **Deploy**:
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live at `https://random-name.netlify.app`

#### Option B: Manual Deploy

1. **Build Locally**:
   ```bash
   npm run build
   ```

2. **Upload to Netlify**:
   - Drag and drop the `dist/public` folder to Netlify dashboard
   - Configure environment variables as above

### 3. Custom Domain (Optional)

1. **Add Custom Domain**:
   - Go to Site Settings → Domain management
   - Add custom domain
   - Update DNS records with your domain provider

2. **SSL Certificate**:
   - Netlify automatically provides HTTPS
   - Certificate will be issued within minutes

### 4. Dynamic Configuration Setup

The app supports dynamic Google Sheets configuration:

1. **Initial Setup**:
   - Visit your deployed site
   - Go to Settings page
   - Enter your Google Sheet ID and Script URL
   - Click "Save Settings"

2. **Change Anytime**:
   - Settings are saved locally and persist across sessions
   - You can change to different sheets anytime through the UI

### 5. Post-Deployment Testing

1. **Test Core Functions**:
   - Add a trade → Check if it appears in Google Sheets
   - Add a strategy → Verify sync
   - Create psychology entry → Confirm data flow

2. **Verify Calculations**:
   - Check P&L calculations are accurate
   - Confirm charts display real data
   - Test dark mode visibility

### 6. Production Features

✅ **No Test Data Pollution**: Production version has no demo data
✅ **Accurate Calculations**: P&L computed from entry/exit prices
✅ **Proper Color Coding**: Green for profit, red for loss
✅ **Dark Mode Support**: All text visible in dark theme
✅ **Mobile Responsive**: Works on all devices
✅ **PWA Ready**: Can be installed as app

### 7. Troubleshooting

#### Build Fails
- Check Node.js version (requires Node 18+)
- Verify all dependencies are installed
- Check build logs for specific errors

#### Data Not Syncing
- Verify Google Apps Script URL is correct
- Check Google Sheets permissions
- Test API endpoint manually

#### UI Issues
- Clear browser cache
- Check console for JavaScript errors
- Verify environment variables are set

#### Performance Issues
- Enable Netlify's edge functions
- Configure proper caching headers
- Optimize image assets

### 8. Maintenance

1. **Updates**: Push code changes to GitHub for automatic deployment
2. **Monitoring**: Use Netlify Analytics for site performance
3. **Backup**: Regular Google Sheets backups recommended
4. **Security**: Monitor for any API key exposure

### 9. Cost Optimization

- **Netlify Free Tier**: 100GB bandwidth, 300 build minutes/month
- **Google Sheets API**: Free for personal use
- **Apps Script**: No cost for reasonable usage

### 10. Advanced Features

#### Custom Functions
- Add new calculation functions in `client/src/lib/calculations.ts`
- Extend Google Apps Script for additional features

#### API Integration
- Add more data sources through backend proxy
- Implement real-time stock price feeds

#### Analytics
- Add Google Analytics or similar
- Track trading performance metrics

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Google Apps Script logs
3. Inspect browser console for errors
4. Test API endpoints individually

Your trading dashboard is now live and ready for professional use!