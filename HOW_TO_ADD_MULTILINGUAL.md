# 🌍 Quick Guide: Add Multilingual to Any Page

## 3-Step Process

### Step 1: Import and Use Hook (in your .js file)

```javascript
// Add this import at the top
import { useTranslation } from 'react-i18next';

function YourPage() {
  // Add this line inside component
  const { t } = useTranslation();
  
  return (
    <div>
      {/* Replace hardcoded text with t() */}
      <h1>{t('yourSection.title')}</h1>
      <button>{t('yourSection.button')}</button>
    </div>
  );
}
```

### Step 2: Add English Keys (en.json)

```json
{
  "yourSection": {
    "title": "Your Title Here",
    "button": "Click Me"
  }
}
```

### Step 3: Add Hindi & Marathi Keys (hi.json & mr.json)

**Hindi (hi.json):**
```json
{
  "yourSection": {
    "title": "आपका शीर्षक यहाँ",
    "button": "मुझे क्लिक करें"
  }
}
```

**Marathi (mr.json):**
```json
{
  "yourSection": {
    "title": "तुमचे शीर्षक येथे",
    "button": "मला क्लिक करा"
  }
}
```

## 📋 Common Translations Reference

### Buttons
| English | Hindi | Marathi |
|---------|-------|---------|
| Submit | जमा करें | सबमिट करा |
| Cancel | रद्द करें | रद्द करा |
| Save | सहेजें | जतन करा |
| Delete | हटाएं | हटवा |
| Edit | संपादित करें | संपादित करा |
| Back | वापस | मागे |
| Next | आगे | पुढे |
| Confirm | पुष्टि करें | पुष्टी करा |

### Form Labels
| English | Hindi | Marathi |
|---------|-------|---------|
| Name | नाम | नाव |
| Phone | फोन | फोन |
| Email | ईमेल | ईमेल |
| Address | पता | पत्ता |
| City | शहर | शहर |
| State | राज्य | राज्य |
| Quantity | मात्रा | प्रमाण |
| Price | मूल्य | किंमत |

### Status Messages
| English | Hindi | Marathi |
|---------|-------|---------|
| Loading... | लोड हो रहा है... | लोड होत आहे... |
| Success | सफलता | यश |
| Error | त्रुटि | त्रुटी |
| Pending | लंबित | प्रलंबित |
| Completed | पूर्ण | पूर्ण |
| Failed | विफल | अयशस्वी |

### Crop Names
| English | Hindi | Marathi |
|---------|-------|---------|
| Wheat | गेहूं | गहू |
| Rice | चावल | तांदूळ |
| Onion | प्याज | कांदा |
| Potato | आलू | बटाटा |
| Tomato | टमाटर | टोमॅटो |
| Corn | मक्का | मका |

## 🎯 Example: Translating AddCrop Page

### Before (Hardcoded):
```javascript
<h2>Add New Crop</h2>
<label>Crop Name</label>
<input placeholder="Enter crop name" />
<button>List Crop</button>
```

### After (Translated):
```javascript
import { useTranslation } from 'react-i18next';

function AddCrop() {
  const { t } = useTranslation();
  
  return (
    <>
      <h2>{t('crop.addCrop')}</h2>
      <label>{t('crop.cropName')}</label>
      <input placeholder={t('crop.cropNamePlaceholder')} />
      <button>{t('crop.listCrop')}</button>
    </>
  );
}
```

### Translation Files:

**en.json:**
```json
{
  "crop": {
    "addCrop": "Add New Crop",
    "cropName": "Crop Name",
    "cropNamePlaceholder": "Enter crop name",
    "listCrop": "List Crop"
  }
}
```

**hi.json:**
```json
{
  "crop": {
    "addCrop": "नई फसल जोड़ें",
    "cropName": "फसल का नाम",
    "cropNamePlaceholder": "फसल का नाम दर्ज करें",
    "listCrop": "फसल सूचीबद्ध करें"
  }
}
```

**mr.json:**
```json
{
  "crop": {
    "addCrop": "नवीन पीक जोडा",
    "cropName": "पिकाचे नाव",
    "cropNamePlaceholder": "पिकाचे नाव प्रविष्ट करा",
    "listCrop": "पीक सूचीबद्ध करा"
  }
}
```

## ⚡ Quick Tips

1. **Use descriptive keys:** `crop.addCrop` not `c1`
2. **Group by section:** All crop-related keys under `crop.*`
3. **Include placeholders:** Translate input placeholders too
4. **Test all languages:** Switch dropdown and verify
5. **Keep emojis:** They work in all languages (🌾 👨‍🌾 🛒)

## 🔍 Finding What to Translate

Search your file for:
- Hardcoded strings in quotes: `"Add Crop"`
- Button text: `<button>Submit</button>`
- Labels: `<label>Name</label>`
- Placeholders: `placeholder="Enter name"`
- Error messages: `"Login failed"`
- Success messages: `"Registration successful"`

Replace ALL of them with `{t('key')}` or `t('key')` in attributes.

## ✅ Checklist for Each Page

- [ ] Import `useTranslation` hook
- [ ] Add `const { t } = useTranslation();`
- [ ] Replace all hardcoded text with `t('key')`
- [ ] Add keys to `en.json`
- [ ] Add keys to `hi.json`
- [ ] Add keys to `mr.json`
- [ ] Test in all 3 languages
- [ ] Check for console errors

## 🎨 Translation Key Naming Convention

```
section.element.property

Examples:
- dashboard.welcome.title
- crop.form.nameLabel
- order.status.pending
- payment.button.payNow
```

## 🚀 Ready to Translate More Pages?

Start with these high-priority pages:
1. **FarmerDashboard.js** - Main farmer interface
2. **AddCrop.js** - Crop listing form
3. **IncomingOrders.js** - Order management
4. **BuyerDashboard.js** - Main buyer interface
5. **EnhancedMarketplace.js** - Crop browsing

Follow the 3-step process above for each page!
