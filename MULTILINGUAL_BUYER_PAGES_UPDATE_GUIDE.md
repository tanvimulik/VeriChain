# Multilingual Implementation for Buyer Pages - Complete Guide

## Status: IN PROGRESS

The multilingual system is set up with i18next and translation files exist for English, Hindi, and Marathi. Now we need to update the remaining buyer pages to use translations.

## Translation Keys Added

All necessary translation keys have been added to `frontend/src/i18n/translations/en.json`:
- ✅ marketplace section (complete)
- ✅ order section (enhanced with new keys)
- ✅ payment section (enhanced with new keys)
- ✅ notification section (enhanced with new keys)
- ✅ priceComparison section (complete)

## Pages That Need Translation Implementation

### HIGH PRIORITY (User-facing buyer pages):

1. **EnhancedMarketplace.js** - Main marketplace page
   - Import: `import { useTranslation } from 'react-i18next';`
   - Add hook: `const { t } = useTranslation();`
   - Replace all hardcoded text with `t('marketplace.keyName')`
   - Key areas:
     - Header: title, dashboard button, cart button
     - Search: placeholder, search button
     - Filters: all filter labels, options, buttons
     - Crop cards: all labels, badges, buttons
     - Loading/error states

2. **AcceptedOrders.js** - Orders ready for payment
   - Import: `import { useTranslation } from 'react-i18next';`
   - Add hook: `const { t } = useTranslation();`
   - Replace all hardcoded text with `t('order.keyName')`
   - Key areas:
     - Header: title, back button
     - Order cards: all labels, status, buttons
     - Price breakdown: all labels
     - Warning/success messages

3. **BuyerPayments.js** - Payment history
   - Import: `import { useTranslation } from 'react-i18next';`
   - Add hook: `const { t } = useTranslation();`
   - Replace all hardcoded text with `t('payment.keyName')`
   - Key areas:
     - Header: title, back button
     - Summary cards: labels
     - Filter tabs: all tab labels
     - Payment cards: all labels, buttons

4. **BuyerNotifications.js** - Notifications page
   - Import: `import { useTranslation } from 'react-i18next';`
   - Add hook: `const { t } = useTranslation();`
   - Replace all hardcoded text with `t('notification.keyName')`
   - Key areas:
     - Header: title, buttons
     - Summary: labels
     - Filter tabs: all tab labels
     - Notification items: titles, messages, buttons

5. **PriceComparison.js** - Mandi price comparison
   - Import: `import { useTranslation } from 'react-i18next';`
   - Add hook: `const { t } = useTranslation();`
   - Replace all hardcoded text with `t('priceComparison.keyName')`
   - Key areas:
     - Header: title, buttons, API toggle
     - Info banner: all text
     - Search and filters: all labels, placeholders
     - Price cards: all labels
     - API information section

## Hindi and Marathi Translations

Translation keys for Hindi and Marathi have been prepared in separate files:
- `frontend/src/i18n/translations/hi_additions.json`
- `frontend/src/i18n/translations/mr_additions.json`

These need to be merged into the main translation files:
- `frontend/src/i18n/translations/hi.json`
- `frontend/src/i18n/translations/mr.json`

## Implementation Steps

### Step 1: Update Component Files
For each of the 5 pages listed above:
1. Add import statement for useTranslation
2. Add const { t } = useTranslation(); inside component
3. Replace all hardcoded English text with t('section.key')
4. Test that the page renders correctly

### Step 2: Merge Translation Files
1. Copy marketplace, order additions, payment additions, notification additions, and priceComparison sections from hi_additions.json to hi.json
2. Copy the same sections from mr_additions.json to mr.json
3. Delete the temporary _additions.json files

### Step 3: Testing
1. Start the application
2. Navigate to each buyer page
3. Switch language between English, Hindi, and Marathi
4. Verify all text changes correctly
5. Check that no hardcoded English text remains

## Translation Key Reference

### Marketplace Keys
- marketplace.title, marketplace.dashboard, marketplace.cart
- marketplace.searchPlaceholder, marketplace.search
- marketplace.filters, marketplace.clearAll
- marketplace.category, marketplace.allCategories
- marketplace.vegetables, marketplace.fruits, marketplace.grains, marketplace.pulses
- marketplace.state, marketplace.allStates
- marketplace.district, marketplace.allDistricts
- marketplace.organicOnly, marketplace.priceRange
- marketplace.sortBy, marketplace.nearestFirst, marketplace.priceLowToHigh, marketplace.priceHighToLow
- marketplace.availableCrops, marketplace.showingResults
- marketplace.loadingCrops, marketplace.noCropsFound
- marketplace.organic, marketplace.local, marketplace.grade
- marketplace.rating, marketplace.available, marketplace.harvest
- marketplace.mandiPrice, marketplace.ourPrice, marketplace.transport
- marketplace.save, marketplace.viewDetails, marketplace.sendRequest

### Order Keys
- order.acceptedOrdersTitle, order.backToDashboard
- order.orderNumber, order.successMessage
- order.farmerDetails, order.farmerName, order.farmerPhone, order.farmerMessage
- order.cropDetails, order.cropType, order.quantity, order.price
- order.deliveryDetails, order.deliveryTypeLabel, order.fpoStorage, order.directDelivery
- order.fpoName, order.location, order.address
- order.priceBreakdown, order.cropCost, order.transport, order.platformFee, order.totalAmount
- order.acceptedPaymentPending, order.proceedToPayment, order.paymentCompleted
- order.trackOrder, order.completePaymentWarning, order.paymentCompletedSuccess
- order.loadingOrders, order.noAcceptedOrders, order.browseCrops

### Payment Keys
- payment.myPayments, payment.backToDashboard
- payment.totalPaid, payment.completed, payment.pending
- payment.allPayments, payment.paymentId, payment.paymentDate
- payment.orderId, payment.farmerName, payment.cropName
- payment.amount, payment.paymentMethod, payment.transactionId
- payment.status, payment.downloadInvoice, payment.noPayments

### Notification Keys
- notification.notifications, notification.markAllRead, notification.backToDashboard
- notification.totalNotifications, notification.unread, notification.read, notification.all
- notification.orderConfirmed, notification.paymentSuccessful
- notification.truckAssigned, notification.outForDelivery
- notification.delivered, notification.priceDrop, notification.newCrop
- notification.noNotificationsFound

### Price Comparison Keys
- priceComparison.title, priceComparison.refreshPrices, priceComparison.refreshing
- priceComparison.realTimeAPI, priceComparison.sampleData
- priceComparison.infoBanner, priceComparison.realTimePrices
- priceComparison.lastUpdated, priceComparison.noteLabel
- priceComparison.pricesInQuintal, priceComparison.modalPrice, priceComparison.mostCommonPrice
- priceComparison.searchPlaceholder, priceComparison.category, priceComparison.allCategories
- priceComparison.vegetables, priceComparison.fruits, priceComparison.grains
- priceComparison.state, priceComparison.allStates
- priceComparison.minPrice, priceComparison.maxPrice, priceComparison.per
- priceComparison.updated, priceComparison.listCropAtPrice
- priceComparison.dataSource, priceComparison.source, priceComparison.managedBy
- priceComparison.coverage, priceComparison.updateFrequency, priceComparison.website
- priceComparison.noResults

## Current Status

✅ Translation keys added to en.json
✅ Hindi translations prepared in hi_additions.json
✅ Marathi translations prepared in mr_additions.json
⏳ Component files need to be updated to use translations
⏳ Translation additions need to be merged into main files

## Next Actions

1. Update all 5 component files to use useTranslation hook
2. Merge translation additions into main hi.json and mr.json files
3. Test all pages with language switching
4. Verify no hardcoded text remains

## Notes

- Language switching is already working on other pages (Landing, Login, Register, Dashboards, AddCrop)
- The i18n configuration is properly set up
- Language persists in localStorage
- All infrastructure is in place, just need to update these 5 pages
